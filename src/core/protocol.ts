// core/protocol.ts

import { getStructureInfo, getStructureSignature } from '../structure-id.js';
import { proxyMap, proxySet } from 'valtio/utils';
import type { 
  StructureInfo, 
  StructurePacket, 
  StructureDefinition, 
  EncodeContext 
} from '../types.js';
import { 
  TYPE_MARKER,
  type SerializedSpecialType, 
  type TypeMarker 
} from '../serialization-types.js';

export class StructureSyncProtocol {
  
  /**
   * Encodes an object into a values-only packet, assuming the structure is already known.
   */
  public encode(data: object, context: EncodeContext): StructurePacket {
    const structureInfo = getStructureInfo(data);
    const rawValues = this.extractValues(data);
    const processedValues = this.processForSerialization(rawValues);
    
    return {
      type: 'values-only',
      structureId: context.knownStructureId,
      values: processedValues,
      metadata: {
        collisionCount: structureInfo.collisionCount,
        levels: structureInfo.levels
      }
    };
  }
  
  /**
   * Decodes a values-only packet using a provided structure definition.
   */
  public decode(packet: StructurePacket, structureDef: StructureDefinition): unknown {
    const reconstructed = this.reconstructObject(packet.values as unknown[], structureDef.shape);
    return this.processForDeserialization(reconstructed);
  }
  
  /**
   * A utility method to create a structure definition from an object.
   * This is now used by both the client and server to cache structures.
   */
  public createStructureDefinition(data: object): StructureDefinition {
    const info = getStructureInfo(data);
    const shape = this.createShape(data);
    return { shape, id: info.id };
  }

  private createShape(obj: unknown): Record<string, unknown> {
    if (typeof obj !== 'object' || obj === null) {
      return { type: typeof obj };
    }
    if (obj instanceof Date || obj instanceof Map || obj instanceof Set || obj instanceof Error) {
      return { type: 'special_value' };
    }
    if (Array.isArray(obj)) {
      return { type: 'array', itemShapes: obj.map(item => this.createShape(item)) };
    }
    const shape: Record<string, unknown> = { type: 'object' };
    const sortedKeys = Object.keys(obj).sort();
    for (const key of sortedKeys) {
      shape[key] = this.createShape((obj as Record<string, unknown>)[key]);
    }
    return shape;
  }

  private extractValues(data: unknown): unknown[] {
    const values: unknown[] = [];
    const recurse = (current: unknown) => {
      if (typeof current !== 'object' || current === null) {
        values.push(current);
        return;
      }
      if (current instanceof Date || current instanceof Map || current instanceof Set || current instanceof Error) {
        values.push(current);
        return;
      }
      if (Array.isArray(current)) {
        current.forEach(item => recurse(item));
        return;
      }
      const sortedKeys = Object.keys(current).sort();
      for (const key of sortedKeys) {
        recurse((current as Record<string, unknown>)[key]);
      }
    };
    recurse(data);
    return values;
  }

  private reconstructObject(values: unknown[], shape: Record<string, unknown>): unknown {
    let valueIndex = 0;
    const recurse = (currentShape: Record<string, unknown>): unknown => {
      const type = currentShape.type as string;
      if (type !== 'object' && type !== 'array') {
        return values[valueIndex++];
      }
      if (type === 'array') {
        const arr: unknown[] = [];
        const itemShapes = currentShape.itemShapes as Record<string, unknown>[];
        for (const itemShape of itemShapes) {
          arr.push(recurse(itemShape));
        }
        return arr;
      }
      const obj: Record<string, unknown> = {};
      const sortedKeys = Object.keys(currentShape).filter(k => k !== 'type').sort();
      for (const key of sortedKeys) {
        obj[key] = recurse(currentShape[key] as Record<string, unknown>);
      }
      return obj;
    };
    return recurse(shape);
  }

  private processForSerialization(obj: unknown): unknown {
		if (obj === null || obj === undefined || typeof obj !== "object") { return obj; }
		if (obj instanceof Date) { return { __type: TYPE_MARKER.Date, value: obj.toISOString() }; }
		if (obj instanceof Map) { return { __type: TYPE_MARKER.Map, value: Array.from(obj.entries()) }; }
		if (obj instanceof Set) { return { __type: TYPE_MARKER.Set, value: Array.from(obj) }; }
    if (obj instanceof Error) { return { __type: TYPE_MARKER.Error, value: { message: obj.message, name: obj.name, stack: obj.stack } }; }
		if (Array.isArray(obj)) { return obj.map((item) => this.processForSerialization(item)); }
    if (obj.constructor === Object) {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) { result[key] = this.processForSerialization(value); }
      return result;
    }
		return obj;
	}

  private processForDeserialization(obj: unknown): unknown {
    if (obj === null || obj === undefined || typeof obj !== "object") { return obj; }
		const objRecord = obj as Record<string, unknown>;
		if ("__type" in objRecord && typeof objRecord.__type === "string") {
			const typeMarker = objRecord.__type as TypeMarker;
			switch (typeMarker) {
				case TYPE_MARKER.Date:
					if (typeof objRecord.value === "string") { return new Date(objRecord.value); }
          return null;
				case TYPE_MARKER.Map:
					if (Array.isArray(objRecord.value)) { return proxyMap(new Map(objRecord.value as [unknown, unknown][])); }
          return new Map();
				case TYPE_MARKER.Set:
					if (Array.isArray(objRecord.value)) { return proxySet(new Set(objRecord.value as unknown[])); }
          return new Set();
        case TYPE_MARKER.Error: {
          if (typeof objRecord.value === "object" && objRecord.value !== null) {
            const errorValue = objRecord.value as Record<string, unknown>;
            const error = new Error(typeof errorValue.message === 'string' ? errorValue.message : '');
            if (typeof errorValue.name === 'string') { error.name = errorValue.name; }
            if (typeof errorValue.stack === 'string') { error.stack = errorValue.stack; }
            return error;
          }
          return new Error();
        }
				default: return objRecord.value;
			}
		}
		if (Array.isArray(obj)) { return obj.map((item) => this.processForDeserialization(item)); }
    const result: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(objRecord)) { result[key] = this.processForDeserialization(value); }
		return result;
	}
}
import { generateStructureId, getStructureInfo, getStructureSignature } from '../structure-id.js';
import type { StateTracker } from './state-tracker.js';
import type { 
  StructureInfo, 
  StructurePacket, 
  StructureDefinition, 
  AccessPattern, 
  EncodeContext 
} from '../types.js';

export class StructureSyncProtocol {
  private structureRegistry = new Map<string, StructureDefinition>();
  private accessPatterns = new Map<string, AccessPattern[]>();
  private stateTrackers = new WeakMap<object, StateTracker>();
  
  registerTrackedState(state: object, tracker: StateTracker): void {
    this.stateTrackers.set(state, tracker);
  }
  
  encode(data: unknown, context?: EncodeContext): StructurePacket {
    if (typeof data !== 'object' || data === null) {
      return {
        type: 'full',
        structureId: 'primitive',
        values: data
      };
    }
    
    const structureInfo = getStructureInfo(data);
    const structureId = structureInfo.id;
    
    const tracker = this.stateTrackers.get(data as object);
    const accessPattern = tracker?.getAccessPattern();
    
    if (accessPattern) {
      const patterns = this.accessPatterns.get(structureId) || [];
      patterns.push(accessPattern);
      this.accessPatterns.set(structureId, patterns);
    }
    
    const isKnownStructure = context?.knownStructures?.includes(structureId);
    
    if (isKnownStructure && accessPattern) {
      const relevantPaths = accessPattern.accessed;
      return {
        type: 'values-only',
        structureId,
        values: this.extractValues(data, relevantPaths),
        paths: relevantPaths,
        metadata: {
          collisionCount: structureInfo.collisionCount,
          levels: structureInfo.levels,
          timestamp: accessPattern.timestamp
        }
      };
    }
    
    const structureDefinition = this.createStructureDefinition(data, structureInfo);
    this.structureRegistry.set(structureId, structureDefinition);
    
    return {
      type: 'full',
      structureId,
      structure: structureDefinition,
      values: this.extractValues(data),
      metadata: {
        collisionCount: structureInfo.collisionCount,
        levels: structureInfo.levels
      }
    };
  }
  
  decode(packet: StructurePacket): unknown {
    if (packet.structureId === 'primitive') {
      return packet.values;
    }
    
    switch (packet.type) {
      case 'full':
        if (packet.structure) {
          this.structureRegistry.set(packet.structureId, packet.structure);
        }
        return this.reconstructObject(packet.values, packet.structure?.shape);
        
      case 'values-only':
        const structure = this.structureRegistry.get(packet.structureId);
        if (!structure) {
          throw new Error(`Unknown structure ID: ${packet.structureId}`);
        }
        return this.reconstructPartialObject(packet.values, structure.shape, packet.paths);
        
      default:
        throw new Error(`Unsupported packet type: ${(packet as any).type}`);
    }
  }
  
  private createStructureDefinition(data: object, info: StructureInfo): StructureDefinition {
    return {
      shape: this.extractShape(data),
      signature: getStructureSignature(data)
    };
  }
  
  private extractShape(obj: unknown): Record<string, unknown> {
    if (typeof obj !== 'object' || obj === null) {
      return { type: typeof obj };
    }
    
    if (Array.isArray(obj)) {
      return { 
        type: 'array',
        length: obj.length,
        itemTypes: obj.map(item => this.extractShape(item))
      };
    }
    
    const shape: Record<string, unknown> = { type: 'object' };
    for (const [key, value] of Object.entries(obj)) {
      shape[key] = this.extractShape(value);
    }
    return shape;
  }
  
  private extractValues(data: unknown, paths?: string[]): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    if (!paths) {
      return JSON.parse(JSON.stringify(data));
    }
    
    const result: any = Array.isArray(data) ? [] : {};
    
    for (const path of paths) {
      const pathParts = path.split('.');
      let current = data as any;
      let target = result;
      
      for (let i = 0; i < pathParts.length; i++) {
        const key = pathParts[i];
        
        if (!key) continue; // Skip empty keys
        
        if (i === pathParts.length - 1) {
          target[key] = current[key];
        } else {
          if (!(key in target)) {
            target[key] = Array.isArray(current[key]) ? [] : {};
          }
          target = target[key];
          current = current[key];
        }
      }
    }
    
    return result;
  }
  
  private reconstructObject(values: unknown, shape?: Record<string, unknown>): unknown {
    return values;
  }
  
  private reconstructPartialObject(values: unknown, shape: Record<string, unknown>, paths?: string[]): unknown {
    return values;
  }
  
  getKnownStructures(): string[] {
    return Array.from(this.structureRegistry.keys());
  }
  
  releaseTracker(data: object): void {
    const tracker = this.stateTrackers.get(data);
    if (tracker) {
      tracker.dispose();
      this.stateTrackers.delete(data);
    }
  }
  
  getAccessPatterns(structureId: string): AccessPattern[] {
    return this.accessPatterns.get(structureId) || [];
  }
}
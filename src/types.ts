export interface StructureInfo {
  id: string;
  levels: number;
  collisionCount: number;
}

export interface AccessPattern {
  accessed: string[];
  mutated: Array<[string, { oldValue: unknown; newValue: unknown }]>;
  timestamp: number;
}

export interface StructurePacket {
  type: 'full' | 'values-only' | 'differential';
  structureId: string;
  structure?: StructureDefinition;
  values: unknown;
  paths?: string[];
  metadata?: {
    collisionCount: number;
    levels: number;
    timestamp?: number;
  };
}

export interface StructureDefinition {
  shape: Record<string, unknown>;
  signature: string;
}

export interface EncodeContext {
  knownStructures?: string[];
  requestId?: string;
}

export interface ClientRegistry {
  structures: Map<string, StructureDefinition>;
  patterns: Map<string, AccessPattern[]>;
}

export interface WakuIntegrationConfig {
  enabled?: boolean;
  fallbackOnError?: boolean;
  maxStructureCacheSize?: number;
  enablePatternLearning?: boolean;
}

export interface RSEasyRenderContext {
  requestId: string;
  knownStructures: Set<string>;
  accessPatterns: Map<string, AccessPattern>;
  trackedObjects: WeakMap<object, string>;
}

export interface EnhancedRSCResponse {
  stream: ReadableStream;
  structureMetadata?: {
    newStructures: StructureDefinition[];
    usedStructures: string[];
    optimizationHints: string[];
  };
}
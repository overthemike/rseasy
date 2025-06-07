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

// The packet is now always 'values-only' or a differential update.
export interface StructurePacket {
  type: 'values-only' | 'differential';
  structureId: string;
  values: unknown; // Can be a full values-array or a partial object
  paths?: string[]; // For differential updates
  metadata?: {
    collisionCount: number;
    levels: number;
    timestamp?: number;
  };
}

export interface StructureDefinition {
  shape: Record<string, unknown>;
  // The structureId is the unique signature
  id: string;
}

// This context is now primarily for the client to tell the server what it knows.
export interface EncodeContext {
  knownStructureId: string; // Client sends the ID it expects
  requestId?: string;
}

export interface ClientRegistry {
  structures: Map<string, StructureDefinition>;
  patterns: Map<string, AccessPattern[]>;
  // Cache to map a request identifier (like a URL) to a structure ID
  requestToStructureId: Map<string, string>;
}

export interface WakuIntegrationConfig {
  enabled?: boolean;
  fallbackOnError?: boolean;
  maxStructureCacheSize?: number;
  enablePatternLearning?: boolean;
}
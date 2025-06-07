import { StructureSyncProtocol } from '../core/protocol.js';
import type { ClientRegistry, StructurePacket, StructureDefinition } from '../types.js';

class RSEasyClient {
  private protocol = new StructureSyncProtocol();
  private registry: ClientRegistry = {
    structures: new Map(),
    patterns: new Map()
  };
  
  enhanceCreateFromFetch(originalCreateFromFetch: Function) {
    return (rscPath: string, rscParams: any, prefetchOnly?: boolean, fetchFn = fetch) => {
      const enhancedFetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
        const headers = new Headers(init.headers);
        
        // Add structure protocol capability
        headers.set('X-Structure-Protocol', 'valtio-v1');
        
        // Include known structure IDs
        const knownStructures = Array.from(this.registry.structures.keys());
        if (knownStructures.length > 0) {
          headers.set('X-Known-Structures', JSON.stringify(knownStructures));
        }
        
        const enhancedInit = { ...init, headers };
        return fetchFn(input, enhancedInit);
      };
      
      // Use enhanced fetch and process structure-aware responses
      const result = originalCreateFromFetch(rscPath, rscParams, prefetchOnly, enhancedFetch);
      
      // If this is a structure-aware response, process it
      if (result && typeof result.then === 'function') {
        return result.then((data: any) => this.processStructureAwareData(data));
      }
      
      return result;
    };
  }
  
  private async processStructureAwareData(data: any): Promise<any> {
    // Check if this is structure-aware data
    if (typeof data === 'string' && data.includes('<!--RSEasy:')) {
      const metadataMatch = data.match(/<!--RSEasy:(.*?)-->/);
      if (metadataMatch && metadataMatch[1]) {
        try {
          const metadata = JSON.parse(metadataMatch[1]);
          
          // Register new structures
          if (metadata.newStructures) {
            for (const structure of metadata.newStructures) {
              // For now, just store the structure definition
              // In a full implementation, you'd need the structure ID
              console.log('Registering new structure:', structure);
            }
          }
          
          // Remove metadata from actual data
          data = data.replace(/<!--RSEasy:.*?-->/, '');
        } catch (e) {
          console.warn('Failed to parse RSEasy metadata:', e);
        }
      }
    }
    
    return data;
  }
  
  decode(packet: StructurePacket): unknown {
    return this.protocol.decode(packet);
  }
  
  registerStructure(id: string, definition: StructureDefinition): void {
    this.registry.structures.set(id, definition);
  }
  
  getKnownStructures(): string[] {
    return Array.from(this.registry.structures.keys());
  }
  
  clearCache(): void {
    this.registry.structures.clear();
    this.registry.patterns.clear();
  }
}

let clientInstance: RSEasyClient | undefined;

export function getRSEasyClient(): RSEasyClient {
  if (!clientInstance) {
    clientInstance = new RSEasyClient();
  }
  return clientInstance;
}

export function createRSEasyClientIntegration() {
  const client = getRSEasyClient();
  
  return {
    enhanceCreateFromFetch: client.enhanceCreateFromFetch.bind(client),
    getClient: () => client
  };
}
// waku/client.ts

import { StructureSyncProtocol } from '../core/protocol.js';
import type { ClientRegistry, StructurePacket, StructureDefinition } from '../types.js';

class RSEasyClient {
  private protocol = new StructureSyncProtocol();
  private registry: ClientRegistry = {
    structures: new Map(),
    patterns: new Map(),
    requestToStructureId: new Map(),
  };

  /**
   * A fetch wrapper that implements the optimization protocol.
   * @param url The request URL, used as a key for caching structures.
   * @param options The standard fetch options.
   */
  public async rseasyFetch(url: string, options?: RequestInit): Promise<unknown> {
    const enhancedOptions = { ...(options || {}) };
    const headers = new Headers(enhancedOptions.headers);

    // Check if we have a cached structure for this URL to request an optimized response.
    const knownStructureId = this.registry.requestToStructureId.get(url);
    if (knownStructureId) {
      headers.set('X-Accept-Structure-ID', knownStructureId);
    }
    enhancedOptions.headers = headers;

    const response = await fetch(url, enhancedOptions);

    // Check if the server sent back an optimized packet.
    const contentType = response.headers.get('Content-Type');
    if (contentType === 'application/rseasy-packet+json') {
      const packet = await response.json() as StructurePacket;
      const structureDef = this.registry.structures.get(packet.structureId);
      if (!structureDef) {
        // This can happen if the client cache is cleared but the server's isn't.
        // A robust implementation would need to re-fetch as standard JSON here.
        throw new Error(`Client cache miss for structure ID: ${packet.structureId}. Re-fetch required.`);
      }
      return this.protocol.decode(packet, structureDef);
    }

    // --- Standard JSON Response Logic ---
    // This is the first time for this structure, or the server doesn't support the protocol.
    const data = await response.json();
    
    // Compute and cache the structure for the *next* time.
    if (typeof data === 'object' && data !== null) {
        const structureDef = this.protocol.createStructureDefinition(data);
        this.registry.structures.set(structureDef.id, structureDef);
        this.registry.requestToStructureId.set(url, structureDef.id);
    }

    return data;
  }
}
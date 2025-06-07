// src/waku/server.ts

import { StructureSyncProtocol } from '../core/protocol.js';
import type { WakuIntegrationConfig, StructureDefinition } from '../types.js';

export const globalProtocol = new StructureSyncProtocol();
// A simple, in-memory cache on the server. In a real app, this might be a Redis/etc.
export const serverStructureCache = new Map<string, StructureDefinition>();

export function createRSEasyServerIntegration(config: WakuIntegrationConfig = {}) {
  return {
    enhanceRenderRsc: (originalRenderRsc: Function) => {
      // The wrapper function must accept all arguments of the original function and pass them through.
      // Using a rest parameter '...rest' is a robust way to do this.
      return async function renderRscWithRSEasy(config: any, ctx: any, elements: Record<string, unknown>, ...rest: any[]) {
        
        const acceptedStructureId = ctx.req?.headers?.['x-accept-structure-id'];

        // --- Subsequent Request: Client is asking for an optimized response ---
        if (acceptedStructureId && serverStructureCache.has(acceptedStructureId)) {
          const packet = globalProtocol.encode(elements, { knownStructureId: acceptedStructureId });
          const jsonPayload = JSON.stringify(packet);
          
          return new Response(jsonPayload, {
            status: 200,
            headers: { 'Content-Type': 'application/rseasy-packet+json' },
          });
        }
        
        // --- First Request: Serve standard JSON/RSC stream ---
        // Pass all original arguments, including the '...rest' arguments, to the original function.
        // This is crucial because 'rest' likely contains the moduleMap or other context needed by RSC.
        const response = await originalRenderRsc(config, ctx, elements, ...rest);
        
        // After responding, compute and cache the structure for next time.
        // This logic seems safe as it doesn't consume the response stream.
        if (typeof elements === 'object' && elements !== null) {
          const structureDef = globalProtocol.createStructureDefinition(elements);
          serverStructureCache.set(structureDef.id, structureDef);
        }
        
        return response;
      };
    },
  };
}
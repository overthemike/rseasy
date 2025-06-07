import { RequestContext } from '../core/request-context.js';
import { StructureSyncProtocol } from '../core/protocol.js';
import type { WakuIntegrationConfig, RSEasyRenderContext, EnhancedRSCResponse } from '../types.js';

const globalProtocol = new StructureSyncProtocol();

export function createRSEasyServerIntegration(config: WakuIntegrationConfig = {}) {
  const {
    enabled = true,
    fallbackOnError = true,
    maxStructureCacheSize = 1000,
    enablePatternLearning = true
  } = config;
  
  return {
    enhanceRenderRsc: (originalRenderRsc: Function) => {
      return async function renderRscWithRSEasy(
        config: any,
        ctx: any,
        elements: Record<string, unknown>,
        onError: Set<Function>,
        moduleIdCallback?: (id: string) => void,
      ): Promise<ReadableStream | EnhancedRSCResponse> {
        if (!enabled) {
          return originalRenderRsc(config, ctx, elements, onError, moduleIdCallback);
        }
        
        try {
          // Check if client supports structure protocol
          const supportsStructureProtocol = ctx.req?.headers?.['x-structure-protocol'] === 'valtio-v1';
          const knownStructures = ctx.req?.headers?.['x-known-structures'] 
            ? JSON.parse(ctx.req.headers['x-known-structures'])
            : [];
          
          if (!supportsStructureProtocol) {
            return originalRenderRsc(config, ctx, elements, onError, moduleIdCallback);
          }
          
          // Create request-scoped context for structure tracking
          const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const structureContext = new RequestContext(globalProtocol, requestId);
          
          // Track elements with structure awareness
          const trackedElements: Record<string, unknown> = {};
          const structureMetadata: any = {
            newStructures: [],
            usedStructures: [],
            optimizationHints: []
          };
          
          for (const [key, value] of Object.entries(elements)) {
            if (typeof value === 'object' && value !== null) {
              const tracked = structureContext.createState(value);
              trackedElements[key] = tracked;
              
              const packet = structureContext.encode(tracked, knownStructures);
              if (packet.type === 'full' && packet.structure) {
                structureMetadata.newStructures.push(packet.structure);
              }
              structureMetadata.usedStructures.push(packet.structureId);
            } else {
              trackedElements[key] = value;
            }
          }
          
          // Get original React stream
          const reactStream = await originalRenderRsc(
            config, 
            ctx, 
            trackedElements, 
            onError, 
            moduleIdCallback
          ) as ReadableStream;
          
          // Transform stream to include structure metadata
          const transformedStream = reactStream.pipeThrough(
            new TransformStream({
              start(controller) {
                // Inject structure metadata as first chunk
                const metadataChunk = new TextEncoder().encode(
                  `<!--RSEasy:${JSON.stringify(structureMetadata)}-->`
                );
                controller.enqueue(metadataChunk);
              },
              transform(chunk, controller) {
                controller.enqueue(chunk);
              },
              flush() {
                structureContext.dispose();
              }
            })
          );
          
          return {
            stream: transformedStream,
            structureMetadata
          };
          
        } catch (error) {
          console.error('RSEasy server error:', error);
          
          if (fallbackOnError) {
            return originalRenderRsc(config, ctx, elements, onError, moduleIdCallback);
          }
          
          throw error;
        }
      };
    },
    
    getProtocol: () => globalProtocol,
    
    createRequestContext: (requestId?: string) => new RequestContext(globalProtocol, requestId)
  };
}

export { globalProtocol };
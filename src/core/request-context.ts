import { StateTracker } from './state-tracker.js';
import { StructureSyncProtocol } from './protocol.js';
import type { StructurePacket, EncodeContext } from '../types.js';

export class RequestContext {
  private protocol: StructureSyncProtocol;
  private trackedStates = new Set<object>();
  private stateTracker: StateTracker;
  private requestId: string;
  
  constructor(protocol: StructureSyncProtocol, requestId?: string) {
    this.protocol = protocol;
    this.requestId = requestId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.stateTracker = new StateTracker(this.requestId);
  }
  
  createState<T extends object>(initialData: T): T {
    const tracked = this.stateTracker.createTrackedState(initialData);
    this.trackedStates.add(tracked);
    this.protocol.registerTrackedState(tracked, this.stateTracker);
    return tracked;
  }
  
  encode(data: unknown, knownStructures?: string[]): StructurePacket {
    const context: EncodeContext = {
      knownStructures,
      requestId: this.requestId
    };
    return this.protocol.encode(data, context);
  }
  
  getKnownStructures(): string[] {
    return this.protocol.getKnownStructures();
  }
  
  getAccessPattern() {
    return this.stateTracker.getAccessPattern();
  }
  
  dispose(): void {
    for (const state of this.trackedStates) {
      this.protocol.releaseTracker(state);
    }
    this.trackedStates.clear();
    this.stateTracker.dispose();
  }
  
  getRequestId(): string {
    return this.requestId;
  }
}
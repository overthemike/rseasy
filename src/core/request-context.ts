// core/request-context.ts

import { StateTracker } from './state-tracker.js';
import type { AccessPattern } from '../types.js';

export class RequestContext {
  private trackedStates = new Set<object>();
  private stateTracker: StateTracker;
  private requestId: string;
  
  constructor(requestId?: string) {
    this.requestId = requestId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.stateTracker = new StateTracker(this.requestId);
  }
  
  /**
   * Wraps an object in a proxy to track its usage.
   */
  createState<T extends object>(initialData: T): T {
    const tracked = this.stateTracker.createTrackedState(initialData);
    this.trackedStates.add(tracked);
    // The protocol no longer needs to be notified here.
    return tracked;
  }
  
  /**
   * Gets the combined access pattern for all tracked states in this context.
   */
  getAccessPattern(): AccessPattern {
    return this.stateTracker.getAccessPattern();
  }
  
  /**
   * Cleans up the state tracker for this request.
   */
  dispose(): void {
    // The only thing to dispose is the tracker itself.
    this.stateTracker.dispose();
    this.trackedStates.clear();
  }
  
  getRequestId(): string {
    return this.requestId;
  }
}
import { proxy, type ValtioPlugin } from '../valtio-plugin.js';
import type { AccessPattern } from '../types.js';

export class StateTracker {
  private proxyFactory = proxy.createInstance();
  private accessedPaths = new Set<string>();
  private mutatedPaths = new Map<string, { oldValue: unknown; newValue: unknown }>();
  private requestId: string;
  
  constructor(requestId: string) {
    this.requestId = requestId;
    
    const accessTrackerPlugin: ValtioPlugin = {
      id: `access-tracker-${requestId}`,
      name: 'AccessTracker',
      
      onGet: (path) => {
        this.accessedPaths.add(path.join('.'));
      },
      
      beforeChange: (path, newValue, oldValue) => {
        this.mutatedPaths.set(path.join('.'), { oldValue, newValue });
        return true;
      }
    };
    
    this.proxyFactory.use(accessTrackerPlugin);
  }
  
  createTrackedState<T extends object>(initialState: T): T {
    return this.proxyFactory(initialState);
  }
  
  getAccessPattern(): AccessPattern {
    return {
      accessed: Array.from(this.accessedPaths),
      mutated: Array.from(this.mutatedPaths.entries()),
      timestamp: Date.now()
    };
  }
  
  dispose(): void {
    this.proxyFactory.dispose();
  }
  
  getRequestId(): string {
    return this.requestId;
  }
}
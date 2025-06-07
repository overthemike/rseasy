import { proxy } from 'valtio'

// Re-export valtio-plugin functionality from npm package
export { 
  proxy,
  enhancedProxy,
  type ValtioPlugin,
  type ProxyFactory,
  type EnhancedGlobalProxy 
} from 'valtio-plugin';
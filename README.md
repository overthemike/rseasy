# RSEasy - Structure-Aware RSC Transfer Protocol

A revolutionary approach to React Server Component data transfer that separates object structure from content, enabling intelligent optimization strategies based on structural patterns.

## 🚀 Features

- **Structure-Aware Transfer**: Only send data structure once, then values-only for repeated patterns
- **Automatic Pattern Learning**: Learns access patterns to optimize what data gets sent
- **Request Isolation**: Each RSC request gets isolated state tracking via Valtio
- **Waku Integration**: Seamless integration with Waku's RSC system
- **Progressive Enhancement**: Gracefully degrades for non-compatible clients

## 🏗️ Architecture

RSEasy combines three powerful technologies:

1. **[structure-id](../structure-id/)**: Generates unique IDs for object structures using multi-level hashing
2. **[valtio-plugin](../valtio-plugin/)**: Provides isolated proxy instances for state tracking
3. **Custom Protocol**: Intelligently encodes/decodes based on structural patterns

## 📦 Installation

```bash
npm install rseasy
```

## 🎯 Quick Start

### Server Integration (Waku)

```typescript
import { createRSEasyServerIntegration } from 'rseasy';

// In your Waku server setup
const rseasyIntegration = createRSEasyServerIntegration({
  enabled: true,
  fallbackOnError: true,
  enablePatternLearning: true
});

// Enhance your renderRsc function
const enhancedRenderRsc = rseasyIntegration.enhanceRenderRsc(originalRenderRsc);
```

### Client Integration (Waku)

```typescript
import { createRSEasyClientIntegration } from 'rseasy';

// In your Waku client setup  
const clientIntegration = createRSEasyClientIntegration();

// Enhance your fetch function
const enhancedCreateFromFetch = clientIntegration.enhanceCreateFromFetch(originalCreateFromFetch);
```

## 🔧 Example Usage

See the [example directory](./example/) for a complete Waku app demonstrating RSEasy optimization.

```bash
cd example
npm install
npm run dev
```

The example shows:
- Repeated data structures being optimized
- Access pattern learning in action
- Network payload reduction
- Graceful fallback behavior

## 📊 How It Works

### 1. Structure Fingerprinting
```typescript
const user = { name: 'Alice', age: 30, profile: { bio: 'Developer' } };
// Generates structure ID: "L0:384-L1:1234-L2:5678"
```

### 2. Access Pattern Tracking
```typescript
// Server automatically tracks which properties are accessed
const trackedUser = context.createState(user);
console.log(trackedUser.name); // Tracked access: "name"
trackedUser.age = 31;          // Tracked mutation: "age"
```

### 3. Intelligent Transfer
```typescript
// First request: Full structure + values
{
  type: 'full',
  structureId: 'L0:384-L1:1234-L2:5678',
  structure: { shape: { name: 'string', age: 'number', profile: {...} } },
  values: { name: 'Alice', age: 30, profile: { bio: 'Developer' } }
}

// Subsequent requests: Values only for known structures
{
  type: 'values-only', 
  structureId: 'L0:384-L1:1234-L2:5678',
  values: { name: 'Bob', age: 25 },
  paths: ['name', 'age'] // Only accessed properties
}
```

## 🎨 API Reference

### Core Classes

#### `StructureSyncProtocol`
Main protocol implementation handling encoding/decoding.

#### `RequestContext` 
Request-scoped context for isolated state tracking.

#### `StateTracker`
Valtio-based proxy for tracking property access patterns.

### Waku Integration

#### `createRSEasyServerIntegration(config)`
Creates server-side integration for Waku.

#### `createRSEasyClientIntegration()`
Creates client-side integration for Waku.

## ⚙️ Configuration

```typescript
const config = {
  enabled: true,                    // Enable/disable RSEasy
  fallbackOnError: true,           // Fallback to standard RSC on errors
  maxStructureCacheSize: 1000,     // Max cached structures
  enablePatternLearning: true      // Learn access patterns over time
};
```

## 🧪 Development

```bash
# Build the library
npm run build

# Watch mode during development  
npm run dev

# Run tests
npm run test

# Run example
npm run example
```

## 🤝 Contributing

RSEasy is experimental technology. Contributions welcome!

## 📄 License

MIT
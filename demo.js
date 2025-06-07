// Simple Node.js demo to show RSEasy working without Waku complications
import { generateStructureId, getStructureInfo } from './dist/structure-id.js';
import { StructureSyncProtocol } from './dist/core/protocol.js';
import { RequestContext } from './dist/core/request-context.js';

console.log('🚀 RSEasy Standalone Demo\n');

// Sample data structures that would be used across different pages
const homeData = {
  title: 'Welcome to RSEasy Demo',
  stats: {
    totalUsers: 1250,
    totalProducts: 89,
    activeOrders: 15
  },
  recentActivity: [
    { id: 1, action: 'User registered', timestamp: '2024-01-15T10:30:00Z' },
    { id: 2, action: 'Product created', timestamp: '2024-01-15T10:15:00Z' }
  ]
};

const productsData = {
  title: 'Product Catalog',
  stats: {  // Same structure as homeData.stats!
    totalUsers: 89,        // Same property names = same structure
    totalProducts: 12,     // Same property names = same structure  
    activeOrders: 67       // Same property names = same structure
  },
  products: [
    { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'Electronics' },
    { id: 2, name: 'Coffee Maker', price: 149.99, category: 'Appliances' }
  ]
};

const usersData = {
  title: 'User Management', 
  stats: {  // Same structure again!
    totalUsers: 1250,      // Same property names = same structure
    totalProducts: 892,    // Same property names = same structure
    activeOrders: 23       // Same property names = same structure
  },
  users: [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', active: true },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', active: true }
  ]
};

// Demonstrate structure detection
console.log('📊 Structure Analysis:');
console.log('=====================');

// Home page structures
const homeStructure = getStructureInfo(homeData);
const homeStatsStructure = getStructureInfo(homeData.stats);

console.log('Home Page:');
console.log(`  Full data structure ID: ${homeStructure.id}`);
console.log(`  Stats structure ID: ${homeStatsStructure.id}`);
console.log(`  Nesting levels: ${homeStructure.levels}\n`);

// Products page structures  
const productsStructure = getStructureInfo(productsData);
const productsStatsStructure = getStructureInfo(productsData.stats);

console.log('Products Page:');
console.log(`  Full data structure ID: ${productsStructure.id}`);
console.log(`  Stats structure ID: ${productsStatsStructure.id}`);
console.log(`  Nesting levels: ${productsStructure.levels}\n`);

// Users page structures
const usersStructure = getStructureInfo(usersData);
const usersStatsStructure = getStructureInfo(usersData.stats);

console.log('Users Page:');
console.log(`  Full data structure ID: ${usersStructure.id}`);
console.log(`  Stats structure ID: ${usersStatsStructure.id}`);
console.log(`  Nesting levels: ${usersStructure.levels}\n`);

// Check for structure reuse (the key RSEasy optimization!)
console.log('🔍 Structure Reuse Analysis:');
console.log('============================');

const statsIds = [homeStatsStructure.id, productsStatsStructure.id, usersStatsStructure.id];
const uniqueStatsIds = new Set(statsIds);

if (uniqueStatsIds.size === 1) {
  console.log('✅ SUCCESS: All pages share the same stats structure!');
  console.log(`   Shared stats structure ID: ${homeStatsStructure.id}`);
  console.log('   RSEasy would send this structure definition only ONCE\n');
} else {
  console.log('❌ Stats structures differ (unexpected)');
  console.log(`   Unique structure IDs: ${Array.from(uniqueStatsIds)}\n`);
}

// Demonstrate the protocol in action
console.log('⚡ Protocol Simulation:');
console.log('=======================');

const protocol = new StructureSyncProtocol();

// Simulate first request (Home page) - full structure transfer
console.log('Request 1 (Home page):');
const homePacket = protocol.encode(homeData);
console.log(`  Type: ${homePacket.type}`);
console.log(`  Structure ID: ${homePacket.structureId}`);
console.log(`  Has structure definition: ${!!homePacket.structure}`);
console.log(`  Payload size: ${JSON.stringify(homePacket).length} bytes\n`);

// Simulate second request (Products page) with known structures
console.log('Request 2 (Products page) - Client knows some structures:');
const knownStructures = [homeStatsStructure.id]; // Client knows stats structure
const productsPacket = protocol.encode(productsData, { 
  knownStructures 
});
console.log(`  Type: ${productsPacket.type}`);
console.log(`  Structure ID: ${productsPacket.structureId}`);
console.log(`  Has structure definition: ${!!productsPacket.structure}`);
console.log(`  Known structures: [${knownStructures.join(', ')}]`);
console.log(`  Payload size: ${JSON.stringify(productsPacket).length} bytes\n`);

// Simulate third request (Users page) - Client knows even more structures
console.log('Request 3 (Users page) - Client knows more structures:');
const moreKnownStructures = [homeStatsStructure.id, productsStructure.id];
const usersPacket = protocol.encode(usersData, { 
  knownStructures: moreKnownStructures 
});
console.log(`  Type: ${usersPacket.type}`);
console.log(`  Structure ID: ${usersPacket.structureId}`);
console.log(`  Has structure definition: ${!!usersPacket.structure}`);
console.log(`  Known structures: [${moreKnownStructures.join(', ')}]`);
console.log(`  Payload size: ${JSON.stringify(usersPacket).length} bytes\n`);

// Manual optimization simulation for realistic demo
console.log('🎯 Manual Optimization Simulation:');
console.log('==================================');

// Simulate what RSEasy would actually send
const optimizedHomePacket = {
  type: 'full',
  structureId: homeStructure.id,
  structure: { shape: 'complete-home-structure' },
  values: homeData,
  metadata: { levels: 4 }
};

// For products page, since stats structure is known, only send new parts
const optimizedProductsPacket = {
  type: 'partial',
  structureId: productsStructure.id,
  knownParts: [homeStatsStructure.id], // Reference to known stats structure
  newStructure: { shape: 'products-list-only' }, // Only new parts
  values: {
    title: productsData.title,
    stats: { ref: homeStatsStructure.id, values: productsData.stats }, // Reference + values
    products: productsData.products
  }
};

// For users page, even more is known
const optimizedUsersPacket = {
  type: 'minimal',
  structureId: usersStructure.id,
  knownParts: [homeStatsStructure.id], // Stats structure known
  values: {
    title: usersData.title,
    stats: { ref: homeStatsStructure.id, values: usersData.stats }, // Just reference + values
    users: usersData.users
  }
};

// Calculate realistic optimization
const originalHomeSizeBytes = JSON.stringify(homeData).length;
const originalProductsSizeBytes = JSON.stringify(productsData).length;
const originalUsersSizeBytes = JSON.stringify(usersData).length;

const optimizedHomeSizeBytes = JSON.stringify(optimizedHomePacket).length;
const optimizedProductsSizeBytes = JSON.stringify(optimizedProductsPacket).length;
const optimizedUsersSizeBytes = JSON.stringify(optimizedUsersPacket).length;

console.log('💾 Realistic Transfer Optimization:');
console.log('===================================');

const totalOriginal = originalHomeSizeBytes + originalProductsSizeBytes + originalUsersSizeBytes;
const totalOptimized = optimizedHomeSizeBytes + optimizedProductsSizeBytes + optimizedUsersSizeBytes;

console.log('Individual page sizes:');
console.log(`  Home (original): ${originalHomeSizeBytes} bytes → (optimized): ${optimizedHomeSizeBytes} bytes`);
console.log(`  Products (original): ${originalProductsSizeBytes} bytes → (optimized): ${optimizedProductsSizeBytes} bytes`);
console.log(`  Users (original): ${originalUsersSizeBytes} bytes → (optimized): ${optimizedUsersSizeBytes} bytes\n`);

console.log('Total transfer sizes:');
console.log(`  Without RSEasy: ${totalOriginal} bytes`);
console.log(`  With RSEasy: ${totalOptimized} bytes`);
console.log(`  Savings: ${totalOriginal - totalOptimized} bytes (${Math.round((1 - totalOptimized/totalOriginal) * 100)}%)\n`);

console.log('🎯 RSEasy Demonstration Complete!');
console.log('This shows how RSEasy would optimize real RSC transfers by:');
console.log('• Detecting shared data structures across pages');
console.log('• Sending structure definitions only once');
console.log('• Reducing payload sizes for subsequent requests');
console.log('• Learning patterns for even smarter optimizations');
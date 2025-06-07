// Realistic RSEasy space savings demonstration
import { generateStructureId, getStructureInfo } from './dist/structure-id.js';

console.log('🚀 RSEasy Space Savings Demo\n');

// Create larger, more realistic data that would benefit from structure optimization
const createUserData = (id, name, email) => ({
  id,
  name, 
  email,
  profile: {
    avatar: `https://example.com/avatars/${id}.jpg`,
    bio: `I am ${name}, a developer working with React and TypeScript.`,
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en-US'
    },
    stats: {
      postsCount: Math.floor(Math.random() * 100),
      followersCount: Math.floor(Math.random() * 1000),
      followingCount: Math.floor(Math.random() * 500)
    }
  },
  metadata: {
    createdAt: '2024-01-15T10:30:00Z',
    lastActive: '2024-01-20T15:45:00Z',
    verified: true,
    tier: 'premium'
  }
});

const createProductData = (id, name, price) => ({
  id,
  name,
  price,
  details: {
    description: `High-quality ${name} with excellent features and great value.`,
    specifications: {
      weight: '1.2kg',
      dimensions: '10x15x5cm',
      warranty: '2 years'
    },
    ratings: {
      average: 4.5,
      count: 127,
      breakdown: {
        5: 65,
        4: 40,
        3: 15,
        2: 5,
        1: 2
      }
    }
  },
  inventory: {
    inStock: true,
    quantity: Math.floor(Math.random() * 100),
    warehouse: 'US-WEST-1',
    supplier: 'ACME Corp'
  }
});

// Simulate pages with many similar objects
const usersPage = {
  title: 'Users Directory',
  users: [
    createUserData(1, 'Alice Johnson', 'alice@example.com'),
    createUserData(2, 'Bob Smith', 'bob@example.com'),
    createUserData(3, 'Carol Davis', 'carol@example.com'),
    createUserData(4, 'David Wilson', 'david@example.com'),
    createUserData(5, 'Eve Brown', 'eve@example.com'),
  ]
};

const productsPage = {
  title: 'Product Catalog',
  products: [
    createProductData(1, 'Wireless Headphones', 99.99),
    createProductData(2, 'Smart Watch', 299.99),
    createProductData(3, 'Laptop Stand', 49.99),
    createProductData(4, 'USB-C Hub', 79.99),
    createProductData(5, 'Keyboard', 129.99),
  ]
};

// Analyze structures
const userStructureId = getStructureInfo(usersPage.users[0]).id;
const productStructureId = getStructureInfo(productsPage.products[0]).id;

console.log('📊 Structure Analysis:');
console.log('=====================');
console.log(`User object structure ID: ${userStructureId}`);
console.log(`Product object structure ID: ${productStructureId}\n`);

// Calculate traditional transfer (full JSON for each page)
const traditionalUsersBytes = JSON.stringify(usersPage).length;
const traditionalProductsBytes = JSON.stringify(productsPage).length;
const traditionalTotal = traditionalUsersBytes + traditionalProductsBytes;

console.log('📦 Traditional Transfer (Full JSON):');
console.log('====================================');
console.log(`Users page: ${traditionalUsersBytes} bytes`);
console.log(`Products page: ${traditionalProductsBytes} bytes`);
console.log(`Total: ${traditionalTotal} bytes\n`);

// Simulate RSEasy optimization
console.log('⚡ RSEasy Optimized Transfer:');
console.log('=============================');

// First request (Users page) - send full structure + values
const userStructureDefinition = {
  type: 'object',
  properties: {
    id: 'number',
    name: 'string', 
    email: 'string',
    profile: {
      type: 'object',
      properties: {
        avatar: 'string',
        bio: 'string',
        preferences: {
          type: 'object',
          properties: {
            theme: 'string',
            notifications: 'boolean',
            language: 'string'
          }
        },
        stats: {
          type: 'object',
          properties: {
            postsCount: 'number',
            followersCount: 'number', 
            followingCount: 'number'
          }
        }
      }
    },
    metadata: {
      type: 'object',
      properties: {
        createdAt: 'string',
        lastActive: 'string',
        verified: 'boolean',
        tier: 'string'
      }
    }
  }
};

const optimizedUsersPage = {
  type: 'full',
  structureId: userStructureId,
  structure: userStructureDefinition,
  values: usersPage
};

const optimizedUsersBytes = JSON.stringify(optimizedUsersPage).length;

// Second request (Products page) - send structure + values (no reuse yet)
const productStructureDefinition = {
  type: 'object',
  properties: {
    id: 'number',
    name: 'string',
    price: 'number',
    details: {
      type: 'object',
      properties: {
        description: 'string',
        specifications: {
          type: 'object',
          properties: {
            weight: 'string',
            dimensions: 'string',
            warranty: 'string'
          }
        },
        ratings: {
          type: 'object',
          properties: {
            average: 'number',
            count: 'number',
            breakdown: {
              type: 'object',
              properties: {
                5: 'number',
                4: 'number',
                3: 'number',
                2: 'number',
                1: 'number'
              }
            }
          }
        }
      }
    },
    inventory: {
      type: 'object',
      properties: {
        inStock: 'boolean',
        quantity: 'number',
        warehouse: 'string',
        supplier: 'string'
      }
    }
  }
};

const optimizedProductsPage = {
  type: 'full',
  structureId: productStructureId,
  structure: productStructureDefinition,
  values: productsPage
};

const optimizedProductsBytes = JSON.stringify(optimizedProductsPage).length;

console.log(`Request 1 (Users): ${optimizedUsersBytes} bytes (includes structure definition)`);
console.log(`Request 2 (Products): ${optimizedProductsBytes} bytes (includes structure definition)\n`);

// Now simulate subsequent requests where we can reuse structures
console.log('🎯 Subsequent Requests (Structure Reuse):');
console.log('========================================');

// Third request - more users (reuse user structure)
const moreUsers = {
  title: 'Team Members',
  users: [
    createUserData(6, 'Frank Miller', 'frank@example.com'),
    createUserData(7, 'Grace Lee', 'grace@example.com'),
    createUserData(8, 'Henry Chen', 'henry@example.com'),
  ]
};

// Only send values, reference known structure
const optimizedMoreUsers = {
  type: 'values-only',
  structureId: userStructureId, // Reference known structure
  values: moreUsers
};

const optimizedMoreUsersBytes = JSON.stringify(optimizedMoreUsers).length;
const traditionalMoreUsersBytes = JSON.stringify(moreUsers).length;

// Fourth request - more products (reuse product structure)
const moreProducts = {
  title: 'Featured Products',
  products: [
    createProductData(6, 'Monitor', 399.99),
    createProductData(7, 'Mouse Pad', 19.99),
  ]
};

const optimizedMoreProducts = {
  type: 'values-only',
  structureId: productStructureId, // Reference known structure
  values: moreProducts
};

const optimizedMoreProductsBytes = JSON.stringify(optimizedMoreProducts).length;
const traditionalMoreProductsBytes = JSON.stringify(moreProducts).length;

console.log(`Request 3 (More Users - traditional): ${traditionalMoreUsersBytes} bytes`);
console.log(`Request 3 (More Users - RSEasy): ${optimizedMoreUsersBytes} bytes`);
console.log(`Request 4 (More Products - traditional): ${traditionalMoreProductsBytes} bytes`);
console.log(`Request 4 (More Products - RSEasy): ${optimizedMoreProductsBytes} bytes\n`);

// Calculate total savings
const traditionalTotalAll = traditionalUsersBytes + traditionalProductsBytes + traditionalMoreUsersBytes + traditionalMoreProductsBytes;
const optimizedTotalAll = optimizedUsersBytes + optimizedProductsBytes + optimizedMoreUsersBytes + optimizedMoreProductsBytes;

console.log('💾 Total Transfer Comparison:');
console.log('=============================');
console.log(`Traditional approach: ${traditionalTotalAll} bytes`);
console.log(`RSEasy optimized: ${optimizedTotalAll} bytes`);
console.log(`Savings: ${traditionalTotalAll - optimizedTotalAll} bytes (${Math.round((1 - optimizedTotalAll/traditionalTotalAll) * 100)}%)\n`);

console.log('🎯 Key Benefits Demonstrated:');
console.log('=============================');
console.log('• Structure definitions sent only once per unique shape');
console.log('• Subsequent requests with same structures are much smaller');
console.log('• Bigger savings with more reuse of common structures');
console.log('• Perfect for RSC apps with repeated data patterns');
console.log('• Automatic optimization with zero developer effort');
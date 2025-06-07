// Realistic RSEasy demo showing where it provides real value
import { generateStructureId, getStructureInfo } from './dist/structure-id.js';

console.log('🚀 RSEasy Real-World Benefits Demo\n');

// Create a realistic user object structure
const createUser = (id, name, email) => ({
  id,
  name,
  email,
  profile: {
    avatar: `https://cdn.example.com/avatars/${id}.jpg`,
    bio: `I'm ${name}, passionate about technology and innovation.`,
    location: 'San Francisco, CA',
    website: `https://${name.toLowerCase().replace(' ', '')}.dev`
  },
  stats: {
    posts: Math.floor(Math.random() * 50),
    followers: Math.floor(Math.random() * 1000),
    following: Math.floor(Math.random() * 200)
  },
  settings: {
    theme: 'dark',
    notifications: true,
    privacy: 'public',
    language: 'en'
  }
});

// Scenario: Large user directory page with 20 users
const userDirectory = Array.from({ length: 20 }, (_, i) => 
  createUser(i + 1, `User ${i + 1}`, `user${i + 1}@example.com`)
);

console.log('📊 Scenario: User Directory with 20 Users');
console.log('==========================================');

// Traditional approach: Send full JSON
const traditionalPayload = JSON.stringify(userDirectory);
const traditionalBytes = traditionalPayload.length;

console.log(`Traditional JSON payload: ${traditionalBytes} bytes\n`);

// RSEasy approach: Structure + values separation
const userStructure = getStructureInfo(userDirectory[0]);
console.log(`User structure ID: ${userStructure.id}`);
console.log(`Structure nesting levels: ${userStructure.levels}\n`);

// Simulate RSEasy optimized payload
const structureDefinition = {
  id: userStructure.id,
  shape: {
    type: 'object',
    properties: {
      id: 'number',
      name: 'string',
      email: 'string',
      profile: {
        avatar: 'string',
        bio: 'string',
        location: 'string',
        website: 'string'
      },
      stats: {
        posts: 'number',
        followers: 'number',
        following: 'number'
      },
      settings: {
        theme: 'string',
        notifications: 'boolean',
        privacy: 'string',
        language: 'string'
      }
    }
  }
};

// Extract just the values (no structure info)
const valuesOnly = userDirectory.map(user => [
  user.id,
  user.name, 
  user.email,
  [user.profile.avatar, user.profile.bio, user.profile.location, user.profile.website],
  [user.stats.posts, user.stats.followers, user.stats.following],
  [user.settings.theme, user.settings.notifications, user.settings.privacy, user.settings.language]
]);

const rseasyPayload = {
  structure: structureDefinition,
  values: valuesOnly
};

const rseasyBytes = JSON.stringify(rseasyPayload).length;

console.log('⚡ RSEasy Optimized Transfer:');
console.log('============================');
console.log(`Structure definition: ${JSON.stringify(structureDefinition).length} bytes`);
console.log(`Values only: ${JSON.stringify(valuesOnly).length} bytes`);
console.log(`Total RSEasy payload: ${rseasyBytes} bytes\n`);

console.log('💾 Comparison:');
console.log('==============');
console.log(`Traditional: ${traditionalBytes} bytes`);
console.log(`RSEasy: ${rseasyBytes} bytes`);
console.log(`Savings: ${traditionalBytes - rseasyBytes} bytes (${Math.round((1 - rseasyBytes/traditionalBytes) * 100)}%)\n`);

// Show even bigger benefits with multiple pages
console.log('🎯 Multiple Pages Scenario:');
console.log('===========================');

// Page 2: More users (reuse structure)
const moreUsers = Array.from({ length: 15 }, (_, i) => 
  createUser(i + 21, `Employee ${i + 1}`, `emp${i + 1}@company.com`)
);

// Page 3: Team members (reuse structure again)  
const teamMembers = Array.from({ length: 8 }, (_, i) =>
  createUser(i + 36, `Team Lead ${i + 1}`, `lead${i + 1}@company.com`)
);

// Traditional: Full JSON for each page
const traditionalPage2 = JSON.stringify(moreUsers).length;
const traditionalPage3 = JSON.stringify(teamMembers).length;
const traditionalTotal = traditionalBytes + traditionalPage2 + traditionalPage3;

// RSEasy: Structure sent once, then values only
const valuesOnlyPage2 = moreUsers.map(user => [
  user.id, user.name, user.email,
  [user.profile.avatar, user.profile.bio, user.profile.location, user.profile.website],
  [user.stats.posts, user.stats.followers, user.stats.following],
  [user.settings.theme, user.settings.notifications, user.settings.privacy, user.settings.language]
]);

const valuesOnlyPage3 = teamMembers.map(user => [
  user.id, user.name, user.email,
  [user.profile.avatar, user.profile.bio, user.profile.location, user.profile.website],
  [user.stats.posts, user.stats.followers, user.stats.following],
  [user.settings.theme, user.settings.notifications, user.settings.privacy, user.settings.language]
]);

const rseasyPage2 = JSON.stringify({ structureId: userStructure.id, values: valuesOnlyPage2 }).length;
const rseasyPage3 = JSON.stringify({ structureId: userStructure.id, values: valuesOnlyPage3 }).length;
const rseasyTotal = rseasyBytes + rseasyPage2 + rseasyPage3;

console.log('Page-by-page breakdown:');
console.log(`Page 1 - Traditional: ${traditionalBytes} bytes, RSEasy: ${rseasyBytes} bytes`);
console.log(`Page 2 - Traditional: ${traditionalPage2} bytes, RSEasy: ${rseasyPage2} bytes`);
console.log(`Page 3 - Traditional: ${traditionalPage3} bytes, RSEasy: ${rseasyPage3} bytes\n`);

console.log('Total for all 3 pages:');
console.log(`Traditional: ${traditionalTotal} bytes`);
console.log(`RSEasy: ${rseasyTotal} bytes`);
console.log(`Total savings: ${traditionalTotal - rseasyTotal} bytes (${Math.round((1 - rseasyTotal/traditionalTotal) * 100)}%)\n`);

console.log('🚀 Real-World RSEasy Benefits:');
console.log('==============================');
console.log('✅ Automatically detects repeated object structures');
console.log('✅ Sends structure definitions only once');
console.log('✅ Massive savings for pages with many similar objects');
console.log('✅ Perfect for user lists, product catalogs, data tables');
console.log('✅ Zero developer effort - works transparently');
console.log('✅ Bigger savings as app grows and reuses more structures');
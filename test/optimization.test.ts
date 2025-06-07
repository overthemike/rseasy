import { describe, test, expect } from "vitest";
import { StructureSyncProtocol } from '../src/core/protocol';

// A helper to calculate the size of a string in bytes.
const getByteSize = (str: string) => new TextEncoder().encode(str).length;

// --- Test Data Generator ---
// A realistic data structure where key elimination will have a significant impact.
const createTestUsers = (page: number, userCount: number) => ({
  page,
  total_pages: Math.ceil(500 / userCount),
  data: Array.from({ length: userCount }, (_, i) => {
    const id = (page - 1) * userCount + i;
    return {
      id,
      email: `user_${id}@example.com`,
      first_name: `FirstName${id}`,
      last_name: `LastName${id}`,
      status: i % 5 === 0 ? 'inactive' : 'active',
      last_login: new Date(Date.now() - i * 3600000),
      permissions: {
        can_edit: i % 2 === 0,
        can_delete: i % 10 === 0,
        role: 'user',
      }
    };
  })
});

// --- Test Suite ---
describe("API Payload Optimization Scaling Test", () => {
  
  const runTestForSize = (userCount: number, testName: string) => {
    test(`should correctly encode/decode and show size reduction for a ${testName} payload`, () => {
      // --- Setup ---
      const protocol = new StructureSyncProtocol();
      const originalObject = createTestUsers(1, userCount);

      // --- 1. Baseline Size ---
      const baselinePayload = JSON.stringify(originalObject);
      const baselineSize = getByteSize(baselinePayload);
      
      console.log(`\n--- Testing ${testName} Payload (${userCount} users) ---`);
      console.log(`1. Baseline Payload (Standard JSON) -> Size: ${baselineSize} bytes`);
      
      // --- 2. Optimized Round-Trip Simulation ---
      const structureDef = protocol.createStructureDefinition(originalObject);
      const optimizedPacket = protocol.encode(originalObject, { knownStructureId: structureDef.id });
      const optimizedPayload = JSON.stringify(optimizedPacket);
      const optimizedSize = getByteSize(optimizedPayload);
      
      const reduction = ((baselineSize - optimizedSize) / baselineSize) * 100;

      console.log(`2. Optimized Subsequent Request -> Size: ${optimizedSize} bytes`);
      console.log(`   Reduction vs Baseline: ${reduction.toFixed(2)}%`);

      // --- 3. Verification ---
      const decodedObject = protocol.decode(optimizedPacket, structureDef);
      expect(decodedObject).toEqual(originalObject);
      
      // For very small payloads, the optimized version might be larger due to overhead.
      // For large and very large, it must be smaller.
      if (userCount > 10) {
        expect(optimizedSize).toBeLessThan(baselineSize);
      }
    });
  };

  // --- Run the tests for different sizes ---
  runTestForSize(5, "Small");
  runTestForSize(50, "Large");
  runTestForSize(250, "Very Large");
  runTestForSize(1000, "Huge")

});
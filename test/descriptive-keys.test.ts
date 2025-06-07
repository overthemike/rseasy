import { describe, test, expect } from "vitest";
import { StructureSyncProtocol } from '../src/core/protocol';

// A helper to calculate the size of a string in bytes.
const getByteSize = (str: string) => new TextEncoder().encode(str).length;

// --- Test Data Generator with Descriptive Keys ---
const createDescriptiveTestObject = (userCount: number) => ({
  pagination_metadata: {
    current_page_number: 1,
    total_pages_available: Math.ceil(500 / userCount),
    records_per_page: userCount,
  },
  user_data_payload: Array.from({ length: userCount }, (_, i) => {
    const id = 1000 + i;
    return {
      user_authentication_identifier: id,
      primary_electronic_mail_address: `user_account_${id}@corporate-domain.com`,
      user_given_name: `FirstName${id}`,
      user_family_name: `LastName${id}`,
      account_activation_status: i % 5 === 0 ? 'STATUS_INACTIVE' : 'STATUS_ACTIVE',
      timestamp_of_last_recorded_login: new Date(Date.now() - i * 3600000),
      user_permission_configuration: {
        has_write_access_to_documents: i % 2 === 0,
        is_eligible_for_account_deletion: i % 10 === 0,
        assigned_security_role_name: 'StandardUserTier1',
      }
    };
  })
});

// --- Test Suite ---
describe("API Optimization with Descriptive Keys (Scaling Test)", () => {

  /**
   * Helper function to run the optimization test for a given payload size.
   * @param userCount The number of user objects to include in the payload.
   * @param testName A descriptive name for the test run.
   */
  const runDescriptiveTestForSize = (userCount: number, testName: string) => {
    test(`should show size reduction for a ${testName} payload`, () => {
      // --- Setup ---
      const protocol = new StructureSyncProtocol();
      const originalObject = createDescriptiveTestObject(userCount);

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
      
      // The optimized version should always be smaller with these long keys.
      expect(optimizedSize).toBeLessThan(baselineSize);
    });
  };

  // --- Run the tests for different sizes ---
  runDescriptiveTestForSize(5, "Small");
  runDescriptiveTestForSize(50, "Large");
  runDescriptiveTestForSize(250, "Very Large");
  runDescriptiveTestForSize(1000, "Huge");
});
/**
 * 🔒 Unit & Integration Security Test: Academy OTP Security Gate
 * Verifies that the fixed OTP 123456 backdoor is strictly OFF when ALLOW_ACADEMY_TEST_OTP !== 'true'.
 * 
 * Can be run with Jest: npx jest apps/backend/tests/controller/academyOtpSecurityGate.test.js
 * Or directly with Node: node apps/backend/tests/controller/academyOtpSecurityGate.test.js
 */

const assert = require('assert');

// Mock Redis / DB connection side effects before requiring controller
process.env.NODE_ENV = 'test';

const { isAcademyTestOtpEnabled } = require('../../controller/academyController');

function runTests() {
  console.log('🧪 Starting Academy Test OTP Security Gate Unit Tests...');

  const originalEnv = process.env.ALLOW_ACADEMY_TEST_OTP;
  const originalAccountsEnv = process.env.ACADEMY_TEST_ACCOUNTS;

  try {
    // -------------------------------------------------------------
    // Test 1: Production Default (env unset) -> Strictly FALSE
    // -------------------------------------------------------------
    delete process.env.ALLOW_ACADEMY_TEST_OTP;
    delete process.env.ACADEMY_TEST_ACCOUNTS;

    assert.strictEqual(
      isAcademyTestOtpEnabled('01000000099'),
      false,
      'Test 1a: isTestFixedOtp must be FALSE for 01000000099 when env is unset'
    );
    assert.strictEqual(
      isAcademyTestOtpEnabled('01000000088'),
      false,
      'Test 1b: isTestFixedOtp must be FALSE for 01000000088 when env is unset'
    );
    assert.strictEqual(
      isAcademyTestOtpEnabled('201000000099', ['201000000099', '01000000099']),
      false,
      'Test 1c: isTestFixedOtp must be FALSE for variant 201000000099 when env is unset'
    );
    assert.strictEqual(
      isAcademyTestOtpEnabled('01123456789'),
      false,
      'Test 1d: isTestFixedOtp must be FALSE for real phone numbers'
    );
    console.log('   ✅ Test 1 Passed: Production default (env unset) is strictly locked');

    // -------------------------------------------------------------
    // Test 2: Explicitly FALSE / other strings -> Strictly FALSE
    // -------------------------------------------------------------
    const falsyValues = ['false', 'FALSE', '0', 'no', 'null', 'undefined', ''];
    for (const val of falsyValues) {
      process.env.ALLOW_ACADEMY_TEST_OTP = val;
      assert.strictEqual(
        isAcademyTestOtpEnabled('01000000099'),
        false,
        `Test 2: isTestFixedOtp must be FALSE when ALLOW_ACADEMY_TEST_OTP="${val}"`
      );
      assert.strictEqual(
        isAcademyTestOtpEnabled('01000000088'),
        false,
        `Test 2: isTestFixedOtp must be FALSE for 088 when ALLOW_ACADEMY_TEST_OTP="${val}"`
      );
    }
    console.log('   ✅ Test 2 Passed: Falsy / invalid env values strictly rejected');

    // -------------------------------------------------------------
    // Test 3: Legacy ACADEMY_TEST_ACCOUNTS env var has NO EFFECT
    // -------------------------------------------------------------
    delete process.env.ALLOW_ACADEMY_TEST_OTP;
    process.env.ACADEMY_TEST_ACCOUNTS = 'true';
    assert.strictEqual(
      isAcademyTestOtpEnabled('01000000099'),
      false,
      'Test 3: ACADEMY_TEST_ACCOUNTS=true must NOT enable test OTP without ALLOW_ACADEMY_TEST_OTP=true'
    );
    delete process.env.ACADEMY_TEST_ACCOUNTS;
    console.log('   ✅ Test 3 Passed: ACADEMY_TEST_ACCOUNTS has zero bypass effect');

    // -------------------------------------------------------------
    // Test 4: Dev/Test Mode (ALLOW_ACADEMY_TEST_OTP === 'true') -> Allowed ONLY for 099 & 088
    // -------------------------------------------------------------
    process.env.ALLOW_ACADEMY_TEST_OTP = 'true';

    // 4a: Target test accounts MUST be true
    assert.strictEqual(
      isAcademyTestOtpEnabled('01000000099'),
      true,
      'Test 4a: isTestFixedOtp must be TRUE for 01000000099 when flag is "true"'
    );
    assert.strictEqual(
      isAcademyTestOtpEnabled('01000000088'),
      true,
      'Test 4b: isTestFixedOtp must be TRUE for 01000000088 when flag is "true"'
    );
    assert.strictEqual(
      isAcademyTestOtpEnabled('201000000099', ['201000000099', '01000000099']),
      true,
      'Test 4c: isTestFixedOtp must be TRUE for international variant when flag is "true"'
    );

    // 4b: Real customer accounts MUST STILL BE FALSE even when flag is true!
    assert.strictEqual(
      isAcademyTestOtpEnabled('01123456789'),
      false,
      'Test 4d: isTestFixedOtp must be FALSE for normal customer even when flag is "true"'
    );
    assert.strictEqual(
      isAcademyTestOtpEnabled('01011112222'),
      false,
      'Test 4e: isTestFixedOtp must be FALSE for random number even when flag is "true"'
    );
    console.log('   ✅ Test 4 Passed: Dev flag only activates for dedicated test phones');

    console.log('🎉 ALL ACADEMY TEST OTP GATE TESTS PASSED!');
    return true;
  } finally {
    // Restore env
    if (originalEnv !== undefined) {
      process.env.ALLOW_ACADEMY_TEST_OTP = originalEnv;
    } else {
      delete process.env.ALLOW_ACADEMY_TEST_OTP;
    }
    if (originalAccountsEnv !== undefined) {
      process.env.ACADEMY_TEST_ACCOUNTS = originalAccountsEnv;
    } else {
      delete process.env.ACADEMY_TEST_ACCOUNTS;
    }
  }
}

// Support Jest runner if invoked by jest
if (typeof describe === 'function') {
  describe('Academy OTP Security Gate Unit Tests', () => {
    test('enforces zero fixed OTP backdoor when ALLOW_ACADEMY_TEST_OTP !== "true"', () => {
      runTests();
    });
  });
}

// Support direct node execution: node apps/backend/tests/controller/academyOtpSecurityGate.test.js
if (require.main === module) {
  runTests();
  process.exit(0);
}

module.exports = { runTests };

/**
 * @file verify-public-code.js
 * @description Offline self-check for company public code generator (AC-1).
 * Tests format validity, uniqueness, prefix determinism, and stub prisma without DB.
 *
 * Usage:
 *   node apps/backend/scripts/one-off/verify-public-code.js [--count=10000]
 */

const {
  PREFIX_RE,
  CODE_RE,
  buildPublicCodePrefix,
  generatePublicCode,
  generateUniqueCompanyPublicCode
} = require('../../utils/companyPublicCode');

async function run() {
  const args = process.argv.slice(2);
  let count = 10000;
  for (const arg of args) {
    if (arg.startsWith('--count=')) {
      const parsed = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(parsed) && parsed > 0) count = parsed;
    }
  }

  // 1. Prefix test
  const prefixSwan = buildPublicCodePrefix('Swan');
  if (prefixSwan !== 'SWAN') {
    console.error(`Prefix test failed: expected SWAN, got ${prefixSwan}`);
    process.exit(1);
  }

  // 2. Format validation on 10,000 codes
  const sampleNames = ['Swan', 'Acme', 'Mega Corp', 'Global Logistics', 'Al Amal', 'XYZ', 'A', ''];
  let validCount = 0;
  for (let i = 0; i < count; i += 1) {
    const name = sampleNames[i % sampleNames.length];
    const code = generatePublicCode(name);
    if (CODE_RE.test(code)) {
      validCount += 1;
    }
  }

  // 3. Uniqueness test on 100 codes
  const uniqueTarget = 100;
  const uniqueSet = new Set();
  for (let i = 0; i < uniqueTarget; i += 1) {
    const code = generatePublicCode('Swan');
    uniqueSet.add(code);
  }
  const noCollisions = uniqueSet.size === uniqueTarget;

  // 4. Offline stub prisma test for generateUniqueCompanyPublicCode
  let stubCollisions = 1;
  const stubPrisma = {
    company: {
      findFirst: async ({ where }) => {
        if (stubCollisions > 0) {
          stubCollisions -= 1;
          return { id: 'existing-id' }; // simulate 1 collision
        }
        return null; // unique
      }
    }
  };
  const stubResult = await generateUniqueCompanyPublicCode('Swan', { prisma: stubPrisma });
  if (!CODE_RE.test(stubResult)) {
    console.error(`Stub test failed: invalid code ${stubResult}`);
    process.exit(1);
  }

  // Print AC-1 expected format
  console.log(`format: ${validCount}/${count} valid`);
  console.log(`unique: ${uniqueSet.size}/${uniqueTarget} ${noCollisions ? 'no collisions' : 'has collisions'}`);
  console.log(`prefix("Swan") = ${prefixSwan}`);
}

run().catch((err) => {
  console.error('Self-check error:', err);
  process.exit(1);
});

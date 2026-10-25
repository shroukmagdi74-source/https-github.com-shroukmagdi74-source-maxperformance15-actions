const { getSharedPrismaClient } = require('../services/sharedDatabase');

async function main() {
  const prisma = getSharedPrismaClient();
  console.log('🚀 Checking for duplicates before creating unique index on suppliers(companyId, phoneNormalized)...');

  try {
    // 1. Check if any duplicate (companyId, phoneNormalized) pairs exist
    const duplicates = await prisma.$queryRawUnsafe(`
      SELECT "companyId", "phoneNormalized", COUNT(*) as count, ARRAY_AGG(id) as ids, ARRAY_AGG(name) as names
      FROM suppliers
      WHERE "phoneNormalized" IS NOT NULL AND "phoneNormalized" != ''
      GROUP BY "companyId", "phoneNormalized"
      HAVING COUNT(*) > 1;
    `);

    if (duplicates.length > 0) {
      console.error(`\n❌ ERROR: Found ${duplicates.length} duplicate group(s) with identical (companyId, phoneNormalized)!`);
      console.error('Cannot create unique index until duplicates are merged.\n');

      duplicates.forEach((dup, index) => {
        console.error(`Group #${index + 1}:`);
        console.error(`  Company ID:      ${dup.companyId}`);
        console.error(`  PhoneNormalized: ${dup.phoneNormalized}`);
        console.error(`  Count:           ${dup.count}`);
        console.error(`  Supplier IDs:    ${dup.ids.join(', ')}`);
        console.error(`  Supplier Names:  ${dup.names.join(', ')}`);
        console.error('--------------------------------------------------');
      });

      console.error('👉 Please run "node scripts/merge_duplicate_suppliers.js --apply" first to resolve duplicates.');
      process.exit(1);
    }

    console.log('✅ No duplicates found. Proceeding with unique index creation...');

    // 2. Create UNIQUE index
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "suppliers_companyId_phoneNormalized_key" 
      ON suppliers("companyId", "phoneNormalized");
    `);

    console.log('✅ Successfully created unique index "suppliers_companyId_phoneNormalized_key" on suppliers(companyId, phoneNormalized).');
  } catch (error) {
    console.error('❌ Error executing add_supplier_phone_unique migration:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();

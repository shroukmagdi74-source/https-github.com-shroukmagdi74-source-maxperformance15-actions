const { getSharedPrismaClient } = require('../services/sharedDatabase');
const { toCanonicalE164 } = require('../utils/phoneNormalization');

async function main() {
  const prisma = getSharedPrismaClient();
  console.log('🚀 Starting migration: add_supplier_fields...');

  try {
    // 1. Add columns safely
    console.log('1. Adding columns to "suppliers" table if they do not exist...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS "tags" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS "phoneNormalized" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS "customerId" TEXT;
    `);
    console.log('✅ Columns added successfully.');

    // 2. Backfill phoneNormalized for existing rows
    console.log('2. Backfilling "phoneNormalized" for existing suppliers...');
    const suppliers = await prisma.$queryRawUnsafe(`
      SELECT id, phone, mobile FROM suppliers WHERE "phoneNormalized" IS NULL;
    `);
    console.log(`Found ${suppliers.length} supplier(s) needing normalization.`);

    let updatedCount = 0;
    for (const s of suppliers) {
      const raw = s.phone || s.mobile;
      if (!raw) continue;
      const canonical = toCanonicalE164(raw);
      if (canonical) {
        await prisma.$executeRawUnsafe(
          `UPDATE suppliers SET "phoneNormalized" = $1 WHERE id = $2;`,
          canonical,
          s.id
        );
        updatedCount++;
      }
    }

    console.log(`✅ Backfilled phoneNormalized for ${updatedCount} supplier(s).`);
    console.log('🎉 add_supplier_fields completed successfully.');
  } catch (error) {
    console.error('❌ Error executing add_supplier_fields migration:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();

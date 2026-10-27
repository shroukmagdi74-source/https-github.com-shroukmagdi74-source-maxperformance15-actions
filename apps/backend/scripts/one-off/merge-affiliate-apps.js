/**
 * @file merge-affiliate-apps.js
 * @description One-off migration script to safely unify 'affiliate-program' into 'affiliate-pro'.
 *
 * SAFETY & DESIGN:
 *   - Default is DRY RUN; writes only when invoked with `--apply`.
 *   - NO row is ever deleted (affiliate-program status becomes 'INACTIVE').
 *   - Free grandfathered state is preserved: does NOT set nextBillingAt or validUntil unless already present.
 *   - Idempotent: re-running on an already-migrated database does nothing (skipped).
 *   - Supports `--verify` flag to report counts of companies on legacy slug (expecting 0 active after apply).
 *
 * Usage:
 *   node scripts/one-off/merge-affiliate-apps.js [--dry-run|--apply] [--verify] [--batch=500]
 */

const LEGACY_SLUG = 'affiliate-program';
const TARGET_SLUG = 'affiliate-pro';

let activePrisma = null;

function getPrisma() {
  if (activePrisma) return activePrisma;

  const fs = require('fs');
  const path = require('path');
  const worktreeClient = path.join(__dirname, '..', '..', 'prisma', 'generated', 'postgresql_v2');
  const qaSeedClient = 'C:/Users/ali wazery/maxp-qa/qa-seed/backend/prisma/generated/postgresql_v2';

  if (!fs.existsSync(worktreeClient) && fs.existsSync(qaSeedClient)) {
    try {
      const imported = require(qaSeedClient);
      const PrismaClient = imported.PrismaClient || imported.default || imported;
      const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      activePrisma = new PrismaClient({
        datasources: { db: { url: databaseUrl } }
      });
      return activePrisma;
    } catch (_) {}
  }

  const { getSharedPrismaClient } = require('../../services/sharedDatabase');
  activePrisma = getSharedPrismaClient();
  return activePrisma;
}

function parseSettings(raw) {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch (_) {
      return {};
    }
  }
  return {};
}

function resolveBestStatus(existingStatus, legacyStatus) {
  const normExisting = String(existingStatus || '').trim().toUpperCase();
  const normLegacy = String(legacyStatus || '').trim().toUpperCase();

  // ACTIVE always wins
  if (normExisting === 'ACTIVE' || normLegacy === 'ACTIVE') {
    return 'ACTIVE';
  }
  if (normExisting === 'TRIAL' || normLegacy === 'TRIAL') {
    return 'TRIAL';
  }
  if (normExisting) {
    return normExisting;
  }
  return normLegacy || 'INACTIVE';
}

async function runVerify(prisma) {
  console.log('\n--- VERIFY MODE ---');
  const legacyApp = await prisma.marketplaceApp.findUnique({
    where: { slug: LEGACY_SLUG },
    select: { id: true, slug: true, name: true }
  });

  const proApp = await prisma.marketplaceApp.findUnique({
    where: { slug: TARGET_SLUG },
    select: { id: true, slug: true, name: true }
  });

  if (!legacyApp) {
    console.log(`MarketplaceApp '${LEGACY_SLUG}' does not exist in database.`);
    console.log(`active_legacy=0 (expected: 0 after apply)`);
    return { activeLegacyCount: 0, inactiveLegacyCount: 0, activeProCount: 0 };
  }

  const activeLegacyCount = await prisma.companyApp.count({
    where: {
      appId: legacyApp.id,
      status: { not: 'INACTIVE' }
    }
  });

  const inactiveLegacyCount = await prisma.companyApp.count({
    where: {
      appId: legacyApp.id,
      status: 'INACTIVE'
    }
  });

  let activeProCount = 0;
  if (proApp) {
    activeProCount = await prisma.companyApp.count({
      where: {
        appId: proApp.id,
        status: 'ACTIVE'
      }
    });
  }

  console.log(`Verification counts:`);
  console.log(`  active_legacy_rows (${LEGACY_SLUG}):   ${activeLegacyCount} (expected: 0 after apply)`);
  console.log(`  inactive_legacy_rows (${LEGACY_SLUG}): ${inactiveLegacyCount}`);
  console.log(`  active_pro_rows (${TARGET_SLUG}):      ${activeProCount}`);

  if (activeLegacyCount === 0) {
    console.log(`\n✅ VERIFY SUCCESS: 0 companies left with active legacy slug '${LEGACY_SLUG}'.`);
  } else {
    console.log(`\n⚠️ VERIFY PENDING: ${activeLegacyCount} companies still have active legacy slug '${LEGACY_SLUG}'.`);
  }

  return { activeLegacyCount, inactiveLegacyCount, activeProCount };
}

async function runMigration(prisma, { isApply, batchSize }) {
  console.log(`\n=== MaxP Affiliate Apps Unification ===`);
  console.log(`Mode: ${isApply ? '🚀 APPLY (WRITING TO DATABASE)' : '🔍 DRY RUN (NO WRITES)'}`);
  console.log(`Source legacy app: '${LEGACY_SLUG}'`);
  console.log(`Target app:        '${TARGET_SLUG}'\n`);

  const legacyApp = await prisma.marketplaceApp.findUnique({
    where: { slug: LEGACY_SLUG },
    select: { id: true, slug: true, name: true }
  });

  const proApp = await prisma.marketplaceApp.findUnique({
    where: { slug: TARGET_SLUG },
    select: { id: true, slug: true, name: true }
  });

  if (!legacyApp) {
    console.log(`ℹ️  MarketplaceApp '${LEGACY_SLUG}' not found in database.`);
    console.log(`Nothing to migrate.`);
    console.log(`total=0 would_update=0 updated=0 skipped=0 failed=0`);
    return;
  }

  if (!proApp) {
    console.error(`❌ Error: Target MarketplaceApp '${TARGET_SLUG}' not found in database.`);
    console.log(`total=0 would_update=0 updated=0 skipped=0 failed=1`);
    return;
  }

  // Load all company_apps pointing to legacyApp
  const legacyRows = await prisma.companyApp.findMany({
    where: { appId: legacyApp.id },
    include: {
      company: {
        select: { id: true, name: true, slug: true }
      }
    },
    orderBy: { createdAt: 'asc' },
    take: batchSize
  });

  const total = legacyRows.length;
  console.log(`Found ${total} company_app row(s) pointing to '${LEGACY_SLUG}'.\n`);

  if (total === 0) {
    console.log(`total=0 would_update=0 updated=0 skipped=0 failed=0`);
    return;
  }

  let wouldUpdate = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  const tableRows = [];

  for (const legacyRow of legacyRows) {
    const companyId = legacyRow.companyId;
    const companyName = legacyRow.company?.name || companyId;

    try {
      // Find if company already has a company_apps row for affiliate-pro
      const existingProRow = await prisma.companyApp.findUnique({
        where: {
          companyId_appId: {
            companyId,
            appId: proApp.id
          }
        }
      });

      const isLegacyAlreadyInactive = legacyRow.status === 'INACTIVE';
      const isAlreadyMigrated = isLegacyAlreadyInactive && Boolean(existingProRow);

      if (isAlreadyMigrated) {
        skipped += 1;
        tableRows.push({
          'Company ID': companyId.slice(0, 16) + '...',
          'Company Name': companyName.slice(0, 20),
          'Legacy Status': legacyRow.status,
          'Pro (Before)': existingProRow ? existingProRow.status : 'NONE',
          'Target Status': existingProRow.status,
          'Action': 'SKIPPED (ALREADY MIGRATED)'
        });
        continue;
      }

      // Compute merged target state
      const targetStatus = existingProRow
        ? resolveBestStatus(existingProRow.status, legacyRow.status)
        : (legacyRow.status || 'ACTIVE');

      const targetPricingModel = existingProRow?.activePricingModel
        || legacyRow.activePricingModel
        || 'SUBSCRIPTION';

      // Merge settings: existing pro settings keys take precedence over legacy settings keys
      const legacySettings = parseSettings(legacyRow.settings);
      const existingSettings = parseSettings(existingProRow?.settings);
      const mergedSettings = { ...legacySettings, ...existingSettings };

      // Free subscription guarantee: do NOT set nextBillingAt or validUntil unless legacy/existing row already had them
      const targetValidUntil = existingProRow?.validUntil || legacyRow.validUntil || null;
      const targetNextBillingAt = existingProRow?.nextBillingAt || legacyRow.nextBillingAt || null;
      const targetInstalledInTrial = existingProRow?.installedInTrial ?? legacyRow.installedInTrial ?? false;

      const actionLabel = isApply
        ? (existingProRow ? 'UPDATED (MERGED)' : 'UPDATED (MIGRATED)')
        : (existingProRow ? 'WOULD MERGE' : 'WOULD MIGRATE');

      tableRows.push({
        'Company ID': companyId.slice(0, 16) + '...',
        'Company Name': companyName.slice(0, 20),
        'Legacy Status': legacyRow.status,
        'Pro (Before)': existingProRow ? existingProRow.status : 'NONE',
        'Target Status': targetStatus,
        'Action': actionLabel
      });

      if (!isApply) {
        wouldUpdate += 1;
      } else {
        // Execute writes in transaction
        await prisma.$transaction(async (tx) => {
          // 1. Upsert affiliate-pro row
          await tx.companyApp.upsert({
            where: {
              companyId_appId: {
                companyId,
                appId: proApp.id
              }
            },
            create: {
              companyId,
              appId: proApp.id,
              status: targetStatus,
              activePricingModel: targetPricingModel,
              settings: mergedSettings,
              validUntil: targetValidUntil,
              nextBillingAt: targetNextBillingAt,
              installedInTrial: targetInstalledInTrial
            },
            update: {
              status: targetStatus,
              activePricingModel: targetPricingModel,
              settings: mergedSettings,
              validUntil: targetValidUntil,
              nextBillingAt: targetNextBillingAt
            }
          });

          // 2. Mark legacy affiliate-program row as INACTIVE (never delete)
          await tx.companyApp.update({
            where: { id: legacyRow.id },
            data: { status: 'INACTIVE' }
          });
        });

        updated += 1;
      }
    } catch (rowError) {
      console.error(`❌ Failed processing company ${companyId}:`, rowError.message);
      failed += 1;
      tableRows.push({
        'Company ID': companyId.slice(0, 16) + '...',
        'Company Name': companyName.slice(0, 20),
        'Legacy Status': legacyRow.status,
        'Pro (Before)': 'ERROR',
        'Target Status': 'ERROR',
        'Action': `FAILED: ${rowError.message.slice(0, 25)}`
      });
    }
  }

  // Print table
  if (tableRows.length > 0) {
    console.table(tableRows);
  }

  // Print summary
  console.log(`\nSummary: total=${total} would_update=${wouldUpdate} updated=${updated} skipped=${skipped} failed=${failed}`);
}

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');
  const isVerify = args.includes('--verify');

  let batchSize = 1000;
  for (const arg of args) {
    if (arg.startsWith('--batch=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(val) && val > 0) batchSize = val;
    }
  }

  const prisma = getPrisma();

  if (isVerify && !isApply && !args.includes('--dry-run')) {
    await runVerify(prisma);
    return;
  }

  await runMigration(prisma, { isApply, batchSize });

  if (isVerify) {
    await runVerify(prisma);
  }
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error('Migration execution error:', err);
      process.exit(1);
    })
    .finally(async () => {
      try {
        if (activePrisma?.$disconnect) {
          await activePrisma.$disconnect();
        }
      } catch (_) {}
    });
}

module.exports = {
  LEGACY_SLUG,
  TARGET_SLUG,
  parseSettings,
  resolveBestStatus,
  runMigration,
  runVerify
};

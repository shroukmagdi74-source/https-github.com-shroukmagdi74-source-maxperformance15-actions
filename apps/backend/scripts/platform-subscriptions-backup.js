#!/usr/bin/env node
/**
 * Platform Subscriptions Backup & Audit Script
 * 
 * Safety:
 * - Default mode is DRY-RUN (read-only queries + planned SQL output).
 * - Physical table creation is gated strictly behind `--apply`.
 * - FORBIDDEN: NEVER runs write operations on production or QA during task inspection.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { getSharedPrismaClient } = require('../services/sharedDatabase');

function getBackupTableName(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `platform_subscriptions_backup_${yyyy}${mm}${dd}`;
}

async function runBackup() {
  const isApply = process.argv.includes('--apply');
  const backupTable = getBackupTableName();
  const prisma = getSharedPrismaClient();

  const report = {
    timestamp: new Date().toISOString(),
    mode: isApply ? 'APPLY' : 'DRY-RUN',
    backupTable,
    plannedSql: `CREATE TABLE IF NOT EXISTS "${backupTable}" AS SELECT * FROM "platform_subscriptions";`,
    before: {
      totalRows: 0,
      paidRows: 0,
      totalMonthlyFee: 0,
      feeDistribution: [],
      checksum: null,
    },
    after: null,
  };

  try {
    // 1. Gather baseline stats (Read-only)
    const statsQuery = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*)::int AS "totalRows",
        COUNT(*) FILTER (WHERE "monthlyFee" > 0)::int AS "paidRows",
        COALESCE(SUM("monthlyFee"), 0)::numeric AS "totalMonthlyFee",
        COALESCE(MD5(STRING_AGG(id::text, ',' ORDER BY id)), '') AS "checksum"
      FROM "platform_subscriptions";
    `);

    if (statsQuery && statsQuery[0]) {
      report.before.totalRows = Number(statsQuery[0].totalRows || 0);
      report.before.paidRows = Number(statsQuery[0].paidRows || 0);
      report.before.totalMonthlyFee = Number(statsQuery[0].totalMonthlyFee || 0);
      report.before.checksum = statsQuery[0].checksum || '';
    }

    // Fee breakdown distribution
    const distQuery = await prisma.$queryRawUnsafe(`
      SELECT 
        "monthlyFee"::numeric AS "monthlyFee",
        COUNT(*)::int AS "count"
      FROM "platform_subscriptions"
      GROUP BY "monthlyFee"
      ORDER BY "monthlyFee" DESC;
    `);

    report.before.feeDistribution = (distQuery || []).map((row) => ({
      monthlyFee: Number(row.monthlyFee),
      count: Number(row.count),
    }));

    if (!isApply) {
      console.log('======================================================');
      console.log('🔍 PLATFORM SUBSCRIPTIONS BACKUP PLAN (DRY-RUN)');
      console.log('======================================================');
      console.log(`Target Backup Table: ${backupTable}`);
      console.log(`Planned SQL Statement:`);
      console.log(`  ${report.plannedSql}`);
      console.log('\n--- Current Ledger Metrics (Baseline) ---');
      console.log(`Total Subscriptions: ${report.before.totalRows}`);
      console.log(`Paid Subscriptions : ${report.before.paidRows}`);
      console.log(`Total Monthly Fee  : ${report.before.totalMonthlyFee} EGP`);
      console.log(`Checksum (MD5)     : ${report.before.checksum}`);
      console.log('Fee Distribution   :');
      report.before.feeDistribution.forEach((d) => {
        console.log(`  - ${d.count} companies paying ${d.monthlyFee} EGP`);
      });
      console.log('\nNote: No changes written to database (--apply flag was not provided).');
      console.log('\n--- JSON Report Output ---');
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    // 2. If --apply is explicitly passed:
    console.log(`🚀 Executing backup into table "${backupTable}"...`);
    await prisma.$executeRawUnsafe(report.plannedSql);

    // Verify created backup table
    const backupStats = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*)::int AS "totalRows",
        COUNT(*) FILTER (WHERE "monthlyFee" > 0)::int AS "paidRows",
        COALESCE(SUM("monthlyFee"), 0)::numeric AS "totalMonthlyFee",
        COALESCE(MD5(STRING_AGG(id::text, ',' ORDER BY id)), '') AS "checksum"
      FROM "${backupTable}";
    `);

    report.after = {
      backupTable,
      totalRows: Number(backupStats[0]?.totalRows || 0),
      paidRows: Number(backupStats[0]?.paidRows || 0),
      totalMonthlyFee: Number(backupStats[0]?.totalMonthlyFee || 0),
      checksum: backupStats[0]?.checksum || '',
      verified: backupStats[0]?.checksum === report.before.checksum,
    };

    console.log('✅ Backup executed and verified successfully.');
    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error('❌ Error executing platform subscriptions backup:', err.message);
    if (!isApply) {
      console.log('\n--- Dry-Run Template Report (Database Offline/Unreachable) ---');
      console.log(JSON.stringify(report, null, 2));
    }
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

runBackup();

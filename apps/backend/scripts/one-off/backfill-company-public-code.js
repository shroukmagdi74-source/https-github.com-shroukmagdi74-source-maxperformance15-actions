/**
 * @file backfill-company-public-code.js
 * @description One-off backfill to assign immutable, human-readable public codes
 * (e.g. SWAN-7K2F9X) to companies lacking one.
 *
 * SAFETY:
 *   - Read-only pass by default (dry-run).
 *   - `--apply` required for any write operations.
 *   - Cursor pagination in configurable batches (default 500) — never loads the whole table.
 *   - Idempotent: rows with an existing publicCode are skipped; re-running `--apply` writes 0 rows.
 *   - Preserves Company.id, slug, email, and all foreign keys strictly untouched.
 *
 * Usage:
 *   node scripts/one-off/backfill-company-public-code.js [--dry-run|--apply] [--batch=500] [--verify]
 */

const { CODE_RE, generatePublicCode, ensureCompanyPublicCode } = require('../../utils/companyPublicCode');

function getPrisma() {
  const { getSharedPrismaClient } = require('../../services/sharedDatabase');
  return getSharedPrismaClient();
}

async function runVerify(prisma, batchSize) {
  // 1. Missing publicCode count
  const nullCount = await prisma.company.count({
    where: {
      OR: [
        { publicCode: null },
        { publicCode: '' }
      ]
    }
  });

  // 2. Duplicate count
  let dupeCount = 0;
  try {
    const groups = await prisma.company.groupBy({
      by: ['publicCode'],
      where: {
        publicCode: { not: null }
      },
      _count: { _all: true }
    });
    const dupes = groups.filter((g) => g._count._all > 1 && g.publicCode);
    dupeCount = dupes.length;
  } catch (err) {
    console.error('Error grouping publicCode:', err.message);
  }

  // 3. Off-regex scan in cursor batches
  let offRegexCount = 0;
  let cursor = null;
  while (true) {
    const query = {
      where: {
        publicCode: { not: null }
      },
      orderBy: { id: 'asc' },
      select: { id: true, publicCode: true },
      take: batchSize
    };
    if (cursor) {
      query.skip = 1;
      query.cursor = { id: cursor };
    }

    const rows = await prisma.company.findMany(query);
    if (rows.length === 0) break;
    cursor = rows[rows.length - 1].id;

    for (const row of rows) {
      if (row.publicCode && !CODE_RE.test(row.publicCode)) {
        offRegexCount += 1;
      }
    }
  }

  console.log(`null=${nullCount} dupes=${dupeCount} off_regex=${offRegexCount}`);
  if (nullCount > 0 || dupeCount > 0 || offRegexCount > 0) {
    process.exit(1);
  }
}

async function runBackfill(prisma, batchSize, isApply) {
  const total = await prisma.company.count();
  let wouldUpdate = 0;
  let updated = 0;
  let failed = 0;
  const samples = [];

  let cursor = null;
  while (true) {
    const query = {
      where: {
        OR: [
          { publicCode: null },
          { publicCode: '' }
        ]
      },
      orderBy: { id: 'asc' },
      select: { id: true, name: true, slug: true, email: true },
      take: batchSize
    };
    if (cursor) {
      query.skip = 1;
      query.cursor = { id: cursor };
    }

    const rows = await prisma.company.findMany(query);
    if (rows.length === 0) break;
    cursor = rows[rows.length - 1].id;

    for (const row of rows) {
      wouldUpdate += 1;
      if (samples.length < 5) {
        const sampleCode = generatePublicCode(row);
        samples.push(`${row.id} → ${sampleCode}`);
      }

      if (isApply) {
        try {
          let success = false;
          for (let attempt = 0; attempt < 2; attempt += 1) {
            try {
              await ensureCompanyPublicCode(row, { prisma });
              success = true;
              break;
            } catch (err) {
              if (err?.code === 'P2002' && attempt === 0) {
                continue;
              }
              throw err;
            }
          }
          if (success) {
            updated += 1;
          } else {
            failed += 1;
          }
        } catch (rowErr) {
          console.error(`Failed to backfill company ${row.id}:`, rowErr.message);
          failed += 1;
        }
      }
    }
  }

  if (isApply) {
    console.log(`total=${total} would_update=${wouldUpdate} updated=${updated} failed=${failed}`);
  } else {
    console.log(`total=${total} would_update=${wouldUpdate}`);
  }

  if (samples.length > 0) {
    samples.forEach((s) => console.log(s));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');
  const isVerify = args.includes('--verify');

  let batchSize = 500;
  for (const arg of args) {
    if (arg.startsWith('--batch=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(val) && val > 0) batchSize = val;
    }
  }

  const prisma = getPrisma();

  if (isVerify && !isApply) {
    await runVerify(prisma, batchSize);
    return;
  }

  await runBackfill(prisma, batchSize, isApply);

  if (isVerify) {
    await runVerify(prisma, batchSize);
  }
}

main().catch((err) => {
  console.error('Backfill execution error:', err);
  process.exit(1);
});

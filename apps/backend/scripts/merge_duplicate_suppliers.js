const { getSharedPrismaClient } = require('../services/sharedDatabase');

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function main() {
  const isApply = process.argv.includes('--apply');
  const prisma = getSharedPrismaClient();

  console.log('='.repeat(70));
  console.log(`🚀 Supplier Deduplication Script [${isApply ? 'APPLY MODE' : 'DRY-RUN MODE'}]`);
  if (!isApply) {
    console.log('ℹ️  Running in preview mode. No records will be modified or deleted.');
    console.log('ℹ️  Pass --apply to execute the merge and deletion.');
  }
  console.log('='.repeat(70));

  try {
    const suppliers = await prisma.$queryRawUnsafe(`
      SELECT id, "companyId", name, phone, mobile, "phoneNormalized", tags, "createdAt"
      FROM suppliers
      ORDER BY "createdAt" ASC;
    `);

    console.log(`Total suppliers found across all companies: ${suppliers.length}`);

    // Group by companyId
    const companySuppliersMap = new Map();
    for (const s of suppliers) {
      if (!companySuppliersMap.has(s.companyId)) {
        companySuppliersMap.set(s.companyId, []);
      }
      companySuppliersMap.get(s.companyId).push(s);
    }

    let totalDuplicateGroups = 0;
    let totalRedundantRows = 0;

    for (const [companyId, compSuppliers] of companySuppliersMap.entries()) {
      if (compSuppliers.length < 2) continue;

      // Build adjacency list for connected components within this company
      const n = compSuppliers.length;
      const adj = Array.from({ length: n }, () => []);

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const s1 = compSuppliers[i];
          const s2 = compSuppliers[j];

          let isMatch = false;

          // Condition 1: Same non-empty phoneNormalized
          if (s1.phoneNormalized && s2.phoneNormalized && s1.phoneNormalized === s2.phoneNormalized) {
            isMatch = true;
          }

          // Condition 2: Same lower(trim(name)) and same non-empty phone
          if (!isMatch && s1.name && s2.name && s1.phone && s2.phone) {
            const name1 = s1.name.trim().toLowerCase();
            const name2 = s2.name.trim().toLowerCase();
            const phone1 = s1.phone.trim();
            const phone2 = s2.phone.trim();
            if (name1 === name2 && phone1 === phone2) {
              isMatch = true;
            }
          }

          if (isMatch) {
            adj[i].push(j);
            adj[j].push(i);
          }
        }
      }

      // Find connected components
      const visited = new Set();
      const groups = [];

      for (let i = 0; i < n; i++) {
        if (!visited.has(i)) {
          const queue = [i];
          visited.add(i);
          const component = [];

          while (queue.length > 0) {
            const curr = queue.shift();
            component.push(compSuppliers[curr]);

            for (const neighbor of adj[curr]) {
              if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
              }
            }
          }

          if (component.length > 1) {
            groups.push(component);
          }
        }
      }

      if (groups.length === 0) continue;

      console.log(`\n🏢 Company [${companyId}]: Found ${groups.length} duplicate group(s).`);

      for (const group of groups) {
        totalDuplicateGroups++;
        // Sort ascending by createdAt -> oldest row first
        group.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const retained = group[0];
        const redundant = group.slice(1);
        totalRedundantRows += redundant.length;

        console.log(`\n  📌 Duplicate Group #${totalDuplicateGroups}:`);
        console.log(`     Retained (Oldest): ID=${retained.id} | Name="${retained.name}" | Phone=${retained.phone || '-'} | PhoneNormalized=${retained.phoneNormalized || '-'} | CreatedAt=${retained.createdAt}`);

        let mergedTags = new Set(parseTags(retained.tags));

        for (const dup of redundant) {
          console.log(`     ❌ Redundant to merge: ID=${dup.id} | Name="${dup.name}" | Phone=${dup.phone || '-'} | PhoneNormalized=${dup.phoneNormalized || '-'} | CreatedAt=${dup.createdAt}`);
          parseTags(dup.tags).forEach(t => mergedTags.add(t));

          if (isApply) {
            // Reassign associated records
            const poResult = await prisma.$executeRawUnsafe(
              `UPDATE "purchase_orders" SET "supplierId" = $1 WHERE "supplierId" = $2;`,
              retained.id,
              dup.id
            );
            const piResult = await prisma.$executeRawUnsafe(
              `UPDATE "purchase_invoices" SET "supplierId" = $1 WHERE "supplierId" = $2;`,
              retained.id,
              dup.id
            );
            const spResult = await prisma.$executeRawUnsafe(
              `UPDATE "supplier_payments" SET "supplierId" = $1 WHERE "supplierId" = $2;`,
              retained.id,
              dup.id
            );

            // Delete redundant supplier row
            await prisma.$executeRawUnsafe(
              `DELETE FROM suppliers WHERE id = $1;`,
              dup.id
            );

            console.log(`        ↳ Transferred: ${poResult} PO(s), ${piResult} Invoice(s), ${spResult} Payment(s) -> Deleted duplicate ID=${dup.id}`);
          }
        }

        if (isApply && mergedTags.size > 0) {
          const serializedTags = JSON.stringify(Array.from(mergedTags));
          await prisma.$executeRawUnsafe(
            `UPDATE suppliers SET "tags" = $1 WHERE id = $2;`,
            serializedTags,
            retained.id
          );
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`📊 Summary:`);
    console.log(`   - Duplicate Groups Identified: ${totalDuplicateGroups}`);
    console.log(`   - Redundant Supplier Rows: ${totalRedundantRows}`);
    if (isApply) {
      console.log(`   - Status: Successfully merged and deleted all ${totalRedundantRows} redundant rows.`);
    } else {
      console.log(`   - Status: Dry-run complete. Run with --apply to commit changes.`);
    }
    console.log('='.repeat(70));
  } catch (error) {
    console.error('❌ Error during supplier deduplication:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();

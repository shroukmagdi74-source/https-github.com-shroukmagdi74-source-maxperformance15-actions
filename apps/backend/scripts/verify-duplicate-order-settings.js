/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ Integration Verification Script: verify-duplicate-order-settings.js
 *
 * Verifies Acceptance Criteria for Duplicate Order Settings:
 * 1. Previous order DELIVERED -> findDuplicateOrder = null
 * 2. Previous order RETURNED -> findDuplicateOrder = null
 * 3. Previous order PREPARING -> match + action applies DUPLICATE_ORDER
 * 4. Previous order SHIPPED -> match
 * 5. Time window toggle: 90m old order with window 60m -> null, with window disabled -> match
 * 6. Tenant isolation: order under Company A does not match under Company B
 * 7. Whitelist / exemptPhones: phone in exempt list returns null even with PREPARING
 *
 * Usage:
 *   node apps/backend/scripts/verify-duplicate-order-settings.js [--apply]
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const { getSharedPrismaClient } = require('../services/sharedDatabase');
const orderService = require('../services/orderService');

const isApply = process.argv.includes('--apply');

async function runVerification() {
  const prisma = getSharedPrismaClient();
  const results = [];
  const createdOrderIds = [];
  const createdCustomerIds = [];

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🔍 [VERIFY-DUPLICATE-SETTINGS] Mode: ${isApply ? 'APPLY (Live DB writes + cleanup)' : 'DRY-RUN (Interactive Transaction Rollback)'}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // 1. Locate qa-lab company or fallback to first available company
    let company = await prisma.company.findFirst({
      where: { slug: 'qa-lab' },
      select: { id: true, name: true, slug: true, settings: true }
    });

    if (!company) {
      console.warn('⚠️ [QA-LAB] Company slug qa-lab not found, using first active company');
      company = await prisma.company.findFirst({
        select: { id: true, name: true, slug: true, settings: true }
      });
    }

    if (!company) {
      throw new Error('No company found in database to run verification against.');
    }

    console.log(`🏢 Target Company: ${company.name} (${company.slug || company.id})`);

    // 2. Locate or create QA test customer
    let customer = await prisma.customer.findFirst({
      where: { companyId: company.id },
      select: { id: true }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          companyId: company.id,
          name: 'QA Test Customer',
          phone: '+201000000000',
        },
        select: { id: true }
      });
      createdCustomerIds.push(customer.id);
    }

    // 3. Find another company for tenant isolation check
    const otherCompany = await prisma.company.findFirst({
      where: { id: { not: company.id } },
      select: { id: true, name: true }
    });
    const isolationCompanyId = otherCompany?.id || '00000000-0000-0000-0000-000000000002';

    // Helper to create test order
    async function createTestOrder(tx, { phone, status, total = 250, createdAt = new Date() }) {
      const orderNumber = `QA-DUP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const order = await tx.order.create({
        data: {
          companyId: company.id,
          customerId: customer.id,
          orderNumber,
          customerName: 'اختبار مكرر',
          customerPhone: phone,
          status,
          subtotal: total,
          total,
          createdAt,
          updatedAt: createdAt,
        },
      });
      createdOrderIds.push(order.id);
      return order;
    }

    // Test runner inside an execution context
    async function executeScenarios(tx) {
      const defaultSettings = orderService.getDefaultDuplicateSettings();

      // Scenario 1: DELIVERED -> null
      const phone1 = '+20100000001';
      await createTestOrder(tx, { phone: phone1, status: 'DELIVERED', total: 300 });
      const dup1 = await orderService.findDuplicateOrder({
        prisma: tx,
        companyId: company.id,
        customerPhone: phone1,
        total: 300,
        settings: defaultSettings,
        includeGuest: false,
      });
      results.push({
        scenario: '1. Previous DELIVERED order',
        expected: 'null (not duplicate)',
        actual: dup1 === null ? 'null' : `Matched order #${dup1.order?.orderNumber}`,
        result: dup1 === null ? 'PASS' : 'FAIL',
      });

      // Scenario 2: RETURNED -> null
      const phone2 = '+20100000002';
      await createTestOrder(tx, { phone: phone2, status: 'RETURNED', total: 300 });
      const dup2 = await orderService.findDuplicateOrder({
        prisma: tx,
        companyId: company.id,
        customerPhone: phone2,
        total: 300,
        settings: defaultSettings,
        includeGuest: false,
      });
      results.push({
        scenario: '2. Previous RETURNED order',
        expected: 'null (not duplicate)',
        actual: dup2 === null ? 'null' : `Matched order #${dup2.order?.orderNumber}`,
        result: dup2 === null ? 'PASS' : 'FAIL',
      });

      // Scenario 3: PREPARING -> match + DUPLICATE_ORDER
      const phone3 = '+20100000003';
      const ord3 = await createTestOrder(tx, { phone: phone3, status: 'PREPARING', total: 400 });
      const dup3 = await orderService.findDuplicateOrder({
        prisma: tx,
        companyId: company.id,
        customerPhone: phone3,
        total: 400,
        settings: defaultSettings,
        includeGuest: false,
      });
      const passed3 = dup3 !== null && dup3.order?.id === ord3.id && dup3.settings?.action === 'record_visible';
      results.push({
        scenario: '3. Previous PREPARING order',
        expected: `Match #${ord3.orderNumber} + action record_visible`,
        actual: dup3 ? `Match #${dup3.order?.orderNumber} + action ${dup3.settings?.action}` : 'null',
        result: passed3 ? 'PASS' : 'FAIL',
      });

      // Scenario 4: SHIPPED -> match
      const phone4 = '+20100000004';
      const ord4 = await createTestOrder(tx, { phone: phone4, status: 'SHIPPED', total: 450 });
      const dup4 = await orderService.findDuplicateOrder({
        prisma: tx,
        companyId: company.id,
        customerPhone: phone4,
        total: 450,
        settings: defaultSettings,
        includeGuest: false,
      });
      const passed4 = dup4 !== null && dup4.order?.id === ord4.id;
      results.push({
        scenario: '4. Previous SHIPPED order',
        expected: `Match #${ord4.orderNumber}`,
        actual: dup4 ? `Match #${dup4.order?.orderNumber}` : 'null',
        result: passed4 ? 'PASS' : 'FAIL',
      });

      // Scenario 5: Time window toggle with 90m old order
      const phone5 = '+20100000005';
      const ninetyMinutesAgo = new Date(Date.now() - 90 * 60 * 1000);
      const ord5 = await createTestOrder(tx, {
        phone: phone5,
        status: 'PREPARING',
        total: 500,
        createdAt: ninetyMinutesAgo,
      });

      const dup5WindowActive = await orderService.findDuplicateOrder({
        prisma: tx,
        companyId: company.id,
        customerPhone: phone5,
        total: 500,
        settings: { ...defaultSettings, windowEnabled: true, windowMinutes: 60 },
        includeGuest: false,
      });

      const dup5WindowDisabled = await orderService.findDuplicateOrder({
        prisma: tx,
        companyId: company.id,
        customerPhone: phone5,
        total: 500,
        settings: { ...defaultSettings, windowEnabled: false },
        includeGuest: false,
      });

      const passed5 = dup5WindowActive === null && dup5WindowDisabled !== null && dup5WindowDisabled.order?.id === ord5.id;
      results.push({
        scenario: '5. Time window toggle (90m ago vs 60m window)',
        expected: 'window=true -> null; window=false -> match',
        actual: `window=true -> ${dup5WindowActive ? 'match' : 'null'}; window=false -> ${dup5WindowDisabled ? 'match' : 'null'}`,
        result: passed5 ? 'PASS' : 'FAIL',
      });

      // Scenario 6: Tenant isolation (different companyId, same phone)
      const dup6 = await orderService.findDuplicateOrder({
        prisma: tx,
        companyId: isolationCompanyId,
        customerPhone: phone3, // active PREPARING under company
        total: 400,
        settings: defaultSettings,
        includeGuest: false,
      });
      results.push({
        scenario: '6. Tenant isolation (Company A order under Company B)',
        expected: 'null (isolated)',
        actual: dup6 === null ? 'null' : `Matched order #${dup6.order?.orderNumber}`,
        result: dup6 === null ? 'PASS' : 'FAIL',
      });

      // Scenario 7: Whitelist / exemptPhones bypasses detection even with PREPARING
      const phone7 = '+20100000007';
      await createTestOrder(tx, { phone: phone7, status: 'PREPARING', total: 600 });
      const dup7 = await orderService.findDuplicateOrder({
        prisma: tx,
        companyId: company.id,
        customerPhone: phone7,
        total: 600,
        settings: { ...defaultSettings, exemptPhones: ['01000000007', '+20100000007'] },
        includeGuest: false,
      });
      results.push({
        scenario: '7. Whitelist exemptPhones bypass',
        expected: 'null (exempt)',
        actual: dup7 === null ? 'null' : `Matched order #${dup7.order?.orderNumber}`,
        result: dup7 === null ? 'PASS' : 'FAIL',
      });
    }

    if (isApply) {
      await executeScenarios(prisma);
    } else {
      // Dry-run mode: run inside an interactive transaction with rollback
      try {
        await prisma.$transaction(async (tx) => {
          await executeScenarios(tx);
          throw new Error('ROLLBACK_TRANSACTION_DRY_RUN');
        });
      } catch (err) {
        if (err.message !== 'ROLLBACK_TRANSACTION_DRY_RUN') {
          throw err;
        }
      }
    }

    console.log('\n📊 [VERIFICATION RESULTS TABLE]');
    console.table(results);

    const allPassed = results.length === 7 && results.every(r => r.result === 'PASS');
    console.log('\n═══════════════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('✅ ALL 7 ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!');
    } else {
      console.log('❌ SOME ACCEPTANCE CRITERIA FAILED.');
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ [FATAL] Error running duplicate order verification:', error.message || error);
    process.exit(1);
  } finally {
    // Air-tight cleanup of any created test records in apply mode
    if (isApply) {
      try {
        if (createdOrderIds.length > 0) {
          await prisma.order.deleteMany({
            where: { id: { in: createdOrderIds } }
          });
          console.log(`🧹 Cleaned up ${createdOrderIds.length} temporary test orders.`);
        }
        if (createdCustomerIds.length > 0) {
          await prisma.customer.deleteMany({
            where: { id: { in: createdCustomerIds } }
          });
          console.log(`🧹 Cleaned up ${createdCustomerIds.length} temporary test customers.`);
        }
        // Safety cleanup for any test orders starting with prefix
        await prisma.order.deleteMany({
          where: { customerPhone: { startsWith: '+20100000' } }
        });
      } catch (cleanupErr) {
        console.warn('⚠️ Cleanup warning:', cleanupErr.message);
      }
    }
    await prisma.$disconnect().catch(() => {});
  }
}

runVerification();

/**
 * Generate Affected Kashier Orders Report
 * Task 8: Audits all credit card (Kashier) orders placed between 2026-10-14 and 2026-10-31
 * where the 10% electronic payment discount was omitted.
 *
 * Outputs: affected-kashier-orders-report.csv
 * Zero automatic refunds or database mutations are performed (owner approval required).
 */

const fs = require('fs');
const path = require('path');
const { getSharedPrismaClient } = require('../services/sharedDatabase');

async function generateReport() {
  const prisma = getSharedPrismaClient();

  console.log('🔍 [REPORT] Finding Swan company...');
  // Find Swan company by slug, name or by the known reference order ORD-959445-754
  let company = await prisma.company.findFirst({
    where: {
      OR: [
        { slug: { contains: 'swan', mode: 'insensitive' } },
        { name: { contains: 'سوان' } },
        { name: { contains: 'swan', mode: 'insensitive' } },
      ],
    },
  });

  if (!company) {
    const refOrder = await prisma.order.findFirst({
      where: { orderNumber: 'ORD-959445-754' },
      select: { companyId: true },
    });
    if (refOrder?.companyId) {
      company = await prisma.company.findUnique({
        where: { id: refOrder.companyId },
      });
    }
  }

  const companyId = company?.id;
  console.log(`🏢 [REPORT] Target Company: ${company?.name || 'Unknown'} (${companyId || 'ALL'})`);

  const startDate = new Date('2026-10-14T00:00:00.000Z');
  const endDate = new Date('2026-10-31T23:59:59.999Z');

  const whereClause = {
    paymentMethod: { in: ['CREDIT_CARD', 'card', 'Card', 'credit_card'] },
    createdAt: { gte: startDate, lte: endDate },
    discount: { lte: 0.01 }, // Orders that did not receive discount
  };
  if (companyId) {
    whereClause.companyId = companyId;
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: 'asc' },
    include: {
      customer: {
        select: { firstName: true, lastName: true, phone: true, email: true },
      },
    },
  });

  console.log(`📊 [REPORT] Found ${orders.length} affected card orders.`);

  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

  const csvRows = [
    [
      'Order Number',
      'Created At',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Subtotal (EGP)',
      'Shipping (EGP)',
      'Paid Total (EGP)',
      'Discount Applied (EGP)',
      'Electronic Discount %',
      'Expected Discount (EGP)',
      'Correct Total (EGP)',
      'Overpaid / Due Amount (EGP)',
      'Payment Status',
      'Order Status',
      'Kashier TX / Session ID',
    ].join(','),
  ];

  let totalSubtotal = 0;
  let totalOverpaid = 0;

  for (const order of orders) {
    const subtotal = round2(order.subtotal);
    const shipping = round2(order.shipping);
    const total = round2(order.total);
    const currentDiscount = round2(order.discount);

    // 10% expected electronic payment discount
    const expectedDiscount = round2((subtotal * 10) / 100);
    const correctTotal = round2(Math.max(0, subtotal - expectedDiscount + shipping));
    const overpaid = round2(total - correctTotal);

    totalSubtotal += subtotal;
    totalOverpaid += overpaid;

    let kashierTx = '';
    try {
      const meta = typeof order.metadata === 'string' ? JSON.parse(order.metadata) : (order.metadata || {});
      kashierTx = meta.kashierSessionId || meta.transactionId || meta.kashierReference || '';
    } catch (_) {}

    const name = order.customerName || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer';
    const phone = order.customerPhone || order.customer?.phone || '';
    const email = order.customerEmail || order.customer?.email || '';

    const row = [
      `"${order.orderNumber}"`,
      `"${order.createdAt.toISOString()}"`,
      `"${name.replace(/"/g, '""')}"`,
      `"${phone}"`,
      `"${email}"`,
      subtotal.toFixed(2),
      shipping.toFixed(2),
      total.toFixed(2),
      currentDiscount.toFixed(2),
      '10%',
      expectedDiscount.toFixed(2),
      correctTotal.toFixed(2),
      overpaid.toFixed(2),
      `"${order.paymentStatus}"`,
      `"${order.status}"`,
      `"${kashierTx}"`,
    ];
    csvRows.push(row.join(','));
  }

  // Summary row
  csvRows.push('');
  csvRows.push(`"TOTALS",,"","","Affected Orders: ${orders.length}",${totalSubtotal.toFixed(2)},,"",,,"","Total Overpaid:",${totalOverpaid.toFixed(2)},,,`);

  const outputPath = path.resolve(__dirname, '../../../affected-kashier-orders-report.csv');
  fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf8');

  console.log(`✅ [REPORT] CSV written to ${outputPath}`);
  console.log(`📈 [SUMMARY] Total Subtotal: ${totalSubtotal.toFixed(2)} EGP`);
  console.log(`💰 [SUMMARY] Total Overpaid (Refund Due): ${totalOverpaid.toFixed(2)} EGP`);
  console.log(`🛡️ [SAFETY] No automatic refunds applied. Decisions remain with store owner.`);

  return {
    count: orders.length,
    totalSubtotal,
    totalOverpaid,
    outputPath,
  };
}

if (require.main === module) {
  generateReport()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ [REPORT] Failed:', err);
      process.exit(1);
    });
}

module.exports = { generateReport };

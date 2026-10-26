const { getSharedPrismaClient, safeQuery } = require('./sharedDatabase');

/**
 * Dynamically recalculates a supplier's current balance from the underlying source of truth:
 * Real Current Balance = openingBalance + sum(Valid Purchase Invoices) - sum(Supplier Payments)
 *
 * Convention:
 * - Positive (> 0): Company owes supplier money (مستحق للمورد / دائن).
 * - Zero (= 0): Balanced (خالص / لا توجد مديونية).
 * - Negative (< 0): Company overpaid or advance payment made to supplier (رصيد دائن للشركة / دفعة مقدمة).
 *
 * @param {string} supplierId
 * @param {string} companyId
 * @param {Object} [prismaClient] Optional transaction client
 * @returns {Promise<{ supplierId: string, currentBalance: number, openingBalance: number, totalInvoices: number, totalPayments: number }|null>}
 */
async function recalculateSupplierBalance(supplierId, companyId, prismaClient = null) {
  if (!supplierId || !companyId) return null;
  const prisma = prismaClient || getSharedPrismaClient();

  const supplier = await safeQuery(() =>
    prisma.supplier.findFirst({
      where: { id: supplierId, companyId },
      select: { id: true, openingBalance: true },
    })
  );

  if (!supplier) return null;

  const openingBalance = parseFloat(supplier.openingBalance) || 0;

  // Aggregate all valid (non-cancelled) purchase invoices
  const invoicesAgg = await safeQuery(() =>
    prisma.purchaseInvoice.aggregate({
      where: {
        supplierId,
        companyId,
        status: { notIn: ['CANCELLED'] },
      },
      _sum: { totalAmount: true },
    })
  );

  // Aggregate all recorded supplier payments
  const paymentsAgg = await safeQuery(() =>
    prisma.supplierPayment.aggregate({
      where: {
        supplierId,
        companyId,
      },
      _sum: { amount: true },
    })
  );

  const totalInvoices = parseFloat(invoicesAgg._sum.totalAmount) || 0;
  const totalPayments = parseFloat(paymentsAgg._sum.amount) || 0;

  const exactBalance = Math.round((openingBalance + totalInvoices - totalPayments) * 100) / 100;

  await safeQuery(() =>
    prisma.supplier.update({
      where: { id: supplierId },
      data: { currentBalance: exactBalance },
    })
  );

  return {
    supplierId,
    currentBalance: exactBalance,
    openingBalance,
    totalInvoices,
    totalPayments,
  };
}

/**
 * Recalculate balances for all suppliers of a given company.
 * @param {string} companyId
 * @param {Object} [prismaClient]
 * @returns {Promise<{ updatedCount: number, totalSuppliers: number }>}
 */
async function recalculateAllSuppliersForCompany(companyId, prismaClient = null) {
  if (!companyId) return { updatedCount: 0, totalSuppliers: 0 };
  const prisma = prismaClient || getSharedPrismaClient();

  const suppliers = await safeQuery(() =>
    prisma.supplier.findMany({
      where: { companyId },
      select: { id: true },
    })
  );

  let updatedCount = 0;
  for (const s of suppliers) {
    await recalculateSupplierBalance(s.id, companyId, prisma);
    updatedCount++;
  }

  return { updatedCount, totalSuppliers: suppliers.length };
}

module.exports = {
  recalculateSupplierBalance,
  recalculateAllSuppliersForCompany,
};

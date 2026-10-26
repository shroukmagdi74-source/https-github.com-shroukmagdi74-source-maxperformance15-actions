/**
 * Unit tests for supplierBalanceService
 * Tests recalculateSupplierBalance and recalculateAllSuppliersForCompany
 */
const { recalculateSupplierBalance, recalculateAllSuppliersForCompany } = require('../../services/supplierBalanceService');

describe('supplierBalanceService', () => {
  const companyId = 'comp_test_123';
  const supplierId = 'supp_test_456';

  const buildMockPrisma = (initialState) => {
    const state = {
      suppliers: initialState.suppliers || [],
      purchaseInvoices: initialState.purchaseInvoices || [],
      supplierPayments: initialState.supplierPayments || [],
    };

    return {
      supplier: {
        findFirst: async ({ where }) => {
          return state.suppliers.find((s) => s.id === where.id && s.companyId === where.companyId) || null;
        },
        findMany: async ({ where }) => {
          return state.suppliers.filter((s) => s.companyId === where.companyId);
        },
        update: async ({ where, data }) => {
          const s = state.suppliers.find((x) => x.id === where.id);
          if (!s) throw new Error('Supplier not found');
          Object.assign(s, data);
          return s;
        },
      },
      purchaseInvoice: {
        aggregate: async ({ where }) => {
          const matching = state.purchaseInvoices.filter((inv) => {
            if (inv.supplierId !== where.supplierId) return false;
            if (inv.companyId !== where.companyId) return false;
            if (where.status?.notIn && where.status.notIn.includes(inv.status)) return false;
            return true;
          });
          const totalAmount = matching.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
          return { _sum: { totalAmount } };
        },
      },
      supplierPayment: {
        aggregate: async ({ where }) => {
          const matching = state.supplierPayments.filter((p) => {
            if (p.supplierId !== where.supplierId) return false;
            if (p.companyId !== where.companyId) return false;
            return true;
          });
          const amount = matching.reduce((sum, p) => sum + Number(p.amount || 0), 0);
          return { _sum: { amount } };
        },
      },
    };
  };

  test('recalculateSupplierBalance resets phantom balance to 0 when invoices and payments are deleted', async () => {
    const mockPrisma = buildMockPrisma({
      suppliers: [
        { id: supplierId, companyId, openingBalance: 0, currentBalance: -10119.75 },
      ],
      purchaseInvoices: [],
      supplierPayments: [],
    });

    const result = await recalculateSupplierBalance(supplierId, companyId, mockPrisma);

    expect(result).not.toBeNull();
    expect(result.currentBalance).toBe(0);
    expect(result.totalInvoices).toBe(0);
    expect(result.totalPayments).toBe(0);

    const updated = await mockPrisma.supplier.findFirst({ where: { id: supplierId, companyId } });
    expect(updated.currentBalance).toBe(0);
  });

  test('recalculateSupplierBalance accurately reflects openingBalance + invoices - payments', async () => {
    const mockPrisma = buildMockPrisma({
      suppliers: [
        { id: supplierId, companyId, openingBalance: 500, currentBalance: 0 },
      ],
      purchaseInvoices: [
        { id: 'inv_1', supplierId, companyId, totalAmount: 1200, status: 'PENDING' },
        { id: 'inv_2', supplierId, companyId, totalAmount: 800, status: 'PAID' },
        { id: 'inv_3_cancelled', supplierId, companyId, totalAmount: 9999, status: 'CANCELLED' },
      ],
      supplierPayments: [
        { id: 'pay_1', supplierId, companyId, amount: 800 },
        { id: 'pay_2', supplierId, companyId, amount: 300 },
      ],
    });

    const result = await recalculateSupplierBalance(supplierId, companyId, mockPrisma);

    // Opening (500) + Invoices (1200 + 800 = 2000) - Payments (800 + 300 = 1100) = 1400
    expect(result.currentBalance).toBe(1400);
    expect(result.totalInvoices).toBe(2000);
    expect(result.totalPayments).toBe(1100);
  });

  test('recalculateSupplierBalance accurately reflects advance payments as negative balance', async () => {
    const mockPrisma = buildMockPrisma({
      suppliers: [
        { id: supplierId, companyId, openingBalance: 0, currentBalance: 0 },
      ],
      purchaseInvoices: [],
      supplierPayments: [
        { id: 'pay_adv', supplierId, companyId, amount: 1225 },
      ],
    });

    const result = await recalculateSupplierBalance(supplierId, companyId, mockPrisma);

    expect(result.currentBalance).toBe(-1225);
    expect(result.totalInvoices).toBe(0);
    expect(result.totalPayments).toBe(1225);
  });

  test('recalculateAllSuppliersForCompany processes all tenant suppliers correctly', async () => {
    const mockPrisma = buildMockPrisma({
      suppliers: [
        { id: 'supp_1', companyId, openingBalance: 0, currentBalance: -100 },
        { id: 'supp_2', companyId, openingBalance: 100, currentBalance: 999 },
      ],
      purchaseInvoices: [],
      supplierPayments: [],
    });

    const result = await recalculateAllSuppliersForCompany(companyId, mockPrisma);
    expect(result.updatedCount).toBe(2);

    const s1 = await mockPrisma.supplier.findFirst({ where: { id: 'supp_1', companyId } });
    const s2 = await mockPrisma.supplier.findFirst({ where: { id: 'supp_2', companyId } });

    expect(s1.currentBalance).toBe(0);
    expect(s2.currentBalance).toBe(100);
  });
});

/**
 * Test Suite for T06: Sample Orders Partner Factory, Expected Delivery Date, Deposit & Payments
 */

const assert = require('assert');

let currentPrisma = null;

// Mock sharedDatabase before requiring services
const sharedDbPath = require.resolve('../services/sharedDatabase');
require.cache[sharedDbPath] = {
  id: sharedDbPath,
  filename: sharedDbPath,
  loaded: true,
  exports: {
    getSharedPrismaClient: () => global.__testPrisma || currentPrisma,
  },
};

if (typeof jest !== 'undefined') {
  jest.mock('../services/sharedDatabase', () => ({
    getSharedPrismaClient: () => global.__testPrisma || currentPrisma,
  }));
}

const ManufacturingSampleService = require('../services/manufacturingSampleService');

function createInMemoryStore() {
  const store = {
    sampleOrders: new Map(),
    samplePayments: new Map(),
    sampleStages: new Map(),
    sampleAttachments: new Map(),
    partnerFactories: new Map(),
    counter: 0,
  };

  const client = {
    $transaction: async (fn) => {
      return await fn(client);
    },
    $executeRawUnsafe: async () => {},

    partnerFactory: {
      findFirst: async ({ where } = {}) => {
        let items = Array.from(store.partnerFactories.values());
        if (where?.id) items = items.filter((f) => f.id === where.id);
        if (where?.companyId) items = items.filter((f) => f.companyId === where.companyId);
        return items[0] || null;
      },
    },

    samplePayment: {
      create: async ({ data }) => {
        const id = `smp-pay-${++store.counter}`;
        const record = {
          id,
          ...data,
          amount: Number(data.amount),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.samplePayments.set(id, record);
        return record;
      },
      findMany: async ({ where, orderBy } = {}) => {
        let items = Array.from(store.samplePayments.values());
        if (where?.sampleOrderId) items = items.filter((p) => p.sampleOrderId === where.sampleOrderId);
        if (where?.companyId) items = items.filter((p) => p.companyId === where.companyId);
        if (orderBy?.paidAt === 'desc') {
          items.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
        }
        return items;
      },
      findFirst: async ({ where } = {}) => {
        let items = Array.from(store.samplePayments.values());
        if (where?.id) items = items.filter((p) => p.id === where.id);
        if (where?.sampleOrderId) items = items.filter((p) => p.sampleOrderId === where.sampleOrderId);
        if (where?.companyId) items = items.filter((p) => p.companyId === where.companyId);
        return items[0] || null;
      },
      count: async ({ where } = {}) => {
        let items = Array.from(store.samplePayments.values());
        if (where?.sampleOrderId) items = items.filter((p) => p.sampleOrderId === where.sampleOrderId);
        return items.length;
      },
      delete: async ({ where } = {}) => {
        const item = store.samplePayments.get(where.id);
        if (item) store.samplePayments.delete(where.id);
        return item;
      },
      aggregate: async ({ where, _sum } = {}) => {
        let items = Array.from(store.samplePayments.values());
        if (where?.sampleOrderId) items = items.filter((p) => p.sampleOrderId === where.sampleOrderId);
        const sumAmount = items.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        return {
          _sum: { amount: sumAmount },
        };
      },
    },

    sampleOrder: {
      create: async ({ data }) => {
        const id = `smp-ord-${++store.counter}`;
        const record = {
          id,
          ...data,
          status: data.status || 'DRAFT',
          totalAmount: data.totalAmount !== undefined ? data.totalAmount : null,
          depositAmount: data.depositAmount !== undefined ? data.depositAmount : 0,
          paidAmount: data.paidAmount !== undefined ? data.paidAmount : 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.sampleOrders.set(id, record);
        return record;
      },
      update: async ({ where, data, include } = {}) => {
        const existing = store.sampleOrders.get(where.id);
        if (!existing) throw new Error('Not found');
        const updated = { ...existing, ...data, updatedAt: new Date() };
        store.sampleOrders.set(where.id, updated);

        const payments = Array.from(store.samplePayments.values())
          .filter((p) => p.sampleOrderId === updated.id)
          .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
        const partnerFactory = updated.partnerFactoryId
          ? store.partnerFactories.get(updated.partnerFactoryId) || null
          : null;
        return { ...updated, payments, partnerFactory };
      },
      findFirst: async ({ where, include } = {}) => {
        let items = Array.from(store.sampleOrders.values());
        if (where?.id) items = items.filter((s) => s.id === where.id);
        if (where?.companyId) items = items.filter((s) => s.companyId === where.companyId);
        if (where?.sampleNumber?.startsWith) {
          items = items.filter((s) => s.sampleNumber.startsWith(where.sampleNumber.startsWith));
        }
        if (items.length === 0) return null;
        const item = items[0];
        const payments = Array.from(store.samplePayments.values())
          .filter((p) => p.sampleOrderId === item.id)
          .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
        const partnerFactory = item.partnerFactoryId
          ? store.partnerFactories.get(item.partnerFactoryId) || null
          : null;
        return { ...item, payments, partnerFactory, stages: [], attachments: [] };
      },
      findMany: async ({ where, skip = 0, take = 50 } = {}) => {
        let items = Array.from(store.sampleOrders.values());
        if (where?.companyId) items = items.filter((s) => s.companyId === where.companyId);
        if (where?.partnerFactoryId) items = items.filter((s) => s.partnerFactoryId === where.partnerFactoryId);
        if (where?.expectedDeliveryAt?.lt) {
          const ltDate = new Date(where.expectedDeliveryAt.lt);
          items = items.filter((s) => s.expectedDeliveryAt && new Date(s.expectedDeliveryAt) < ltDate);
        }
        if (where?.status?.notIn) {
          items = items.filter((s) => !where.status.notIn.includes(s.status));
        }
        return items.slice(skip, skip + take).map((item) => {
          const partnerFactory = item.partnerFactoryId
            ? store.partnerFactories.get(item.partnerFactoryId) || null
            : null;
          return { ...item, partnerFactory, stages: [], attachments: [] };
        });
      },
      count: async ({ where } = {}) => {
        let items = Array.from(store.sampleOrders.values());
        if (where?.companyId) items = items.filter((s) => s.companyId === where.companyId);
        if (where?.partnerFactoryId) items = items.filter((s) => s.partnerFactoryId === where.partnerFactoryId);
        if (where?.expectedDeliveryAt?.lt) {
          const ltDate = new Date(where.expectedDeliveryAt.lt);
          items = items.filter((s) => s.expectedDeliveryAt && new Date(s.expectedDeliveryAt) < ltDate);
        }
        return items.length;
      },
    },
  };

  return { store, client };
}

describe('T06: Sample Orders Partner Factory, Deposit & Payment Flow', () => {
  const companyId = 'test-company-t06';
  const adminUser = { id: 'usr-admin', role: 'COMPANY_ADMIN', isOwner: false };
  const standardUser = { id: 'usr-worker', role: 'WORKER', isOwner: false };
  let testEnv;

  beforeEach(() => {
    testEnv = createInMemoryStore();
    currentPrisma = testEnv.client;
    global.__testPrisma = testEnv.client;

    testEnv.store.partnerFactories.set('fac-noor', {
      id: 'fac-noor',
      companyId,
      name: 'مصنع النور للخياطة',
      code: 'FAC-NOOR',
      contactPerson: 'الحاج مصطفى',
      phone: '01000000001',
      email: 'noor@factory.local',
    });
    testEnv.store.partnerFactories.set('fac-delta', {
      id: 'fac-delta',
      companyId,
      name: 'مصنع الدلتا للغزل',
      code: 'FAC-DELTA',
      contactPerson: 'م. إبراهيم',
      phone: '01000000002',
      email: 'delta@factory.local',
    });
  });

  test('4.1/1: Create sample with totalAmount 2000 & deposit 500 -> remaining 1500 & factory linked', async () => {
    const sample = await ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
      productName: 'عينة دفع',
      partnerFactoryId: 'fac-noor',
      expectedDeliveryAt: '2026-11-05',
      totalAmount: 2000,
      depositAmount: 500,
      plannedQuantity: 1,
    });

    expect(Number(sample.totalAmount)).toBe(2000);
    expect(Number(sample.depositAmount)).toBe(500);
    expect(Number(sample.paidAmount)).toBe(500);
    expect(Number(sample.remaining)).toBe(1500);
    expect(sample.partnerFactory?.name).toBe('مصنع النور للخياطة');
    expect(sample.payments?.length).toBe(1);
    expect(sample.payments[0].kind).toBe('DEPOSIT');
    expect(Number(sample.payments[0].amount)).toBe(500);
  });

  test('4.1/2: Add second payment of 500 -> paidAmount 1000, remaining 1000, 2 payments', async () => {
    const sample = await ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
      productName: 'عينة دفع 2',
      partnerFactoryId: 'fac-noor',
      expectedDeliveryAt: '2026-11-05',
      totalAmount: 2000,
      depositAmount: 500,
    });

    const updated = await ManufacturingSampleService.addSamplePayment(companyId, standardUser, sample.id, {
      amount: 500,
      method: 'CASH',
      paidAt: '2026-10-28',
      notes: 'دفعة تانية',
    });

    expect(Number(updated.paidAmount)).toBe(1000);
    expect(Number(updated.remaining)).toBe(1000);
    expect(updated.payments.length).toBe(2);
  });

  test('4.2/2 & 4.2/3: Overdue calculation for past and future expectedDeliveryAt', async () => {
    // Yesterday
    const pastSample = await ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
      productName: 'عينة متأخرة',
      expectedDeliveryAt: '2026-10-27',
      totalAmount: 1000,
    });
    expect(pastSample.isOverdue).toBe(true);
    expect(pastSample.overdueDays).toBeGreaterThanOrEqual(1);

    // Next week
    const futureSample = await ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
      productName: 'عينة قادمة',
      expectedDeliveryAt: '2026-11-10',
      totalAmount: 1000,
    });
    expect(futureSample.isOverdue).toBe(false);
    expect(futureSample.overdueDays).toBe(0);
  });

  test('4.2/5 & 4.2/6: Payment validation rejects overpayment, zero, and negative amounts', async () => {
    const sample = await ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
      productName: 'عينة فحص قيود',
      totalAmount: 1000,
      depositAmount: 200,
    });

    // Overpayment
    await expect(
      ManufacturingSampleService.addSamplePayment(companyId, standardUser, sample.id, { amount: 999999 })
    ).rejects.toThrow(/أكبر من المتبقي/);

    // Zero
    await expect(
      ManufacturingSampleService.addSamplePayment(companyId, standardUser, sample.id, { amount: 0 })
    ).rejects.toThrow(/مبلغ الدفعة يجب أن يكون رقماً موجباً/);

    // Negative
    await expect(
      ManufacturingSampleService.addSamplePayment(companyId, standardUser, sample.id, { amount: -50 })
    ).rejects.toThrow(/مبلغ الدفعة يجب أن يكون رقماً موجباً/);
  });

  test('4.2/7: Invalid paidAt date throws 400', async () => {
    const sample = await ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
      productName: 'عينة تاريخ غلط',
      totalAmount: 1000,
    });

    await expect(
      ManufacturingSampleService.addSamplePayment(companyId, standardUser, sample.id, {
        amount: 100,
        paidAt: '2026-13-45',
      })
    ).rejects.toThrow(/تاريخ الدفعة غير صحيح/);
  });

  test('4.2/8 & 4.2/9 & 4.2/10: PATCH commercial updates totalAmount, factory, but blocks deposit when payments exist', async () => {
    const sample = await ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
      productName: 'عينة تجارية',
      partnerFactoryId: 'fac-noor',
      totalAmount: 2000,
      depositAmount: 500,
    });

    // Update totalAmount to 2500
    const upd1 = await ManufacturingSampleService.updateSampleCommercial(companyId, adminUser, sample.id, {
      totalAmount: 2500,
    });
    expect(Number(upd1.totalAmount)).toBe(2500);
    expect(Number(upd1.remaining)).toBe(2000); // 2500 - 500

    // Switch factory to fac-delta
    const upd2 = await ManufacturingSampleService.updateSampleCommercial(companyId, adminUser, sample.id, {
      partnerFactoryId: 'fac-delta',
    });
    expect(upd2.partnerFactoryId).toBe('fac-delta');

    // Attempt to modify deposit after payments exist -> 400
    await expect(
      ManufacturingSampleService.updateSampleCommercial(companyId, adminUser, sample.id, {
        depositAmount: 600,
      })
    ).rejects.toThrow(/العربون تحول إلى دفعة مسجلة/);
  });

  test('4.2/11: Partner factory from foreign company is rejected with 400', async () => {
    await expect(
      ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
        productName: 'عينة مصنع غريب',
        partnerFactoryId: 'foreign-factory-id',
      })
    ).rejects.toThrow(/المصنع الشريك غير موجود في هذه الشركة/);
  });

  test('4.2/12: DELETE payment recalculates paidAmount and remaining', async () => {
    const sample = await ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
      productName: 'عينة حذف دفعة',
      totalAmount: 2000,
      depositAmount: 500,
    });

    const withSecondPayment = await ManufacturingSampleService.addSamplePayment(companyId, standardUser, sample.id, {
      amount: 500,
      notes: 'دفعة ثانية سيتم حذفها',
    });
    expect(Number(withSecondPayment.paidAmount)).toBe(1000);

    const paymentToDelete = withSecondPayment.payments[0]; // Most recent
    const afterDelete = await ManufacturingSampleService.deleteSamplePayment(companyId, adminUser, sample.id, paymentToDelete.id);

    expect(Number(afterDelete.paidAmount)).toBe(500);
    expect(Number(afterDelete.remaining)).toBe(1500);
    expect(afterDelete.payments.length).toBe(1);
  });

  test('4.2/13: createSampleOrder rejects depositAmount > totalAmount', async () => {
    await expect(
      ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
        productName: 'عينة عربون زائد',
        totalAmount: 2000,
        depositAmount: 3000,
      })
    ).rejects.toThrow(/العربون أكبر من إجمالي العينة/);
  });

  test('4.2/14: Fallback to fee when totalAmount is not provided', async () => {
    const sample = await ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
      productName: 'عينة بتكلفة فقط',
      fee: 250,
      plannedQuantity: 1,
    });

    expect(Number(sample.fee)).toBe(250);
    expect(sample.totalAmount).toBe(250); // Fallback at creation
    expect(Number(sample.remaining)).toBe(250);
  });

  test('Commercial modification guard: Non-admin/owner gets 403 on financial edits', async () => {
    const sample = await ManufacturingSampleService.createSampleOrder(companyId, adminUser, {
      productName: 'عينة صلاحيات',
      totalAmount: 2000,
    });

    await expect(
      ManufacturingSampleService.updateSampleCommercial(companyId, standardUser, sample.id, {
        totalAmount: 3000,
      })
    ).rejects.toThrow(/تعديل المبالغ المالية للعينة يتطلب صلاحيات/);
  });
});

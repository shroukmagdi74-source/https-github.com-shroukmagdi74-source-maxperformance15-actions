/**
 * @file customerQuality.bulk.test.js
 * @desc اختبار أداء وتجميع جودة العملاء لـ 40,000 عميل (شركة سوان ومتاجر الحجم الكبير).
 *
 * يحاكي الاختبار فشل كود الإنتاج القديم (Prisma IN query تتخطى 32,767 bind variable)،
 * ويتأكد من نجاح الاستعلام المجمع بـ $queryRawUnsafe وحساب كافة الشرائح والإحصائيات بدقة.
 */

const mockPrisma = {
  $queryRawUnsafe: jest.fn(),
  customer: {
    findMany: jest.fn(),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: () => mockPrisma,
}));

const analyticsController = require('../../controller/analyticsController');

const generate40kCustomers = () => {
  const rows = new Array(40000);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // 1. 10,000 عميل VIP (Score = 30 + 30 + 20 + 20 = 100)
  for (let i = 0; i < 10000; i++) {
    rows[i] = {
      customerId: `cust-vip-${i}`,
      totalOrders: 15,
      completedOrders: 15,
      cancelledOrders: 0,
      totalSpent: 15000,
      lastOrderDate: new Date(now - 2 * dayMs).toISOString(),
    };
  }

  // 2. 10,000 عميل عالي (Score = 20 + 20 + 15 + 20 = 75)
  for (let i = 10000; i < 20000; i++) {
    rows[i] = {
      customerId: `cust-high-${i}`,
      totalOrders: 6,
      completedOrders: 6,
      cancelledOrders: 0,
      totalSpent: 6000,
      lastOrderDate: new Date(now - 20 * dayMs).toISOString(),
    };
  }

  // 3. 10,000 عميل متوسط (Score = 10 + 10 + 10 + 20 = 50)
  for (let i = 20000; i < 30000; i++) {
    rows[i] = {
      customerId: `cust-med-${i}`,
      totalOrders: 3,
      completedOrders: 3,
      cancelledOrders: 0,
      totalSpent: 2500,
      lastOrderDate: new Date(now - 60 * dayMs).toISOString(),
    };
  }

  // 4. 10,000 عميل منخفض (Score = 5 + 0 + 0 + 0 = 5)
  for (let i = 30000; i < 40000; i++) {
    rows[i] = {
      customerId: `cust-low-${i}`,
      totalOrders: 1,
      completedOrders: 0,
      cancelledOrders: 1,
      totalSpent: 0,
      lastOrderDate: new Date(now - 250 * dayMs).toISOString(),
    };
  }

  return rows;
};

describe('Customer Quality Analytics — 40,000 Bulk Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // سلوك محاكاة فشل الإنتاج المثبت في لوج 25/10:
    // إذا تم استدعاء findMany بدون تحديد أو بفلتر يتجاوز 32,000 يرمي خطأ PostgreSQL الشهير
    mockPrisma.customer.findMany.mockImplementation(async (query) => {
      if (!query?.where?.id?.in || query.where.id.in.length > 32000) {
        throw new Error('too many bind variables in prepared statement, expected maximum of 32767');
      }

      return query.where.id.in.map((id) => ({
        id,
        firstName: 'عميل',
        lastName: id.replace('cust-', ''),
        phone: '01012345678',
      }));
    });
  });

  test('محاكاة فشل استعلام findMany غير المحدود قبل التعديل عند تخطي 32,767 بارامتر', async () => {
    await expect(
      mockPrisma.customer.findMany({
        where: { companyId: 'company-swan' },
      })
    ).rejects.toThrow('too many bind variables in prepared statement, expected maximum of 32767');
  });

  test('ينجح في معالجة 40,000 عميل باستخدام تجميع SQL ويرجع 200 وبنية بيانات صحيحة تمامًا', async () => {
    const fixtureRows = generate40kCustomers();
    mockPrisma.$queryRawUnsafe.mockResolvedValue(fixtureRows);

    const req = {
      user: { companyId: 'company-swan' },
      query: { period: '30' },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await analyticsController.getCustomerQualityAnalytics(req, res);

    // 1. التحقق من عدم رمي 500 واستدعاء 200 بنجاح
    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledTimes(1);

    const jsonResponse = res.json.mock.calls[0][0];
    expect(jsonResponse.success).toBe(true);

    // 2. التحقق من استدعاء استعلام SQL التجميعي مرة واحدة واحتوائه على GROUP BY
    expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(1);
    const executedSql = mockPrisma.$queryRawUnsafe.mock.calls[0][0];
    expect(executedSql).toMatch(/GROUP BY/i);
    expect(executedSql).toMatch(/FILTER\s*\(WHERE/i);

    // 3. التحقق من استدعاء findMany لأعلى 100 عميل فقط
    expect(mockPrisma.customer.findMany).toHaveBeenCalledTimes(1);
    const findManyArgs = mockPrisma.customer.findMany.mock.calls[0][0];
    expect(findManyArgs.where.id.in).toHaveLength(100);

    const data = jsonResponse.data;

    // 4. إجمالي العملاء 40,000
    expect(data.totalCustomers).toBe(40000);

    // 5. توزيع الشرائح الدقيق ومجموعها 40,000
    expect(data.tierCounts).toEqual({
      VIP: 10000,
      'عالي': 10000,
      'متوسط': 10000,
      'منخفض': 10000,
    });
    const tierSum = Object.values(data.tierCounts).reduce((sum, count) => sum + count, 0);
    expect(tierSum).toBe(40000);

    // متوسط السكور (100 + 75 + 50 + 5) / 4 = 57.50
    expect(data.avgCustomerScore).toBeCloseTo(57.5, 1);

    // 6. قائمة العملاء المرجعة طولها 100 ومرتبة تنازليًا بالسكور
    expect(data.customers).toHaveLength(100);
    for (let i = 1; i < data.customers.length; i++) {
      expect(data.customers[i - 1].score).toBeGreaterThanOrEqual(data.customers[i].score);
    }

    // 7. مطابقة مفاتيح الرد بالحرف
    const expectedDataKeys = [
      'avgCustomerScore',
      'averageOrderValue',
      'customerLifetimeValue',
      'customers',
      'newCustomers',
      'repeatCustomers',
      'repeatRate',
      'segments',
      'tierCounts',
      'topCustomers',
      'totalCustomers',
      'totalRevenue',
      'vipRevenue',
      'vipRevenuePercentage',
    ].sort();
    expect(Object.keys(data).sort()).toEqual(expectedDataKeys);

    // 8. التحقق من أنواع الحقول ومفاتيح عناصر العملاء الـ 13 بالحرف
    const expectedCustomerKeys = [
      'avgOrderValue',
      'cancelledOrders',
      'completedOrders',
      'completionRate',
      'customerId',
      'customerName',
      'customerPhone',
      'daysSinceLastOrder',
      'lastOrderDate',
      'score',
      'tier',
      'totalOrders',
      'totalSpent',
    ].sort();

    expect(typeof data.avgCustomerScore).toBe('number');

    data.customers.forEach((c) => {
      expect(Object.keys(c).sort()).toEqual(expectedCustomerKeys);
      expect(typeof c.avgOrderValue).toBe('string');
      expect(typeof c.completionRate).toBe('string');
      expect(typeof c.totalSpent).toBe('number');
      expect(typeof c.score).toBe('number');
      expect(typeof c.totalOrders).toBe('number');
      expect(typeof c.completedOrders).toBe('number');
      expect(typeof c.cancelledOrders).toBe('number');
      expect(typeof c.daysSinceLastOrder).toBe('number');
      expect(c.lastOrderDate === null || typeof c.lastOrderDate === 'string').toBe(true);
    });
  });
});

/**
 * @file academySources.test.js
 * @desc Tests for ACAD-SRC-1:
 *   1. enrollStudent stores attribution and sessionDetails
 *   2. getSourcesAnalytics accurately aggregates totals, byCampaign, bySource, byLanding, byDay on 4 mock enrollments
 *   3. Negative test: attribution with 5000 chars + nested objects is safely sanitized and stored without error
 */

const academyService = require('../../services/academyService');
const { sanitizeOrderAttribution } = require('../../utils/orderAttribution');

// Mock shared database to isolate unit tests
jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: () => ({}),
}));

const mockDb = {
  academyCourse: { findFirst: jest.fn(), findMany: jest.fn() },
  academyEnrollment: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  order: { findMany: jest.fn(), findUnique: jest.fn() },
};

academyService.getDb = () => mockDb;

describe('ACAD-SRC-1 — مصادر تسجيل الأكاديمية والتحليلات', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('أ) حفظ attribution وsessionDetails في enrollStudent', () => {
    test('enrollStudent يحفظ attribution وsessionDetails عند إنشاء التسجيل', async () => {
      const course = {
        id: 'course-1',
        companyId: 'company-123',
        price: 0,
        isGlobal: false,
        title: 'كورس تجريبي',
      };
      mockDb.academyCourse.findFirst.mockResolvedValue(course);
      mockDb.academyEnrollment.findFirst.mockResolvedValue(null);
      mockDb.academyEnrollment.create.mockImplementation(({ data }) => Promise.resolve({ id: 'enr-1', ...data }));

      const sampleAttribution = {
        source: 'facebook',
        medium: 'paid_social',
        campaignName: 'حملة الخريف',
        campaignId: 'cmp-99',
      };
      const sampleSessionDetails = {
        durationSeconds: 120,
        pagesVisited: [{ path: '/portal/course/course-1', title: 'الكورس' }],
      };

      const result = await academyService.enrollStudent({
        companyId: 'company-123',
        courseId: 'course-1',
        studentName: 'أحمد علي',
        studentPhone: '01012345678',
        attribution: sampleAttribution,
        sessionDetails: sampleSessionDetails,
      });

      expect(mockDb.academyEnrollment.create).toHaveBeenCalledTimes(1);
      const createData = mockDb.academyEnrollment.create.mock.calls[0][0].data;

      expect(createData.attribution).toEqual(sampleAttribution);
      expect(createData.sessionDetails).toEqual(sampleSessionDetails);
      expect(result.studentName).toBe('أحمد علي');
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('ب) دالة التجميع getSourcesAnalytics على 4 تسجيلات نموذجية', () => {
    test('ترجع totals وbyCampaign بدقة (2 حملة + 1 غير معروف + 1 بلا أوردر)', async () => {
      const companyId = 'comp-analytics-test';
      const now = new Date();

      const mockEnrollments = [
        // 1. مسجل بحملة فيسبوك + أوردر مدفوع
        {
          id: 'enr-1',
          companyId,
          courseId: 'c-paid-1',
          orderId: 'ord-1',
          enrolledAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          attribution: {
            source: 'facebook',
            medium: 'paid_social',
            platform: 'facebook',
            campaignName: 'حملة الصيف',
            campaignId: 'camp-summer',
            landingPath: '/portal/course/c-paid-1',
            referrer: 'https://m.facebook.com/',
          },
          sessionDetails: null,
          course: { id: 'c-paid-1', title: 'كورس التسويق', price: 100 },
        },
        // 2. مسجل بنفس حملة فيسبوك + أوردر معلق (غير مدفوع)
        {
          id: 'enr-2',
          companyId,
          courseId: 'c-paid-1',
          orderId: 'ord-2',
          enrolledAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          attribution: {
            source: 'facebook',
            medium: 'paid_social',
            platform: 'facebook',
            campaignName: 'حملة الصيف',
            campaignId: 'camp-summer',
            landingPath: '/portal/course/c-paid-1',
            referrer: 'https://m.facebook.com/',
          },
          sessionDetails: null,
          course: { id: 'c-paid-1', title: 'كورس التسويق', price: 100 },
        },
        // 3. مسجل غير معروف المصدر + أوردر مكتمل الدفع
        {
          id: 'enr-3',
          companyId,
          courseId: 'c-paid-2',
          orderId: 'ord-3',
          enrolledAt: new Date(now.getTime() - 30 * 60 * 1000),
          attribution: null,
          sessionDetails: null,
          course: { id: 'c-paid-2', title: 'كورس الإدارة', price: 200 },
        },
        // 4. مسجل بحملة تيك توك في كورس مجاني (بلا أوردر)
        {
          id: 'enr-4',
          companyId,
          courseId: 'c-free-1',
          orderId: null,
          enrolledAt: now,
          attribution: {
            source: 'tiktok',
            medium: 'cpc',
            platform: 'tiktok',
            campaignName: 'حملة تيك توك المجانية',
            campaignId: 'camp-tt',
            landingPath: '/portal/catalog',
            referrer: 'https://www.tiktok.com/',
          },
          sessionDetails: null,
          course: { id: 'c-free-1', title: 'كورس مجاني', price: 0 },
        },
      ];

      const mockOrders = [
        { id: 'ord-1', orderNumber: 'ORD-1', total: 100, paymentStatus: 'PAID' },
        { id: 'ord-2', orderNumber: 'ORD-2', total: 100, paymentStatus: 'PENDING' },
        { id: 'ord-3', orderNumber: 'ORD-3', total: 200, paymentStatus: 'COMPLETED' },
      ];

      mockDb.academyEnrollment.findMany.mockResolvedValue(mockEnrollments);
      mockDb.order.findMany.mockResolvedValue(mockOrders);

      const result = await academyService.getSourcesAnalytics(companyId, { days: 30 });

      expect(result).toBeDefined();
      expect(result.range.days).toBe(30);

      // فحص الأرقام الإجمالية (totals)
      expect(result.totals.enrollments).toBe(4);
      expect(result.totals.paidEnrollments).toBe(2); // ord-1 و ord-3
      expect(result.totals.attributedEnrollments).toBe(3); // enr-1, enr-2, enr-4
      expect(result.totals.unattributedEnrollments).toBe(1); // enr-3
      expect(result.totals.revenue).toBe(300); // 100 + 200
      expect(result.totals.enrollmentValue).toBe(400); // 100 + 100 + 200 + 0

      // فحص تصنيف الحملات (byCampaign)
      const summerCamp = result.byCampaign.find((c) => c.campaignName === 'حملة الصيف');
      expect(summerCamp).toBeDefined();
      expect(summerCamp.enrollments).toBe(2);
      expect(summerCamp.paidEnrollments).toBe(1);
      expect(summerCamp.revenue).toBe(100);
      expect(summerCamp.enrollmentValue).toBe(200);

      const ttCamp = result.byCampaign.find((c) => c.campaignName === 'حملة تيك توك المجانية');
      expect(ttCamp).toBeDefined();
      expect(ttCamp.enrollments).toBe(1);
      expect(ttCamp.paidEnrollments).toBe(0);
      expect(ttCamp.revenue).toBe(0);

      const unknownCamp = result.byCampaign.find((c) => c.campaignName === 'غير معروف');
      expect(unknownCamp).toBeDefined();
      expect(unknownCamp.enrollments).toBe(1);
      expect(unknownCamp.paidEnrollments).toBe(1);
      expect(unknownCamp.revenue).toBe(200);

      // فحص تصنيف المصادر (bySource)
      const fbSource = result.bySource.find((s) => s.source === 'facebook');
      expect(fbSource).toBeDefined();
      expect(fbSource.enrollments).toBe(2);
      expect(fbSource.revenue).toBe(100);

      const unknownSource = result.bySource.find((s) => s.source === 'unknown');
      expect(unknownSource).toBeDefined();
      expect(unknownSource.enrollments).toBe(1);

      // فحص تصنيف صفحات الهبوط (byLanding)
      expect(result.byLanding.length).toBeGreaterThan(0);

      // فحص الشريط اليومي (byDay)
      expect(result.byDay.length).toBeGreaterThan(0);
      expect(result.byDay[0].enrollments).toBeGreaterThan(0);
    });
  });

  describe('ج) اختبار سلبي — قيم ضخمة وكائنات متداخلة (Negative Test)', () => {
    test('تنقية النصوص وتفادي 500 وقص القيم إلى <= 320 حرف', async () => {
      const hugeString = 'A'.repeat(5000);
      const nestedObject = { deep: { deeper: 'B'.repeat(5000) } };

      const rawAttribution = {
        source: hugeString,
        medium: hugeString,
        campaignName: nestedObject,
        content: 'C'.repeat(5000),
      };

      const sanitized = sanitizeOrderAttribution(rawAttribution);
      expect(sanitized).toBeDefined();

      // التأكد أن القيم قُطعت ولا تتجاوز الحدود الآمنة
      expect(sanitized.source.length).toBeLessThanOrEqual(120);
      expect(sanitized.medium.length).toBeLessThanOrEqual(120);
      expect(sanitized.campaignName.length).toBeLessThanOrEqual(320);
      expect(sanitized.content.length).toBeLessThanOrEqual(320);

      // التأكد أن enrollStudent يقبلها ويخزنها دون أخطاء
      const course = {
        id: 'c-free-neg',
        companyId: 'co-neg',
        price: 0,
        isGlobal: false,
        title: 'كورس اختبار سلبي',
      };
      mockDb.academyCourse.findFirst.mockResolvedValue(course);
      mockDb.academyEnrollment.findFirst.mockResolvedValue(null);
      mockDb.academyEnrollment.create.mockImplementation(({ data }) => Promise.resolve({ id: 'enr-neg', ...data }));

      const result = await academyService.enrollStudent({
        companyId: 'co-neg',
        courseId: 'c-free-neg',
        studentName: 'طالب الاختبار السلبي',
        attribution: sanitized,
      });

      expect(result).toBeDefined();
      expect(result.attribution.source.length).toBeLessThanOrEqual(120);
    });
  });
});

const mockPrisma = {
  competitor: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  competitorReport: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  safeQuery: jest.fn(async (operation) => operation()),
}));

const CompetitorService = require('../../services/competitorService');

describe('CompetitorService.generateReport (Package A)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aggregates ads, products, packages, features, social, tech, and priceChanges into structured sections and Arabic summary', async () => {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 3);

    const mockCompetitor = {
      id: 'comp-1',
      name: 'منافس تجريبي',
      companyId: 'company-1',
      metadata: {
        tech: ['Next.js', 'Cloudflare', 'TailwindCSS'],
        tech_scanned: '2026-11-24',
      },
      products: [
        {
          id: 'p1',
          name: 'باقة احترافية',
          category: 'باقة',
          price: 1500,
          currency: 'EGP',
          firstSeen: periodStart,
          priceHistory: [
            { price: 1500, recordedAt: new Date() },
            { price: 1200, recordedAt: new Date(Date.now() - 86400000) },
          ],
        },
        {
          id: 'p2',
          name: 'منتج عادي',
          category: 'عام',
          price: 300,
          currency: 'EGP',
          firstSeen: new Date(Date.now() - 864000000),
          priceHistory: [{ price: 300, recordedAt: new Date() }],
        },
      ],
      ads: [
        {
          id: 'ad1',
          platform: 'facebook',
          status: 'active',
          headline: 'عرض الصيف',
          copy: 'اشترك الآن واحصل على خصم',
          firstSeen: periodStart,
        },
        {
          id: 'ad2',
          platform: 'facebook',
          status: 'inactive',
          headline: 'عرض قديم',
          firstSeen: new Date(Date.now() - 864000000),
        },
      ],
      features: [
        { id: 'f1', title: 'دعم فني 24/7', priority: 'high', status: 'active' },
        { id: 'f2', title: 'شحن مجاني', priority: 'medium', status: 'pending' },
      ],
      socialProfiles: [
        { id: 's1', platform: 'facebook', profileUrl: 'https://facebook.com/comp' },
        { id: 's2', platform: 'instagram', profileUrl: 'https://instagram.com/comp' },
      ],
    };

    mockPrisma.competitor.findFirst.mockResolvedValue(mockCompetitor);
    // No report exists for today yet
    mockPrisma.competitorReport.findFirst.mockResolvedValue(null);
    mockPrisma.competitorReport.create.mockImplementation(({ data }) => Promise.resolve({ id: 'rep-new', ...data }));

    const report = await CompetitorService.generateReport('company-1', 'comp-1', 'weekly');

    expect(report).toBeDefined();
    // 1. Verify summary format: «X إعلان (Y جديد) · Z باقة · W ميزة · تغيّر سعر N»
    expect(report.summary).toContain('2 إعلان');
    expect(report.summary).toContain('1 جديد');
    expect(report.summary).toContain('1 باقة');
    expect(report.summary).toContain('2 ميزة');
    expect(report.summary).toContain('تغيّر سعر 1');

    // 2. Verify structured sections in data
    const parsedData = JSON.parse(report.data);
    expect(parsedData.sections).toBeDefined();
    expect(parsedData.sections.ads.total).toBe(2);
    expect(parsedData.sections.products.packagesCount).toBe(1);
    expect(parsedData.sections.features.total).toBe(2);
    expect(parsedData.sections.social.total).toBe(2);
    expect(parsedData.sections.tech.items).toEqual(['Next.js', 'Cloudflare', 'TailwindCSS']);
    expect(parsedData.sections.priceChanges.total).toBe(1);

    // 3. Verify creation was called
    expect(mockPrisma.competitorReport.create).toHaveBeenCalled();
  });

  it('performs upsert if report already exists for today, preventing duplicates', async () => {
    const mockCompetitor = {
      id: 'comp-1',
      name: 'منافس تجريبي',
      companyId: 'company-1',
      metadata: {},
      products: [],
      ads: [],
      features: [],
      socialProfiles: [],
    };

    mockPrisma.competitor.findFirst.mockResolvedValue(mockCompetitor);
    const existingReport = { id: 'rep-existing-today', title: 'تقرير قديم' };
    mockPrisma.competitorReport.findFirst.mockResolvedValue(existingReport);
    mockPrisma.competitorReport.update.mockImplementation(({ data }) => Promise.resolve({ id: 'rep-existing-today', ...data }));

    const report = await CompetitorService.generateReport('company-1', 'comp-1', 'weekly');

    expect(report.id).toBe('rep-existing-today');
    expect(mockPrisma.competitorReport.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rep-existing-today' } })
    );
    expect(mockPrisma.competitorReport.create).not.toHaveBeenCalled();
  });

  it('INVARIANT: reports with null/empty insights are handled safely and never throw', async () => {
    const rawReports = [
      { id: 'rep-null-insights', insights: null, data: { sections: {} } },
      { id: 'rep-empty-insights', insights: '', data: null },
      { id: 'rep-invalid-json', insights: '{invalid json}', data: '{invalid json}' },
    ];

    mockPrisma.competitorReport.findMany.mockResolvedValue(rawReports);
    mockPrisma.competitorReport.count.mockResolvedValue(3);

    const result = await CompetitorService.listReports('company-1', 'comp-1', { page: 1, limit: 10 });
    expect(result.data).toHaveLength(3);
    // Verifies service processes all records without throwing any JSON parse error
    expect(result.data[0].insights).toBeNull();
  });
});

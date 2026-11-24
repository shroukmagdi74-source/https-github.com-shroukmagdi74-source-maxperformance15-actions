const CompetitorExportService = require('../../services/competitorExportService');

describe('Competitor Export Service (Package F)', () => {
  const mockCompetitor = {
    id: 'comp-101',
    companyId: 'company-1',
    name: 'سوان كير المنافس',
    website: 'https://competitor.example.com',
    market: 'مستحضرات تجميل',
    profileCompletion: 85,
  };

  const mockReport = {
    id: 'rep-1',
    createdAt: new Date('2026-11-24T00:00:00.000Z'),
    summary: '15 إعلان (3 جديد) · 4 باقة · 8 ميزة · تغيّر سعر 1',
  };

  const mockAds = [
    {
      id: 'ad-1',
      title: 'عرض الجمعة البيضاء كولكشن العناية',
      platform: 'Meta',
      status: 'ACTIVE',
      libraryId: '123456789',
      spend: '$100-500',
      runTime: '14 يوم',
      startDate: new Date('2026-11-10'),
      creativeUrl: '/uploads/competitor-creatives/ad-1.svg',
    },
    {
      id: 'ad-2',
      title: 'إعلان متوقف سيروم الوجه',
      platform: 'Meta',
      status: 'INACTIVE',
      libraryId: '987654321',
      spend: '$50',
      runTime: '5 أيام',
      startDate: new Date('2026-11-01'),
      creativeUrl: null,
    },
  ];

  const mockProducts = [
    {
      id: 'prod-1',
      name: 'باقة التوفير الشهرية',
      category: 'باقة',
      price: 499,
      currency: 'EGP',
      metadata: { billingCycle: 'شهري' },
      url: 'https://competitor.example.com/packages/bundle',
    },
    {
      id: 'prod-2',
      name: 'سيروم الهيالورونيك',
      category: 'عناية بالبشرة',
      price: 250,
      currency: 'EGP',
      metadata: null,
      url: 'https://competitor.example.com/products/serum',
    },
  ];

  const mockFeatures = [
    {
      id: 'feat-1',
      name: 'شحن مجاني لكافة المحافظات',
      category: 'لوجستيات',
      isDifferentiator: true,
      description: 'توصيل مجاني لأي طلب يتجاوز 300 جنيه خلال 48 ساعة',
    },
    {
      id: 'feat-2',
      name: 'دفع عند الاستلام وإنستاباي',
      category: 'دفع',
      isDifferentiator: false,
      description: 'دعم المحافظ الإلكترونية والميزات المحلية',
    },
  ];

  it('generates well-formatted CSV with UTF-8 BOM, ads, packages, and features', () => {
    const csv = CompetitorExportService.generateCsv({
      competitor: mockCompetitor,
      report: mockReport,
      ads: mockAds,
      products: mockProducts,
      features: mockFeatures,
    });

    expect(typeof csv).toBe('string');
    // Enforce UTF-8 BOM so Excel on Windows opens Arabic cleanly
    expect(csv.startsWith('\ufeff')).toBe(true);

    // Assert competitor info
    expect(csv).toContain('سوان كير المنافس');
    expect(csv).toContain('مستحضرات تجميل');
    expect(csv).toContain('85%');
    expect(csv).toContain('15 إعلان (3 جديد)');

    // Assert Ads section
    expect(csv).toContain('عرض الجمعة البيضاء كولكشن العناية');
    expect(csv).toContain('123456789');

    // Assert Packages and products
    expect(csv).toContain('باقة التوفير الشهرية');
    expect(csv).toContain('499');
    expect(csv).toContain('شهري');

    // Assert Features
    expect(csv).toContain('شحن مجاني لكافة المحافظات');
    expect(csv).toContain('نعم (ميزة حصرية)');
  });

  it('generates valid PDF buffer with Arabic text shaping', async () => {
    const pdfBuffer = await CompetitorExportService.generatePdf({
      competitor: mockCompetitor,
      report: mockReport,
      ads: mockAds,
      products: mockProducts,
      features: mockFeatures,
    });

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    // PDF Magic bytes '%PDF'
    const header = pdfBuffer.slice(0, 4).toString('ascii');
    expect(header).toBe('%PDF');
  });

  it('CompetitorService.exportCompetitorData returns correct mimeType and attachment headers', async () => {
    const mockPrisma = {
      competitor: {
        findFirst: jest.fn().mockResolvedValue(mockCompetitor),
      },
      competitorReport: {
        findFirst: jest.fn().mockResolvedValue(mockReport),
      },
      competitorAd: {
        findMany: jest.fn().mockResolvedValue(mockAds),
      },
      competitorProduct: {
        findMany: jest.fn().mockResolvedValue(mockProducts),
      },
      competitorFeature: {
        findMany: jest.fn().mockResolvedValue(mockFeatures),
      },
    };

    jest.doMock('../../services/sharedDatabase', () => ({
      getSharedPrismaClient: jest.fn(() => mockPrisma),
      safeQuery: jest.fn(async (operation) => operation()),
    }));

    const CompetitorService = require('../../services/competitorService');

    // 1. CSV export
    const csvResult = await CompetitorService.exportCompetitorData('company-1', 'comp-101', { format: 'csv' });
    expect(csvResult.format).toBe('csv');
    expect(csvResult.mimeType).toBe('text/csv; charset=utf-8');
    expect(csvResult.filename).toContain('.csv');
    expect(csvResult.content).toContain('سوان كير المنافس');

    // 2. PDF export
    const pdfResult = await CompetitorService.exportCompetitorData('company-1', 'comp-101', { format: 'pdf' });
    expect(pdfResult.format).toBe('pdf');
    expect(pdfResult.mimeType).toBe('application/pdf');
    expect(pdfResult.filename).toContain('.pdf');
    expect(Buffer.isBuffer(pdfResult.buffer)).toBe(true);
    expect(pdfResult.buffer.slice(0, 4).toString('ascii')).toBe('%PDF');
  });
});

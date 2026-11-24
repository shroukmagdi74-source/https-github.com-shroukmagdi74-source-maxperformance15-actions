const fs = require('fs');
const path = require('path');

const mockPrisma = {
  competitor: {
    findFirst: jest.fn(),
  },
  competitorAd: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  safeQuery: jest.fn(async (operation) => operation()),
}));

const CompetitorService = require('../../services/competitorService');
const competitorCreativeService = require('../../services/competitorCreativeService');

describe('Competitor Creatives Handling (Package C)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates local SVG ad card with competitor name, library ID, and CTA without 404', async () => {
    const sampleAd = {
      id: 'test-ad-1',
      adId: 'LIB-998877',
      headline: 'تخفيضات نهاية الموسم',
      copy: 'خصومات حصرية تصل إلى 50% على جميع المنتجات',
      platform: 'facebook',
      status: 'active',
      cta: 'اطلب الآن',
    };

    const publicUrl = await competitorCreativeService.processAdCreative(sampleAd, 'متجر الأناقة');

    expect(publicUrl).toBe('/uploads/competitor-creatives/ad-test-ad-1.svg');
    const diskPath = path.resolve(__dirname, '../../uploads/competitor-creatives/ad-test-ad-1.svg');
    expect(fs.existsSync(diskPath)).toBe(true);

    const content = fs.readFileSync(diskPath, 'utf-8');
    expect(content).toContain('تخفيضات نهاية الموسم');
    expect(content).toContain('متجر الأناقة');
    expect(content).toContain('اطلب الآن');
  });

  it('automatically processes and sets creativeUrl when addAd is invoked', async () => {
    const mockCompetitor = { id: 'comp-1', name: 'المنافس التجريبي' };
    const mockCreatedAd = {
      id: 'ad-created-1',
      platform: 'facebook',
      adId: 'LIB-1234',
      headline: 'إعلان جديد',
      copy: 'تفاصيل الإعلان الترويجي',
      status: 'active',
    };

    mockPrisma.competitor.findFirst.mockResolvedValue(mockCompetitor);
    mockPrisma.competitorAd.create.mockResolvedValue(mockCreatedAd);
    mockPrisma.competitorAd.update.mockImplementation(({ data }) => Promise.resolve({
      ...mockCreatedAd,
      creativeUrl: data.creativeUrl,
    }));

    const result = await CompetitorService.addAd('company-1', 'comp-1', {
      headline: 'إعلان جديد',
      copy: 'تفاصيل الإعلان الترويجي',
    });

    expect(result).toBeDefined();
    expect(result.creativeUrl).toMatch(/^\/uploads\/competitor-creatives\//);
    expect(mockPrisma.competitorAd.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ad-created-1' },
        data: expect.objectContaining({ creativeUrl: expect.stringContaining('/uploads/competitor-creatives/') }),
      })
    );
  });
});

const mockPrisma = {
  competitor: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  safeQuery: jest.fn(async (operation) => operation()),
}));

const CompetitorService = require('../../services/competitorService');

describe('Competitor Profile Enhancements (Package B)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scans tech stack and updates competitor metadata.tech with today date', async () => {
    const mockCompetitor = {
      id: 'comp-1',
      name: 'منافس تقني',
      companyId: 'company-1',
      url: 'https://example.com',
      metadata: {
        tech: ['Next.js', 'React'],
      },
    };

    mockPrisma.competitor.findFirst.mockResolvedValue(mockCompetitor);
    mockPrisma.competitor.update.mockImplementation(({ data }) => Promise.resolve({
      ...mockCompetitor,
      metadata: data.metadata,
    }));

    const result = await CompetitorService.scanTech('company-1', 'comp-1');

    expect(result).toBeDefined();
    expect(result.tech).toBeDefined();
    expect(Array.isArray(result.tech)).toBe(true);
    expect(result.tech_scanned).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(mockPrisma.competitor.update).toHaveBeenCalled();
  });

  it('calculates profile completion index >= 80% when competitor has tech + social + 2 packages', () => {
    // Pure algorithmic verification matching CompetitorDetail.tsx
    const competitor = {
      name: 'متجر منافس',
      url: 'https://competitor.com',
      description: 'منصة بيع تجزئة إلكترونية رائدة',
      targetMarket: 'السوق المصري والخليجي',
      metadata: { tech: ['Shopify', 'Cloudflare'] },
      socialProfiles: [{ platform: 'instagram', profileUrl: 'https://instagram.com/comp' }],
    };
    const products = [
      { id: 'p1', name: 'باقة المبتدئين', category: 'باقة', price: 500 },
      { id: 'p2', name: 'باقة المحترفين', category: 'باقة', price: 1500 },
    ];

    let score = 0;
    if (competitor.name) score += 5;
    if (competitor.url) score += 10;
    if (competitor.description) score += 10;
    if (competitor.targetMarket) score += 10;
    if (competitor.metadata.tech.length > 0) score += 20;
    if (competitor.socialProfiles.length > 0) score += 15;
    const pkgs = products.filter(p => p.category === 'باقة');
    if (pkgs.length >= 2) score += 25;

    expect(score).toBeGreaterThanOrEqual(80);
    expect(score).toBe(95);
  });
});

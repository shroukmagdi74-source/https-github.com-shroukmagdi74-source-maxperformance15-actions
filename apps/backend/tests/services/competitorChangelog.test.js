const mockPrisma = {
  competitor: {
    findFirst: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  competitorProduct: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  competitorPriceHistory: {
    create: jest.fn(),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  safeQuery: jest.fn(async (operation) => operation()),
}));

const competitorChangelogService = require('../../services/competitorChangelogService');
const CompetitorService = require('../../services/competitorService');

describe('Competitor Changelog & Diff Engine (Package D)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records change into metadata.changes and updates last_change_detected', async () => {
    const mockCompetitor = {
      id: 'comp-1',
      companyId: 'company-1',
      metadata: { changes: [] },
    };

    mockPrisma.competitor.findFirst.mockResolvedValue(mockCompetitor);
    mockPrisma.competitor.update.mockResolvedValue({ id: 'comp-1' });

    const change = await competitorChangelogService.recordChange('company-1', 'comp-1', {
      type: 'PRICE_CHANGE',
      title: 'تغيّر سعر منتج تجريبي',
      description: 'من 100 إلى 150',
      diff: { oldPrice: 100, newPrice: 150, percentChange: '+50%' },
    });

    expect(change).toBeDefined();
    expect(change.type).toBe('PRICE_CHANGE');
    expect(mockPrisma.competitor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'comp-1' },
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            changes: expect.arrayContaining([expect.objectContaining({ title: 'تغيّر سعر منتج تجريبي' })]),
          }),
        }),
      })
    );
  });

  it('detects price difference from priceHistory and records PACKAGE_CHANGE', async () => {
    const mockCompetitor = {
      id: 'comp-1',
      companyId: 'company-1',
      metadata: { changes: [] },
      products: [
        {
          id: 'p1',
          name: 'باقة الانطلاق',
          category: 'باقة',
          currency: 'EGP',
          priceHistory: [
            { price: 1500, recordedAt: new Date() },
            { price: 1200, recordedAt: new Date(Date.now() - 3600000) },
          ],
        },
      ],
      features: [],
    };

    mockPrisma.competitor.findFirst.mockResolvedValue(mockCompetitor);
    mockPrisma.competitor.update.mockResolvedValue({ id: 'comp-1' });

    const result = await competitorChangelogService.detectAndRecordChanges('company-1', 'comp-1');

    expect(result.count).toBe(1);
    expect(result.changes[0].type).toBe('PACKAGE_CHANGE');
    expect(result.changes[0].diff.oldPrice).toBe(1200);
    expect(result.changes[0].diff.newPrice).toBe(1500);
    expect(result.changes[0].diff.percentChange).toBe('+25.0%');
  });

  it('automatically triggers changelog entry when updateProductPrice modifies price', async () => {
    const mockProduct = {
      id: 'prod-99',
      competitorId: 'comp-1',
      name: 'باقة بلس',
      price: 1000,
      category: 'باقة',
      competitor: { id: 'comp-1' },
    };

    mockPrisma.competitorProduct.findFirst.mockResolvedValue(mockProduct);
    mockPrisma.competitorProduct.update.mockResolvedValue({ ...mockProduct, price: 1200 });
    mockPrisma.competitorPriceHistory.create.mockResolvedValue({});

    const mockCompetitor = {
      id: 'comp-1',
      companyId: 'company-1',
      metadata: { changes: [] },
    };
    mockPrisma.competitor.findFirst.mockResolvedValue(mockCompetitor);
    mockPrisma.competitor.update.mockResolvedValue({ id: 'comp-1' });

    const updated = await CompetitorService.updateProductPrice('company-1', 'prod-99', 1200, 'EGP');

    expect(updated).toBeDefined();
    expect(mockPrisma.competitor.update).toHaveBeenCalled();
  });
});

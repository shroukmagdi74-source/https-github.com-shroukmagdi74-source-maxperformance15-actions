const { resolveWholesalePrice } = require('../services/wholesalePricing');

function makePrisma({ wc = null, links = [], itemsByList = {} }) {
  return {
    wholesaleCustomer: {
      findFirst: jest.fn().mockResolvedValue(wc),
    },
    wholesaleCustomerPriceList: {
      findMany: jest.fn().mockResolvedValue(links),
    },
    wholesalePriceListItem: {
      findMany: jest.fn().mockImplementation(({ where }) =>
        Promise.resolve(itemsByList[where.priceListId] || []),
      ),
    },
  };
}

const baseCtx = {
  companyId: 'co1',
  customerId: 'c1',
  productId: 'p1',
  variantId: null,
  quantity: 1,
};

describe('resolveWholesalePrice', () => {
  test('1. higher priority price list wins', async () => {
    const prisma = makePrisma({
      wc: { id: 'wc1', customerId: 'c1', companyId: 'co1', isActive: true },
      links: [
        {
          priceListId: 'pl1',
          priority: 10,
          createdAt: new Date('2026-01-01'),
          priceList: { id: 'pl1', companyId: 'co1', isActive: true, validFrom: null, validTo: null },
        },
        {
          priceListId: 'pl2',
          priority: 0,
          createdAt: new Date('2026-01-02'),
          priceList: { id: 'pl2', companyId: 'co1', isActive: true, validFrom: null, validTo: null },
        },
      ],
      itemsByList: {
        pl1: [{ id: 'i1', priceListId: 'pl1', productId: 'p1', variantId: null, price: 80, minQuantity: 1 }],
        pl2: [{ id: 'i2', priceListId: 'pl2', productId: 'p1', variantId: null, price: 60, minQuantity: 1 }],
      },
    });

    const result = await resolveWholesalePrice({ prisma, ...baseCtx });

    expect(result).not.toBeNull();
    expect(result.price).toBe(80);
    expect(result.priceListId).toBe('pl1');
  });

  test('2. minQuantity not met is ignored -> null', async () => {
    const prisma = makePrisma({
      wc: { id: 'wc1', customerId: 'c1', companyId: 'co1', isActive: true },
      links: [
        {
          priceListId: 'pl1',
          priority: 10,
          createdAt: new Date('2026-01-01'),
          priceList: { id: 'pl1', companyId: 'co1', isActive: true, validFrom: null, validTo: null },
        },
      ],
      itemsByList: {
        pl1: [{ id: 'i1', priceListId: 'pl1', productId: 'p1', variantId: null, price: 100, minQuantity: 5 }],
      },
    });

    const result = await resolveWholesalePrice({ prisma, ...baseCtx, quantity: 3 });

    expect(result).toBeNull();
  });

  test('3. variant-specific row wins over general row', async () => {
    const prisma = makePrisma({
      wc: { id: 'wc1', customerId: 'c1', companyId: 'co1', isActive: true },
      links: [
        {
          priceListId: 'pl1',
          priority: 10,
          createdAt: new Date('2026-01-01'),
          priceList: { id: 'pl1', companyId: 'co1', isActive: true, validFrom: null, validTo: null },
        },
      ],
      itemsByList: {
        pl1: [
          { id: 'i_v1', priceListId: 'pl1', productId: 'p1', variantId: 'v1', price: 90, minQuantity: 1 },
          { id: 'i_gen', priceListId: 'pl1', productId: 'p1', variantId: null, price: 100, minQuantity: 1 },
        ],
      },
    });

    const result = await resolveWholesalePrice({ prisma, ...baseCtx, variantId: 'v1' });

    expect(result).not.toBeNull();
    expect(result.price).toBe(90);
    expect(result.itemId).toBe('i_v1');
  });

  test('4. non-wholesale or inactive customer -> null without list queries', async () => {
    const prisma = makePrisma({ wc: null, links: [], itemsByList: {} });

    const result = await resolveWholesalePrice({ prisma, ...baseCtx });

    expect(result).toBeNull();
    expect(prisma.wholesaleCustomerPriceList.findMany).not.toHaveBeenCalled();
  });

  test('5. expired (validTo in past) list skipped, valid list wins', async () => {
    const prisma = makePrisma({
      wc: { id: 'wc1', customerId: 'c1', companyId: 'co1', isActive: true },
      links: [
        {
          priceListId: 'pl_expired',
          priority: 10,
          createdAt: new Date('2026-01-01'),
          priceList: {
            id: 'pl_expired',
            companyId: 'co1',
            isActive: true,
            validFrom: null,
            validTo: new Date(Date.now() - 86400000),
          },
        },
        {
          priceListId: 'pl_valid',
          priority: 0,
          createdAt: new Date('2026-01-02'),
          priceList: { id: 'pl_valid', companyId: 'co1', isActive: true, validFrom: null, validTo: null },
        },
      ],
      itemsByList: {
        pl_expired: [{ id: 'i_exp', priceListId: 'pl_expired', productId: 'p1', variantId: null, price: 50, minQuantity: 1 }],
        pl_valid: [{ id: 'i_val', priceListId: 'pl_valid', productId: 'p1', variantId: null, price: 70, minQuantity: 1 }],
      },
    });

    const result = await resolveWholesalePrice({ prisma, ...baseCtx });

    expect(result).not.toBeNull();
    expect(result.price).toBe(70);
    expect(result.priceListId).toBe('pl_valid');
  });
});

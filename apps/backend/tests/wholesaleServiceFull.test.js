const mockPrisma = {
  wholesaleCustomer: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  wholesaleCustomerPriceList: {
    findMany: jest.fn(),
  },
  wholesalePriceListItem: {
    findMany: jest.fn(),
  },
  wholesaleTransaction: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
  },
  productVariant: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(async (cb) => cb(mockPrisma)),
};

jest.mock('../services/sharedDatabase', () => ({
  getSharedPrismaClient: () => mockPrisma,
}));

const { wholesaleService } = require('../services/wholesaleService');

describe('Wholesale Full Workflow & Idempotency Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. resolveWholesalePrice', () => {
    test('handles positional arguments (customerId, productId, companyId, variantId, qty)', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue({
        id: 'wc1',
        customerId: 'cust1',
        companyId: 'comp1',
        isActive: true,
      });

      mockPrisma.wholesaleCustomerPriceList.findMany.mockResolvedValue([
        {
          priority: 10,
          priceList: {
            id: 'pl1',
            name: 'VIP Wholesale',
            companyId: 'comp1',
            isActive: true,
            validFrom: null,
            validTo: null,
            items: [
              {
                id: 'item1',
                productId: 'prod1',
                variantId: null,
                price: 150,
                minQuantity: 1,
              },
            ],
          },
        },
      ]);

      mockPrisma.wholesalePriceListItem.findMany.mockResolvedValue([
        { id: 'item1', productId: 'prod1', variantId: null, price: 150, minQuantity: 1 },
      ]);

      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod1',
        price: 200,
      });

      const res = await wholesaleService.resolveWholesalePrice('cust1', 'prod1', 'comp1', null, 2);

      expect(res.isWholesale).toBe(true);
      expect(res.price).toBe(150);
      expect(res.priceListName).toBe('VIP Wholesale');
      // Verify numeric coercion
      expect(Number(res)).toBe(150);
      expect(res + 50).toBe(200);
    });

    test('handles object payload argument and matches specific variant before base product', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue({
        id: 'wc1',
        customerId: 'cust1',
        companyId: 'comp1',
        isActive: true,
      });

      mockPrisma.wholesaleCustomerPriceList.findMany.mockResolvedValue([
        {
          priority: 1,
          priceList: {
            id: 'pl1',
            name: 'Standard Wholesale',
            companyId: 'comp1',
            isActive: true,
            validFrom: null,
            validTo: null,
            items: [
              {
                id: 'item_base',
                productId: 'prod1',
                variantId: null,
                price: 180,
                minQuantity: 1,
              },
              {
                id: 'item_var',
                productId: 'prod1',
                variantId: 'var1',
                price: 160,
                minQuantity: 1,
              },
            ],
          },
        },
      ]);

      mockPrisma.wholesalePriceListItem.findMany.mockResolvedValue([
        { id: 'item_base', productId: 'prod1', variantId: null, price: 180, minQuantity: 1 },
        { id: 'item_var', productId: 'prod1', variantId: 'var1', price: 160, minQuantity: 1 },
      ]);

      mockPrisma.productVariant.findUnique.mockResolvedValue({
        id: 'var1',
        price: 220,
      });

      const res = await wholesaleService.resolveWholesalePrice({
        customerId: 'cust1',
        productId: 'prod1',
        variantId: 'var1',
        companyId: 'comp1',
        quantity: 1,
      });

      expect(res.isWholesale).toBe(true);
      expect(res.price).toBe(160);
      expect(res.itemId).toBe('item_var');
    });

    test('returns null if customer is not wholesale, and fallback object when requested', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod1',
        price: 250,
      });

      // Default: returns null per requirement 1
      const resNull = await wholesaleService.resolveWholesalePrice('cust_reg', 'prod1', 'comp1');
      expect(resNull).toBeNull();

      // With fallbackToRegular
      const resFallback = await wholesaleService.resolveWholesalePrice('cust_reg', 'prod1', 'comp1', null, { fallbackToRegular: true });
      expect(resFallback.isWholesale).toBe(false);
      expect(resFallback.price).toBe(250);
      expect(Number(resFallback)).toBe(250);
    });
  });

  describe('2. validateCreditLimit', () => {
    test('returns allowed=true when currentBalance + orderTotal <= creditLimit', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue({
        id: 'wc1',
        creditLimit: 10000,
        currentBalance: 3000,
      });

      const check = await wholesaleService.validateCreditLimit('wc1', 'comp1', 2000);

      expect(check.isWholesale).toBe(true);
      expect(check.allowed).toBe(true);
      expect(check.currentBalance).toBe(3000);
      expect(check.newBalance).toBe(5000);
      expect(check.available).toBe(7000);
    });

    test('returns allowed=false when newBalance exceeds creditLimit', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue({
        id: 'wc1',
        creditLimit: 5000,
        currentBalance: 4000,
      });

      const check = await wholesaleService.validateCreditLimit('wc1', 'comp1', 1500);

      expect(check.allowed).toBe(false);
      expect(check.newBalance).toBe(5500);
      expect(check.available).toBe(1000);
    });

    test('unlimited credit when creditLimit is 0', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue({
        id: 'wc1',
        creditLimit: 0,
        currentBalance: 50000,
      });

      const check = await wholesaleService.validateCreditLimit('wc1', 'comp1', 100000);

      expect(check.allowed).toBe(true);
    });
  });

  describe('3. Auto-Invoice on Order Confirmation (Atomic & Idempotent)', () => {
    test('records INVOICE transaction and increments balance', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue({
        id: 'wc1',
        companyId: 'comp1',
        currentBalance: 1000,
      });
      mockPrisma.wholesaleTransaction.findFirst.mockResolvedValue(null); // not existing yet
      mockPrisma.wholesaleCustomer.findUnique.mockResolvedValue({
        id: 'wc1',
        currentBalance: 1000,
      });
      mockPrisma.wholesaleTransaction.create.mockImplementation(async ({ data }) => ({
        id: 'tx_inv_1',
        ...data,
      }));
      mockPrisma.wholesaleCustomer.update.mockResolvedValue({});

      const order = {
        id: 'ord_1',
        orderNumber: '1001',
        wholesaleCustomerId: 'wc1',
        companyId: 'comp1',
        total: 500,
      };

      const tx = await wholesaleService.recordOrderInvoice(order);

      expect(tx).toBeDefined();
      expect(mockPrisma.wholesaleTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            wholesaleCustomerId: 'wc1',
            type: 'INVOICE',
            amount: 500,
            balanceBefore: 1000,
            balanceAfter: 1500,
            referenceType: 'ORDER',
            referenceId: 'ord_1',
          }),
        }),
      );
      expect(mockPrisma.wholesaleCustomer.update).toHaveBeenCalledWith({
        where: { id: 'wc1' },
        data: { currentBalance: 1500 },
      });
    });

    test('is strictly idempotent on orderId (returns existing without duplicate debit)', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue({
        id: 'wc1',
        companyId: 'comp1',
      });
      // Already existing invoice
      mockPrisma.wholesaleTransaction.findFirst.mockResolvedValue({
        id: 'tx_inv_existing',
        type: 'INVOICE',
        amount: 500,
        referenceType: 'ORDER',
        referenceId: 'ord_1',
      });

      const order = {
        id: 'ord_1',
        wholesaleCustomerId: 'wc1',
        companyId: 'comp1',
        total: 500,
      };

      const result = await wholesaleService.recordOrderInvoice(order);

      expect(result.id).toBe('tx_inv_existing');
      expect(mockPrisma.wholesaleTransaction.create).not.toHaveBeenCalled();
      expect(mockPrisma.wholesaleCustomer.update).not.toHaveBeenCalled();
    });
  });

  describe('4. Order Cancellation / Return Reversal (Credit Note)', () => {
    test('creates CREDIT_NOTE reversing invoice and decrements balance', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue({
        id: 'wc1',
        companyId: 'comp1',
      });
      // Existing invoice of 500
      mockPrisma.wholesaleTransaction.findFirst
        .mockResolvedValueOnce({
          id: 'tx_inv_1',
          amount: 500,
          type: 'INVOICE',
        })
        .mockResolvedValueOnce(null); // No CREDIT_NOTE yet

      mockPrisma.wholesaleCustomer.findUnique.mockResolvedValue({
        id: 'wc1',
        currentBalance: 1500,
      });
      mockPrisma.wholesaleTransaction.create.mockImplementation(async ({ data }) => ({
        id: 'tx_cn_1',
        ...data,
      }));
      mockPrisma.wholesaleCustomer.update.mockResolvedValue({});

      const order = {
        id: 'ord_1',
        orderNumber: '1001',
        wholesaleCustomerId: 'wc1',
        companyId: 'comp1',
      };

      const cn = await wholesaleService.recordOrderCreditNote(order);

      expect(cn).toBeDefined();
      expect(mockPrisma.wholesaleTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            wholesaleCustomerId: 'wc1',
            type: 'CREDIT_NOTE',
            amount: 500,
            balanceBefore: 1500,
            balanceAfter: 1000,
            referenceType: 'ORDER',
            referenceId: 'ord_1',
          }),
        }),
      );
      expect(mockPrisma.wholesaleCustomer.update).toHaveBeenCalledWith({
        where: { id: 'wc1' },
        data: { currentBalance: 1000 },
      });
    });

    test('strict idempotency on CREDIT_NOTE prevents double reversal', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue({
        id: 'wc1',
        companyId: 'comp1',
      });
      // Invoice exists
      mockPrisma.wholesaleTransaction.findFirst
        .mockResolvedValueOnce({
          id: 'tx_inv_1',
          amount: 500,
          type: 'INVOICE',
        })
        // CREDIT_NOTE already exists!
        .mockResolvedValueOnce({
          id: 'tx_cn_existing',
          amount: 500,
          type: 'CREDIT_NOTE',
        });

      const order = {
        id: 'ord_1',
        wholesaleCustomerId: 'wc1',
        companyId: 'comp1',
      };

      const result = await wholesaleService.recordOrderCreditNote(order);

      expect(result.id).toBe('tx_cn_existing');
      expect(mockPrisma.wholesaleTransaction.create).not.toHaveBeenCalled();
      expect(mockPrisma.wholesaleCustomer.update).not.toHaveBeenCalled();
    });
  });

  describe('5. Payment Transaction Recording', () => {
    test('type PAYMENT decrements balance correctly', async () => {
      mockPrisma.wholesaleCustomer.findFirst.mockResolvedValue({
        id: 'wc1',
        companyId: 'comp1',
        currentBalance: 5000,
      });
      mockPrisma.wholesaleTransaction.create.mockImplementation(async ({ data }) => ({
        id: 'tx_pay_1',
        ...data,
      }));
      mockPrisma.wholesaleCustomer.update.mockResolvedValue({});

      const tx = await wholesaleService.recordTransaction({
        wholesaleCustomerId: 'wc1',
        companyId: 'comp1',
        type: 'PAYMENT',
        amount: 2000,
        referenceType: 'PAYMENT',
        referenceId: 'BANK_TRANSFER',
        notes: 'سداد تحويل بنكي',
      });

      expect(tx).toBeDefined();
      expect(mockPrisma.wholesaleTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'PAYMENT',
            amount: 2000,
            balanceBefore: 5000,
            balanceAfter: 3000,
          }),
        }),
      );
      expect(mockPrisma.wholesaleCustomer.update).toHaveBeenCalledWith({
        where: { id: 'wc1' },
        data: { currentBalance: 3000 },
      });
    });
  });
});

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getSharedPrismaClient } = require('../../services/sharedDatabase');
const { getJwtSecret } = require('../../utils/jwtSecret');

// Mock verifyToken to respect authorization header while permitting customer auth simulation
jest.mock('../../utils/verifyToken', () => {
  const jwt = require('jsonwebtoken');
  const { getJwtSecret } = require('../../utils/jwtSecret');

  return {
    authenticateToken: (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'رمز المصادقة مطلوب' });
      }

      try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        next();
      } catch (e) {
        return res.status(401).json({ success: false, message: 'رمز غير صالح' });
      }
    },
    requireCompanyAccess: (req, res, next) => next(),
    requireRole: () => (req, res, next) => next(),
    requireSuperAdmin: (req, res, next) => next(),
    optionalAuth: (req, res, next) => next(),
  };
});

const wholesalePortalRoutes = require('../../routes/wholesalePortalRoutes');

describe('Wholesale Portal Integration Suite (TASK 5)', () => {
  let prisma;
  let app;
  const companyId = 'test-wp-company';
  let cust1, cust2, wc1, wc2, wcInactive, custInactive, custRegular;
  let tokenWc1, tokenWc2, tokenInactive, tokenRegular;
  let prod1, prod2, priceList1;
  let orderCust1;

  beforeAll(async () => {
    prisma = getSharedPrismaClient();

    app = express();
    app.use(express.json());
    app.use('/api/v1/wholesale-portal', wholesalePortalRoutes);

    // Create test company
    await prisma.company.upsert({
      where: { id: companyId },
      update: {},
      create: {
        id: companyId,
        name: 'Test Wholesale Portal Co',
        slug: 'test-wp-company',
        email: 'wp-company@test.com',
        isActive: true,
      },
    });

    // Clean up previous runs
    await prisma.orderItem.deleteMany({ where: { order: { companyId } } }).catch(() => {});
    await prisma.order.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.wholesaleStatement.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.wholesaleTransaction.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.wholesaleCustomerPriceList.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.wholesalePriceListItem.deleteMany({ where: { priceList: { companyId } } }).catch(() => {});
    await prisma.wholesalePriceList.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.wholesaleCustomer.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.customer.deleteMany({ where: { companyId } }).catch(() => {});

    // Create customer 1 (Active Wholesale Dealer)
    cust1 = await prisma.customer.create({
      data: {
        id: 'cust-wp-1',
        companyId,
        firstName: 'أحمد',
        lastName: 'الموزع',
        phone: '01011111111',
        status: 'ACTIVE',
      },
    });
    wc1 = await prisma.wholesaleCustomer.create({
      data: {
        id: 'wc-wp-1',
        customerId: cust1.id,
        companyId,
        creditLimit: 20000,
        currentBalance: 5000,
        isActive: true,
      },
    });

    // Create customer 2 (Another Wholesale Dealer)
    cust2 = await prisma.customer.create({
      data: {
        id: 'cust-wp-2',
        companyId,
        firstName: 'محمود',
        lastName: 'التاجر',
        phone: '01022222222',
        status: 'ACTIVE',
      },
    });
    wc2 = await prisma.wholesaleCustomer.create({
      data: {
        id: 'wc-wp-2',
        customerId: cust2.id,
        companyId,
        creditLimit: 30000,
        currentBalance: 10000,
        isActive: true,
      },
    });

    // Create inactive wholesale customer
    custInactive = await prisma.customer.create({
      data: {
        id: 'cust-wp-inactive',
        companyId,
        firstName: 'سامي',
        lastName: 'الموقوف',
        phone: '01033333333',
        status: 'ACTIVE',
      },
    });
    wcInactive = await prisma.wholesaleCustomer.create({
      data: {
        id: 'wc-wp-inactive',
        customerId: custInactive.id,
        companyId,
        creditLimit: 10000,
        currentBalance: 0,
        isActive: false, // Inactive!
      },
    });

    // Create regular retail customer (not a wholesale customer)
    custRegular = await prisma.customer.create({
      data: {
        id: 'cust-wp-regular',
        companyId,
        firstName: 'علي',
        lastName: 'المستهلك',
        phone: '01044444444',
        status: 'ACTIVE',
      },
    });

    // Products
    const cat = await prisma.category.create({
      data: { id: 'cat-wp-1', companyId, name: 'تصنيف الجملة', slug: 'cat-wp-1' },
    });

    prod1 = await prisma.product.create({
      data: {
        id: 'prod-wp-1',
        companyId,
        name: 'منتج جملة أ',
        categoryId: cat.id,
        price: 300,
        cost: 150,
        sku: 'SKU-WP-A',
        stock: 500,
        isActive: true,
      },
    });

    prod2 = await prisma.product.create({
      data: {
        id: 'prod-wp-2',
        companyId,
        name: 'منتج جملة ب',
        categoryId: cat.id,
        price: 600,
        cost: 300,
        sku: 'SKU-WP-B',
        stock: 500,
        isActive: true,
      },
    });

    // Price list assigned to Customer 1 only
    priceList1 = await prisma.wholesalePriceList.create({
      data: {
        id: 'pl-wp-1',
        name: 'قائمة أسعار أحمد الموزع',
        companyId,
        isActive: true,
        items: {
          create: [
            {
              productId: prod1.id,
              price: 220, // Discounted wholesale price
              minQuantity: 5,
            },
          ],
        },
      },
    });

    await prisma.wholesaleCustomerPriceList.create({
      data: {
        customerId: cust1.id,
        priceListId: priceList1.id,
        companyId,
        priority: 1,
      },
    });

    // Create existing order for Customer 1
    orderCust1 = await prisma.order.create({
      data: {
        id: 'order-wp-c1',
        orderNumber: 'WS-TEST-1001',
        companyId,
        customerId: cust1.id,
        wholesaleCustomerId: wc1.id,
        orderSource: 'WHOLESALE',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal: 1100,
        total: 1100,
        orderItems: {
          create: [
            {
              productId: prod1.id,
              productName: prod1.name,
              productSku: prod1.sku,
              quantity: 5,
              price: 220,
              total: 1100,
            },
          ],
        },
      },
    });

    // Create existing order for Customer 2
    await prisma.order.create({
      data: {
        id: 'order-wp-c2',
        orderNumber: 'WS-TEST-2001',
        companyId,
        customerId: cust2.id,
        wholesaleCustomerId: wc2.id,
        orderSource: 'WHOLESALE',
        status: 'PENDING',
        subtotal: 3000,
        total: 3000,
      },
    });

    // Auth tokens
    const secret = getJwtSecret();
    tokenWc1 = jwt.sign(
      { customerId: cust1.id, role: 'CUSTOMER', companyId, phone: cust1.phone },
      secret,
      { expiresIn: '1h' }
    );
    tokenWc2 = jwt.sign(
      { customerId: cust2.id, role: 'CUSTOMER', companyId, phone: cust2.phone },
      secret,
      { expiresIn: '1h' }
    );
    tokenInactive = jwt.sign(
      { customerId: custInactive.id, role: 'CUSTOMER', companyId, phone: custInactive.phone },
      secret,
      { expiresIn: '1h' }
    );
    tokenRegular = jwt.sign(
      { customerId: custRegular.id, role: 'CUSTOMER', companyId, phone: custRegular.phone },
      secret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.orderItem.deleteMany({ where: { order: { companyId } } }).catch(() => {});
    await prisma.order.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.wholesaleStatement.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.wholesaleTransaction.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.wholesaleCustomerPriceList.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.wholesalePriceListItem.deleteMany({ where: { priceList: { companyId } } }).catch(() => {});
    await prisma.wholesalePriceList.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.wholesaleCustomer.deleteMany({ where: { companyId } }).catch(() => {});
    await prisma.customer.deleteMany({ where: { companyId } }).catch(() => {});
  });

  describe('1. Authentication, Access Control & Profile (GET /me)', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/wholesale-portal/me');
      expect(res.status).toBe(401);
    });

    it('rejects regular non-wholesale customers with 403', async () => {
      const res = await request(app)
        .get('/api/v1/wholesale-portal/me')
        .set('Authorization', `Bearer ${tokenRegular}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('NOT_WHOLESALE_CUSTOMER');
    });

    it('rejects inactive wholesale customers with 403', async () => {
      const res = await request(app)
        .get('/api/v1/wholesale-portal/me')
        .set('Authorization', `Bearer ${tokenInactive}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('WHOLESALE_INACTIVE');
    });

    it('returns wholesale profile and exact matching balance & credit limit for active dealer', async () => {
      const res = await request(app)
        .get('/api/v1/wholesale-portal/me')
        .set('Authorization', `Bearer ${tokenWc1}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.creditLimit).toBe(20000);
      expect(res.body.data.currentBalance).toBe(5000);
      expect(res.body.data.availableCredit).toBe(15000);
      expect(res.body.data.isActive).toBe(true);
      expect(res.body.data.customer.name).toContain('أحمد');
    });
  });

  describe('2. Scoped Orders & Security Boundary (GET /orders & /orders/:id)', () => {
    it('returns only orders belonging to the authenticated wholesale dealer', async () => {
      const res = await request(app)
        .get('/api/v1/wholesale-portal/orders')
        .set('Authorization', `Bearer ${tokenWc1}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].orderNumber).toBe('WS-TEST-1001');
      // Verify no sensitive internal fields like cost are returned
      expect(res.body.data[0].cost).toBeUndefined();
    });

    it('allows a dealer to view details of their own order', async () => {
      const res = await request(app)
        .get(`/api/v1/wholesale-portal/orders/${orderCust1.id}`)
        .set('Authorization', `Bearer ${tokenWc1}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(orderCust1.id);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].productName).toBe(prod1.name);
    });

    it('NEGATIVE TEST: blocks a dealer from reading another dealer order (returns 403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/wholesale-portal/orders/${orderCust1.id}`)
        .set('Authorization', `Bearer ${tokenWc2}`); // Cust 2 tries to access Cust 1's order
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });
  });

  describe('3. Statement of Account (GET /statement)', () => {
    it('returns statement scoped to the authenticated dealer with accurate balance metrics', async () => {
      const res = await request(app)
        .get('/api/v1/wholesale-portal/statement')
        .set('Authorization', `Bearer ${tokenWc1}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.creditLimit).toBe(20000);
      expect(res.body.data.currentBalance).toBe(5000);
      expect(res.body.data.availableCredit).toBe(15000);
      expect(Array.isArray(res.body.data.lines)).toBe(true);
    });
  });

  describe('4. Wholesale Price List (GET /price-list)', () => {
    it('returns only items in customer assigned price list without exposing cost or margins', async () => {
      const res = await request(app)
        .get('/api/v1/wholesale-portal/price-list')
        .set('Authorization', `Bearer ${tokenWc1}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      const item = res.body.data[0];
      expect(item.productId).toBe(prod1.id);
      expect(item.wholesalePrice).toBe(220);
      expect(item.minQuantity).toBe(5);
      // Cost must never be exposed
      expect(item.cost).toBeUndefined();
    });
  });

  describe('5. Create Wholesale Order (POST /orders)', () => {
    it('rejects order with 400 when quantity is below minQuantity', async () => {
      const res = await request(app)
        .post('/api/v1/wholesale-portal/orders')
        .set('Authorization', `Bearer ${tokenWc1}`)
        .send({
          items: [{ productId: prod1.id, quantity: 2 }], // min is 5!
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MIN_QUANTITY_NOT_MET');
    });

    it('rejects order with 400 when order total exceeds credit limit with clear Arabic message', async () => {
      // Current balance = 5000, credit limit = 20000. Available = 15000.
      // Order of 80 items * 220 = 17600 (5000 + 17600 = 22600 > 20000)
      const res = await request(app)
        .post('/api/v1/wholesale-portal/orders')
        .set('Authorization', `Bearer ${tokenWc1}`)
        .send({
          items: [{ productId: prod1.id, quantity: 80 }],
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('CREDIT_LIMIT_EXCEEDED');
      expect(res.body.error).toContain('الحد الائتماني');
    });

    it('successfully creates order in PENDING status, source WHOLESALE, and leaves balance untouched', async () => {
      const balanceBefore = (await prisma.wholesaleCustomer.findUnique({ where: { id: wc1.id } })).currentBalance;

      // 10 items * 220 = 2200 (well within available 15000)
      const res = await request(app)
        .post('/api/v1/wholesale-portal/orders')
        .set('Authorization', `Bearer ${tokenWc1}`)
        .send({
          items: [{ productId: prod1.id, quantity: 10 }],
          notes: 'طلب جملة تجريبي للتسليم السريع',
          shippingAddress: 'مستودع الموزع - شارع النصر',
          city: 'القاهرة',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING'); // Strictly PENDING, not DRAFT
      expect(res.body.data.total).toBe(2200);

      // Verify created order in database
      const createdOrder = await prisma.order.findUnique({
        where: { id: res.body.data.id },
        include: { orderItems: true },
      });
      expect(createdOrder.status).toBe('PENDING');
      expect(createdOrder.orderSource).toBe('WHOLESALE');
      expect(createdOrder.wholesaleCustomerId).toBe(wc1.id);
      expect(createdOrder.orderItems.length).toBe(1);

      // Verify CRITICAL requirement: balance has NOT changed before confirmation!
      const balanceAfter = (await prisma.wholesaleCustomer.findUnique({ where: { id: wc1.id } })).currentBalance;
      expect(Number(balanceAfter)).toBe(Number(balanceBefore));
    });
  });
});

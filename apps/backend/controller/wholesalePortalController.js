/**
 * Wholesale Portal Controller (TASK 5)
 *
 * Provides dedicated endpoints for wholesale dealers over the existing customer account system:
 * - GET  /wholesale-portal/me           (Profile + currentBalance + creditLimit + availableCredit)
 * - GET  /wholesale-portal/orders       (Scoped orders list without sensitive cost/margins)
 * - GET  /wholesale-portal/orders/:id   (Specific order details, 403 on another customer's order)
 * - GET  /wholesale-portal/statement    (Scoped statement of account & transaction ledger)
 * - GET  /wholesale-portal/price-list   (Assigned wholesale catalog & dealer prices only)
 * - POST /wholesale-portal/orders       (Create order with status PENDING, orderSource WHOLESALE,
 *                                        creditLimit validation, balance untouched before confirmation,
 *                                        staff notification)
 */

const { getSharedPrismaClient } = require('../services/sharedDatabase');
const { wholesaleService } = require('../services/wholesaleService');
let notificationService;
try {
  notificationService = require('../services/notificationService');
} catch (_) {
  notificationService = null;
}

class WholesalePortalController {
  /**
   * Helper: Resolve active wholesale customer profile from authenticated customer token.
   * Scoped strictly by customerId and companyId.
   */
  static async resolveWholesaleCustomer(req) {
    const customerId = req.user?.customerId || req.user?.userId || req.user?.id;
    const companyId = req.user?.companyId || req.user?.effectiveCompanyId;

    if (!customerId || !companyId) {
      const err = new Error('بيانات المصادقة غير مكتملة');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const prisma = getSharedPrismaClient();
    const wc = await prisma.wholesaleCustomer.findFirst({
      where: { customerId, companyId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!wc) {
      const err = new Error('غير مسجل كموزع جملة معتمد في هذه الشركة');
      err.statusCode = 403;
      err.code = 'NOT_WHOLESALE_CUSTOMER';
      throw err;
    }

    if (!wc.isActive) {
      const err = new Error('حساب الموزع معطل أو موقوف حالياً');
      err.statusCode = 403;
      err.code = 'WHOLESALE_INACTIVE';
      throw err;
    }

    return { wc, customerId, companyId, prisma };
  }

  /**
   * GET /wholesale-portal/me
   * Return wholesale profile, currentBalance, creditLimit, availableCredit
   */
  static async getMe(req, res) {
    try {
      const { wc } = await WholesalePortalController.resolveWholesaleCustomer(req);
      const creditLimit = Number(wc.creditLimit || 0);
      const currentBalance = Number(wc.currentBalance || 0);
      const availableCredit = Math.max(0, creditLimit - currentBalance);

      const customerName = `${wc.customer?.firstName || ''} ${wc.customer?.lastName || ''}`.trim() || 'تاجر جملة';

      return res.json({
        success: true,
        data: {
          id: wc.id,
          wholesaleCustomerId: wc.id,
          customerId: wc.customerId,
          companyId: wc.companyId,
          creditLimit,
          currentBalance,
          availableCredit,
          isActive: wc.isActive,
          notes: wc.notes,
          customer: {
            id: wc.customer?.id,
            name: customerName,
            phone: wc.customer?.phone || null,
            email: wc.customer?.email || null,
          },
        },
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'حدث خطأ أثناء تحميل بيانات الموزع',
        code: err.code || 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /wholesale-portal/orders
   * Scoped to this customer's wholesale orders only
   */
  static async getOrders(req, res) {
    try {
      const { wc, customerId, companyId, prisma } = await WholesalePortalController.resolveWholesaleCustomer(req);
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;

      const where = {
        companyId,
        OR: [
          { wholesaleCustomerId: wc.id },
          { customerId, orderSource: 'WHOLESALE' },
        ],
      };

      if (req.query.status && req.query.status !== 'all') {
        where.status = req.query.status.toUpperCase();
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: {
              select: {
                id: true,
                productId: true,
                variantId: true,
                productName: true,
                productSku: true,
                productImage: true,
                quantity: true,
                price: true,
                total: true,
              },
            },
          },
        }),
        prisma.order.count({ where }),
      ]);

      const safeOrders = orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        subtotal: Number(o.subtotal !== undefined ? o.subtotal : o.total),
        total: Number(o.total),
        notes: o.notes,
        createdAt: o.createdAt,
        itemsCount: o.orderItems?.length || 0,
        items: (o.orderItems || []).map((i) => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variantId,
          productName: i.productName,
          productSku: i.productSku,
          productImage: i.productImage,
          quantity: i.quantity,
          price: Number(i.price),
          total: Number(i.total),
        })),
      }));

      return res.json({
        success: true,
        data: safeOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'حدث خطأ أثناء تحميل الطلبات',
        code: err.code || 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /wholesale-portal/orders/:id
   * Specific order details. If not owned by this customer, return 403 Forbidden!
   */
  static async getOrderDetails(req, res) {
    try {
      const { wc, customerId, companyId, prisma } = await WholesalePortalController.resolveWholesaleCustomer(req);
      const orderId = String(req.params.id || '').trim();

      const rawOrder = await prisma.order.findFirst({
        where: { id: orderId, companyId },
        include: {
          orderItems: {
            select: {
              id: true,
              productId: true,
              variantId: true,
              productName: true,
              productSku: true,
              productImage: true,
              quantity: true,
              price: true,
              total: true,
            },
          },
        },
      });

      if (!rawOrder) {
        return res.status(404).json({
          success: false,
          error: 'الطلب غير موجود',
          code: 'NOT_FOUND',
        });
      }

      // Strict scoping check: must belong to this wholesale customer
      const isOwner =
        rawOrder.wholesaleCustomerId === wc.id ||
        (rawOrder.customerId === customerId && rawOrder.orderSource === 'WHOLESALE');

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'غير مصرح بالوصول إلى بيانات هذا الطلب',
          code: 'FORBIDDEN',
        });
      }

      const safeOrder = {
        id: rawOrder.id,
        orderNumber: rawOrder.orderNumber,
        status: rawOrder.status,
        paymentStatus: rawOrder.paymentStatus,
        subtotal: Number(rawOrder.subtotal !== undefined ? rawOrder.subtotal : rawOrder.total),
        total: Number(rawOrder.total),
        notes: rawOrder.notes,
        createdAt: rawOrder.createdAt,
        shippingAddress: rawOrder.shippingAddress,
        city: rawOrder.city,
        governorate: rawOrder.governorate,
        itemsCount: rawOrder.orderItems?.length || 0,
        items: (rawOrder.orderItems || []).map((i) => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variantId,
          productName: i.productName,
          productSku: i.productSku,
          productImage: i.productImage,
          quantity: i.quantity,
          price: Number(i.price),
          total: Number(i.total),
        })),
      };

      return res.json({ success: true, data: safeOrder });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'حدث خطأ أثناء تحميل تفاصيل الطلب',
        code: err.code || 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /wholesale-portal/statement
   * Account statement and ledger transactions for this customer only
   */
  static async getStatement(req, res) {
    try {
      const { wc, companyId } = await WholesalePortalController.resolveWholesaleCustomer(req);
      const data = await wholesaleService.generateStatement(
        wc.id,
        companyId,
        req.query.periodStart,
        req.query.periodEnd
      );

      const creditLimit = Number(wc.creditLimit || 0);
      const currentBalance = Number(wc.currentBalance || 0);
      const availableCredit = Math.max(0, creditLimit - currentBalance);

      return res.json({
        success: true,
        data: {
          ...data,
          creditLimit,
          currentBalance,
          availableCredit,
        },
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'حدث خطأ أثناء إنشاء كشف الحساب',
        code: err.code || 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /wholesale-portal/price-list
   * Returns products in customer's assigned wholesale price list(s)
   * Strips any internal cost or profit margin fields
   */
  static async getPriceList(req, res) {
    try {
      const { wc, companyId } = await WholesalePortalController.resolveWholesaleCustomer(req);
      const prices = await wholesaleService.getCustomerPrices(wc.id, companyId);

      const safePrices = (prices || []).map((p) => ({
        id: p.id,
        productId: p.productId,
        productName: p.productName,
        productSku: p.productSku,
        productImage: p.productImage,
        variantId: p.variantId,
        variantName: p.variantName,
        wholesalePrice: Number(p.wholesalePrice),
        regularPrice: Number(p.regularPrice),
        minQuantity: p.minQuantity || 1,
        priceListId: p.priceListId,
        priceListName: p.priceListName,
      }));

      return res.json({ success: true, data: safePrices });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'حدث خطأ أثناء تحميل قائمة الأسعار',
        code: err.code || 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * POST /wholesale-portal/orders
   * Create new wholesale order:
   * - Status: PENDING (strictly PENDING, not DRAFT)
   * - orderSource: 'WHOLESALE'
   * - Checks creditLimit: rejects with clear Arabic error if exceeded
   * - Balance remains untouched until confirmation
   * - Creates staff notification for confirmation center
   */
  static async createOrder(req, res) {
    try {
      const { wc, customerId, companyId, prisma } = await WholesalePortalController.resolveWholesaleCustomer(req);
      const { items, notes, shippingAddress, city, governorate } = req.body || {};

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'يجب اختيار منتج واحد على الأقل لإنشاء الطلب',
          code: 'EMPTY_ITEMS',
        });
      }

      // Fetch customer's assigned wholesale prices to check minQuantity & metadata
      const prices = await wholesaleService.getCustomerPrices(wc.id, companyId);
      const priceMap = new Map();
      for (const p of prices || []) {
        const key = `${p.productId}_${p.variantId || 'base'}`;
        priceMap.set(key, p);
      }

      const orderItemsData = [];
      let calculatedTotal = 0;

      for (const item of items) {
        const pId = String(item.productId || '').trim();
        const vId = item.variantId ? String(item.variantId).trim() : null;
        const qty = parseInt(item.quantity, 10);

        if (!pId || !qty || qty <= 0) {
          return res.status(400).json({
            success: false,
            error: 'بيانات المنتج أو الكمية غير صالحة',
            code: 'INVALID_ITEM',
          });
        }

        const priceKey = `${pId}_${vId || 'base'}`;
        const wholesaleItem = priceMap.get(priceKey);

        if (wholesaleItem && wholesaleItem.minQuantity && qty < wholesaleItem.minQuantity) {
          return res.status(400).json({
            success: false,
            error: `الحد الأدنى للطلب من المنتج "${wholesaleItem.productName}" هو ${wholesaleItem.minQuantity} قطعة`,
            code: 'MIN_QUANTITY_NOT_MET',
          });
        }

        // Resolve price via Task #4 unified resolveWholesalePrice
        const resolved = await wholesaleService.resolveWholesalePrice(
          wc.customerId,
          pId,
          companyId,
          vId,
          { quantity: qty, fallbackToRegular: true }
        );

        if (!resolved || resolved.price === undefined || resolved.price === null) {
          return res.status(400).json({
            success: false,
            error: `المنتج المحدد غير متاح في المتجر أو لا يمكن تسعيره: ${pId}`,
            code: 'PRICING_UNAVAILABLE',
          });
        }

        const itemPrice = Number(resolved.price);
        const itemTotal = itemPrice * qty;
        calculatedTotal += itemTotal;

        let productName = wholesaleItem?.productName || item.productName || 'منتج';
        let productSku = wholesaleItem?.productSku || item.productSku || '—';
        let productImage = wholesaleItem?.productImage || item.productImage || null;

        if (!wholesaleItem) {
          const prod = await prisma.product.findFirst({
            where: { id: pId, companyId },
            include: { variants: vId ? { where: { id: vId } } : false },
          });
          if (prod) {
            const matchedVar = vId && prod.variants ? prod.variants[0] : null;
            productName = matchedVar ? `${prod.name} - ${matchedVar.name}` : prod.name;
            productSku = matchedVar?.sku || prod.sku || '—';
            productImage = prod.mainImage || null;
          }
        }

        orderItemsData.push({
          productId: pId,
          variantId: vId,
          productName,
          productSku,
          productImage,
          quantity: qty,
          price: itemPrice,
          total: itemTotal,
        });
      }

      // Enforce creditLimit check via Task #4 validateCreditLimit
      const creditCheck = await wholesaleService.validateCreditLimit(wc.id, companyId, calculatedTotal);
      if (!creditCheck.allowed) {
        return res.status(400).json({
          success: false,
          error: `تم رفض الطلب لتجاوز الحد الائتماني المسموح به. الحد: ${creditCheck.creditLimit}، الرصيد الحالي: ${creditCheck.currentBalance}، إجمالي الطلب: ${calculatedTotal}، المتاح: ${creditCheck.available}`,
          code: 'CREDIT_LIMIT_EXCEEDED',
          creditLimit: creditCheck.creditLimit,
          currentBalance: creditCheck.currentBalance,
          orderTotal: calculatedTotal,
          availableCredit: creditCheck.available,
        });
      }

      // Generate order number
      const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `WS-${datePart}-${randomPart}`;

      const customerFullName = `${wc.customer?.firstName || ''} ${wc.customer?.lastName || ''}`.trim() || 'تاجر جملة';

      // Create order with status PENDING and orderSource WHOLESALE
      const order = await prisma.order.create({
        data: {
          companyId,
          customerId,
          wholesaleCustomerId: wc.id,
          orderNumber,
          orderSource: 'WHOLESALE',
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: 'CASH',
          subtotal: calculatedTotal,
          total: calculatedTotal,
          tax: 0,
          shipping: 0,
          discount: 0,
          notes: notes ? String(notes).trim() : null,
          shippingAddress: shippingAddress ? String(shippingAddress).trim() : null,
          city: city ? String(city).trim() : null,
          governorate: governorate ? String(governorate).trim() : null,
          customerName: customerFullName,
          customerPhone: wc.customer?.phone || null,
          customerEmail: wc.customer?.email || null,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: true,
        },
      });

      // NOTE: Balance is deliberately NOT updated here.
      // Acceptance criterion: الرصيد مايتغيرش قبل التأكيد.

      // Notify staff / confirmation center queue
      try {
        if (notificationService?.createNotification) {
          await notificationService.createNotification({
            companyId,
            title: 'طلب جملة جديد في انتظار التأكيد',
            body: `استلمت طلباً جديداً #${orderNumber} بقيمة ${calculatedTotal} ج.م من الموزع ${customerFullName}`,
            type: 'ORDER',
            metadata: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              source: 'WHOLESALE',
              wholesaleCustomerId: wc.id,
              total: calculatedTotal,
            },
          });
        }
      } catch (notifyErr) {
        console.warn('⚠️ [WHOLESALE-PORTAL] Notification warning:', notifyErr.message);
      }

      return res.status(201).json({
        success: true,
        message: 'تم إنشاء طلب الجملة بنجاح وهو قيد المراجعة في مركز التأكيد',
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          orderSource: order.orderSource,
          total: Number(order.total),
          createdAt: order.createdAt,
          itemsCount: order.orderItems?.length || 0,
        },
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'حدث خطأ أثناء إنشاء الطلب',
        code: err.code || 'INTERNAL_ERROR',
      });
    }
  }
}

module.exports = WholesalePortalController;

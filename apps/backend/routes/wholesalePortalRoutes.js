/**
 * Wholesale Portal Routes (TASK 5)
 *
 * Dedicated router for wholesale dealers on top of existing customer auth:
 * GET  /wholesale-portal/me
 * GET  /wholesale-portal/orders
 * GET  /wholesale-portal/orders/:id
 * GET  /wholesale-portal/statement
 * GET  /wholesale-portal/price-list
 * POST /wholesale-portal/orders
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const verifyToken = require('../utils/verifyToken');
const ctrl = require('../controller/wholesalePortalController');

// Rate limiting on public/client-facing endpoints
const portalReadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'تجاوزت الحد المسموح به من الطلبات. يرجى المحاولة بعد قليل.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

const portalOrderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'تجاوزت الحد المسموح لإنشاء الطلبات. يرجى الانتظار عدة دقائق.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// All wholesale portal endpoints require customer authentication
router.use(verifyToken.authenticateToken);

// Customer portal wholesale endpoints
router.get('/me', portalReadLimiter, ctrl.getMe);
router.get('/orders', portalReadLimiter, ctrl.getOrders);
router.get('/orders/:id', portalReadLimiter, ctrl.getOrderDetails);
router.get('/statement', portalReadLimiter, ctrl.getStatement);
router.get('/price-list', portalReadLimiter, ctrl.getPriceList);
router.post('/orders', portalOrderLimiter, ctrl.createOrder);

module.exports = router;

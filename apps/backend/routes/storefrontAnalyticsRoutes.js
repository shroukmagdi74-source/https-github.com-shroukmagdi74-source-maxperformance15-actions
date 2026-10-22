const express = require('express');
const router = express.Router();
const storefrontAnalyticsController = require('../controller/storefrontAnalyticsController');
const verifyToken = require('../utils/verifyToken');
const { addPublicCORS } = require('../middleware/companyMiddleware');

// Handle preflight OPTIONS for cross-origin storefront visitors
router.options('*', addPublicCORS, (req, res) => {
  res.sendStatus(204);
});

/**
 * @route   POST /api/v1/storefront-analytics/event
 * @desc    Record storefront view or click event (Public, zero-auth, rate-limited, privacy-first)
 * @access  Public
 */
router.post('/event', addPublicCORS, storefrontAnalyticsController.recordEvent);

/**
 * @route   GET /api/v1/storefront-analytics/summary
 * @desc    Get aggregate analytics summary for merchant editor/dashboard
 * @access  Private (Authenticated + Company Access required)
 */
router.get(
  '/summary',
  verifyToken.authenticateToken,
  verifyToken.requireCompanyAccess,
  storefrontAnalyticsController.getSummary
);

module.exports = router;

/**
 * Public Sample Share Controller (Wave 5 / T05)
 *
 * Public unauthenticated endpoints for sample order share links:
 * - GET /api/v1/public/sample-share/:token
 * - POST /api/v1/public/sample-share/:token/factory-ack
 */

const ManufacturingSampleShareService = require('../services/manufacturingSampleShareService');

class PublicSampleShareController {
  /**
   * GET /api/v1/public/sample-share/:token
   */
  static async getPublic(req, res) {
    try {
      const token = String(req.params.token || '').trim();
      if (!token) {
        return res.status(404).json({
          success: false,
          error: 'الرابط غير صالح',
        });
      }

      const data = await ManufacturingSampleShareService.getPublicView(token);
      res.json({ success: true, data });
    } catch (err) {
      const status = err.statusCode || err.status || 404;
      // In accordance with T05 requirements, 404 and 410 return literally "الرابط غير صالح"
      res.status(status).json({
        success: false,
        error: err.message || 'الرابط غير صالح',
      });
    }
  }

  /**
   * POST /api/v1/public/sample-share/:token/factory-ack
   */
  static async factoryAck(req, res) {
    try {
      const token = String(req.params.token || '').trim();
      if (!token) {
        return res.status(404).json({
          success: false,
          error: 'الرابط غير صالح',
        });
      }

      const result = await ManufacturingSampleShareService.acknowledgeFactory(token, {
        name: req.body?.name,
        file: req.file,
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'تم تسجيل استلام العينة بنجاح',
      });
    } catch (err) {
      const status = err.statusCode || err.status || 400;
      res.status(status).json({
        success: false,
        error: err.message || 'حدث خطأ أثناء تسجيل الاستلام',
      });
    }
  }
}

module.exports = PublicSampleShareController;

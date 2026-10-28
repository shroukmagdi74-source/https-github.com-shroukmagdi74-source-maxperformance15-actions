/**
 * @file companyPreferencesController.js
 * @description وحدة التحكم في تفضيلات الشركة وتخصيص عناصر القائمة الجانبية
 */

const sharedDatabase = require('../services/sharedDatabase');

const MAX_SIDEBAR_ITEMS = 60;

/**
 * جلب تفضيلات القائمة الجانبية للشركة
 * GET /api/company/sidebar-preferences
 */
const getSidebarPreferences = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير مصرح به أو لا ينتمي لشركة'
      });
    }

    const userRole = req.user?.role ? String(req.user.role).toUpperCase() : null;
    const userPerms = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
    if (userRole && !['OWNER', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(userRole) && !userPerms.includes('settings.manage')) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل إعدادات القائمة الجانبية. هذه العملية مخصصة للمالك والمسؤولين فقط',
        code: 'FORBIDDEN',
        error: 'غير مصرح لك بتعديل تفضيلات القائمة الجانبية'
      });
    }

    const prisma = sharedDatabase.getSharedPrismaClient();
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { sidebarPreferences: true }
    });

    const preferences = company?.sidebarPreferences && typeof company.sidebarPreferences === 'object'
      ? company.sidebarPreferences
      : { hidden: [], order: [] };

    return res.json({
      success: true,
      data: {
        hidden: Array.isArray(preferences.hidden) ? preferences.hidden : [],
        order: Array.isArray(preferences.order) ? preferences.order : []
      }
    });
  } catch (error) {
    console.error('❌ [COMPANY-PREFERENCES] خطأ في جلب تفضيلات القائمة الجانبية:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب تفضيلات القائمة الجانبية'
    });
  }
};

/**
 * تحديث تفضيلات القائمة الجانبية للشركة
 * PUT /api/company/sidebar-preferences
 * Body: { hidden: string[], order: string[] }
 */
const updateSidebarPreferences = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير مصرح به أو لا ينتمي لشركة'
      });
    }

    const userRole = req.user?.role ? String(req.user.role).toUpperCase() : null;
    const userPerms = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
    if (userRole && !['OWNER', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(userRole) && !userPerms.includes('settings.manage')) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل إعدادات القائمة الجانبية. هذه العملية مخصصة للمالك والمسؤولين فقط',
        code: 'FORBIDDEN',
        error: 'غير مصرح لك بتعديل تفضيلات القائمة الجانبية'
      });
    }

    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({
        success: false,
        error: 'بيانات الطلب غير صالحة، يجب إرسال كائن يحتوي على hidden و order'
      });
    }

    const { hidden = [], order = [] } = body;

    // التحقق من أن hidden و order مصفوفات
    if (!Array.isArray(hidden) || !Array.isArray(order)) {
      return res.status(400).json({
        success: false,
        error: 'الحقول hidden و order يجب أن تكون مصفوفات'
      });
    }

    // التحقق من الحد الأقصى (60 عنصراً)
    if (hidden.length > MAX_SIDEBAR_ITEMS || order.length > MAX_SIDEBAR_ITEMS) {
      return res.status(400).json({
        success: false,
        error: `الحد الأقصى المسموح به لكل مصفوفة هو ${MAX_SIDEBAR_ITEMS} عنصراً`
      });
    }

    // التحقق من أن كل معرّف هو نص فقط (رفض أي id غير نصي)
    for (const id of hidden) {
      if (typeof id !== 'string' || id.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'كل معرّف في قائمة hidden يجب أن يكون نصاً غير فارغ'
        });
      }
    }

    for (const id of order) {
      if (typeof id !== 'string' || id.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'كل معرّف في قائمة order يجب أن يكون نصاً غير فارغ'
        });
      }
    }

    // تنظيف البيانات وإزالة التكرارات
    const sanitizedHidden = Array.from(new Set(hidden.map((id) => id.trim())));
    const sanitizedOrder = Array.from(new Set(order.map((id) => id.trim())));

    const payload = {
      hidden: sanitizedHidden,
      order: sanitizedOrder
    };

    const prisma = sharedDatabase.getSharedPrismaClient();
    await prisma.company.update({
      where: { id: companyId },
      data: {
        sidebarPreferences: payload
      }
    });

    return res.json({
      success: true,
      message: 'تم حفظ تفضيلات القائمة الجانبية بنجاح',
      data: payload
    });
  } catch (error) {
    console.error('❌ [COMPANY-PREFERENCES] خطأ في تحديث تفضيلات القائمة الجانبية:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في حفظ تفضيلات القائمة الجانبية'
    });
  }
};

module.exports = {
  getSidebarPreferences,
  updateSidebarPreferences,
  MAX_SIDEBAR_ITEMS
};

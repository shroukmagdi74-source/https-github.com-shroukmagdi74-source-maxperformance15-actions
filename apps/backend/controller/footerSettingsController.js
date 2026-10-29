const {
  getSharedPrismaClientAsync,
  safeQuery,
} = require('../services/sharedDatabase');
const redisCacheService = require('../services/redisCacheService');
const companyCacheService = require('../services/companyCacheService');
const {
  isPlaceholderPhone,
  isPlaceholderEmail,
} = require('../utils/placeholderContact');

const PUBLIC_FOOTER_SETTINGS_CACHE_TTL = 300;
const getPublicFooterSettingsCacheKey = (companyId) =>
  `public_footer_settings_v1:${companyId}`;

async function invalidateFooterSettingsCache(companyId) {
  if (!companyId) return;
  try {
    await redisCacheService.del(getPublicFooterSettingsCacheKey(companyId));
  } catch (err) {
    console.warn('⚠️ [REDIS] Failed to invalidate public footer settings cache:', err?.message);
  }
}

/**
 * Footer Settings Controller
 * Handles footer information management
 */

// Helper function to get Prisma client
async function getPrisma() {
  return getSharedPrismaClientAsync();
}

/**
 * Get footer settings
 */
exports.getFooterSettings = async (req, res) => {
  try {
    const { companyId } = req.user;
    // Handle null, undefined, or string 'null'/'undefined'
    if (!companyId || companyId === 'null' || companyId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد الشركة لعرض إعدادات الفوتر',
        error: 'COMPANY_ID_REQUIRED'
      });
    }

    let settings = await safeQuery((prisma) =>
      prisma.footerSettings.findUnique({
        where: { companyId }
      })
    );

    // Create default settings if not exists
    if (!settings) {
      // Get company info for defaults
      const company = await safeQuery((prisma) =>
        prisma.company.findUnique({
          where: { id: companyId },
          select: { name: true, email: true, phone: true, address: true }
        })
      );

      settings = await safeQuery((prisma) =>
        prisma.footerSettings.create({
          data: {
            companyId,
            aboutStore: `نحن ${company?.name || 'متجر'} نقدم أفضل المنتجات والخدمات لعملائنا الكرام`,
            showAboutStore: true,
            email: company?.email || '',
            showEmail: true,
            phone: company?.phone || '',
            showPhone: true,
            address: company?.address || '',
            showAddress: true,
            showQuickLinks: true,
            copyrightText: `© ${new Date().getFullYear()} ${company?.name || 'المتجر'}. جميع الحقوق محفوظة`,
            showCopyright: true
          }
        })
      );

      await invalidateFooterSettingsCache(companyId);
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching footer settings:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب إعدادات الفوتر'
    });
  }
};

/**
 * Update footer settings
 */
// Allowed fields for footer settings update — prevents mass assignment
const FOOTER_SETTINGS_WHITELIST = [
  'aboutStore', 'showAboutStore',
  'email', 'showEmail',
  'phone', 'showPhone',
  'address', 'showAddress',
  'showQuickLinks',
  'copyrightText', 'showCopyright'
];

exports.updateFooterSettings = async (req, res) => {
  try {
    const { companyId } = req.user;
    const prisma = await getPrisma();

    // Handle null, undefined, or string 'null'/'undefined'
    if (!companyId || companyId === 'null' || companyId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد الشركة لتحديث إعدادات الفوتر',
        error: 'COMPANY_ID_REQUIRED'
      });
    }

    // Whitelist: only allow known safe fields to prevent mass assignment
    const updateData = {};
    for (const key of FOOTER_SETTINGS_WHITELIST) {
      if (key in req.body) {
        updateData[key] = req.body[key];
      }
    }

    if (updateData.phone !== undefined && isPlaceholderPhone(updateData.phone)) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف غير صالح — يرجى إدخال رقم حقيقي'
      });
    }

    if (updateData.email !== undefined && isPlaceholderEmail(updateData.email)) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني غير صالح — يرجى إدخال بريد حقيقي'
      });
    }

    // Check if settings exist
    let settings = await prisma.footerSettings.findUnique({
      where: { companyId }
    });

    if (!settings) {
      settings = await prisma.footerSettings.create({
        data: { companyId, ...updateData }
      });
    } else {
      settings = await prisma.footerSettings.update({
        where: { companyId },
        data: updateData
      });
    }

    await invalidateFooterSettingsCache(companyId);

    res.json({
      success: true,
      message: 'تم تحديث إعدادات الفوتر بنجاح',
      data: settings
    });
  } catch (error) {
    console.error('Error updating footer settings:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث إعدادات الفوتر'
    });
  }
};

/**
 * Reset footer settings to defaults
 */
exports.resetFooterSettings = async (req, res) => {
  try {
    const { companyId } = req.user;
    const prisma = await getPrisma();

    // Handle null, undefined, or string 'null'/'undefined'
    if (!companyId || companyId === 'null' || companyId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد الشركة لإعادة تعيين إعدادات الفوتر',
        error: 'COMPANY_ID_REQUIRED'
      });
    }

    // Get company info for defaults
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, email: true, phone: true, address: true }
    });

    const settings = await prisma.footerSettings.upsert({
      where: { companyId },
      update: {
        aboutStore: `نحن ${company?.name || 'متجر'} نقدم أفضل المنتجات والخدمات لعملائنا الكرام`,
        showAboutStore: true,
        email: company?.email || '',
        showEmail: true,
        phone: company?.phone || '',
        showPhone: true,
        address: company?.address || '',
        showAddress: true,
        showQuickLinks: true,
        copyrightText: `© ${new Date().getFullYear()} ${company?.name || 'المتجر'}. جميع الحقوق محفوظة`,
        showCopyright: true
      },
      create: {
        companyId,
        aboutStore: `نحن ${company?.name || 'متجر'} نقدم أفضل المنتجات والخدمات لعملائنا الكرام`,
        showAboutStore: true,
        email: company?.email || '',
        showEmail: true,
        phone: company?.phone || '',
        showPhone: true,
        address: company?.address || '',
        showAddress: true,
        showQuickLinks: true,
        copyrightText: `© ${new Date().getFullYear()} ${company?.name || 'المتجر'}. جميع الحقوق محفوظة`,
        showCopyright: true
      }
    });

    await invalidateFooterSettingsCache(companyId);

    res.json({
      success: true,
      message: 'تم إعادة تعيين إعدادات الفوتر بنجاح',
      data: settings
    });
  } catch (error) {
    console.error('Error resetting footer settings:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إعادة تعيين إعدادات الفوتر'
    });
  }
};

/**
 * Get public footer settings (for storefront)
 * Supports both companyId and slug
 */
exports.getPublicFooterSettings = async (req, res) => {
  try {
    // Use company from middleware (set by getCompanyFromSubdomain) or fallback to params
    const companyId = req.company?.id || req.params?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الشركة مطلوب'
      });
    }

    // Determine if companyId is actually a slug or an ID
    // CUIDs are exactly 25 chars starting with 'c', slugs are shorter alphanumeric strings
    let actualCompanyId = companyId;
    const looksLikeSlug = !req.company?.id && !/^c[a-z0-9]{24}$/.test(companyId);

    if (looksLikeSlug) {
      const company = await companyCacheService.getCompanyLookup('footer_ref', companyId, async () => {
        const prisma = await getPrisma();
        return prisma.company.findFirst({
          where: { OR: [{ slug: companyId }, { id: companyId }] },
          select: { id: true, slug: true }
        });
      });

      if (company?.id) {
        actualCompanyId = company.id;
      }
    }

    const cacheKey = getPublicFooterSettingsCacheKey(actualCompanyId);
    try {
      const cached = await redisCacheService.get(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        return res.json(cached);
      }
    } catch (cacheErr) {
      console.warn('⚠️ [REDIS] public footer settings cache lookup failed:', cacheErr?.message);
    }

    const prisma = await getPrisma();
    const settings = await prisma.footerSettings.findUnique({
      where: { companyId: actualCompanyId },
      select: {
        aboutStore: true,
        showAboutStore: true,
        email: true,
        showEmail: true,
        phone: true,
        showPhone: true,
        address: true,
        showAddress: true,
        showQuickLinks: true,
        copyrightText: true,
        showCopyright: true
      }
    });

    let responsePayload;
    if (!settings) {
      // Return default settings if not configured
      const company = await prisma.company.findUnique({
        where: { id: actualCompanyId },
        select: { name: true, email: true, phone: true, address: true }
      });

      responsePayload = {
        success: true,
        data: {
          aboutStore: `نحن ${company?.name || 'متجر'} نقدم أفضل المنتجات والخدمات لعملائنا الكرام`,
          showAboutStore: true,
          email: company?.email || '',
          showEmail: true,
          phone: company?.phone || '',
          showPhone: true,
          address: company?.address || '',
          showAddress: true,
          showQuickLinks: true,
          copyrightText: `© ${new Date().getFullYear()} ${company?.name || 'المتجر'}. جميع الحقوق محفوظة`,
          showCopyright: true
        }
      };
    } else {
      responsePayload = {
        success: true,
        data: settings
      };
    }

    try {
      await redisCacheService.set(cacheKey, responsePayload, PUBLIC_FOOTER_SETTINGS_CACHE_TTL);
    } catch (_) {
      // non-blocking cache write
    }

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.json(responsePayload);
  } catch (error) {
    console.error('Error fetching public footer settings:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب إعدادات الفوتر'
    });
  }
};

const express = require('express');
const router = express.Router();
const merchantService = require('../services/merchantService');
const { getCompanyFromSubdomain } = require('../middleware/companyMiddleware');
const { getSharedPrismaClient } = require('../services/sharedDatabase');

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();

/**
 * Public Merchant Registration Routes
 * No authentication required - company isolation through subdomain
 */

/**
 * تسجيل تاجر جديد (عام - بدون authentication)
 * يستخرج الشركة من subdomain للعزل
 */
router.post('/register', getCompanyFromSubdomain, async (req, res) => {
  try {
    // استخراج الشركة من subdomain (إذا كان موجوداً)
    let companyId = null;
    if (req.company && req.company.id) {
      companyId = req.company.id;
      console.log('✅ [PUBLIC-MERCHANT] Company extracted from subdomain:', req.company.name, 'ID:', companyId);
    } else {
      // إذا لم يكن هناك subdomain، يمكن استخدام companyId من body
      companyId = req.body?.companyId || null;
      if (companyId) {
        // التحقق من وجود الشركة
        const prisma = getSharedPrismaClient();
        const company = await prisma.company.findFirst({
          where: {
            OR: [
              { id: companyId },
              { slug: companyId }
            ],
            isActive: true
          }
        });

        if (company) {
          companyId = company.id;
          console.log('✅ [PUBLIC-MERCHANT] Using companyId from request body:', companyId);
        } else {
          return res.status(400).json({
            success: false,
            message: 'الشركة غير موجودة أو غير نشطة. يرجى الوصول من subdomain الشركة (مثل: storename.mokhtarelhenawy.online)'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'يجب تحديد الشركة. يرجى الوصول من subdomain الشركة (مثل: storename.mokhtarelhenawy.online) أو تحديد companyId'
        });
      }
    }

    // التحقق من البيانات المطلوبة
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة'
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب ألا تقل عن 8 أحرف'
      });
    }

    // التحقق من أن التاجر غير موجود (email فريد عالمياً)
    const prisma = getSharedPrismaClient();
    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      }
    });

    if (existingMerchant) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      },
      select: { id: true }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل كمستخدم'
      });
    }

    // Public signup collects identity/contact data only.
    // Operational settings مثل العمولة، الـ webhook، والوفاء التلقائي تظل قرار الشركة.
    const merchant = await merchantService.createMerchant(companyId, {
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      phone: req.body?.phone,
      address: req.body?.address,
      isActive: false
    });

    if (req.body?.phone) {
      setImmediate(async () => {
        try {
          const prisma = getSharedPrismaClient();
          const cleanPhone = String(req.body.phone).replace(/\D/g, '');
          let customer = await prisma.customer.findFirst({
            where: { companyId, OR: [{ phone: req.body.phone }, { email: normalizedEmail }] }
          });
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                companyId,
                firstName: String(name).trim(),
                email: normalizedEmail,
                phone: req.body.phone,
                status: 'LEAD'
              }
            });
          }
          if (customer?.id) {
            const formatted = cleanPhone.startsWith('0') ? `20${cleanPhone.substring(1)}` : cleanPhone;
            const jid = `${formatted}@s.whatsapp.net`;
            let contact = await prisma.whatsAppContact.findFirst({
              where: { whatsAppSession: { companyId }, OR: [{ customerId: customer.id }, { phoneNumber: formatted }] }
            });
            if (!contact) {
              const session = await prisma.whatsAppSession.findFirst({
                where: { companyId, isDefault: true }
              }) || await prisma.whatsAppSession.findFirst({
                where: { companyId, status: 'CONNECTED' },
                orderBy: [{ lastConnectedAt: 'desc' }, { createdAt: 'desc' }]
              }) || await prisma.whatsAppSession.findFirst({
                where: { companyId }
              });
              if (session) {
                contact = await prisma.whatsAppContact.create({
                  data: {
                    sessionId: session.id,
                    jid,
                    phoneNumber: formatted,
                    name: String(name).trim(),
                    customerId: customer.id,
                    category: 'LEAD'
                  }
                });
              }
            }
            if (contact) {
              const LeadFollowUpService = require('../services/whatsapp/LeadFollowUpService');
              await LeadFollowUpService.enrollLead(companyId, customer.id, contact.id);
            }
          }
        } catch (e) {
          console.warn('⚠️ [PUBLIC-MERCHANT] Auto-enrollment error:', e.message);
        }
      });
    }

    res.json({
      success: true,
      message: 'تم تسجيل التاجر بنجاح، وسيتم تفعيل الحساب بعد مراجعة الشركة',
      data: merchant
    });
  } catch (error) {
    console.error('❌ [PUBLIC-MERCHANT] Error registering merchant:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء تسجيل التاجر'
    });
  }
});

module.exports = router;

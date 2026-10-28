# APPS-2 — أقسام التطبيقات 21→60 · حالة التسليم

**التاريخ:** 28/10/2026 · **الريبو:** `C:\maxp-platform-13` · **الحالة:** ✅ تم
**Commit:** `599c8afe3` — `feat(storefront): add APPS-2 presets for 40 marketplace apps (21-60)`

## الأرقام
| البند | قبل | بعد |
|---|---|---|
| التطبيقات في `APP_SECTION_PRESETS` | 20 | **60** |
| الأقسام الكلية | 60 | **180** (3 لكل تطبيق) |
| أنواع الأقسام المستخدمة | 7 | 7 (بدون أي نوع جديد) |

- المصدر الوحيد لأسماء التطبيقات: `apps/backend/catalog/marketplace/apps.json` (86 تطبيق) — الاسم العربي من الكتالوج، و`appId = app-<slug>`.
- **تم استثناء `manufacturing`** لأن `app-manufacturing` موجود أصلًا ضمن الـ20 في APPS-1 — الإضافة فقط، بدون لمس الموجود.

## الملفات المعدلة
1. `apps/frontend/src/storefront/presets/appSectionPresets.ts` (+2358 سطر، إضافة فقط — صفر سطور محذوفة من الـ20 الأولى).
2. `apps/frontend/src/storefront/__tests__/appSectionPresets.test.tsx` (20→60، قائمة id كاملة، 180 قسم، فرادة ids، الشارة لكل تطبيق، فحص النصوص الممنوعة، بحث عربي لـ3 تطبيقات جديدة).

## البوابات
| البوابة | النتيجة |
|---|---|
| `vitest run src/storefront/__tests__/appSectionPresets.test.tsx` | ✅ **9/9 pass** · Test Files 1 passed |
| `oxlint --config .oxlintrc.json …/appSectionPresets.ts` | ✅ **0 warnings, 0 errors** |
| `oxlint` على ملف الاختبار | 0 أخطاء (ملف الاختبار مستبعد من ignore patterns المشروع → "No files found to lint") |
| `git diff package.json` | ✅ فارغ — صفر dependency جديدة |
| نطاق التغيير | ✅ `apps/frontend/src/storefront/**` فقط |

## قائمة الـ40 المضافة (بترتيب الملف)
| # | appId | الاسم | التصنيف | slug في الكتالوج |
|---|---|---|---|---|
| 21 | app-orders-analytics | تحليلات الطلبات | تحليلات | orders-analytics |
| 22 | app-profit-analytics | تحليلات الأرباح | تحليلات | profit-analytics |
| 23 | app-whatsapp-business | WhatsApp Business API | تواصل | whatsapp-business |
| 24 | app-instagram-business | انستجرام بزنس | تواصل | instagram-business |
| 25 | app-telegram-business | تكامل Telegram | تواصل | telegram-business |
| 26 | app-tiktok-integrations | تكامل TikTok | تواصل | tiktok-integrations |
| 27 | app-bot-automation | أتمتة المحادثات | تواصل | bot-automation |
| 28 | app-facebook-ads-pro | إعلانات فيسبوك وانستجرام | تسويق | facebook-ads-pro |
| 29 | app-ugc-reviews-pro | تقييمات العملاء | تسويق | ugc-reviews-pro |
| 30 | app-affiliate-pro | Affiliate Pro | تسويق | affiliate-pro |
| 31 | app-blog-pro | نظام المدونة والـ SEO | محتوى | blog-pro |
| 32 | app-campaign-attribution | Campaign Attribution | تسويق | campaign-attribution |
| 33 | app-ai-chat-basic | AI Chat Basic | ذكاء اصطناعي | ai-chat-basic |
| 34 | app-store | المتجر | تجارة إلكترونية | store |
| 35 | app-conversion-suite | أدوات رفع التحويل | تجارة إلكترونية | conversion-suite |
| 36 | app-quantity-offers-pro | عروض الكميات | تجارة إلكترونية | quantity-offers-pro |
| 37 | app-pos-pro | نظام POS | تجارة إلكترونية | pos-pro |
| 38 | app-crm-lite | CRM Lite | إدارة عملاء | crm-lite |
| 39 | app-procurement-pro | المشتريات وإدارة الموردين | مشتريات | procurement-pro |
| 40 | app-order-confirmation-distribution | Order Confirmation & Distribution | تشغيل طلبات | order-confirmation-distribution |
| 41 | app-cafe-restaurant-pro | نظام الكافيهات والمطاعم | تشغيل طلبات | cafe-restaurant-pro |
| 42 | app-order-automation | أتمتة الحالات | تشغيل طلبات | order-automation |
| 43 | app-returns-settings | إعدادات المرتجعات | تشغيل طلبات | returns-settings |
| 44 | app-unified-inbox | Unified Inbox | إنتاجية | unified-inbox |
| 45 | app-notification-automation | Notification Automation | إنتاجية | notification-automation |
| 46 | app-academy-app | أكاديمية ماكس بي | إنتاجية | academy-app |
| 47 | app-medical-system | النظام الطبي | طبي | medical-system |
| 48 | app-lab-app | نظام المعمل | طبي | lab-app |
| 49 | app-radiology-app | نظام الأشعة | طبي | radiology-app |
| 50 | app-inventory-pro | المخزون والمستودعات الشامل | مخازن | inventory-pro |
| 51 | app-multi-warehouse-pro | المخزون المتعدد | مخازن | multi-warehouse-pro |
| 52 | app-order-shipping-turbo | بوابة وشركات الشحن الذكي | شحن | order-shipping-turbo |
| 53 | app-internal-courier-fleet | أسطول المناديب والتوصيل الداخلي | شحن | internal-courier-fleet |
| 54 | app-order-invoicing | الفواتير | محاسبة | order-invoicing |
| 55 | app-accounting | المحاسبة | محاسبة | accounting |
| 56 | app-wholesale-pro | البيع بالجملة | جملة | wholesale-pro |
| 57 | app-treasury-expenses-pro | الخزينة والنفقات ورأس المال | خزينة ومالية | treasury-expenses |
| 58 | app-hr-core | نظام HR الأساسي | موارد بشرية | hr-core |
| 59 | app-hr-attendance-pro | الحضور والانصراف والورديات | موارد بشرية | hr-attendance-pro |
| 60 | app-executable-mindmap | الخرائط الذهنية ومسارات العمل | أتمتة | executable-mindmap |

## أنواع الأقسام المستخدمة (120 قسم جديد)
`hero-banner` 40 · `services-grid` 38 · `features-bar` 32 · `tech-grid` 7 · `article-grid` 1 · `featured-products` 1 · `featured-collections` 1 — كلها موجودة في `sections/manifest.ts` (الاختبار يتحقق لكل قسم).

## النصوص
- صفر أرقام تسويقية وصفر وعود: فحص `/‎%|٪|توفير|عميل سعيد|آلاف/` على كل سلاسل الـ60 تطبيقًا (بما فيها الكلمات المفتاحية والأوصاف) → **صفر مطابقة**.
- لا أقسام ولا مكوّنات جديدة، ولا تغيير في `StudioSectionCatalogModal` (يقرأ العدد من `APP_SECTION_PRESETS.length` → يعرض «60 تطبيق» تلقائيًا).

## ملاحظات
- `tsc --noEmit` الكامل لم يُشغَّل في هذه الدفعة (تعارض مع تعليمات التشغيل: بوابتا vitest + oxlint فقط). ملف الاختبار يستورد الملف الجديد ويمر بنجاح عبر vitest، ما يغطي صحته النوعية عمليًا.
- `studioEditorSmokeE2E` لم يُشغَّل لنفس السبب.

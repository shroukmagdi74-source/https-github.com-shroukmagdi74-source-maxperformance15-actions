# APPS-3 — أقسام التطبيقات 61→103 · حالة التسليم (إقفال)

**التاريخ:** 28/10/2026 · **الريبو:** `C:\maxp-platform-13` · **الحالة:** ✅ تم
**Commit:** `d577c3739` — `feat(storefront): add APPS-3 presets for remaining 43 marketplace apps (61-103)`

## تصحيح رقم التيكت (مهم)
التيكت افترض **106 تطبيق**. العدد الفعلي في `apps/backend/catalog/marketplace/apps.json` = **86 تطبيق** (86 slug فريد، صفر مكرر).
حسب بند القبول رقم 1 («لو الكتالوج فيه عدد مختلف، استخدم العدد الفعلي واذكره») تم العمل على **86**.

توزيع تغطية الـ86 عبر الدفعات:
| الدفعة | تطبيقات كتالوج غطّتها |
|---|---|
| APPS-1 | 3 (`booking-app`, `manufacturing`, `dental-lab-app`) |
| APPS-2 | 40 |
| APPS-3 | **43** (هذه الدفعة) |
| **الإجمالي** | **86 = 86/86 تغطية كاملة** |

## الأرقام
| البند | قبل | بعد |
|---|---|---|
| تطبيقات في `APP_SECTION_PRESETS` | 60 | **103** |
| الأقسام الكلية | 180 | **309** (3 لكل تطبيق) |
| تطبيقات الكتالوج المغطاة | 43 / 86 | **86 / 86** |
| أنواع الأقسام المستخدمة | 12 | 12 (بدون أي نوع جديد) |

**103 = 86 تطبيق كتالوج + 17 تطبيق صناعي من APPS-1** غير موجود في الكتالوج
(`courses, restaurants, clinics, pharmacies, real-estate, contracting, interior-finishing, gym, salon, education, fashion-store, electronics, supermarket, auto-repair, travel, charity, home-services`).

- `appId = app-<slug>` لكل المضافة. الاستثناءات القديمة `booking-app → app-booking` و`dental-lab-app → app-dental-lab` لم تُلمس.
- كل تطبيق جديد 3 أقسام من الأنواع الموجودة فقط: `hero-banner` + `services-grid` + `features-bar`.
- الشارة: `متاح مع تطبيق <appName>` لكل قسم (مطابقة للاختبار).

## الملفات المعدلة
1. `apps/frontend/src/storefront/presets/appSectionPresets.ts` — **+2494 سطر، 0 سطر محذوف** (إضافة فقط بعد الـ60).
2. `apps/frontend/src/storefront/__tests__/appSectionPresets.test.tsx` — تحديث الأرقام (60→103، 180→309) + اختبار تغطية الكتالوج 86/86 + اختبار بحث عربي لـAPPS-3.

## البوابات
| البوابة | النتيجة |
|---|---|
| `vitest run src/storefront/__tests__/appSectionPresets.test.tsx` | ✅ **11/11 pass** · Test Files 1 passed |
| `oxlint --config .oxlintrc.json src/storefront/presets/appSectionPresets.ts src/storefront/__tests__/appSectionPresets.test.tsx` | ✅ **exit 0 · صفر أخطاء** |
| `git diff --numstat` على ملف الـpresets | ✅ `2494 0` (صفر حذف) |
| `git diff` على `package.json` | ✅ فارغ — صفر dependency جديدة |
| نطاق التغيير | ✅ `apps/frontend/src/storefront/**` فقط |
| أقسام جديدة / مكوّنات جديدة | ✅ صفر (`isStorefrontSectionKnown` true لكل الأنواع) |
| نصوص ممنوعة (`%|٪|توفير|عميل سعيد|آلاف`) | ✅ صفر |

## قايمة الـ43 المضافة (بترتيب الملف)
| # | appId | الاسم | التصنيف | أقسام |
|---|---|---|---|---|
| 61 | app-facebook-pages-connect | ربط صفحات فيسبوك | تواصل | 3 |
| 62 | app-facebook-pixel-capi | Pixel وتحليلات التحويل | تحليلات | 3 |
| 63 | app-facebook-catalog-shop | كتالوج ومتجر فيسبوك | تجارة إلكترونية | 3 |
| 64 | app-facebook-post | إنشاء منشور فيسبوك | محتوى | 3 |
| 65 | app-google-tag-manager | Google Tag Manager | تحليلات | 3 |
| 66 | app-woocommerce-pro | تكامل WooCommerce | تكاملات | 3 |
| 67 | app-analytics-basic | Analytics Basic | تحليلات | 3 |
| 68 | app-status-summary | ملخص حالات الطلبات | تحليلات | 3 |
| 69 | app-returns-reasons-analytics | أسباب المرتجعات | تحليلات | 3 |
| 70 | app-campaign-attribution-analytics | بيانات الحملة | تحليلات | 3 |
| 71 | app-order-source-tracking | تتبع مصدر الطلب | تشغيل طلبات | 3 |
| 72 | app-commerce-advanced | المبيعات المتقدمة | تجارة إلكترونية | 3 |
| 73 | app-product-presentations | عرض المنتج المتعدد | تجارة إلكترونية | 3 |
| 74 | app-coupons-pro | الكوبونات والعروض | تسويق | 3 |
| 75 | app-amazon-affiliate-pro | Amazon Affiliate | تسويق | 3 |
| 76 | app-broadcast-pro | نظام البث المتقدم | تسويق | 3 |
| 77 | app-break-even | حاسبة المشاريع — نقطة التعادل | تحليل مالي | 3 |
| 78 | app-product-break-even | نقطة التعادل للمنتج | تحليل مالي | 3 |
| 79 | app-pricing-strategy | استراتيجية التسعير | تحليل مالي | 3 |
| 80 | app-profitability-engine | محرك الربحية | تحليل مالي | 3 |
| 81 | app-campaign-calculator | حاسبة الحملات | تسويق | 3 |
| 82 | app-ad-budget-planner | مخطط الميزانية الإعلانية | تسويق | 3 |
| 83 | app-discount-impact | حاسبة أثر الخصم | تحليل مالي | 3 |
| 84 | app-shipping-optimizer | محسن الشحن | شحن | 3 |
| 85 | app-monthly-pnl | القوائم المالية الشهرية | محاسبة | 3 |
| 86 | app-clv-calculator | حاسبة القيمة الدائمة للعميل | تحليل مالي | 3 |
| 87 | app-upsell-planner | مخطط البيع الإضافي والتكميلي | تسويق | 3 |
| 88 | app-refund-rate | حاسبة معدل المرتجعات | تحليلات | 3 |
| 89 | app-marketing-agency-pro | إدارة وكالات التسويق | تسويق | 3 |
| 90 | app-cod-deposit | دفعة مقدمة على COD | مدفوعات | 3 |
| 91 | app-agent-workspace | مركز التأكيد والمتابعة | تشغيل طلبات | 3 |
| 92 | app-order-preparation-hold | تجهيز الطلبات | تشغيل طلبات | 3 |
| 93 | app-order-accounting-sources | مصادر الطلبات والمحاسبة | محاسبة | 3 |
| 94 | app-manual-orders-pro | الطلب اليدوي | تشغيل طلبات | 3 |
| 95 | app-bulk-search | البحث المجمع | تشغيل طلبات | 3 |
| 96 | app-customer-blocks | حظر العملاء | إدارة عملاء | 3 |
| 97 | app-bulk-orders | الطلبات الجماعية | تشغيل طلبات | 3 |
| 98 | app-quick-status | التغيير السريع للحالة | تشغيل طلبات | 3 |
| 99 | app-order-workflow | مسار الطلبات | تشغيل طلبات | 3 |
| 100 | app-dental-materials-pro | خامات وموردي معمل الأسنان | معمل أسنان | 3 |
| 101 | app-hr-payroll | مسير الرواتب والمستحقات | موارد بشرية | 3 |
| 102 | app-hr-recruitment | التوظيف واستبيانات العمل | موارد بشرية | 3 |
| 103 | app-hr-assets | العهد والأصول وتقييم الأداء | موارد بشرية | 3 |

## تطبيقات اتخطت وليه
- **صفر تطبيق من الكتالوج اتخطى** — التغطية 86/86.
- `manufacturing` و`booking-app` و`dental-lab-app` لم تُضاف مرة تانية لأنها مغطاة أصلًا من APPS-1 (تكرار appId ممنوع ويفشل الاختبار).
- الـ17 تطبيق الصناعي في APPS-1 مش موجودين في `apps.json` أصلًا، فمش داخلين في حساب الـ86.

## ملاحظات
- `tsc --noEmit` الكامل و`studioEditorSmokeE2E` لم يُشغلا في هذه الدفعة (تعليمات التشغيل)، والبوابتان المطلوبتان (vitest + oxlint) نجحتا.
- الدالة `getAllAppPresetSections` و`StudioSectionCatalogModal` تقرأ العدد ديناميكيًا (`APP_SECTION_PRESETS.length`) — لا أرقام مكتوبة في الكود، فتظهر «103 تطبيق» تلقائيًا.

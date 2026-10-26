import { FEATURE_COPY } from "./feature-catalog/featureCopy";
import { POSITIONING_COPY } from "./feature-catalog/positioningCopy";
import type {
  FeatureAccessKind,
  PositioningFieldKey,
  FeatureDisplayItem,
  PositioningDisplayItem,
  RawFeatureItem,
  MarketplaceFeatureCarrier,
  MarketplacePositioningCarrier,
} from "./feature-catalog/types";

export type {
  FeatureAccessKind,
  PositioningFieldKey,
  FeatureDisplayItem,
  PositioningDisplayItem,
};

type JsonRecord = Record<string, unknown>;

const PRICING_MODEL_ACCESS: Record<string, FeatureAccessKind> = {
  FREE: "FREE",
  SUBSCRIPTION: "PAID",
  PAY_PER_USE: "PAY_PER_USE",
};

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const humanizeKey = (key: string): string => {
  const normalized = key.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const normalizeFeatureAccess = (
  access: unknown,
  fallbackAccess: FeatureAccessKind,
): FeatureAccessKind => {
  const normalized = String(access || "").trim().toUpperCase();
  if (normalized === "FREE" || normalized === "PAID" || normalized === "PAY_PER_USE") {
    return normalized;
  }
  return fallbackAccess;
};

const normalizeRawFeatureItems = (features: unknown): RawFeatureItem[] => {
  if (!features) return [];

  if (Array.isArray(features)) {
    return features.flatMap((item) => {
      if (!item) return [];
      if (typeof item === "string") return [{ key: item.trim() }];
      if (isRecord(item)) {
        const key = typeof item.key === "string" && item.key.trim() ? item.key.trim() : "";
        if (!key) return [];
        return [
          {
            key,
            name: typeof item.name === "string" ? item.name : undefined,
            description: typeof item.description === "string" ? item.description : undefined,
            access: typeof item.access === "string" ? item.access : undefined,
          },
        ];
      }
      return [];
    });
  }

  if (isRecord(features)) {
    return Object.entries(features).flatMap(([key, value]) => {
      if (value === false || value === null || value === undefined) return [];
      if (value === true) return [{ key }];
      if (isRecord(value)) {
        if (value.enabled === false) return [];
        return [
          {
            key,
            name: typeof value.name === "string" ? value.name : undefined,
            description: typeof value.description === "string" ? value.description : undefined,
            access: typeof value.access === "string" ? value.access : undefined,
          },
        ];
      }
      return [{ key, description: String(value) }];
    });
  }

  return [];
};

export const getFeatureAccessKind = (pricingModel?: string): FeatureAccessKind =>
  PRICING_MODEL_ACCESS[String(pricingModel || "").trim().toUpperCase()] || "PAID";

export const getFeatureAccessLabel = (access: FeatureAccessKind): string => {
  if (access === "FREE") return "مجاني";
  if (access === "PAY_PER_USE") return "حسب الاستخدام";
  return "مدفوع";
};

export const getFeatureAccessBadgeClasses = (access: FeatureAccessKind): string => {
  if (access === "FREE") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (access === "PAY_PER_USE") {
    return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800";
  }
  return "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
};

export const getMarketplaceFeatureItems = (
  app: MarketplaceFeatureCarrier,
): FeatureDisplayItem[] => {
  const fallbackAccess = getFeatureAccessKind(app.pricingModel);

  return normalizeRawFeatureItems(app.features).map((feature) => {
    const catalogEntry = FEATURE_COPY[feature.key];

    return {
      key: feature.key,
      name: feature.name || catalogEntry?.name || humanizeKey(feature.key),
      description:
        feature.description ||
        catalogEntry?.description ||
        "ميزة إضافية ضمن هذه الأداة.",
      access: normalizeFeatureAccess(feature.access, fallbackAccess),
    };
  });
};

const LIMITATION_COPY: Record<string, string> = {
  "conversion-suite": "المتجر لسه جديد ومفيش زيارات بتدخل عليه أصلًا عشان تحوّلها",
  "ugc-reviews-pro": "لسه مبيعش حاجة ومفيش عميل اشترى منك عشان يكتب تقييم مصوّر",
  "order-shipping-turbo": "بتبيع في المحل بس ومفيش طلبات بتطلع منه لعميل في محافظة تانية",
  "notification-automation": "شغال لوحدك وكل حاجة قدام عينك، فمحتاجش حد يبعتلك تنبيه",
  "commerce-advanced": "منتجاتك دايمًا موجودة وبتتسلّم بنفس الطريقة لكل عميل",
  "quantity-offers-pro": "بتبيع قطعة واحدة من كل حاجة ومفيش عميل بياخد أكتر من واحدة",
  "procurement-pro": "بتشتري من السوق كاش ومفيش مورد ثابت بتتعامل معاه بأوراق",
  "order-source-tracking": "كل طلباتك بتيجي من مكان واحد ومفيش داعي تعرف مصدرها",
  "order-shipping-reports": "مفيش شحن عندك أصلًا، فمفيش تكاليف شحن عايز تحللها",
  "order-invoicing": "مبيعاتك كلها كاش من غير فواتير، ومش مسجل في الضرايب",
  "campaign-attribution": "مش بتعمل إعلانات مدفوعة، فمفيش حملة تربط بيها الطلبات",
  "affiliate-pro": "بتبيع لعملائك بنفسك ومفيش مسوقين ولا دروب شيبنج بتشتغل معاهم",
  "booking-app": "شغلك خدمة فورية والعميل بييجي في أي وقت من غير ميعاد",
  "order-confirmation-distribution": "بتأكد الطلبات بنفسك وحدك، ومفيش فريق بتوزّع عليه الشغل",
  "medical-system": "شغلك مش طبي ومفيش عيادة ولا دكتور محتاج جدول",
  "wholesale-pro": "بتبيع للعميل النهائي بس ومفيش تاجر بياخد منك بأسعار جملة وأجل",
  "forms-app": "مفيش عرض عندك بتجمع عليه بيانات، وكل عميل بيتكلم معاك على طول",
  "education-app": "مش بتدرّس حد ومفيش حصص ولا طلاب محتاجين جدول",
  "service-request-app": "بتبيع منتج جاهز ومفيش شغل مخصص بيطلبه العميل بملفاته",
  "hotel-app": "مفيش غرف بتتأجر بالليلة ومكانك مش بيستقبل نزلاء",
  "manual-orders-pro": "كل طلباتك بتيجي لوحدها من المتجر، ومفيش طلب بتكتبه بإيدك",
  "bot-automation": "رسايلك قليلة وكل عميل بيسأل سؤال مختلف، فالكلمات المفتاحية مش هتفيد",
  "order-workflow": "دورة الطلب عندك بسيطة وثابتة، ومش محتاج ترتب حالات على مزاجك",
  "returns-settings": "مفيش مرتجعات عندك، وكل بيعة بتخلص على طول",
  "returns-reasons-analytics": "مرتجعاتك قليلة جدًا، ومفيش أسباب كفاية عشان تحللها",
  "bulk-search": "طلباتك معدودة وبتلاقي الطلب اللي بتدور عليه على طول",
  "bulk-orders": "بتتعامل مع كام طلب في اليوم، وكل طلب بياخد وقته لوحده",
  "radiology-app": "مفيش عندك تصوير أو أشعة، وشغلك مش قايم على صور DICOM",
  "manufacturing": "بتشتري المنتج جاهز وتبيعه، ومفيش مواد خام بتتحول عندك",
  "marketing-agency-pro": "بتشتغل على براندك بس، ومفيش عملاء وكالة بتديرلهم شغل",
  "academy-app": "مش بتبيع كورسات ولا محتوى مسجل، وتدريبك بيتم وش لوش",
  "pos-pro": "كل شغلك أونلاين ومفيش عميل بيقف قدامك في محل",
  "accounting": "محاسبك ماسك الدفاتر على نظامه، ومش محتاج قيد مزدوج عندك",
  "lab-app": "مفيش تحاليل بتعملها ومكانك مش معمل",
  "profit-analytics": "مش مسجل تكلفة المنتجات عندك، فالربح اللي هيطلع مش حقيقي",
  "status-summary": "طلباتك معدودة وبتعرف حالة كل واحد من غير ما تفتح تقرير",
  "quick-status": "بتغيّر حالة كام طلب في اليوم، والفتح العادي مش مضايقك",
  "order-automation": "كل طلب عندك بياخد قرار لوحده، ومفيش حالة بتتغير بنفس القاعدة",
  "store": "مش عايز تبيع أونلاين خالص، وكل مبيعاتك بتتم في المحل",
  "dental-materials-pro": "مفيش معمل أسنان عندك ومش بتشتري أقراص زيركونيا أو خامات تفريز",
  "whatsapp-business": "مفيش تواصل مع عملائك على واتساب، وكل اتفاق بيتم في زيارة أو تليفون",
  "internal-courier-fleet": "مفيش مناديب عندك، وبتشحن طلباتك مع شركة مش بتوصّل بنفسك",
  "analytics-basic": "المتجر لسه ما بدأش ومفيش أرقام بتتراقب أصلًا",
  "facebook-ads-pro": "مش بتصرف على إعلانات، ومبيعاتك جاية من عملاء بيجولك لوحدهم",
  "cafe-restaurant-pro": "مفيش مشروبات ولا أطباق بتقدمها، وشغلك مش قايم على رسيبي وطاولات",
  "turbo-analytics": "حجم بياناتك صغير ومفيش اتجاهات محتاجة توقع أو تحليل لحظي",
  "store-pro": "منتجاتك قليلة ومخزنك واحد، والمتجر العادي كفاية معاك",
  "ai-chat-pro": "مفيش محادثات كتير محتاجة فهم، وردودك كلها ثابتة ومعروفة",
  "crm-loyalty": "عميلك بيشتري مرة واحدة ومش بيرجع تاني، فنقاط الولاء مش هتفيده",
  "crm-basic": "بتبيع كاش من غير ما تسجل بيانات العميل، ومش محتاج ملف لكل واحد",
  "ai-image-studio": "عندك مصور وصور منتجاتك جاهزة بجودة كافية",
  "woocommerce-sync": "متجرك على منصة تانية ومفيش ووردبريس بتزامن معاه",
  "unified-inbox": "كل محادثاتك على منصة واحدة ومفيش أكتر من صندوق بتديره",
  "opportunities-pipeline": "بيعتك بتتم في دقيقة، ومفيش صفقة بتاخد أسابيع لحد ما تقفل",
  "order-accounting-sources": "كل طلباتك من قناة واحدة، ومفيش إيراد قناة محتاج تفصله",
  "telegram-business": "جمهورك مش على تليجرام، ومفيش قناة أو جروب بتديره هناك",
  "appointments-pro": "مفيش مواعيد بتحددها للعملاء، والخدمة بتتم أول ما يجي",
  "ai-rag-knowledge": "مفيش محادثات AI شغالة عندك، فمفيش بوت هيقرأ القاعدة دي",
  "break-even": "لسه مش عارف مصاريفك الثابتة، فمفيش أرقام تدخلها في الحساب",
  "stock-analytics": "شغلك كله خدمة أو وقت، ومفيش بضاعة بتتخزن وتتعد كل يوم",
  "revenue-analytics": "مبيعاتك بسيطة وبتعرف إجماليها آخر اليوم من غير أي تقرير",
  "smart-scheduler": "شغال لوحدك وكل مهامك في دماغك ومفيش حد بتوزع عليه شغل",
  "facebook-catalog-shop": "مش بتبيع على فيسبوك وانستجرام ومفيش كتالوج هناك محتاج مزامنة",
  "team-performance-analytics": "مفيش عندك مندوبين ولا فريق تشغيل وشغلك كله على إيدك",
  "hr-attendance-pro": "مفيش ورديات ولا مواعيد دوام مختلفة عندك عشان تضبطها",
  "webhooks-pro": "مفيش أنظمة تانية بتستخدمها ومحتاجة تربطها ببعض أوتوماتيك",
  "invoicing-pro": "بتبيع كاش في المحل ومش محتاج فواتير ولا متابعة مدفوعات",
  "customer-blocks": "عملاءك قليلين ومفيش حد بيطلب ويكنسل ويضايقك عشان تحظره",
  "shipping-optimizer": "كل بيعك استلام من الفرع ومفيش شحن بتدفع فيه",
  "facebook-post": "مش بتنشر محتوى على فيسبوك ولا محتاج تجدول منشورات",
  "conversion-funnel-analytics": "طلباتك بتتقفل على طول ومفيش خطوات كتير بين الطلب والتسليم",
  "delivery-returns-analytics": "بتبيع خدمات أو منتجات رقمية مفيش فيها شحن ولا مرتجع",
  "facebook-pixel-capi": "مفيش إعلانات فيسبوك شغالة ولا موقع بتتابع عليه زوار",
  "blog-pro": "مش بتكتب مقالات ولا بتعتمد على جوجل يجيبلك زوار",
  "gamification-pro": "مفيش فريق ولا عملاء بيرجعولك عشان تحفزهم بالنقاط والشارات",
  "multi-warehouse-pro": "عندك مخزن واحد بس، أو مش مشترك في تطبيق المخزون الشامل",
  "discount-impact": "بتبيع بسعر ثابت ومش بتنزل خصومات ولا بتعمل عروض",
  "telegram-integration": "جمهورك كله على واتساب ومفيش قناة أو جروب تليجرام بتديره",
  "orders-analytics": "طلباتك قليلة لدرجة إنك عارف حالتها كلها من غير تقرير",
  "facebook-pages-connect": "مفيش صفحة فيسبوك ليك ولا بتدير صفحات لعملاء",
  "customer-analytics": "بتبيع كاش لناس مش بتسجل بياناتهم ومش بترجع تعرف مين العميل",
  "woocommerce-pro": "متجرك مش على WooCommerce ومفيش متجر تاني عايز تزامنه",
  "instagram-business": "مفيش حساب انستجرام بترد منه على عملاء ولا بتبيع في الرسائل",
  "hr-attendance": "فريقك صغير أو شغال من البيت ومحدش بيسجل حضور في مكان",
  "payment-methods-analytics": "كل تحصيلك كاش ومفيش أكتر من طريقة دفع عايز تقارنها",
  "today-ops-analytics": "شغلك مش يومي ومفيش طلبات بتتجهز وتخرج في نفس اليوم",
  "cancellation-analytics": "مفيش إلغاءات عندك أو البيع نهائي مش بيتلغي",
  "delivery-rate-analytics": "مفيش توصيل لبيت العميل وكل بيعك بيتستلم من المكان",
  "pricing-strategy": "أسعارك محددة من الموزع أو الماركة ومش من حقك تغيرها",
  "status-movement-analytics": "الطلب عندك بيمشي على طول من غير محطات بيمر بيها",
  "abandoned-cart-analytics": "مفيش سلة أونلاين بتتساب، طلباتك بتيجي بالتليفون أو من الفرع",
  "product-consolidator": "كتالوجك نضيف ومفيش منتجات مكررة محتاجة دمج",
  "clv-calculator": "عميلك بيشتري مرة واحدة ومش بتنفق على اكتساب عملاء جدد",
  "hr-payroll": "مفيش موظفين بمرتبات شهرية عندك ولا سلف وخصومات بتحسبها",
  "hr-assets": "مفيش أجهزة أو عهد بتسلمها للموظفين ومش بتعمل تقييم أداء",
  "coupons-pro": "مش بتعمل كوبونات ولا عروض ترويجية ومبيعاتك بالسعر الأساسي",
  "refund-rate": "منتجاتك مش بتترجع لأنها خدمة أو شغل مخصص للعميل",
  "inventory-pro": "شغلك خدمي ومفيش بضاعة بتتخزن أو بتتعد",
  "profit-loss-report": "مش مسجل تكاليفك ومصروفاتك عشان تقرير الربح يطلع صح",
  "broadcast-pro": "عملاءك عددهم صغير وبتكلمهم فرد فرد على واتساب",
  "dental-lab-app": "انت دكتور أسنان أو عيادة مش معمل تركيبات بيشتغل للدكاترة",
  "product-analytics": "عندك منتج واحد أو اتنين ومبيعاتهم معروفة من غير تقرير",
  "kudos-recognition": "شغال لوحدك أو الفريق صغير ومفيش حد محتاج تقدير مكتوب",
  "variation-analytics": "منتجاتك مفيهاش ألوان ولا مقاسات تفرق في البيع",
  "category-analytics": "كل منتجاتك في تصنيف واحد ومفيش تصنيفات تقارن بينها",
  "coupon-analytics": "مش بتستخدم كوبونات خصم ومبيعاتك بتحصل بالسعر الأساسي",
  "cod-performance-analytics": "كل تحصيلك دفع مقدم أو تحويل ومفيش دفع عند الاستلام",
  "product-fulfillment-analytics": "بتسلم الطلب في نفس اللحظة ومفيش تجهيز بياخد وقت",
  "region-analytics": "بتشتغل في مكان واحد وعملاءك كلهم من نفس المنطقة",
  "returns-analytics": "شغلك مفيهوش مرتجعات، أو المرتجع قليل لدرجة إنه مش محتاج تحليل",
  "conversion-rate-analytics": "مفيش زوار على متجر أونلاين ومبيعاتك بتتم في المكان",
  "hr-recruitment": "مش بتوظف بشكل متكرر ومفيش متقدمين بتحتاج تتابعهم",
  "status-analysis-analytics": "طلباتك كلها بتقف على حالة واحدة ومفيش توزيع عايز تعرفه",
  "amazon-affiliate-pro": "عندك بضاعة خاصة بتبيعها ومش عايز تكسب من كتالوج أمازون",
  "analytics-advanced": "بياناتك قليلة ومش محتاج تقارير مخصصة ولا توقعات",
  "google-tag-manager": "مفيش متجر إلكتروني ولا أكواد تتبع بتحطها",
  "profitability-engine": "بتسعّر بالتجربة ومش بتتابع تكاليف الشحن والإعلان على كل طلب",
};

/** «مش ليك لو…» — prefers the row's own limitations, else the curated line. */
export const getMarketplaceLimitations = (app: {
  slug?: string;
  limitations?: unknown;
}): string | null => {
  const raw = app.limitations;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (raw && typeof raw === "object") {
    const first = Object.values(raw as Record<string, unknown>).find(
      (value) => typeof value === "string" && value.trim(),
    );
    if (typeof first === "string") return first.trim();
  }
  return LIMITATION_COPY[String(app.slug || "").trim()] || null;
};

export const MARKETPLACE_POSITIONING_LABELS: Record<PositioningFieldKey, string> = {
  audience: "مناسبة لـ",
  surface: "تظهر في",
  outcome: "النتيجة",
};

export const getMarketplacePositioning = (
  app: MarketplacePositioningCarrier,
): PositioningDisplayItem | null => {
  const fallbackPositioning = POSITIONING_COPY[String(app.slug || "").trim()];
  const rawPositioning = app.positioning;

  if (!rawPositioning) {
    return fallbackPositioning || null;
  }

  if (typeof rawPositioning === "string") {
    try {
      return getMarketplacePositioning({
        ...app,
        positioning: JSON.parse(rawPositioning),
      });
    } catch {
      return fallbackPositioning || null;
    }
  }

  if (!isRecord(rawPositioning)) {
    return fallbackPositioning || null;
  }

  const normalizedPositioning: PositioningDisplayItem = {
    audience:
      (isNonEmptyString(rawPositioning.audience)
        ? rawPositioning.audience
        : fallbackPositioning?.audience) || "مناسبة لفرق تبحث عن قيمة تشغيلية أو نمو مباشر.",
    surface:
      (isNonEmptyString(rawPositioning.surface)
        ? rawPositioning.surface
        : fallbackPositioning?.surface) || "داخل مسار العمل المرتبط بهذه الأداة.",
    outcome:
      (isNonEmptyString(rawPositioning.outcome)
        ? rawPositioning.outcome
        : fallbackPositioning?.outcome) || "نتيجة أوضح وأسرع من تشغيل هذه الأداة.",
  };

  return normalizedPositioning;
};

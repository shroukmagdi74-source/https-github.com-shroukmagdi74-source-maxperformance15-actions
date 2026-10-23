import React from "react";

export interface Template {
  id: string | null;
  name: string;
  category: string;
  eventType: string;
  content: string;
  isActive: boolean;
  isDefault: boolean;
  channel?: "AUTO" | "BAILEYS" | "META_CLOUD" | string;
  sentCount?: number;
  deliveredCount?: number;
  readCount?: number;
  metaTemplateName?: string | null;
  metaTemplateStatus?: string | null;
}

export type NoticeTone = "success" | "error" | "warning" | "info";

export interface TemplateFormState {
  name: string;
  category: string;
  eventType: string;
  content: string;
  isActive: boolean;
  channel: "AUTO" | "BAILEYS" | "META_CLOUD";
  metaTemplateName?: string;
}

export interface WhatsAppTemplatesProps {
  companyId?: string;
  companyName?: string;
  superAdminMode?: boolean;
}

export interface MetaSessionOption {
  id: string;
  name: string;
  provider?: string;
  metaDisplayPhoneNumber?: string;
}

export const categoryBadgeClasses: Record<string, string> = {
  ORDERS:
    "border-blue-300/70 bg-blue-500/10 text-blue-800 dark:border-blue-500/40 dark:text-blue-200",
  PRODUCTS:
    "border-violet-300/70 bg-violet-500/10 text-violet-800 dark:border-violet-500/40 dark:text-violet-200",
  MARKETING:
    "border-pink-300/70 bg-pink-500/10 text-pink-800 dark:border-pink-500/40 dark:text-pink-200",
  CUSTOMER:
    "border-sky-300/70 bg-sky-500/10 text-sky-800 dark:border-sky-500/40 dark:text-sky-200",
  ABANDONED_CART:
    "border-orange-300/70 bg-orange-500/10 text-orange-800 dark:border-orange-500/40 dark:text-orange-200",
  HR: "border-teal-300/70 bg-teal-500/10 text-teal-800 dark:border-teal-500/40 dark:text-teal-200",
  SYSTEM:
    "border-slate-300/70 bg-slate-500/10 text-slate-700 dark:border-slate-500/40 dark:text-slate-200",
};

export const SUPER_ADMIN_EVENT_TYPES = [
  "NEW_SIGNUP_WELCOME",
  "NEW_SIGNUP_ADMIN_ALERT",
  "SUBSCRIPTION_CREATED",
  "SUBSCRIPTION_RENEWED",
  "SUBSCRIPTION_CANCELLED",
] as const;

export const SUPER_ADMIN_EVENT_TYPE_SET = new Set<string>(SUPER_ADMIN_EVENT_TYPES);
export const SUPER_ADMIN_CATEGORY_SET = new Set<string>(["CUSTOMER", "SYSTEM"]);

export const EVENT_TRIGGERS: Record<string, string> = {
  LOYALTY_POINTS_AWARDED: "عند تسليم الطلب (احتساب النقاط المكتسبة)",
  LOYALTY_TIER_UPGRADED: "عند ترقية تصنيف العميل لمستوى أعلى",
  LOYALTY_TIER_DOWNGRADED: "عند تراجع مستوى العميل",
  LOYALTY_POINTS_EXPIRY_WARNING: "قبل انتهاء صلاحية النقاط بأيام محددة",
  LOYALTY_POINTS_EXPIRED: "عند انتهاء صلاحية النقاط (مهمة يومية)",
  LOYALTY_POINTS_REDEEMED: "عند استبدال النقاط في طلب جديد",
  CASHBACK_CREDITED: "عند تسليم الطلب واحتساب رصيد الكاش باك",
  CASHBACK_REVERSED: "عند إرجاع الطلب أو إلغائه (استرداد الكاش باك)",
  CUSTOMER_QUALITY_UPGRADED: "عند ارتفاع تصنيف جودة العميل (VIP)",
  CUSTOMER_QUALITY_DOWNGRADED: "عند انخفاض تصنيف جودة العميل",
  AUTO_DISCOUNT_COUPON_GRANTED: "عند تسليم الطلب وإصدار كوبون الخصم التلقائي",
  AUTO_DISCOUNT_COUPON_EXPIRING: "قبل انتهاء صلاحية كوبون الخصم بـ 3 أيام",
  AUTO_DISCOUNT_CASHBACK_CONVERTED: "عند انتهاء صلاحية الكوبون وتحويله لكاش باك",
  BIRTHDAY_WISH: "يومياً الساعة 12:00 ظهراً (تلقائي بحسب تاريخ الميلاد)",
  REVIEW_REQUEST: "بعد 7 أيام من تسليم الطلب للعميل (طلب تقييم التجربة)",
  CADENCE_PRODUCT: "كل 10 أيام للعملاء غير المتفاعلين (ترشيح منتج جديد)",
  CADENCE_BALANCE: "كل 15 يوماً لتذكير العميل برصيد محفظته والنقاط",
  CADENCE_REFERRAL: "كل 30 يوماً لدعوة الأصدقاء ومشاركة كود الإحالة",
  CADENCE_TIER: "كل 30 يوماً لتذكير العميل بمزايا مستواه الحالي",
  CART_ABANDONED_1H: "بعد ساعة واحدة من ترك السلة دون إتمام الشراء",
  CART_ABANDONED_24H: "بعد 24 ساعة من ترك السلة (تذكير ثانٍ)",
  CART_ABANDONED_72H: "بعد 72 ساعة من ترك السلة (تذكير نهائي)",
  CART_ABANDONED_WITH_DISCOUNT: "تذكير سلة متروكة مع كود خصم تحفيزي خاص",
  BACK_IN_STOCK: "عند توفر كمية جديدة من منتج بعد نفاد المخزون",
  PRICE_DROP: "عند تخفيض سعر منتج في قائمة رغبات العميل",
  NEW_PRODUCT: "عند نشر منتج جديد بالمتجر",
  NEW_SIGNUP_WELCOME: "فور تسجيل الشركة بالمنصة (رسالة ترحيبية)",
  NEW_SIGNUP_ADMIN_ALERT: "تنبيه للإدارة فور إنشاء حساب جديد",
  SUBSCRIPTION_CREATED: "عند تأكيد تفعيل اشتراك المتجر",
  SUBSCRIPTION_RENEWED: "عند تجديد الاشتراك الشهري أو السنوي",
  SUBSCRIPTION_CANCELLED: "عند إلغاء أو انتهاء الاشتراك",
};

export const CATEGORY_EVENT_MAP: Record<string, string[]> = {
  CUSTOMER: [
    "LOYALTY_POINTS_AWARDED",
    "LOYALTY_TIER_UPGRADED",
    "LOYALTY_TIER_DOWNGRADED",
    "LOYALTY_POINTS_EXPIRY_WARNING",
    "LOYALTY_POINTS_EXPIRED",
    "LOYALTY_POINTS_REDEEMED",
    "CASHBACK_CREDITED",
    "CASHBACK_REVERSED",
    "CUSTOMER_QUALITY_UPGRADED",
    "CUSTOMER_QUALITY_DOWNGRADED",
    "AUTO_DISCOUNT_COUPON_GRANTED",
    "AUTO_DISCOUNT_COUPON_EXPIRING",
    "AUTO_DISCOUNT_CASHBACK_CONVERTED",
    "BIRTHDAY_WISH",
    "REVIEW_REQUEST",
    "CADENCE_PRODUCT",
    "CADENCE_BALANCE",
    "CADENCE_REFERRAL",
    "CADENCE_TIER",
  ],
  PRODUCTS: ["BACK_IN_STOCK", "PRICE_DROP", "NEW_PRODUCT"],
  ABANDONED_CART: [
    "CART_ABANDONED_1H",
    "CART_ABANDONED_24H",
    "CART_ABANDONED_72H",
    "CART_ABANDONED_WITH_DISCOUNT",
  ],
  MARKETING: ["PROMOTIONAL", "COUPON_SENT", "BIRTHDAY_WISH", "ANNOUNCEMENT"],
  HR: [
    "ATTENDANCE_REMINDER",
    "ATTENDANCE_CONFIRMED",
    "CHECKOUT_CONFIRMED",
    "LEAVE_APPROVED",
    "LEAVE_REJECTED",
    "PERMISSION_APPROVED",
    "PERMISSION_REJECTED",
    "MANUAL_DEDUCTION",
    "PAYROLL_READY",
    "BIRTHDAY_EMPLOYEE",
    "WARNING_ISSUED",
  ],
  SYSTEM: [
    "NEW_SIGNUP_WELCOME",
    "NEW_SIGNUP_ADMIN_ALERT",
    "SUBSCRIPTION_CREATED",
    "SUBSCRIPTION_RENEWED",
    "SUBSCRIPTION_CANCELLED",
    "NEWSLETTER_SUBSCRIBED",
    "BENEFIT_GRANTED",
    "OTP",
  ],
};

export interface VariableItem {
  var: string;
  label: string;
  desc: string;
}

export const CATEGORY_VARIABLES: Record<string, VariableItem[]> = {
  CUSTOMER: [
    { var: "{customerName}", label: "اسم العميل", desc: "اسم العميل المسجل" },
    { var: "{points}", label: "النقاط", desc: "عدد النقاط المكتسبة أو المستبدلة" },
    { var: "{currentPoints}", label: "الرصيد الكلي", desc: "إجمالي رصيد النقاط الحالي" },
    { var: "{cashAmount}", label: "قيمة الكاش باك", desc: "المبلغ المالي المضاف أو المخصوم" },
    { var: "{currency}", label: "العملة", desc: "العملة الرسمية (ج.م / ر.س)" },
    { var: "{balance}", label: "رصيد المحفظة", desc: "إجمالي الرصيد النقدي للمحفظة" },
    { var: "{tierName}", label: "اسم المستوى", desc: "اسم مستوى الولاء الجديد" },
    { var: "{expiryDate}", label: "تاريخ الانتهاء", desc: "تاريخ انتهاء صلاحية النقاط أو الكوبون" },
    { var: "{orderNumber}", label: "رقم الطلب", desc: "رقم الطلب المرتبط بالعملية" },
    { var: "{reason}", label: "السبب", desc: "سبب المعاملة أو الإشعار" },
    { var: "{programName}", label: "برنامج الولاء", desc: "اسم برنامج الولاء للشركة" },
    { var: "{qualityTier}", label: "درجة الجودة", desc: "تصنيف العميل (VIP / عالي / متوسط)" },
    { var: "{discountPercent}", label: "نسبة الخصم", desc: "نسبة خصم الكوبون" },
    { var: "{voucherAmount}", label: "قيمة الكوبون", desc: "قيمة كوبون الخصم بالعملة" },
    { var: "{validityDays}", label: "أيام الصلاحية", desc: "عدد أيام صلاحية الكوبون" },
  ],
  PRODUCTS: [
    { var: "{customerName}", label: "اسم العميل", desc: "اسم العميل" },
    { var: "{productName}", label: "اسم المنتج", desc: "اسم المنتج المستهدف" },
    { var: "{price}", label: "السعر الحالي", desc: "سعر المنتج الحالي" },
    { var: "{oldPrice}", label: "السعر السابق", desc: "السعر قبل الخصم" },
    { var: "{discountPercent}", label: "نسبة الخصم", desc: "النسبة المئوية للتخفيض" },
    { var: "{productUrl}", label: "رابط المنتج", desc: "رابط مباشر لصفحة الشراء" },
  ],
  ABANDONED_CART: [
    { var: "{customerName}", label: "اسم العميل", desc: "اسم العميل صاحب السلة" },
    { var: "{cartTotal}", label: "إجمالي السلة", desc: "قيمة المنتجات في السلة" },
    { var: "{itemsCount}", label: "عدد العناصر", desc: "عدد المنتجات المتروكة" },
    { var: "{cartUrl}", label: "رابط السلة", desc: "رابط استرجاع وإكمال الطلب" },
    { var: "{discountCode}", label: "كود الخصم", desc: "كوبون تحفيزي مخصص" },
  ],
  MARKETING: [
    { var: "{customerName}", label: "اسم العميل", desc: "اسم العميل" },
    { var: "{promoTitle}", label: "عنوان العرض", desc: "اسم أو عنوان الحملة الترويجية" },
    { var: "{couponCode}", label: "كود الكوبون", desc: "كود الخصم الترويجي" },
    { var: "{discountPercent}", label: "نسبة الخصم", desc: "نسبة التخفيض" },
    { var: "{validUntil}", label: "تاريخ الانتهاء", desc: "آخر موعد للاستفادة" },
    { var: "{storeUrl}", label: "رابط المتجر", desc: "رابط المتجر الإلكتروني" },
  ],
  HR: [
    { var: "{employeeName}", label: "اسم الموظف", desc: "اسم الموظف" },
    { var: "{date}", label: "التاريخ", desc: "تاريخ المعاملة" },
    { var: "{time}", label: "الوقت", desc: "وقت الحضور أو الانصراف" },
    { var: "{status}", label: "الحالة", desc: "حالة الطلب أو السجل" },
    { var: "{amount}", label: "المبلغ", desc: "قيمة الخصم أو المكافأة أو الراتب" },
  ],
  SYSTEM: [
    { var: "{companyName}", label: "اسم الشركة", desc: "اسم الشركة المسجلة" },
    { var: "{adminName}", label: "اسم المسؤول", desc: "اسم صاحب الحساب" },
    { var: "{planName}", label: "اسم الباقة", desc: "نوع الاشتراك" },
    { var: "{expiryDate}", label: "تاريخ الانتهاء", desc: "تاريخ انتهاء صلاحية الاشتراك" },
    { var: "{loginUrl}", label: "رابط الدخول", desc: "رابط منصة MaxP" },
  ],
};

export const createEmptyTemplateForm = (
  superAdminMode = false,
): TemplateFormState => ({
  name: "",
  category: superAdminMode ? "CUSTOMER" : "PRODUCTS",
  eventType: superAdminMode ? "NEW_SIGNUP_WELCOME" : "",
  content: "",
  isActive: true,
  channel: "AUTO",
  metaTemplateName: "",
});

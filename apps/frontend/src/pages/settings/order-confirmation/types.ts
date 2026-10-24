import type { OrderConfirmationUser } from "../../../services/orderConfirmationService";

export const SOURCE_OPTIONS = [
  { value: "ai_conversation", label: "محادثة تلقائية" },
  { value: "manual", label: "يدوي" },
  { value: "storefront", label: "المتجر" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "pos", label: "POS" },
  { value: "api", label: "API" },
  { value: "import", label: "استيراد" },
  { value: "unknown", label: "غير معروف" },
];

export const REQUIRE_STATUS_OPTIONS = [
  { value: "PENDING", label: "جديد / قيد الانتظار" },
  { value: "PROCESSING", label: "قيد المعالجة المبدئية" },
];

export const CONFIRM_TARGET_STATUS_OPTIONS = [
  { value: "CONFIRMED", label: "مؤكد (الافتراضي للمستودع)" },
  { value: "PROCESSING", label: "قيد التجهيز بالمستودع" },
  { value: "READY_TO_SHIP", label: "جاهز للشحن" },
];

export const MATCH_MODE_OPTIONS = [
  {
    value: "any",
    label: "مطابقة أي شرط (OR)",
    description: "يكفي أن يطابق الطلب مصدرًا أو حالةً واحدة.",
  },
  {
    value: "all",
    label: "مطابقة كل الشروط (AND)",
    description: "يجب أن يطابق الطلب المصدر والحالة معًا.",
  },
];

export const ROLE_OPTIONS = [
  { value: "OWNER", label: "المالك" },
  { value: "COMPANY_ADMIN", label: "مدير الشركة" },
  { value: "MANAGER", label: "مدير" },
  { value: "AGENT", label: "موظف" },
];

export const ROLE_LABELS = ROLE_OPTIONS.reduce<Record<string, string>>((acc, role) => {
  acc[role.value] = role.label;
  return acc;
}, {});

export const AVAILABILITY_LABELS: Record<string, string> = {
  available: "متاح",
  busy: "مشغول",
  away: "بعيد",
  offline: "غير متصل",
};

export type MultiRuleEntry = { keys: string[]; userIds: string[] };
export type ValueRuleEntry = { minTotal: string; maxTotal: string; userIds: string[] };
export type MultiSelectOption = { value: string; label: string; description?: string };

export const formatUserLabel = (user: OrderConfirmationUser) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || user.id;

export const formatRoleLabel = (role?: string | null) =>
  role ? ROLE_LABELS[role] || role : "بدون دور";

export const formatAvailabilityLabel = (availability?: string | null) =>
  availability ? AVAILABILITY_LABELS[availability] || availability : "غير محدد";

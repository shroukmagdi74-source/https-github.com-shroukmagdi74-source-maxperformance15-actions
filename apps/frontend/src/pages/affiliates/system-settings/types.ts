export interface AffiliateSettingsData {
  commissionType: string;
  commissionRate: number;
  cookieDuration: number;
  termsAndConditions: string;
  isActive: boolean;
  autoApproveAffiliates: boolean;
  defaultMinPayout: number;
  defaultCanCreateOrdersForOthers: boolean;
  defaultCanViewCustomerData: boolean;
  requireIdentityDocument: boolean;
  identityDocumentLabel: string;
  payoutSlaDays: number;
  platformMarginType: string;
  platformMarginValue: number;
  commissionOnStatus: string;
}

export interface ApiSuccess<T> {
  success: boolean;
  data: T;
  message?: string;
  recalculatedProducts?: number;
}

export const VALID_COMMISSION_TYPES = [
  "PERCENTAGE",
  "MARKUP",
  "FIXED",
  "FIXED_PER_ITEM",
] as const;

export const VALID_PLATFORM_MARGIN_TYPES = [
  "FIXED",
  "PERCENTAGE",
] as const;

export const DEFAULT_SETTINGS: AffiliateSettingsData = {
  commissionType: "PERCENTAGE",
  commissionRate: 5.0,
  cookieDuration: 30,
  termsAndConditions: "",
  isActive: true,
  autoApproveAffiliates: false,
  defaultMinPayout: 100,
  defaultCanCreateOrdersForOthers: true,
  defaultCanViewCustomerData: true,
  requireIdentityDocument: false,
  identityDocumentLabel: "مستند إثبات الهوية",
  payoutSlaDays: 3,
  platformMarginType: "FIXED",
  platformMarginValue: 0,
  commissionOnStatus: "CONFIRMED",
};

export const parseNumberInput = (value: string, fallback: number): number => {
  if (value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const toBoolean = (val: any, fallback: boolean): boolean => {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  return fallback;
};

export const normalizeSettings = (
  incoming: Partial<AffiliateSettingsData> = {},
): AffiliateSettingsData => ({
  commissionType: incoming.commissionType || "PERCENTAGE",
  commissionRate: Number(incoming.commissionRate ?? 5),
  cookieDuration: Number(incoming.cookieDuration ?? 30),
  termsAndConditions: incoming.termsAndConditions || "",
  isActive: toBoolean(incoming.isActive, true),
  autoApproveAffiliates: toBoolean(incoming.autoApproveAffiliates, false),
  defaultMinPayout: Number(incoming.defaultMinPayout ?? 100),
  defaultCanCreateOrdersForOthers: toBoolean(
    incoming.defaultCanCreateOrdersForOthers,
    true,
  ),
  defaultCanViewCustomerData: toBoolean(
    incoming.defaultCanViewCustomerData,
    true,
  ),
  requireIdentityDocument: toBoolean(
    incoming.requireIdentityDocument,
    false,
  ),
  identityDocumentLabel:
    incoming.identityDocumentLabel || "مستند إثبات الهوية",
  payoutSlaDays: Number(incoming.payoutSlaDays ?? 3),
  platformMarginType: incoming.platformMarginType || "FIXED",
  platformMarginValue: Number(incoming.platformMarginValue ?? 0),
  commissionOnStatus: incoming.commissionOnStatus || "CONFIRMED",
});

export const validateSettings = (nextSettings: AffiliateSettingsData): string | null => {
  if (!VALID_COMMISSION_TYPES.includes(nextSettings.commissionType as any)) {
    return "نوع العمولة غير صالح";
  }

  if (
    !VALID_PLATFORM_MARGIN_TYPES.includes(
      nextSettings.platformMarginType as any,
    )
  ) {
    return "نوع ربح المنصة غير صالح";
  }

  const commissionRate = Number(nextSettings.commissionRate);
  if (!Number.isFinite(commissionRate) || commissionRate < 0) {
    return "قيمة عمولة المسوق غير صالحة";
  }

  if (nextSettings.commissionType === "PERCENTAGE" && commissionRate > 100) {
    return "نسبة عمولة المسوق لا يمكن أن تتجاوز 100%";
  }

  if (nextSettings.commissionType === "MARKUP" && commissionRate > 1000000) {
    return "قيمة هامش ربح المسوق أكبر من الحد المسموح";
  }

  if (nextSettings.commissionType === "FIXED" && commissionRate > 1000000) {
    return "المبلغ الثابت لكل طلب أكبر من الحد المسموح";
  }

  if (
    nextSettings.commissionType === "FIXED_PER_ITEM" &&
    commissionRate > 1000000
  ) {
    return "المبلغ الثابت لكل قطعة أكبر من الحد المسموح";
  }

  const platformMarginValue = Number(nextSettings.platformMarginValue);
  if (!Number.isFinite(platformMarginValue) || platformMarginValue < 0) {
    return "قيمة ربح المنصة غير صالحة";
  }

  if (
    nextSettings.platformMarginType === "PERCENTAGE" &&
    platformMarginValue > 1000
  ) {
    return "نسبة ربح المنصة لا يمكن أن تتجاوز 1000%";
  }

  if (
    nextSettings.platformMarginType === "FIXED" &&
    platformMarginValue > 1000000
  ) {
    return "قيمة ربح المنصة أكبر من الحد المسموح";
  }

  const cookieDuration = Number(nextSettings.cookieDuration);
  if (
    !Number.isInteger(cookieDuration) ||
    cookieDuration < 1 ||
    cookieDuration > 365
  ) {
    return "مدة الكوكيز يجب أن تكون بين 1 و365 يوم";
  }

  const defaultMinPayout = Number(nextSettings.defaultMinPayout);
  if (!Number.isFinite(defaultMinPayout) || defaultMinPayout < 0) {
    return "الحد الأدنى الافتراضي للسحب غير صالح";
  }

  if (defaultMinPayout > 1000000) {
    return "الحد الأدنى الافتراضي للسحب أكبر من الحد المسموح";
  }

  if (
    nextSettings.requireIdentityDocument &&
    (!nextSettings.identityDocumentLabel ||
      nextSettings.identityDocumentLabel.trim().length < 3)
  ) {
    return "اسم مستند الاعتماد يجب أن يحتوي على 3 أحرف على الأقل";
  }

  const payoutSlaDays = Number(nextSettings.payoutSlaDays);
  if (!Number.isInteger(payoutSlaDays) || payoutSlaDays < 1 || payoutSlaDays > 60) {
    return "مدة معالجة السحب يجب أن تكون بين 1 و60 يوم";
  }

  return null;
};

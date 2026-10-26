export interface MarketplaceApp {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  category: string;
  description: string;
  imageUrl?: string;
  pricingModel: string; // FREE, PAY_PER_USE, SUBSCRIPTION
  unitPrice?: number;
  unitName?: string;
  freeUnitsIncluded?: number;
  minimumCharge?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  trialDays: number;
  isActive: boolean;
  isInstalled?: boolean;
}

export type SortField = "name" | "monthlyPrice" | "unitPrice" | "trialDays";
export type SortOrder = "asc" | "desc" | null;

export const APP_CATEGORIES = [
  "ECOMMERCE", "MARKETING", "ANALYTICS", "CRM", "AI",
  "COMMUNICATION", "FINANCE", "GAMIFICATION", "HR",
  "INTEGRATION", "PRODUCTIVITY", "THEME", "OTHER",
];

export const USAGE_UNITS = [
  "message", "request", "order", "user", "session", "GB",
  "month", "email", "sms", "call", "lead", "product",
];

export const BULK_DELETE_ID = "__bulk__";

export const getApiErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const response = (error as { response?: unknown }).response;
  if (!response || typeof response !== "object") return undefined;
  const data = (response as { data?: unknown }).data;
  if (!data || typeof data !== "object") return undefined;
  const message = (data as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : undefined;
};

export const buildAppPayload = (app: Partial<MarketplaceApp>, slug: string) => ({
  name: app.name,
  slug,
  category: app.category,
  description: app.description || "",
  nameEn: app.nameEn || "",
  imageUrl: app.imageUrl || "",
  pricingModel: app.pricingModel,
  monthlyPrice: Number(app.monthlyPrice) || 0,
  yearlyPrice: Number(app.yearlyPrice) || 0,
  unitPrice: Number(app.unitPrice) || 0,
  unitName: app.unitName || "",
  freeUnitsIncluded: Number(app.freeUnitsIncluded) || 0,
  minimumCharge: Number(app.minimumCharge) || 0,
  trialDays: Number(app.trialDays) || 0,
  isActive: app.isActive ?? true,
});

export const sortApps = (
  list: MarketplaceApp[],
  field: SortField,
  order: SortOrder,
  language: string,
): MarketplaceApp[] => {
  if (!order || !field) return list;
  const pick = (app: MarketplaceApp): string | number => {
    if (field === "name") return language === "ar" ? app.name : app.nameEn || app.name;
    if (field === "monthlyPrice") {
      return app.pricingModel === "SUBSCRIPTION"
        ? app.monthlyPrice || 0
        : app.pricingModel === "FREE"
          ? 0
          : -1;
    }
    if (field === "unitPrice") return app.unitPrice || 0;
    return app.trialDays || 0;
  };
  return [...list].sort((a, b) => {
    const valA = pick(a);
    const valB = pick(b);
    if (typeof valA === "string" && typeof valB === "string") {
      return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return order === "asc"
      ? (valA as number) - (valB as number)
      : (valB as number) - (valA as number);
  });
};

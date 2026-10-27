import {
  FacebookCampaign,
  FacebookAdSet,
  FacebookAd,
  CAMPAIGN_OBJECTIVES,
} from "../../../services/facebookAdsService";

export type CampaignWithCurrency = FacebookCampaign & {
  adAccount?: { currency?: string | null } | null;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "response" in error) {
    const response = error.response as {
      data?: { error?: string };
    };

    if (typeof response.data?.error === "string") {
      return response.data.error;
    }
  }

  return fallback;
};

export const REGION_ARABIC_NAMES: Record<string, string> = {
  Cairo: "القاهرة",
  Alexandria: "الإسكندرية",
  Giza: "الجيزة",
  "Al Sharqia": "الشرقية",
  Dakahlia: "الدقهلية",
  Beheira: "البحيرة",
  Gharbia: "الغربية",
  Monufia: "المنوفية",
  "Kafr el Sheikh": "كفر الشيخ",
  "Kafr el-Sheikh": "كفر الشيخ",
  "Port Said": "بورسعيد",
  Damietta: "دمياط",
  Qalyubia: "القليوبية",
  Suez: "السويس",
  Ismailia: "الإسماعيلية",
  Faiyum: "الفيوم",
  "Beni Suef": "بني سويف",
  Minya: "المنيا",
  Asyut: "أسيوط",
  Sohag: "سوهاج",
  Qena: "قنا",
  Luxor: "الأقصر",
  Aswan: "أسوان",
  "Red Sea": "البحر الأحمر",
  "New Valley": "الوادي الجديد",
  Matrouh: "مطروح",
  "North Sinai": "شمال سيناء",
  "South Sinai": "جنوب سيناء",
};

export const translateRegion = (name: string, isEn: boolean): string => {
  if (isEn) return name;
  return REGION_ARABIC_NAMES[name] || name;
};

export const parseLocations = (locationsRaw: unknown, isEn = false): string | null => {
  if (!locationsRaw) return null;
  let parsed: unknown = locationsRaw;

  if (typeof locationsRaw === "string") {
    try {
      parsed = JSON.parse(locationsRaw);
    } catch {
      if (
        locationsRaw.length < 40 &&
        !locationsRaw.includes("{") &&
        !locationsRaw.includes("[")
      ) {
        return locationsRaw;
      }
      return null;
    }
  }

  if (Array.isArray(parsed)) {
    const names = parsed
      .map((item) =>
        typeof item === "string" ? item : (item as { name?: string })?.name || "",
      )
      .filter(Boolean);
    if (names.length === 0) return null;
    const translated = names.map((n) => translateRegion(n, isEn));
    if (translated.length <= 3) return translated.join("، ");
    return `${translated.slice(0, 3).join("، ")} (+${translated.length - 3} ${isEn ? "more" : "أخرى"})`;
  }

  if (parsed && typeof parsed === "object") {
    const p = parsed as {
      cities?: Array<{ name?: string }>;
      regions?: Array<{ name?: string }>;
      countries?: string[];
    };
    const names: string[] = [];

    if (Array.isArray(p.regions)) {
      p.regions.forEach((r) => {
        if (r.name) {
          const cleanName = r.name.replace(/\s+Governorate$/i, "").trim();
          if (!names.includes(cleanName)) names.push(cleanName);
        }
      });
    }

    if (Array.isArray(p.cities)) {
      p.cities.forEach((c) => {
        if (c.name) {
          const cleanName = c.name.replace(/\s+Governorate$/i, "").trim();
          if (!names.includes(cleanName)) names.push(cleanName);
        }
      });
    }

    if (names.length === 0 && Array.isArray(p.countries)) {
      names.push(...p.countries);
    }

    if (names.length > 0) {
      const translated = names.map((n) => translateRegion(n, isEn));
      if (translated.length <= 3) {
        return translated.join("، ");
      }
      return `${translated.slice(0, 3).join("، ")} (+${translated.length - 3} ${isEn ? "more" : "محافظات"})`;
    }
  }

  return null;
};

export const getObjectiveLabel = (objective: string): string => {
  const obj = CAMPAIGN_OBJECTIVES.find((o) => o.value === objective);
  return obj?.label || objective;
};

export const getStatusBadge = (status: string): string => {
  const badges: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    PAUSED: "bg-yellow-100 text-yellow-800",
    ARCHIVED: "bg-gray-100 text-gray-800",
    DELETED: "bg-red-100 text-red-800",
  };
  return badges[status] || "bg-gray-100 text-gray-800";
};

export const getStatusLabel = (status: string, isEn: boolean): string => {
  const labels: Record<string, string> = {
    ACTIVE: isEn ? "Active" : "نشط",
    PAUSED: isEn ? "Paused" : "متوقف",
    ARCHIVED: isEn ? "Archived" : "مؤرشف",
    DELETED: isEn ? "Deleted" : "محذوف",
  };
  return labels[status] || status;
};

export const formatCurrency = (value?: number, currency = "EGP", isEn = false): string =>
  new Intl.NumberFormat(isEn ? "en-US" : "ar-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0);

export const formatNumber = (value?: number, isEn = false): string =>
  new Intl.NumberFormat(isEn ? "en-US" : "ar-EG").format(value || 0);

export const formatPercent = (value?: number, isEn = false): string =>
  `${new Intl.NumberFormat(isEn ? "en-US" : "ar-EG", {
    maximumFractionDigits: 2,
  }).format(value || 0)}%`;

export interface CustomerLoyaltyTier {
  id: string;
  name: string;
  nameAr?: string;
  minPoints: number;
  maxPoints?: number;
  minSpent?: number;
  maxSpent?: number;
  minItems?: number;
  maxItems?: number;
  calculationType?: string;
  benefits: any;
  discountPercent?: number;
  freeShipping?: boolean;
  rawBenefits?: any;
  targetGovernorates?: string[];
  conditions?: {
    minOrders?: number;
    minSpent?: number;
  } | null;
  color: string;
  icon: string;
  customersCount: number;
  programId: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  nameAr?: string;
  type?: string;
  status?: string;
}

export interface TierPresetPack {
  key: string;
  name: string;
  description: string;
  count: number;
  icon: string;
}

export const EGYPT_GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "القليوبية",
  "الدقهلية",
  "الشرقية",
  "المنوفية",
  "الغربية",
  "البحيرة",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "كفر الشيخ",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "الوادي الجديد",
  "مطروح",
  "شمال سيناء",
  "جنوب سيناء"
];

export const TIER_PRESET_PACKS: TierPresetPack[] = [
  { key: "classic5", name: "كلاسيك — 5 مستويات", description: "برونز، فضة، ذهب، بلاتين، دايموند", count: 5, icon: "crown" },
  { key: "stars10", name: "نجوم — 10 مستويات", description: "10 مستويات متدرجة بأسلوب الألعاب", count: 10, icon: "trophy" },
  { key: "vip3", name: "VIP — 3 مستويات", description: "مستويات فاخرة بقيمة عالية", count: 3, icon: "gem" },
];

export const normalizeBenefits = (b: any): string[] => {
  if (Array.isArray(b)) return b.map(String).filter(x => x.trim() !== "");
  if (b && typeof b === "object") {
    const items: string[] = [];
    if (b.freeShipping) items.push("شحن مجاني");
    if (b.priorityShipping) items.push("شحن سريع / أولوية");
    if (Number(b.discountPercent) > 0) items.push(`خصم ${b.discountPercent}%`);
    if (b.customText) items.push(b.customText);
    return items;
  }
  return [];
};

export const parseTierFromApi = (t: any): CustomerLoyaltyTier => {
  let raw = t.benefits;
  if (typeof raw === "string") {
    try { raw = JSON.parse(raw); } catch { raw = {}; }
  }
  let discountPercent = Number(t.discountPercent || 0);
  let freeShipping = Boolean(t.freeShipping);

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    if (raw.discountPercent != null) discountPercent = Number(raw.discountPercent) || 0;
    if (raw.freeShipping) freeShipping = true;
    if (Array.isArray(raw.items)) {
      for (const item of raw.items) {
        const str = String(item);
        if (/شحن\s*مجاني|free\s*shipping/i.test(str)) freeShipping = true;
        const m = str.match(/(?:خصم|discount)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*%/i) || str.match(/(\d+(?:\.\d+)?)\s*%\s*(?:خصم|discount)/i);
        if (m) discountPercent = parseFloat(m[1]) || 0;
      }
    }
  } else if (Array.isArray(raw)) {
    for (const item of raw) {
      const str = String(item);
      if (/شحن\s*مجاني|free\s*shipping/i.test(str)) freeShipping = true;
      const m = str.match(/(?:خصم|discount)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*%/i) || str.match(/(\d+(?:\.\d+)?)\s*%\s*(?:خصم|discount)/i);
      if (m) discountPercent = parseFloat(m[1]) || 0;
    }
  }

  return {
    ...t,
    discountPercent,
    freeShipping,
    rawBenefits: raw,
    benefits: normalizeBenefits(raw || { discountPercent, freeShipping }),
  };
};

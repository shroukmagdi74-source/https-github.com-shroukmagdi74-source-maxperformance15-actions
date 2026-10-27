export type JsonRecord = Record<string, unknown>;
export type ManagedRelationType = "upsell" | "crossSell" | "related";
export type RelationBuckets = Record<ManagedRelationType, string[]>;

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  isActive: boolean;
  categoryName: string;
  imageUrl?: string;
  metadata: JsonRecord;
  relations: RelationBuckets;
}

export interface RelationTabMeta {
  id: ManagedRelationType;
  label: string;
  subtitle: string;
  badgeTone: "green" | "blue" | "purple";
  helpText: string;
  placementBadge: string;
}

export const RELATION_TABS: RelationTabMeta[] = [
  {
    id: "upsell",
    label: "منتجات الترقية (Upsell)",
    subtitle: "بدائل أفضل أو أعلى قيمة لتشجيع العميل على الترقية.",
    badgeTone: "green",
    helpText: "تظهر في صفحة الشكر بعد الدفع أو كعرض ترقية مباشر لبديل أفضل.",
    placementBadge: "Thank You & PDP",
  },
  {
    id: "crossSell",
    label: "منتجات مكملة (Cross-sell)",
    subtitle: "إضافات تكميلية ترفع قيمة سلة الشراء ومكملة للمنتج.",
    badgeTone: "blue",
    helpText: "تظهر داخل سلة الشراء وتحت المنتج كـ (Frequently Bought Together).",
    placementBadge: "Cart & PDP",
  },
  {
    id: "related",
    label: "منتجات مشابهة (Related)",
    subtitle: "منتجات قريبة من نفس الفئة والاهتمام.",
    badgeTone: "purple",
    helpText: "تغذي شبكة المنتجات المقترحة أسفل صفحة المنتج بدون ضغط بيعي.",
    placementBadge: "Product Page",
  },
];

export const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const parseJsonRecord = (value: unknown): JsonRecord => {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return isRecord(value) ? value : {};
};

export const extractRelationIds = (metadata: JsonRecord, key: string): string[] => {
  const value = metadata[key];
  if (!Array.isArray(value)) return [];
  return value.map((entry) => String(entry || "").trim()).filter(Boolean);
};

export const normalizeProduct = (rawItem: unknown): CatalogProduct => {
  const raw = isRecord(rawItem) ? rawItem : {};
  const rawPrice = Number(raw["price"]);
  const metadata = parseJsonRecord(raw["metadata"]);

  const relations: RelationBuckets = {
    upsell: extractRelationIds(metadata, "upsellProducts"),
    crossSell: extractRelationIds(metadata, "crossSellProducts"),
    related: extractRelationIds(metadata, "relatedProducts"),
  };

  let imageUrl: string | undefined;
  if (typeof raw["imageUrl"] === "string" && raw["imageUrl"].trim()) {
    imageUrl = raw["imageUrl"].trim();
  } else if (Array.isArray(raw["images"]) && raw["images"].length > 0) {
    const first = raw["images"][0];
    if (typeof first === "string") imageUrl = first;
    else if (isRecord(first) && typeof first["url"] === "string") imageUrl = first["url"];
  }

  return {
    id: String(raw["id"] || ""),
    name: String(raw["name"] || "منتج بدون اسم"),
    sku: String(raw["sku"] || ""),
    price: Number.isFinite(rawPrice) ? rawPrice : null,
    isActive: raw["isActive"] !== false,
    categoryName: isRecord(raw["category"]) ? String(raw["category"]["name"] || "") : "",
    imageUrl,
    metadata,
    relations,
  };
};

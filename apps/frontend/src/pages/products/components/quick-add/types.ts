export interface QuickVariantOption {
  id: string;
  name: string;
  type?: string;
  price: string;
  stock: string;
}

export interface QuickProductAttribute {
  id: string;
  name: string;
  slug: string;
  values: string[];
}

export interface QuickGeneratedVariant {
  id: string;
  name: string;
  price: string;
  stock: string;
  attributeValues: Record<string, string>;
}

export interface CategoryOption {
  id: string;
  name?: string;
  title?: string;
}

export interface WarehouseOption {
  id: string;
  name: string;
}

export interface QuickAddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (createdProduct: any) => void;
  initialCategories?: CategoryOption[];
  warehouses?: WarehouseOption[];
  defaultWarehouseId?: string;
  showWarehouseSelect?: boolean;
  initialName?: string;
}

export interface AttributeTemplate {
  name: string;
  slug: string;
  icon: string;
  suggestedValues: string[];
}

export const ATTRIBUTE_TEMPLATES: AttributeTemplate[] = [
  {
    name: "المقاس",
    slug: "size",
    icon: "📏",
    suggestedValues: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "اللون",
    slug: "color",
    icon: "🎨",
    suggestedValues: ["أسود", "أبيض", "كحلي", "رمادي", "بيج", "أحمر", "أزرق"],
  },
  {
    name: "مقاس الحذاء",
    slug: "shoe_size",
    icon: "👟",
    suggestedValues: ["39", "40", "41", "42", "43", "44"],
  },
  {
    name: "الخامة",
    slug: "material",
    icon: "🧵",
    suggestedValues: ["قطن", "بوليستر", "جلد", "كتان"],
  },
  {
    name: "العبوة / الباقة",
    slug: "pack",
    icon: "📦",
    suggestedValues: ["قطعة", "قطعتين", "3 قطع", "عرض التوفير"],
  },
];

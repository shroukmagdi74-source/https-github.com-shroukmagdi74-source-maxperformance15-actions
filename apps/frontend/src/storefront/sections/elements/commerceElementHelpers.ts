import type { DynamicContext, DynamicProductContext } from "../../studio/utils/dynamicValues";
import { formatStorefrontCurrency } from "../../utils/currency";
import { canonicalizeAttributeKey, getVariantAttributes } from "../../utils/variants";

/**
 * Checks whether an unknown object has genuine product identity/properties.
 * A context that only has a collection, page, or empty object is NOT a product.
 */
export function isProductLike(value: unknown): value is DynamicProductContext {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;

  // Must have at least one product-specific field defined (and not an empty object)
  const hasId = obj.id !== undefined && obj.id !== null && String(obj.id).trim() !== "";
  const hasTitle = obj.title !== undefined && obj.title !== null && String(obj.title).trim() !== "";
  const hasName = obj.name !== undefined && obj.name !== null && String(obj.name).trim() !== "";
  const hasPrice = obj.price !== undefined && obj.price !== null && !Number.isNaN(Number(obj.price));
  const hasStock = obj.stock !== undefined && obj.stock !== null && !Number.isNaN(Number(obj.stock));
  const hasVariants = Array.isArray(obj.variants) || Array.isArray(obj.productVariants);
  const hasOptions = Array.isArray(obj.options) || (obj.options !== null && typeof obj.options === "object");

  return Boolean(hasId || hasTitle || hasName || hasPrice || hasStock || hasVariants || hasOptions);
}

/**
 * Resolves the active product from the dynamic context or direct props.
 * Returns null if the context is NOT a product context.
 */
export function resolveProductFromContext(
  ctx?: DynamicContext | null,
  directProduct?: unknown,
): DynamicProductContext | null {
  if (isProductLike(directProduct)) {
    return directProduct;
  }
  if (ctx && isProductLike(ctx.product)) {
    return ctx.product;
  }
  if (ctx && isProductLike(ctx.item)) {
    return ctx.item as DynamicProductContext;
  }
  return null;
}

export interface FormattedPriceResult {
  price: number;
  comparePrice: number | null;
  formattedPrice: string;
  formattedComparePrice: string | null;
  discountPercent: number;
  isDiscounted: boolean;
}

/**
 * Formats a product's price and compareAt price cleanly.
 */
export function formatProductPrice(
  product: DynamicProductContext,
  currency = "EGP",
  locale = "ar-EG",
): FormattedPriceResult | null {
  const rawPrice = product.price;
  if (rawPrice === undefined || rawPrice === null || Number.isNaN(Number(rawPrice))) {
    return null;
  }
  const price = Number(rawPrice);

  const compareRaw =
    product.compareAtPrice ??
    product.comparePrice ??
    (product as Record<string, unknown>).compareAt;

  const comparePrice =
    compareRaw !== undefined && compareRaw !== null && !Number.isNaN(Number(compareRaw))
      ? Number(compareRaw)
      : null;

  const formattedPrice = formatStorefrontCurrency(price, currency, locale);
  const isDiscounted = comparePrice !== null && comparePrice > price;
  const formattedComparePrice = isDiscounted
    ? formatStorefrontCurrency(comparePrice as number, currency, locale)
    : null;

  const discountPercent =
    isDiscounted && comparePrice
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  return {
    price,
    comparePrice,
    formattedPrice,
    formattedComparePrice,
    discountPercent,
    isDiscounted,
  };
}

export interface ExtractedProductOption {
  name: string;
  values: string[];
}

/**
 * Normalizes options and attributes from a product's options or variants list.
 */
export function extractProductOptions(product: DynamicProductContext): ExtractedProductOption[] {
  // 1. Direct options array: [{ name: "Size", values: ["S", "M"] }]
  if (Array.isArray(product.options) && product.options.length > 0) {
    return product.options
      .map((opt: unknown) => {
        if (!opt || typeof opt !== "object") return null;
        const o = opt as Record<string, unknown>;
        const name = String(o.name || o.title || "").trim();
        const rawValues = Array.isArray(o.values) ? o.values : [];
        const values = rawValues.map((v) => String(v).trim()).filter(Boolean);
        return name && values.length > 0 ? { name, values } : null;
      })
      .filter((opt): opt is ExtractedProductOption => opt !== null);
  }

  // 2. Direct options record: { Size: ["S", "M"], Color: ["Red"] }
  if (product.options && typeof product.options === "object" && !Array.isArray(product.options)) {
    const list: ExtractedProductOption[] = [];
    for (const [name, rawValues] of Object.entries(product.options as Record<string, unknown>)) {
      if (Array.isArray(rawValues)) {
        const values = rawValues.map((v) => String(v).trim()).filter(Boolean);
        if (values.length > 0) {
          list.push({ name, values });
        }
      }
    }
    if (list.length > 0) return list;
  }

  // 3. Infer from variants list
  const variants = Array.isArray(product.variants)
    ? product.variants
    : Array.isArray(product.productVariants)
    ? product.productVariants
    : [];

  if (variants.length > 0) {
    const map = new Map<string, Set<string>>();
    for (const v of variants) {
      if (!v || typeof v !== "object") continue;
      const rawAttrs = (v as Record<string, unknown>).attributes;
      const directAttrs = rawAttrs && typeof rawAttrs === 'object' ? (rawAttrs as Record<string, unknown>) : {};
      const normalizedAttrs = getVariantAttributes(rawAttrs as Record<string, unknown>);

      // Combine direct keys and normalized keys so user can see original labels
      const allKeys = Array.from(new Set([...Object.keys(directAttrs), ...Object.keys(normalizedAttrs)]));
      for (const key of allKeys) {
        const val = directAttrs[key] ?? normalizedAttrs[key];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          if (!map.has(key)) map.set(key, new Set());
          map.get(key)!.add(String(val).trim());
        }
      }
    }
    const result: ExtractedProductOption[] = [];
    for (const [name, valSet] of map.entries()) {
      if (valSet.size > 0) {
        result.push({ name, values: Array.from(valSet) });
      }
    }
    return result;
  }

  return [];
}

/**
 * Finds the matching variant ID from selected attributes.
 */
export function findMatchingVariantId(
  product: DynamicProductContext,
  selectedAttributes: Record<string, string>,
): string | undefined {
  const variants = Array.isArray(product.variants)
    ? product.variants
    : Array.isArray(product.productVariants)
    ? product.productVariants
    : [];

  if (variants.length === 0) return undefined;

  for (const v of variants) {
    if (!v || typeof v !== "object") continue;
    const vObj = v as Record<string, unknown>;
    const rawAttrs = vObj.attributes;
    const normalizedAttrs = getVariantAttributes(rawAttrs as Record<string, unknown>);
    const rawDirectAttrs = (rawAttrs && typeof rawAttrs === 'object') ? (rawAttrs as Record<string, unknown>) : {};

    const allMatch = Object.entries(selectedAttributes).every(([key, val]) => {
      const canonicalKey = canonicalizeAttributeKey(key);
      const matchedVal =
        normalizedAttrs[canonicalKey] ??
        normalizedAttrs[key] ??
        rawDirectAttrs[key] ??
        rawDirectAttrs[canonicalKey];

      return (
        matchedVal !== undefined &&
        matchedVal !== null &&
        String(matchedVal).trim().toLowerCase() === String(val).trim().toLowerCase()
      );
    });

    if (allMatch && vObj.id) {
      return String(vObj.id);
    }
  }

  return undefined;
}

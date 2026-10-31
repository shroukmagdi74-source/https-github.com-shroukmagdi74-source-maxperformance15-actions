import { ProductVariant } from "./types";

// Helper function to parse variant metadata and extract attributeValues
export const parseVariantAttributes = (
  variant: ProductVariant,
): Record<string, string> => {
  // First try attributeValues directly
  if (
    variant.attributeValues &&
    Object.keys(variant.attributeValues).length > 0
  ) {
    return variant.attributeValues;
  }

  // Then try metadata
  if (variant.metadata) {
    try {
      const metadata =
        typeof variant.metadata === "string"
          ? JSON.parse(variant.metadata)
          : variant.metadata;
      if (
        metadata.attributeValues &&
        Object.keys(metadata.attributeValues).length > 0
      ) {
        return metadata.attributeValues;
      }
    } catch {
      // ignore parse errors
    }
  }

  // Try color and size fields directly
  if (variant.color || variant.size) {
    const attrs: Record<string, string> = {};
    if (variant.color) attrs["اللون"] = variant.color;
    if (variant.size) attrs["المقاس"] = variant.size;
    return attrs;
  }

  // Fallback: Try to extract from variant name (e.g., "بيفليل - 54" or "تنا - 98")
  if (variant.name) {
    const parts = variant.name.split(/\s*[-–]\s*/);
    if (parts.length >= 2) {
      const colorPart = parts[0] ?? "";
      const sizePart = parts[1] ?? "";
      return {
        اللون: colorPart.trim(),
        المقاس: sizePart.trim(),
      };
    } else if (parts.length === 1 && variant.type) {
      const partValue = parts[0] ?? "";
      const typeName =
        variant.type === "color"
          ? "اللون"
          : variant.type === "size"
            ? "المقاس"
            : variant.type;
      return { [typeName]: partValue.trim() };
    }
  }

  return {};
};

// Helper function to extract unique attributes from variants
export const extractAttributes = (
  variants: ProductVariant[],
): { name: string; values: string[] }[] => {
  const attributeMap: Record<string, Set<string>> = {};

  variants.forEach((variant) => {
    const attrs = parseVariantAttributes(variant);
    Object.entries(attrs).forEach(([key, value]) => {
      const valueSet = attributeMap[key] ?? new Set<string>();
      attributeMap[key] = valueSet;
      if (value) valueSet.add(value);
    });
  });

  return Object.entries(attributeMap)
    .filter(([_, values]) => values.size > 0)
    .map(([name, values]) => ({
      name,
      values: Array.from(values).sort(),
    }));
};

/** Returns true if the item is considered in-stock (either tracking is off, or stock > 0) */
export const isInStock = (item: {
  stock: number;
  trackInventory?: boolean;
}): boolean => {
  if (item.trackInventory === false) return true;
  return item.stock > 0;
};

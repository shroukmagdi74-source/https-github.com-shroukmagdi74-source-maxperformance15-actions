import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  QuickProductAttribute,
  QuickGeneratedVariant,
  AttributeTemplate,
  ATTRIBUTE_TEMPLATES,
} from "./types";

interface UseQuickAddVariantsProps {
  price: string;
  displayCurrency: string;
  setFieldErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

export function useQuickAddVariants({
  price,
  displayCurrency,
  setFieldErrors,
}: UseQuickAddVariantsProps) {
  const [hasOptions, setHasOptions] = useState(false);
  const [attributes, setAttributes] = useState<QuickProductAttribute[]>([]);
  const [variants, setVariants] = useState<QuickGeneratedVariant[]>([]);
  const [newCustomAttrName, setNewCustomAttrName] = useState("");
  const [attrInputValues, setAttrInputValues] = useState<Record<string, string>>({});
  const [bulkStockValue, setBulkStockValue] = useState("");

  const handleToggleHasOptions = () => {
    const next = !hasOptions;
    setHasOptions(next);
    if (next && attributes.length === 0) {
      const defaultTemplate = ATTRIBUTE_TEMPLATES[0];
      setAttributes([
        {
          id: `attr_${defaultTemplate.slug}_${Date.now()}`,
          name: defaultTemplate.name,
          slug: defaultTemplate.slug,
          values: ["M", "L", "XL"],
        },
      ]);
    }
  };

  const handleAddAttributeFromTemplate = (template: AttributeTemplate) => {
    if (attributes.some((a) => a.name === template.name || a.slug === template.slug)) {
      toast.info(`الخاصية "${template.name}" مضافة بالفعل`);
      return;
    }
    const newAttr: QuickProductAttribute = {
      id: `attr_${template.slug}_${Date.now()}`,
      name: template.name,
      slug: template.slug,
      values: [...template.suggestedValues.slice(0, 3)],
    };
    setAttributes((prev) => [...prev, newAttr]);
    setFieldErrors((p) => ({ ...p, options: "" }));
  };

  const handleAddCustomAttribute = () => {
    const trimmed = newCustomAttrName.trim();
    if (!trimmed) return;
    if (attributes.some((a) => a.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("اسم الخاصية مضاف مسبقاً");
      return;
    }
    const slug = `attr_${Date.now()}`;
    const newAttr: QuickProductAttribute = {
      id: slug,
      name: trimmed,
      slug,
      values: [],
    };
    setAttributes((prev) => [...prev, newAttr]);
    setNewCustomAttrName("");
    setFieldErrors((p) => ({ ...p, options: "" }));
  };

  const handleRemoveAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddValueToAttribute = (attrId: string, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setAttributes((prev) =>
      prev.map((a) => {
        if (a.id !== attrId) return a;
        if (a.values.includes(trimmed)) return a;
        return { ...a, values: [...a.values, trimmed] };
      })
    );
    setAttrInputValues((prev) => ({ ...prev, [attrId]: "" }));
    setFieldErrors((p) => ({ ...p, options: "" }));
  };

  const handleRemoveValueFromAttribute = (attrId: string, valueToRemove: string) => {
    setAttributes((prev) =>
      prev.map((a) => {
        if (a.id !== attrId) return a;
        return { ...a, values: a.values.filter((v) => v !== valueToRemove) };
      })
    );
  };

  const validAttributes = useMemo(() => {
    return attributes.filter((a) => a.values && a.values.length > 0);
  }, [attributes]);

  const potentialCombinationCount = useMemo(() => {
    if (validAttributes.length === 0) return 0;
    return validAttributes.reduce((acc, a) => acc * a.values.length, 1);
  }, [validAttributes]);

  const computeCombinations = (
    currentAttributes: QuickProductAttribute[],
    basePrice: string,
    existingVariants: QuickGeneratedVariant[] = []
  ): QuickGeneratedVariant[] => {
    const activeAttrs = currentAttributes.filter(
      (a) => a.values && a.values.length > 0
    );
    if (activeAttrs.length === 0) return [];

    const combinations: { [key: string]: string }[][] = activeAttrs.map((attr) =>
      attr.values.map((value) => ({ [attr.name]: value }))
    );

    const allCombos = combinations.reduce(
      (acc, curr) => {
        if (acc.length === 0) return curr.map((item) => [item]);
        return acc.flatMap((combo) => curr.map((item) => [...combo, item]));
      },
      [] as { [key: string]: string }[][]
    );

    return allCombos.map((combo, idx) => {
      const attributeValues = combo.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      const variantName = Object.values(attributeValues).join(" - ");

      const existing = existingVariants.find((ev) => {
        if (ev.name.trim() === variantName.trim()) return true;
        if (
          ev.attributeValues &&
          Object.keys(ev.attributeValues).length === Object.keys(attributeValues).length
        ) {
          return Object.entries(attributeValues).every(
            ([k, v]) => ev.attributeValues[k] === v
          );
        }
        return false;
      });

      return {
        id: existing?.id || `var-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        name: variantName,
        price: existing?.price !== undefined ? existing.price : (basePrice || ""),
        stock: existing?.stock !== undefined ? existing.stock : "10",
        attributeValues,
      };
    });
  };

  const handleGenerateVariations = () => {
    if (validAttributes.length === 0) {
      toast.error("يرجى إضافة قيم واحدة على الأقل لكل خاصية قبل التوليد");
      return;
    }
    const generated = computeCombinations(attributes, price, variants);
    setVariants(generated);
    setFieldErrors((p) => ({ ...p, options: "" }));
    toast.success(`تم توليد ${generated.length} متغير بنجاح`);
  };

  const handleUpdateVariant = (
    id: string,
    field: "price" | "stock",
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleApplyBasePriceToAll = () => {
    if (!price) return;
    setVariants((prev) => prev.map((v) => ({ ...v, price })));
    toast.success(`تم تطبيق السعر ${price} ${displayCurrency} على جميع المتغيرات`);
  };

  const handleApplyBulkStockToAll = () => {
    const trimmed = bulkStockValue.trim();
    if (!trimmed || isNaN(Number(trimmed))) return;
    setVariants((prev) => prev.map((v) => ({ ...v, stock: trimmed })));
    toast.success(`تم تطبيق الكمية ${trimmed} على جميع المتغيرات`);
    setBulkStockValue("");
  };

  const resetVariants = () => {
    setHasOptions(false);
    setAttributes([]);
    setVariants([]);
    setNewCustomAttrName("");
    setAttrInputValues({});
    setBulkStockValue("");
  };

  return {
    hasOptions,
    setHasOptions,
    attributes,
    setAttributes,
    variants,
    setVariants,
    newCustomAttrName,
    setNewCustomAttrName,
    attrInputValues,
    setAttrInputValues,
    bulkStockValue,
    setBulkStockValue,
    validAttributes,
    potentialCombinationCount,
    handleToggleHasOptions,
    handleAddAttributeFromTemplate,
    handleAddCustomAttribute,
    handleRemoveAttribute,
    handleAddValueToAttribute,
    handleRemoveValueFromAttribute,
    computeCombinations,
    handleGenerateVariations,
    handleUpdateVariant,
    handleRemoveVariant,
    handleApplyBasePriceToAll,
    handleApplyBulkStockToAll,
    resetVariants,
  };
}

import React, { useMemo } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { VariantSelectionModalProps, ProductVariant } from "./types";
import {
  overlayStyle,
  headingStyle,
  mutedStyle,
  primaryStyle,
  successStyle,
  dangerStyle,
  sectionSurfaceStyle,
  getVariantButtonStyle,
} from "./styles";
import { extractAttributes, parseVariantAttributes, isInStock } from "./helpers";

export const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
  product,
  selectedAttributes,
  onAttributeSelect,
  onVariantSelect,
  onClose,
}) => {
  // Extract attributes from product
  const productAttributes = useMemo(() => {
    return extractAttributes(product.variants);
  }, [product]);

  // Filter variants based on selected attributes
  const filteredVariants = useMemo(() => {
    return product.variants.filter((variant) => {
      const variantAttrs = parseVariantAttributes(variant);
      return Object.entries(selectedAttributes).every(([key, value]) => {
        return variantAttrs[key] === value;
      });
    });
  }, [product, selectedAttributes]);

  // Get available values for each attribute based on current selection
  const getAvailableValues = (attrName: string): string[] => {
    const otherSelections = { ...selectedAttributes };
    delete otherSelections[attrName];

    const availableVariants = product.variants.filter((variant) => {
      const variantAttrs = parseVariantAttributes(variant);
      return Object.entries(otherSelections).every(([key, value]) => {
        return variantAttrs[key] === value;
      });
    });

    const values = new Set<string>();
    availableVariants.forEach((variant) => {
      const variantAttrs = parseVariantAttributes(variant);
      const attributeValue = variantAttrs[attrName];
      if (attributeValue) {
        values.add(attributeValue);
      }
    });

    return Array.from(values);
  };

  // Check if all attributes are selected
  const allAttributesSelected =
    productAttributes.length > 0 &&
    productAttributes.every((attr) => selectedAttributes[attr.name]);

  // Get the matching variant when all attributes are selected
  const matchedVariant = useMemo(() => {
    if (!allAttributesSelected || filteredVariants.length !== 1) return null;
    return filteredVariants[0];
  }, [allAttributesSelected, filteredVariants]);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4 variant-selection-modal"
      style={overlayStyle}
    >
      <div className="business-modal-surface w-full max-w-md overflow-hidden">
        <div
          className="business-gallery-toolbar flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--business-muted-line)" }}
        >
          <h3 className="truncate pr-4 font-bold" style={headingStyle}>
            {product.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="business-icon-button business-icon-button--sm"
            style={mutedStyle}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Multi-level attribute selection */}
          {productAttributes.length > 0 ? (
            <div className="space-y-4">
              {productAttributes.map((attr) => {
                const availableValues = getAvailableValues(attr.name);
                const isSelected = selectedAttributes[attr.name];

                return (
                  <div key={attr.name} className="space-y-2">
                    <label
                      className="block text-sm font-semibold"
                      style={headingStyle}
                    >
                      {attr.name}
                      {isSelected && (
                        <span className="mr-2" style={primaryStyle}>
                          : {isSelected}
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((value) => {
                        const isAvailable = availableValues.includes(value);
                        const isActive =
                          selectedAttributes[attr.name] === value;

                        return (
                          <button
                            type="button"
                            key={value}
                            onClick={() => onAttributeSelect(attr.name, value)}
                            disabled={!isAvailable}
                            className={`rounded-2xl border-2 px-3 py-2 text-sm font-medium transition-all ${
                              !isAvailable
                                ? "cursor-not-allowed line-through"
                                : ""
                            }`}
                            style={getVariantButtonStyle(isActive, isAvailable)}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Selected variant info & add button */}
              {matchedVariant && (
                <div
                  className="business-status-banner mt-4 p-4"
                  data-tone="primary"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-lg font-bold font-mono tabular-nums" style={primaryStyle}>
                        {matchedVariant.price} ج.م
                      </div>
                      <div
                        className="text-sm font-medium"
                        style={
                          isInStock(matchedVariant) ? successStyle : dangerStyle
                        }
                      >
                        {isInStock(matchedVariant)
                          ? matchedVariant.trackInventory === false
                            ? "متاح"
                            : `${matchedVariant.stock} متاح`
                          : "نفذت الكمية"}
                      </div>
                    </div>
                    <div className="text-xs font-mono" style={mutedStyle}>
                      SKU: {matchedVariant.sku}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onVariantSelect(matchedVariant)}
                    disabled={!isInStock(matchedVariant)}
                    className={`business-chip-button flex w-full items-center justify-center gap-2 py-2.5 font-semibold ${
                      !isInStock(matchedVariant)
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
                    data-active={isInStock(matchedVariant)}
                    style={
                      isInStock(matchedVariant)
                        ? undefined
                        : {
                            background:
                              "color-mix(in srgb, var(--color-border) 18%, var(--color-background))",
                            color: "var(--color-muted-foreground)",
                          }
                    }
                  >
                    <PlusIcon className="w-5 h-5" />
                    إضافة للسلة
                  </button>
                </div>
              )}

              {/* Prompt to select remaining attributes */}
              {!allAttributesSelected && (
                <div
                  className="mt-4 rounded-2xl p-3 text-center text-sm"
                  style={{
                    ...sectionSurfaceStyle,
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  ← اختر{" "}
                  {productAttributes
                    .filter((a) => !selectedAttributes[a.name])
                    .map((a) => a.name)
                    .join(" و ")}
                </div>
              )}
            </div>
          ) : (
            /* Fallback: Simple variant list if no attributes found */
            <div className="space-y-2">
              {product.variants.map((variant) => (
                <button
                  type="button"
                  key={variant.id}
                  onClick={() => onVariantSelect(variant)}
                  disabled={!isInStock(variant)}
                  className={`w-full rounded-2xl border p-3 text-right transition-all ${
                    isInStock(variant)
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-60"
                  }`}
                  style={
                    isInStock(variant)
                      ? sectionSurfaceStyle
                      : {
                          background:
                            "color-mix(in srgb, var(--color-border) 18%, var(--color-background))",
                          borderColor: "var(--business-muted-line)",
                        }
                  }
                >
                  <div className="flex flex-col items-start">
                    <div className="text-sm font-medium" style={headingStyle}>
                      {variant.name || "غير محدد"}
                    </div>
                    <div className="mt-0.5 text-xs font-mono" style={mutedStyle}>
                      SKU: {variant.sku}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold font-mono tabular-nums" style={primaryStyle}>
                      {variant.price} ج.م
                    </div>
                    <div
                      className="mt-0.5 text-xs font-medium"
                      style={isInStock(variant) ? successStyle : dangerStyle}
                    >
                      {isInStock(variant)
                        ? variant.trackInventory === false
                          ? "متاح"
                          : `${variant.stock} متاح`
                        : "نفذت الكمية"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

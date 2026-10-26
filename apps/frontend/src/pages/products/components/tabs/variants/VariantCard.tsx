import React from "react";
import { ProductVariant, ShippingClassOption, VariantColorGroup } from "./types";
import { VariantCardHeader } from "./VariantCardHeader";
import { VariantCardBasicInfo } from "./VariantCardBasicInfo";
import { VariantCardImage } from "./VariantCardImage";
import { VariantCardPricingInventory } from "./VariantCardPricingInventory";
import { VariantCardShipping } from "./VariantCardShipping";

interface VariantCardProps {
  idx: number;
  variant: ProductVariant;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  updateVariant: (idx: number, field: keyof ProductVariant, value: any) => void;
  handleVariantImageChange: (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  displayCurrency: string;
  shippingClassOptions: ShippingClassOption[];
  defaultPricing?: {
    price?: number;
    comparePrice?: number;
    cost?: number;
  };
  syncWithProductPricing?: (targetIdx?: number) => void;
  group?: VariantColorGroup;
  copiedGroupToast: { idx: number; message: string } | null;
  setCopiedGroupToast: React.Dispatch<
    React.SetStateAction<{ idx: number; message: string } | null>
  >;
  applyImageToGroup: (group: VariantColorGroup, imageUrl: string) => void;
}

export const VariantCard: React.FC<VariantCardProps> = ({
  idx,
  variant,
  isExpanded,
  onToggle,
  onRemove,
  updateVariant,
  handleVariantImageChange,
  displayCurrency,
  shippingClassOptions,
  defaultPricing,
  syncWithProductPricing,
  group,
  copiedGroupToast,
  setCopiedGroupToast,
  applyImageToGroup,
}) => {
  return (
    <div
      className={`border overflow-hidden transition-all duration-200 ${
        isExpanded
          ? "border-indigo-200 dark:border-indigo-800/50 shadow-md rounded-xl bg-white dark:bg-gray-800 ring-1 ring-indigo-50 dark:ring-indigo-900/20"
          : "border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow"
      }`}
    >
      <VariantCardHeader
        idx={idx}
        variant={variant}
        isExpanded={isExpanded}
        displayCurrency={displayCurrency}
        onToggle={onToggle}
        onRemove={onRemove}
      />

      {isExpanded && (
        <div className="border-t border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-gray-800 p-6 space-y-8 animate-slide-down">
          <VariantCardBasicInfo
            idx={idx}
            variant={variant}
            updateVariant={updateVariant}
          />

          <VariantCardImage
            idx={idx}
            variant={variant}
            updateVariant={updateVariant}
            handleVariantImageChange={handleVariantImageChange}
            group={group}
            copiedGroupToast={copiedGroupToast}
            setCopiedGroupToast={setCopiedGroupToast}
            applyImageToGroup={applyImageToGroup}
          />

          <VariantCardPricingInventory
            idx={idx}
            variant={variant}
            updateVariant={updateVariant}
            displayCurrency={displayCurrency}
            defaultPricing={defaultPricing}
            syncWithProductPricing={syncWithProductPricing}
          />

          <VariantCardShipping
            idx={idx}
            variant={variant}
            updateVariant={updateVariant}
            shippingClassOptions={shippingClassOptions}
          />
        </div>
      )}
    </div>
  );
};

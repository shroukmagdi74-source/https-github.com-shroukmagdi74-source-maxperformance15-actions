import React from "react";
import { ProductAttribute, ProductVariant } from "../../../types";
import { ShippingClassOption } from "../../../../../constants/shippingClasses";
import { VariantColorGroup } from "../../../utils/variantColorGrouping";

export type { ProductAttribute, ProductVariant, ShippingClassOption, VariantColorGroup };

export interface VariantsTabProps {
  variants: ProductVariant[];
  showVariants: boolean;
  setShowVariants: React.Dispatch<React.SetStateAction<boolean>>;
  bulkAction: string;
  handleBulkActionChange: (action: string) => void;
  showBulkInput: boolean;
  bulkValue: string | number;
  setBulkValue: React.Dispatch<React.SetStateAction<string | number>>;
  applyBulkAction: () => void;
  removeVariant: (idx: number) => void;
  updateVariant: (idx: number, field: keyof ProductVariant, value: any) => void;
  handleVariantImageChange: (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  addVariant: () => void;
  displayCurrency: string;
  shippingClassOptions: ShippingClassOption[];
  defaultPricing?: {
    price?: number;
    comparePrice?: number;
    cost?: number;
  };
  syncWithProductPricing?: (targetIdx?: number) => void;
  t: any;
  attributes?: ProductAttribute[];
  uploadedImages?: string[];
  onBatchUpdateVariants?: (
    indices: number[],
    updates: Partial<ProductVariant> | ((v: ProductVariant) => Partial<ProductVariant>),
  ) => void;
  onUploadImageForVariants?: (
    indices: number[],
    file: File,
  ) => Promise<string | undefined>;
  variantSettings?: any;
  setVariantSettings?: React.Dispatch<React.SetStateAction<any>>;
}

import React, { useId } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../../hooks/useCurrency";
import { getCurrencySymbol } from "../../../utils/currency";
import { CategoryFormModal } from "../../../components/category/CategoryFormModal";
import {
  QuickVariantOption,
  QuickProductAttribute,
  QuickGeneratedVariant,
  WarehouseOption,
  QuickAddProductModalProps,
  useQuickAddVariants,
  useQuickAddProductController,
  QuickAddHeader,
  QuickAddBasicFields,
  QuickAddCategoryWarehouseSection,
  QuickAddImagesSection,
  QuickAddAttributesSection,
  QuickAddVariantsMatrix,
  QuickAddFooter,
} from "./quick-add";

export type {
  QuickVariantOption,
  QuickProductAttribute,
  QuickGeneratedVariant,
  WarehouseOption,
  QuickAddProductModalProps,
};

export const QuickAddProductModal: React.FC<QuickAddProductModalProps> = (props) => {
  const { open } = props;
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const displayCurrency = getCurrencySymbol(currency);
  const titleId = useId();

  // 1. Variations and Attributes Hook
  const variantsHook = useQuickAddVariants({
    price: "",
    displayCurrency,
    setFieldErrors: () => {},
  });

  // 2. Main Product Form Controller
  const controller = useQuickAddProductController({
    ...props,
    hasOptions: variantsHook.hasOptions,
    validAttributes: variantsHook.validAttributes,
    variants: variantsHook.variants,
    attributes: variantsHook.attributes,
    computeCombinations: variantsHook.computeCombinations,
    setVariants: variantsHook.setVariants,
    resetVariants: variantsHook.resetVariants,
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <QuickAddHeader titleId={titleId} onClose={controller.handleClose} />

        {/* Form Body - Scrollable */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-right" dir="rtl">
          {/* Basic Fields: Name, Price, Compare Price */}
          <QuickAddBasicFields
            name={controller.name}
            setName={controller.setName}
            price={controller.price}
            setPrice={controller.setPrice}
            comparePrice={controller.comparePrice}
            setComparePrice={controller.setComparePrice}
            displayCurrency={displayCurrency}
            fieldErrors={controller.fieldErrors}
            setFieldErrors={controller.setFieldErrors}
          />

          {/* Category & Warehouse */}
          <QuickAddCategoryWarehouseSection
            categoryId={controller.categoryId}
            setCategoryId={controller.setCategoryId}
            categories={controller.categories}
            loadingCategories={controller.loadingCategories}
            isQuickAddingCategory={controller.isQuickAddingCategory}
            setIsQuickAddingCategory={controller.setIsQuickAddingCategory}
            newCategoryName={controller.newCategoryName}
            setNewCategoryName={controller.setNewCategoryName}
            addingCategoryLoading={controller.addingCategoryLoading}
            handleQuickAddCategory={controller.handleQuickAddCategory}
            showWarehouseSelect={Boolean(props.showWarehouseSelect)}
            warehouseId={controller.warehouseId}
            setWarehouseId={controller.setWarehouseId}
            internalWarehouses={controller.internalWarehouses}
            loadingWarehouses={controller.loadingWarehouses}
            hasOptions={variantsHook.hasOptions}
            stock={controller.stock}
            setStock={controller.setStock}
            variants={variantsHook.variants}
            fieldErrors={controller.fieldErrors}
            setFieldErrors={controller.setFieldErrors}
          />

          {/* Product Images */}
          <QuickAddImagesSection
            images={controller.images}
            setImages={controller.setImages}
            fileInputRef={controller.fileInputRef}
            uploadingImage={controller.uploadingImage}
            handleImageFileChange={controller.handleImageFileChange}
          />

          {/* Attributes & Options Section */}
          <QuickAddAttributesSection
            hasOptions={variantsHook.hasOptions}
            onToggleHasOptions={variantsHook.handleToggleHasOptions}
            attributes={variantsHook.attributes}
            onAddAttributeFromTemplate={variantsHook.handleAddAttributeFromTemplate}
            newCustomAttrName={variantsHook.newCustomAttrName}
            setNewCustomAttrName={variantsHook.setNewCustomAttrName}
            onAddCustomAttribute={variantsHook.handleAddCustomAttribute}
            onRemoveAttribute={variantsHook.handleRemoveAttribute}
            attrInputValues={variantsHook.attrInputValues}
            setAttrInputValues={variantsHook.setAttrInputValues}
            onAddValueToAttribute={variantsHook.handleAddValueToAttribute}
            onRemoveValueFromAttribute={variantsHook.handleRemoveValueFromAttribute}
          />

          {/* Generated Variants Matrix */}
          {variantsHook.hasOptions && (
            <QuickAddVariantsMatrix
              validAttributes={variantsHook.validAttributes}
              potentialCombinationCount={variantsHook.potentialCombinationCount}
              onGenerateVariations={variantsHook.handleGenerateVariations}
              variants={variantsHook.variants}
              price={controller.price}
              onApplyBasePriceToAll={variantsHook.handleApplyBasePriceToAll}
              bulkStockValue={variantsHook.bulkStockValue}
              setBulkStockValue={variantsHook.setBulkStockValue}
              onApplyBulkStockToAll={variantsHook.handleApplyBulkStockToAll}
              onUpdateVariant={variantsHook.handleUpdateVariant}
              onRemoveVariant={variantsHook.handleRemoveVariant}
              fieldErrorOptions={controller.fieldErrors.options}
            />
          )}
        </div>

        {/* Footer Actions */}
        <QuickAddFooter
          onAdvanceToNew={() => {
            controller.handleClose();
            navigate("/products/new");
          }}
          onClose={controller.handleClose}
          onSubmit={controller.handleSubmit}
          submitting={controller.submitting}
          actionType={controller.actionType}
        />
      </div>

      {/* Category Creation Modal */}
      {controller.isCategoryModalOpen && (
        <CategoryFormModal
          open={controller.isCategoryModalOpen}
          editingCategory={null}
          onClose={() => controller.setIsCategoryModalOpen(false)}
          onSaved={(newCategory) => {
            controller.setCategories((prev) => [...prev, newCategory]);
            controller.setCategoryId(newCategory.id);
            controller.setIsCategoryModalOpen(false);
            if (controller.fieldErrors.category) {
              controller.setFieldErrors((p) => ({ ...p, category: "" }));
            }
          }}
        />
      )}
    </div>
  );
};

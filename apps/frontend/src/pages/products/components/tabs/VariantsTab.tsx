import React, { useState, useMemo } from "react";
import { PlusIcon, CubeIcon } from "@heroicons/react/24/outline";
import { VariantColorImagesModal } from "./VariantColorImagesModal";
import { groupVariantsByColor, VariantColorGroup } from "../../utils/variantColorGrouping";
import {
  VariantsTabProps,
  VariantsTabHeader,
  VariantsBulkActions,
  VariantsSavedImagesSyncBanner,
  VariantsQuickColorToolbar,
  VariantCard,
} from "./variants";

export const VariantsTab: React.FC<VariantsTabProps> = ({
  variants,
  showVariants,
  setShowVariants,
  bulkAction,
  handleBulkActionChange,
  showBulkInput,
  bulkValue,
  setBulkValue,
  applyBulkAction,
  removeVariant,
  updateVariant,
  handleVariantImageChange,
  addVariant,
  displayCurrency,
  shippingClassOptions,
  defaultPricing,
  syncWithProductPricing,
  t,
  attributes = [],
  uploadedImages = [],
  onBatchUpdateVariants,
  onUploadImageForVariants,
  variantSettings,
  setVariantSettings,
}) => {
  const [expandedVariantIdx, setExpandedVariantIdx] = useState<number | null>(null);
  const [isColorImagesModalOpen, setIsColorImagesModalOpen] = useState(false);
  const [copiedGroupToast, setCopiedGroupToast] = useState<{
    idx: number;
    message: string;
  } | null>(null);
  const [selectedQuickColorId, setSelectedQuickColorId] = useState<string>("");
  const [quickCustomUrl, setQuickCustomUrl] = useState<string>("");
  const [isQuickUploading, setIsQuickUploading] = useState<boolean>(false);

  const effectiveBatchUpdate = (
    indices: number[],
    updates: any,
  ) => {
    if (onBatchUpdateVariants) {
      onBatchUpdateVariants(indices, updates);
    } else {
      indices.forEach((idx) => {
        const current = variants[idx];
        const patch = typeof updates === "function" ? updates(current) : updates;
        Object.entries(patch).forEach(([k, val]) => {
          updateVariant(idx, k as any, val);
        });
      });
    }
  };

  const colorGroups = useMemo(() => {
    return groupVariantsByColor(variants, attributes, undefined, variantSettings);
  }, [variants, attributes, variantSettings]);

  const activeQuickGroup = useMemo(() => {
    if (!colorGroups.length) return null;
    return (
      colorGroups.find((g) => g.id === selectedQuickColorId) ||
      colorGroups[0]
    );
  }, [colorGroups, selectedQuickColorId]);

  const syncableSavedCount = useMemo(() => {
    return colorGroups.filter(
      (g) => Boolean(g.savedAttributeImage || g.currentImage) && g.imagesCount < g.items.length
    ).length;
  }, [colorGroups]);

  const applyImageToGroup = (group: VariantColorGroup, imageUrl: string) => {
    if (!imageUrl) return;
    const indices = group.items.map((it) => it.index);
    effectiveBatchUpdate(indices, (v: any) => ({
      image: imageUrl,
      images:
        v.images && v.images.length > 0
          ? [imageUrl, ...v.images.filter((img: string) => img !== imageUrl)]
          : [imageUrl],
    }));

    if (setVariantSettings && group.attributeName) {
      setVariantSettings((prev: any) => {
        const currentAttrImages = prev?.attributeImages || {};
        const attrKey = group.attributeName || "اللون";
        return {
          ...prev,
          attributeImages: {
            ...currentAttrImages,
            [attrKey]: {
              ...(currentAttrImages[attrKey] || {}),
              [group.name]: imageUrl,
            },
          },
        };
      });
    }

    setCopiedGroupToast({
      idx: -1,
      message: `✓ تم تطبيق الصورة على جميع مقاسات "${group.name}" (${indices.length})`,
    });
    setTimeout(() => setCopiedGroupToast(null), 3500);
  };

  const handleApplyAllSavedColorImages = () => {
    let count = 0;
    colorGroups.forEach((group) => {
      const img = group.savedAttributeImage || group.currentImage;
      if (img && group.imagesCount < group.items.length) {
        applyImageToGroup(group, img);
        count += 1;
      }
    });
    if (count > 0) {
      setCopiedGroupToast({
        idx: -1,
        message: `✓ تم تطبيق صور الألوان المحفوظة على كافة المقاسات لـ ${count} ألوان بنجاح`,
      });
      setTimeout(() => setCopiedGroupToast(null), 4000);
    }
  };

  const variantColorGroupMap = useMemo(() => {
    const map = new Map<number, VariantColorGroup>();
    colorGroups.forEach((group) => {
      group.items.forEach((item) => {
        map.set(item.index, group);
      });
    });
    return map;
  }, [colorGroups]);

  const toggleVariant = (idx: number) => {
    setExpandedVariantIdx(expandedVariantIdx === idx ? null : idx);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-3.5 sm:p-6">
        <VariantsTabHeader
          variantsCount={variants.length}
          colorGroupsCount={colorGroups.length}
          showVariants={showVariants}
          setShowVariants={setShowVariants}
          defaultPricing={defaultPricing}
          displayCurrency={displayCurrency}
          onOpenColorModal={() => setIsColorImagesModalOpen(true)}
          onSyncPricing={() => syncWithProductPricing?.()}
          t={t}
        />

        {showVariants && variants.length > 0 && (
          <VariantsBulkActions
            variantsCount={variants.length}
            bulkAction={bulkAction}
            handleBulkActionChange={handleBulkActionChange}
            showBulkInput={showBulkInput}
            bulkValue={bulkValue}
            setBulkValue={setBulkValue}
            applyBulkAction={applyBulkAction}
            shippingClassOptions={shippingClassOptions}
            defaultPricing={defaultPricing}
            displayCurrency={displayCurrency}
            onOpenColorModal={() => setIsColorImagesModalOpen(true)}
          />
        )}

        {copiedGroupToast?.idx === -1 && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center justify-between animate-fade-in shadow-sm">
            <span className="font-semibold">{copiedGroupToast.message}</span>
            <button
              type="button"
              onClick={() => setCopiedGroupToast(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {showVariants && (
          <VariantsSavedImagesSyncBanner
            syncableSavedCount={syncableSavedCount}
            variantsCount={variants.length}
            onApplyAllSavedColorImages={handleApplyAllSavedColorImages}
          />
        )}

        {showVariants && (
          <VariantsQuickColorToolbar
            colorGroups={colorGroups}
            activeQuickGroup={activeQuickGroup}
            selectedQuickColorId={selectedQuickColorId}
            setSelectedQuickColorId={setSelectedQuickColorId}
            quickCustomUrl={quickCustomUrl}
            setQuickCustomUrl={setQuickCustomUrl}
            isQuickUploading={isQuickUploading}
            setIsQuickUploading={setIsQuickUploading}
            uploadedImages={uploadedImages}
            onOpenColorModal={() => setIsColorImagesModalOpen(true)}
            applyImageToGroup={applyImageToGroup}
            onUploadImageForVariants={onUploadImageForVariants}
          />
        )}

        {showVariants && (
          <div className="space-y-3">
            {variants.map((variant, idx) => (
              <VariantCard
                key={idx}
                idx={idx}
                variant={variant}
                isExpanded={expandedVariantIdx === idx}
                onToggle={() => toggleVariant(idx)}
                onRemove={() => removeVariant(idx)}
                updateVariant={updateVariant}
                handleVariantImageChange={handleVariantImageChange}
                displayCurrency={displayCurrency}
                shippingClassOptions={shippingClassOptions}
                defaultPricing={defaultPricing}
                syncWithProductPricing={syncWithProductPricing}
                group={variantColorGroupMap.get(idx)}
                copiedGroupToast={copiedGroupToast}
                setCopiedGroupToast={setCopiedGroupToast}
                applyImageToGroup={applyImageToGroup}
              />
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="w-full flex justify-center items-center px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium mt-4"
            >
              <PlusIcon className="h-5 w-5 ml-2" />
              {t("products.variants.addVariant")}
            </button>

            {variants.length === 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
                <CubeIcon className="h-12 w-12 text-blue-400 dark:text-blue-500 mx-auto mb-2" />
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  {t("products.variants.noVariants")}
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  {t("products.variants.noVariantsDesc")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <VariantColorImagesModal
        isOpen={isColorImagesModalOpen}
        onClose={() => setIsColorImagesModalOpen(false)}
        variants={variants}
        attributes={attributes}
        uploadedImages={uploadedImages}
        onBatchUpdateVariants={effectiveBatchUpdate}
        onUploadImageForVariants={onUploadImageForVariants}
        variantSettings={variantSettings}
        setVariantSettings={setVariantSettings}
      />
    </div>
  );
};

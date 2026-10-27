import React from "react";
import { getDirection } from "../../i18n";
import { PostPurchaseOfferAnalyticsTab } from "./components/PostPurchaseOfferAnalyticsTab";
import {
  usePostPurchaseOfferBuilder,
  PostPurchaseOfferHeader,
  PostPurchaseOfferStatusCard,
  PostPurchaseOfferProductPricingCard,
  PostPurchaseOfferTriggerConditionCard,
  PostPurchaseOfferCopywritingCard,
  PostPurchaseOfferLivePreview,
  PostPurchaseOfferLoading,
} from "./post-purchase-offer-builder";

export type { CatalogItem } from "./post-purchase-offer-builder";

export default function PostPurchaseOfferBuilderPage() {
  const isRtl = getDirection() === "rtl";

  const {
    loading,
    saving,
    lastSavedAt,
    activeTab,
    offer,
    catalog,
    catalogLoading,
    productSearch,
    isProductPickerOpen,
    triggerProductSearch,
    previewDevice,
    filteredProducts,
    filteredTriggerProducts,
    selectedProduct,
    calculatedOfferPrice,
    calculatedSavings,
    calculatedSavingsPercent,
    setActiveTab,
    setOffer,
    setProductSearch,
    setIsProductPickerOpen,
    setTriggerProductSearch,
    setPreviewDevice,
    handleSave,
    handleSelectProduct,
    handleToggleTriggerProduct,
    handleSelectAllTriggerProducts,
    handleClearTriggerProducts,
    handleAddFeature,
    handleRemoveFeature,
    handleUpdateFeature,
  } = usePostPurchaseOfferBuilder();

  if (loading) {
    return <PostPurchaseOfferLoading />;
  }

  return (
    <div
      className="w-full min-h-screen bg-slate-50/60 dark:bg-zinc-950 p-3 sm:p-6 space-y-6"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <PostPurchaseOfferHeader
        offer={offer}
        saving={saving}
        lastSavedAt={lastSavedAt}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSave={handleSave}
      />

      {activeTab === "analytics" ? (
        <PostPurchaseOfferAnalyticsTab />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <PostPurchaseOfferStatusCard
              offer={offer}
              setOffer={setOffer}
            />

            <PostPurchaseOfferProductPricingCard
              offer={offer}
              selectedProduct={selectedProduct}
              isProductPickerOpen={isProductPickerOpen}
              productSearch={productSearch}
              catalogLoading={catalogLoading}
              filteredProducts={filteredProducts}
              calculatedOfferPrice={calculatedOfferPrice}
              calculatedSavings={calculatedSavings}
              calculatedSavingsPercent={calculatedSavingsPercent}
              setOffer={setOffer}
              setIsProductPickerOpen={setIsProductPickerOpen}
              setProductSearch={setProductSearch}
              onSelectProduct={handleSelectProduct}
            />

            <PostPurchaseOfferTriggerConditionCard
              offer={offer}
              catalog={catalog}
              catalogLoading={catalogLoading}
              triggerProductSearch={triggerProductSearch}
              filteredTriggerProducts={filteredTriggerProducts}
              setOffer={setOffer}
              setTriggerProductSearch={setTriggerProductSearch}
              onToggleTriggerProduct={handleToggleTriggerProduct}
              onSelectAllTriggerProducts={handleSelectAllTriggerProducts}
              onClearTriggerProducts={handleClearTriggerProducts}
            />

            <PostPurchaseOfferCopywritingCard
              offer={offer}
              setOffer={setOffer}
              onAddFeature={handleAddFeature}
              onRemoveFeature={handleRemoveFeature}
              onUpdateFeature={handleUpdateFeature}
            />
          </div>

          {/* Right Column: Live Interactive Preview (5 cols) */}
          <PostPurchaseOfferLivePreview
            offer={offer}
            previewDevice={previewDevice}
            calculatedOfferPrice={calculatedOfferPrice}
            calculatedSavings={calculatedSavings}
            calculatedSavingsPercent={calculatedSavingsPercent}
            setPreviewDevice={setPreviewDevice}
          />
        </div>
      )}
    </div>
  );
}

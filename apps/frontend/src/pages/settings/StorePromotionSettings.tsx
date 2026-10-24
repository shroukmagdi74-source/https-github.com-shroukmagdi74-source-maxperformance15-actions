import React from "react";
import { Separator } from "@/components/ui/separator";
import {
  SettingsLoadingState,
  SettingsPageShell,
  SettingsStatusAlert,
} from "./components/SettingsPagePrimitives";
import { getDirection } from "../../i18n";
import {
  StorePromotionBarSection,
  StorePromotionGeneralSection,
  StorePromotionHeader,
  StorePromotionRelatedNav,
  StorePromotionSaveBar,
  StorePromotionTiersSection,
  useStorePromotionController,
} from "./store-promotions";

export default function StorePromotionSettings() {
  const {
    t,
    loading,
    saving,
    message,
    setMessage,
    promotion,
    setPromotion,
    typeOptions,
    summaryItems,
    relatedTools,
    handleSave,
    handleReset,
    addTier,
    removeTier,
    updateTier,
    fillDefaults,
  } = useStorePromotionController();

  if (loading) {
    return (
      <SettingsLoadingState
        title={t("storePromotionSettings.loadingTitle")}
        description={t("storePromotionSettings.loadingDescription")}
      />
    );
  }

  return (
    <SettingsPageShell dir={getDirection()}>
      <StorePromotionHeader
        summaryItems={summaryItems}
        onFillDefaults={fillDefaults}
      />

      {message && (
        <SettingsStatusAlert message={message} onDismiss={() => setMessage(null)} />
      )}

      <div className="p-6 space-y-6">
        <StorePromotionRelatedNav tools={relatedTools} />

        <StorePromotionGeneralSection
          promotion={promotion}
          onChange={(updates) => setPromotion((prev) => ({ ...prev, ...updates }))}
        />

        <StorePromotionBarSection
          promotion={promotion}
          onChange={(updates) => setPromotion((prev) => ({ ...prev, ...updates }))}
        />

        <StorePromotionTiersSection
          tiers={promotion.tiers}
          typeOptions={typeOptions}
          onAddTier={addTier}
          onRemoveTier={removeTier}
          onUpdateTier={updateTier}
        />

        <Separator className="dark:bg-slate-800" />

        <StorePromotionSaveBar
          saving={saving}
          onSave={handleSave}
          onReset={handleReset}
        />
      </div>
    </SettingsPageShell>
  );
}

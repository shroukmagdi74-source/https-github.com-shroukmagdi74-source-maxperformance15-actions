import React from "react";
import { useTranslation } from "react-i18next";
import { getDirection } from "../../i18n";
import {
  StoreBranchesTab,
  StoreCheckoutTab,
  StoreFooterTab,
  StorePaymentTab,
  StorePromotionTab,
  StoreSettingsHeader,
  StoreSettingsProps,
  StoreShippingTab,
  useStoreSettingsController,
} from "./store-settings";

const StoreSettings: React.FC<StoreSettingsProps> = ({
  forcedTab,
  hideNavigation = false,
  pageTitle: propPageTitle,
  pageDescription: propPageDescription,
}) => {
  const { t } = useTranslation();
  const pageTitle = propPageTitle ?? t("storeSettings.pageTitle");
  const pageDescription =
    propPageDescription ?? t("storeSettings.pageDescription");

  const ctrl = useStoreSettingsController(forcedTab);

  if (ctrl.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={getDirection()}>
      <StoreSettingsHeader
        pageTitle={pageTitle}
        pageDescription={pageDescription}
        hideNavigation={hideNavigation}
        activeTab={ctrl.activeTab}
        onTabChange={ctrl.handleTabChange}
      />

      <main className="w-full">
        <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-gray-700/50 p-6 lg:p-8 shadow-xl shadow-gray-200/20 dark:shadow-none min-h-[600px]">
          {ctrl.activeTab === "branches" ? (
            <StoreBranchesTab
              branches={ctrl.branches}
              onAdd={ctrl.handleAddBranch}
              onEdit={ctrl.handleEditBranch}
              onDelete={ctrl.handleDeleteBranch}
              showBranchModal={ctrl.showBranchModal}
              onCloseBranchModal={() => ctrl.setShowBranchModal(false)}
              onSaveBranch={ctrl.handleSaveBranch}
              branchForm={ctrl.branchForm}
              onBranchFormChange={ctrl.setBranchForm}
              isEditingBranch={Boolean(ctrl.editingBranch)}
            />
          ) : ctrl.activeTab === "shipping" ? (
            <StoreShippingTab
              shippingZones={ctrl.shippingZones}
              canonicalGovernorates={ctrl.canonicalGovernorates}
              onAddShipping={ctrl.handleAddShipping}
              onEditShipping={ctrl.handleEditShipping}
              onDeleteShipping={ctrl.handleDeleteShipping}
              shippingClasses={ctrl.shippingClasses}
              promotionSettings={ctrl.promotionSettings}
              onUpdatePromotionSettings={ctrl.handleUpdatePromotionSettings}
              storefrontSettings={ctrl.storefrontSettings}
              setStorefrontSettings={ctrl.setStorefrontSettings}
              shippingClassMode={ctrl.shippingClassMode}
              setShippingClassMode={ctrl.setShippingClassMode}
              shippingClassFees={ctrl.shippingClassFees}
              setShippingClassFees={ctrl.setShippingClassFees}
              savingShippingClassFees={ctrl.savingShippingClassFees}
              newShippingClassLabel={ctrl.newShippingClassLabel}
              setNewShippingClassLabel={ctrl.setNewShippingClassLabel}
              newShippingClassKey={ctrl.newShippingClassKey}
              setNewShippingClassKey={ctrl.setNewShippingClassKey}
              handleAddShippingClass={ctrl.handleAddShippingClass}
              handleUpdateShippingClassLabel={ctrl.handleUpdateShippingClassLabel}
              handleRemoveShippingClass={ctrl.handleRemoveShippingClass}
              handleSaveShippingClassFees={ctrl.handleSaveShippingClassFees}
              showShippingModal={ctrl.showShippingModal}
              onCloseShippingModal={() => ctrl.setShowShippingModal(false)}
              onSaveShipping={ctrl.handleSaveShipping}
              shippingForm={ctrl.shippingForm}
              setShippingForm={ctrl.setShippingForm}
              isEditingShipping={Boolean(ctrl.editingShipping)}
            />
          ) : ctrl.activeTab === "checkout" ? (
            <StoreCheckoutTab
              checkoutFormSettings={ctrl.checkoutFormSettings}
              checkoutFormSettingsLoading={ctrl.checkoutFormSettingsLoading}
              checkoutTabBusy={
                ctrl.checkoutFormSettingsLoading ||
                ctrl.checkoutFormSettingsSaving ||
                ctrl.processingCheckoutTab
              }
              applyCheckoutFormSettings={ctrl.applyCheckoutFormSettings}
              storefrontSettings={ctrl.storefrontSettings}
              handleToggleProductPageCheckout={
                ctrl.handleToggleProductPageCheckout
              }
              handleChangePdpQuickOrderSettings={
                ctrl.handleChangePdpQuickOrderSettings
              }
              handleSaveCheckoutTabSettings={ctrl.handleSaveCheckoutTabSettings}
              handleResetCheckoutTabSettings={
                ctrl.handleResetCheckoutTabSettings
              }
              handleToggleWishlist={ctrl.handleToggleWishlist}
              handleToggleComparison={ctrl.handleToggleComparison}
            />
          ) : ctrl.activeTab === "footer" ? (
            <StoreFooterTab
              footerSettings={ctrl.footerSettings}
              setFooterSettings={ctrl.setFooterSettings}
              socialLinks={
                (ctrl.storefrontSettings?.designTokens?.socialLinks as Record<
                  string,
                  string
                >) || {}
              }
              onSocialLinksChange={ctrl.handleChangeStorefrontSocialLinks}
              onSave={ctrl.handleSaveFooter}
              onReset={ctrl.handleResetFooter}
              loading={ctrl.loading}
            />
          ) : ctrl.activeTab === "promotion" ? (
            <StorePromotionTab />
          ) : ctrl.activeTab === "payment" ? (
            <StorePaymentTab
              settings={ctrl.storefrontSettings}
              onChange={ctrl.setStorefrontSettings}
              loading={ctrl.loading}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default StoreSettings;

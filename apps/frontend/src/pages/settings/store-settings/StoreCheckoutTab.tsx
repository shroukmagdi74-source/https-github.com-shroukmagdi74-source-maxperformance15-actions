import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  HeartIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { CheckoutFormSection } from "../../../components/store/CheckoutFormSection";
import { CheckoutFormSettings } from "../../../services/checkoutFormSettingsService";
import { StorefrontSettings } from "../../../services/storefrontSettingsService";
import {
  getPdpQuickOrderSettingsFromDesignTokens,
  PdpQuickOrderSettings,
} from "../../../storefront/utils/pdpQuickOrderSettings";
import { resolvePdpCheckoutEnabled } from "./types";

interface StoreCheckoutTabProps {
  checkoutFormSettings: CheckoutFormSettings;
  checkoutFormSettingsLoading: boolean;
  checkoutTabBusy: boolean;
  applyCheckoutFormSettings: (patch: Partial<CheckoutFormSettings>) => void;
  storefrontSettings: StorefrontSettings;
  handleToggleProductPageCheckout: (enabled: boolean) => void;
  handleChangePdpQuickOrderSettings: (
    settings: PdpQuickOrderSettings,
  ) => void;
  handleSaveCheckoutTabSettings: () => Promise<boolean>;
  handleResetCheckoutTabSettings: () => Promise<void>;
  handleToggleWishlist: (enabled: boolean) => void;
  handleToggleComparison: (enabled: boolean) => void;
}

export const StoreCheckoutTab: React.FC<StoreCheckoutTabProps> = ({
  checkoutFormSettings,
  checkoutFormSettingsLoading,
  checkoutTabBusy,
  applyCheckoutFormSettings,
  storefrontSettings,
  handleToggleProductPageCheckout,
  handleChangePdpQuickOrderSettings,
  handleSaveCheckoutTabSettings,
  handleResetCheckoutTabSettings,
  handleToggleWishlist,
  handleToggleComparison,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const productPageCheckoutEnabled =
    resolvePdpCheckoutEnabled(storefrontSettings);
  const pdpQuickOrderSettings = getPdpQuickOrderSettingsFromDesignTokens(
    storefrontSettings.designTokens,
  );

  return (
    <div className="space-y-6">
      <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("storeSettings.checkoutFieldsTitle")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("storeSettings.checkoutFieldsDesc")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/settings/store/tools")}
              className="px-4 py-2 rounded-md text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t("storeSettings.openConversionTools")}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleResetCheckoutTabSettings();
              }}
              disabled={checkoutTabBusy}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                checkoutTabBusy
                  ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              {t("storeSettings.resetToDefault")}
            </button>
          </div>
        </div>
      </div>

      {/* Product Image Action Buttons: Wishlist & Comparison */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              {t(
                "storeSettings.productPageActionsTitle",
                "أزرار التفاعل على صور المنتج",
              )}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t(
                "storeSettings.productPageActionsDesc",
                "التحكم في ظهور زري المفضلة والمقارنة العائمين فوق صور المنتج في المتجر.",
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings/store/product-conversion")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            {t("storeSettings.viewInConversionTools", "عرض في أدوات التحويل")}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-base shadow-sm">
                <HeartIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("storeSettings.wishlistToggle", "زر قائمة المفضلة")}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t(
                    "storeSettings.wishlistToggleDesc",
                    "إظهار أيقونة القلب لحفظ المنتج",
                  )}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={storefrontSettings?.wishlistEnabled !== false}
              onChange={(e) => handleToggleWishlist(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base shadow-sm">
                <ArrowsRightLeftIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("storeSettings.comparisonToggle", "زر مقارنة المنتجات")}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t(
                    "storeSettings.comparisonToggleDesc",
                    "إظهار زر المقارنة بين المواصفات",
                  )}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={storefrontSettings?.comparisonEnabled !== false}
              onChange={(e) => handleToggleComparison(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {checkoutFormSettingsLoading && !checkoutFormSettings ? (
        <div className="flex items-center justify-center min-h-[240px] rounded-2xl border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <CheckoutFormSection
          settings={checkoutFormSettings}
          onChange={applyCheckoutFormSettings}
          productPageCheckoutEnabled={productPageCheckoutEnabled}
          onProductPageCheckoutToggle={handleToggleProductPageCheckout}
          pdpQuickOrderSettings={pdpQuickOrderSettings}
          onPdpQuickOrderSettingsChange={handleChangePdpQuickOrderSettings}
          onSave={() => {
            void handleSaveCheckoutTabSettings();
          }}
          onReset={() => {
            void handleResetCheckoutTabSettings();
          }}
          loading={checkoutTabBusy}
        />
      )}
    </div>
  );
};

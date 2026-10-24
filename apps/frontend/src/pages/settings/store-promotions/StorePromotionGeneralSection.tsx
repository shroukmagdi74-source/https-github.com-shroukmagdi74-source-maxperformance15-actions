import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Calendar, Gift, ShoppingCart, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingsSection } from "../components/SettingsPagePrimitives";
import { StorePromotion } from "./types";

interface StorePromotionGeneralSectionProps {
  promotion: StorePromotion;
  onChange: (updates: Partial<StorePromotion>) => void;
}

export const StorePromotionGeneralSection: React.FC<StorePromotionGeneralSectionProps> = ({
  promotion,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <SettingsSection
        icon={Gift}
        title={t("storePromotionSettings.enablePromo")}
        description={t("storePromotionSettings.enablePromoDesc")}
        accentClassName="bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/30"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              {t("storePromotionSettings.enablePromo")}
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("storePromotionSettings.enablePromoDesc")}
            </p>
          </div>
          <Switch
            checked={promotion.isActive}
            onCheckedChange={(checked) => onChange({ isActive: checked })}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={ShoppingCart}
        title={t("storePromotionSettings.disableOtherDiscounts")}
        description={t("storePromotionSettings.disableOtherDiscountsDesc")}
        accentClassName="bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/30"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              {t("storePromotionSettings.disableOtherDiscounts")}
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("storePromotionSettings.disableOtherDiscountsDesc")}
            </p>
          </div>
          <Switch
            checked={promotion.disableOtherDiscounts}
            onCheckedChange={(checked) => onChange({ disableOtherDiscounts: checked })}
          />
        </div>

        {promotion.disableOtherDiscounts && (
          <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 p-3 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>{t("storePromotionSettings.disableOtherDiscountsAlert")}</p>
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        icon={Tag}
        title={t("storePromotionSettings.promoTitle")}
        description={t("storePromotionSettings.promoTitleDesc")}
        accentClassName="bg-sky-50 text-sky-700 ring-sky-200/70 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-500/30"
      >
        <Input
          value={promotion.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={t("storePromotionSettings.promoTitlePlaceholder")}
          className="max-w-md bg-white text-slate-900 border-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500 font-medium"
        />
      </SettingsSection>

      <SettingsSection
        icon={Calendar}
        title={t("storePromotionSettings.promoDate")}
        description={t("storePromotionSettings.promoDateDesc")}
        accentClassName="bg-violet-50 text-violet-700 ring-violet-200/70 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-500/30"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              {t("storePromotionSettings.from")}
            </Label>
            <Input
              type="datetime-local"
              value={promotion.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="bg-white text-slate-900 border-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-700 font-medium dark:[color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              {t("storePromotionSettings.to")}
            </Label>
            <Input
              type="datetime-local"
              value={promotion.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="bg-white text-slate-900 border-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-700 font-medium dark:[color-scheme:dark]"
            />
          </div>
        </div>
      </SettingsSection>
    </>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { PanelTop } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSection } from "../components/SettingsPagePrimitives";
import { StorePromotion } from "./types";

interface StorePromotionBarSectionProps {
  promotion: StorePromotion;
  onChange: (updates: Partial<StorePromotion>) => void;
}

export const StorePromotionBarSection: React.FC<StorePromotionBarSectionProps> = ({
  promotion,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <SettingsSection
      icon={PanelTop}
      title={t("storePromotionSettings.barSettings")}
      description={t("storePromotionSettings.barSettingsDesc")}
      accentClassName="bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/30"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              {t("storePromotionSettings.showBar")}
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("storePromotionSettings.showBarDesc")}
            </p>
          </div>
          <Switch
            checked={promotion.barVisible}
            onCheckedChange={(checked) => onChange({ barVisible: checked })}
          />
        </div>

        <Separator className="dark:bg-slate-800" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              {t("storePromotionSettings.stickyBar")}
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("storePromotionSettings.stickyBarDesc")}
            </p>
          </div>
          <Switch
            checked={promotion.barSticky}
            onCheckedChange={(checked) => onChange({ barSticky: checked })}
          />
        </div>

        <Separator className="dark:bg-slate-800" />

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-900 dark:text-slate-200">
            {t("storePromotionSettings.barPages")}
          </Label>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("storePromotionSettings.barPagesDesc")}
          </p>
          <Select
            value={promotion.barPages}
            onValueChange={(val) => onChange({ barPages: val })}
          >
            <SelectTrigger className="max-w-xs bg-white text-slate-900 border-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-700 font-medium">
              <SelectValue>
                {promotion.barPages === "shop"
                  ? t("storePromotionSettings.shopOnly")
                  : promotion.barPages === "product"
                    ? t("storePromotionSettings.productOnly")
                    : promotion.barPages === "checkout"
                      ? t("storePromotionSettings.checkoutOnly")
                      : t("storePromotionSettings.allPages")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
              <SelectItem value="all" className="dark:text-slate-100 dark:focus:bg-slate-800">
                {t("storePromotionSettings.allPages")}
              </SelectItem>
              <SelectItem value="shop" className="dark:text-slate-100 dark:focus:bg-slate-800">
                {t("storePromotionSettings.shopOnly")}
              </SelectItem>
              <SelectItem value="product" className="dark:text-slate-100 dark:focus:bg-slate-800">
                {t("storePromotionSettings.productOnly")}
              </SelectItem>
              <SelectItem value="checkout" className="dark:text-slate-100 dark:focus:bg-slate-800">
                {t("storePromotionSettings.checkoutOnly")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SettingsSection>
  );
};

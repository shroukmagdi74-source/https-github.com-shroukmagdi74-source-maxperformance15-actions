import React from "react";
import { useTranslation } from "react-i18next";
import { Megaphone, Gift, Ticket, Award } from "lucide-react";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import type { NotificationSettings } from "../types";

interface MarketingTabProps {
  settings: NotificationSettings;
  updateSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) => void;
}

export const MarketingTab: React.FC<MarketingTabProps> = ({
  settings,
  updateSetting,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm max-w-3xl">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">
            {t("whatsappNotifications.tabs.marketing", "الإشعارات التسويقية والولاء")}
          </h3>
        </div>
        <Switch
          checked={settings.marketingNotificationsEnabled}
          onCheckedChange={(checked) =>
            updateSetting("marketingNotificationsEnabled", checked)
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Promotional */}
        <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-3">
          <div className="space-y-0.5">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />
              {t("whatsappNotifications.marketing.promotional", "العروض والرسائل الترويجية")}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t("whatsappNotifications.marketing.promotionalDesc", "إرسال العروض والتخفيضات الموسمية")}
            </p>
          </div>
          <Switch
            disabled={!settings.marketingNotificationsEnabled}
            checked={settings.promotionalEnabled}
            onCheckedChange={(checked) => updateSetting("promotionalEnabled", checked)}
          />
        </div>

        {/* Coupons */}
        <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-3">
          <div className="space-y-0.5">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
              {t("whatsappNotifications.marketing.coupons", "كوبونات الخصم والمكافآت")}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t("whatsappNotifications.marketing.couponsDesc", "إرسال قسائم الشراء الخاصة")}
            </p>
          </div>
          <Switch
            disabled={!settings.marketingNotificationsEnabled}
            checked={settings.couponEnabled}
            onCheckedChange={(checked) => updateSetting("couponEnabled", checked)}
          />
        </div>

        {/* Birthday Wish */}
        <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-3">
          <div className="space-y-0.5">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5 text-muted-foreground" />
              {t("whatsappNotifications.marketing.birthday", "تهنئة أعياد الميلاد")}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t("whatsappNotifications.marketing.birthdayDesc", "رسالة تهنئة مع هدية أو كود خصم")}
            </p>
          </div>
          <Switch
            disabled={!settings.marketingNotificationsEnabled}
            checked={settings.birthdayEnabled}
            onCheckedChange={(checked) => updateSetting("birthdayEnabled", checked)}
          />
        </div>

        {/* Loyalty Program */}
        <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-3">
          <div className="space-y-0.5">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-muted-foreground" />
              {t("whatsappNotifications.marketing.loyalty", "تنبيهات برنامج الولاء")}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t("whatsappNotifications.marketing.loyaltyDesc", "إشعار العميل بالنقاط المكتسبة والترقية")}
            </p>
          </div>
          <Switch
            disabled={!settings.marketingNotificationsEnabled}
            checked={settings.loyaltyEnabled}
            onCheckedChange={(checked) => updateSetting("loyaltyEnabled", checked)}
          />
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, ShoppingBag, Percent, Clock } from "lucide-react";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import type { NotificationSettings } from "../types";

interface ProductsTabProps {
  settings: NotificationSettings;
  updateSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  settings,
  updateSetting,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 1. Product Alerts Section */}
      <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">
              {t("whatsappNotifications.tabs.products", "تنبيهات المنتجات")}
            </h3>
          </div>
          <Switch
            checked={settings.productNotificationsEnabled}
            onCheckedChange={(checked) =>
              updateSetting("productNotificationsEnabled", checked)
            }
          />
        </div>

        <div className="space-y-3">
          {/* Back in stock */}
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-2.5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-foreground">
                {t("whatsappNotifications.products.backInStock", "توفر المنتج بعد النفاد")}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t("whatsappNotifications.products.backInStockHelp", "إشعار العملاء المسجلين في قائمة الانتظار فور توفر المخزون")}
              </p>
            </div>
            <Switch
              disabled={!settings.productNotificationsEnabled}
              checked={settings.backInStockEnabled}
              onCheckedChange={(checked) => updateSetting("backInStockEnabled", checked)}
            />
          </div>

          {/* Price drop */}
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-2.5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-foreground">
                {t("whatsappNotifications.products.priceDrop", "انخفاض سعر المنتج")}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t("whatsappNotifications.products.priceDropHelp", "إرسال إشعار تلقائي للعملاء المهتمين عند تخفيض السعر")}
              </p>
            </div>
            <Switch
              disabled={!settings.productNotificationsEnabled}
              checked={settings.priceDropEnabled}
              onCheckedChange={(checked) => updateSetting("priceDropEnabled", checked)}
            />
          </div>

          {/* New product */}
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-2.5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-foreground">
                {t("whatsappNotifications.products.newProduct", "إطلاق منتجات جديدة")}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t("whatsappNotifications.products.newProductHelp", "إشعار العملاء المميزين بأحدث المنتجات المضافة")}
              </p>
            </div>
            <Switch
              disabled={!settings.productNotificationsEnabled}
              checked={settings.newProductEnabled}
              onCheckedChange={(checked) => updateSetting("newProductEnabled", checked)}
            />
          </div>
        </div>
      </div>

      {/* 2. Abandoned Cart Recovery */}
      <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">
              {t("whatsappNotifications.tabs.abandonedCart", "استعادة السلات المتروكة")}
            </h3>
          </div>
          <Switch
            checked={settings.abandonedCartEnabled}
            onCheckedChange={(checked) =>
              updateSetting("abandonedCartEnabled", checked)
            }
          />
        </div>

        {/* Reminders Hours */}
        <div className="space-y-2.5">
          <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {t("whatsappNotifications.abandonedCart.timing", "مواعيد إرسال التذكيرات (بالساعات)")}
          </Label>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground">التذكير 1</span>
              <Input
                type="number"
                min={1}
                disabled={!settings.abandonedCartEnabled}
                value={settings.abandonedCartFirstReminder || 1}
                onChange={(e) =>
                  updateSetting(
                    "abandonedCartFirstReminder",
                    Number.parseInt(e.target.value, 10) || 1,
                  )
                }
                className="h-8 font-mono text-xs tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground">التذكير 2</span>
              <Input
                type="number"
                min={2}
                disabled={!settings.abandonedCartEnabled}
                value={settings.abandonedCartSecondReminder || 24}
                onChange={(e) =>
                  updateSetting(
                    "abandonedCartSecondReminder",
                    Number.parseInt(e.target.value, 10) || 24,
                  )
                }
                className="h-8 font-mono text-xs tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground">التذكير 3</span>
              <Input
                type="number"
                min={3}
                disabled={!settings.abandonedCartEnabled}
                value={settings.abandonedCartThirdReminder || 72}
                onChange={(e) =>
                  updateSetting(
                    "abandonedCartThirdReminder",
                    Number.parseInt(e.target.value, 10) || 72,
                  )
                }
                className="h-8 font-mono text-xs tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Incentive Discount */}
        <div className="rounded-md border border-border/40 bg-muted/20 p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                {t("whatsappNotifications.abandonedCart.incentiveDiscount", "تقديم كوبون خصم تشجيعي")}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t("whatsappNotifications.abandonedCart.discountHelp", "إرفاق كود خصم خاص في رسالة التذكير الأخيرة")}
              </p>
            </div>
            <Switch
              disabled={!settings.abandonedCartEnabled}
              checked={settings.abandonedCartDiscountEnabled}
              onCheckedChange={(checked) =>
                updateSetting("abandonedCartDiscountEnabled", checked)
              }
            />
          </div>

          {settings.abandonedCartDiscountEnabled && (
            <div className="space-y-1 pt-1">
              <Label className="text-[11px] text-muted-foreground">
                {t("whatsappNotifications.abandonedCart.percent", "نسبة الخصم (%)")}
              </Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={settings.abandonedCartDiscountPercent || 10}
                onChange={(e) =>
                  updateSetting(
                    "abandonedCartDiscountPercent",
                    Number.parseInt(e.target.value, 10) || 10,
                  )
                }
                className="h-8 font-mono text-xs tabular-nums max-w-[120px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, Bell, ShieldAlert, CreditCard } from "lucide-react";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import type { NotificationSettings } from "../types";

interface CompanyTabProps {
  settings: NotificationSettings;
  superAdminMode?: boolean;
  updateSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) => void;
}

export const CompanyTab: React.FC<CompanyTabProps> = ({
  settings,
  superAdminMode,
  updateSetting,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 1. Signup & Welcome Lifecycle */}
      <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">
              {i18n.language === "ar" ? "تسجيل الحسابات والترحيب" : "Account Signup & Welcome"}
            </h3>
          </div>
          <Switch
            checked={settings.companyLifecycleNotificationsEnabled}
            onCheckedChange={(checked) =>
              updateSetting("companyLifecycleNotificationsEnabled", checked)
            }
          />
        </div>

        <div className="space-y-3">
          {/* Welcome Message */}
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-2.5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-foreground">
                {i18n.language === "ar" ? "رسالة الترحيب بعد التسجيل" : "Welcome after signup"}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {i18n.language === "ar"
                  ? "ترحيب تلقائي للمستخدم فور إنشاء الحساب"
                  : "Automatic welcome message upon registration"}
              </p>
            </div>
            <Switch
              disabled={!settings.companyLifecycleNotificationsEnabled}
              checked={settings.newSignupWelcomeEnabled}
              onCheckedChange={(checked) =>
                updateSetting("newSignupWelcomeEnabled", checked)
              }
            />
          </div>

          {/* Admin Alert */}
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-2.5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-foreground">
                {i18n.language === "ar" ? "تنبيه الإدارة بتسجيل جديد" : "Admin alert for signup"}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {i18n.language === "ar"
                  ? "إرسال إشعار فوري لأرقام الإدارة عند وجود تسجيل جديد"
                  : "Notify leadership phone numbers when a new user signs up"}
              </p>
            </div>
            <Switch
              disabled={!settings.companyLifecycleNotificationsEnabled}
              checked={settings.newSignupAdminAlertEnabled}
              onCheckedChange={(checked) =>
                updateSetting("newSignupAdminAlertEnabled", checked)
              }
            />
          </div>

          {/* Admin Phones Input */}
          {settings.newSignupAdminAlertEnabled && (
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                {i18n.language === "ar" ? "أرقام الإدارة المستلمة" : "Admin Phone Numbers"}
              </Label>
              <Input
                placeholder="2010xxxxxxxx, 2011xxxxxxxx"
                value={settings.companyLifecycleAdminPhones || ""}
                onChange={(e) =>
                  updateSetting("companyLifecycleAdminPhones", e.target.value)
                }
                className="h-8 font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                {i18n.language === "ar"
                  ? "افصل بين الأرقام بفاصلة (,)"
                  : "Separate multiple numbers with commas"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Subscription Lifecycle */}
      <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">
            {i18n.language === "ar" ? "إشعارات الاشتراكات والباقات" : "Subscription Lifecycle"}
          </h3>
        </div>

        <div className="space-y-3">
          {/* Subscription Created */}
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-2.5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-foreground">
                {i18n.language === "ar" ? "تأكيد إنشاء الاشتراك" : "Subscription created"}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {i18n.language === "ar" ? "رسالة تأكيد وتفاصيل الخطة" : "Confirmation with plan details"}
              </p>
            </div>
            <Switch
              disabled={!settings.companyLifecycleNotificationsEnabled}
              checked={settings.subscriptionCreatedEnabled}
              onCheckedChange={(checked) =>
                updateSetting("subscriptionCreatedEnabled", checked)
              }
            />
          </div>

          {/* Subscription Renewed */}
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-2.5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-foreground">
                {i18n.language === "ar" ? "تنبيه تجديد الاشتراك" : "Subscription renewed"}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {i18n.language === "ar" ? "إشعار التجديد الدوري للفاتورة" : "Recurring renewal receipt alert"}
              </p>
            </div>
            <Switch
              disabled={!settings.companyLifecycleNotificationsEnabled}
              checked={settings.subscriptionRenewedEnabled}
              onCheckedChange={(checked) =>
                updateSetting("subscriptionRenewedEnabled", checked)
              }
            />
          </div>

          {/* Subscription Cancelled */}
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-2.5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-foreground">
                {i18n.language === "ar" ? "تنبيه إلغاء الاشتراك" : "Subscription cancelled"}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {i18n.language === "ar" ? "إشعار انتهاء أو إلغاء الخطة" : "Cancellation confirmation"}
              </p>
            </div>
            <Switch
              disabled={!settings.companyLifecycleNotificationsEnabled}
              checked={settings.subscriptionCancelledEnabled}
              onCheckedChange={(checked) =>
                updateSetting("subscriptionCancelledEnabled", checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

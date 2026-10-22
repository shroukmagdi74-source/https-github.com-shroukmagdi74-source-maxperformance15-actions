import React from "react";
import { useTranslation } from "react-i18next";
import { Settings, Shield, Clock, Smartphone } from "lucide-react";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import type { NotificationSettings, Session } from "../types";

interface GeneralTabProps {
  settings: NotificationSettings;
  sessions: Session[];
  updateSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  settings,
  sessions,
  updateSetting,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 1. Main Activation & Session Binding */}
      <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
          <Settings className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">
            {t("whatsappNotifications.general.mainControl", "التحكم الرئيسي والجلسة")}
          </h3>
        </div>

        {/* Master Switch */}
        <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/20 p-3">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold text-foreground">
              {t("whatsappNotifications.general.enableNotifications", "تفعيل خدمة الإشعارات")}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t(
                "whatsappNotifications.general.enableNotificationsDesc",
                "تشغيل أو إيقاف إرسال الرسائل التلقائية لجميع الأقسام",
              )}
            </p>
          </div>
          <Switch
            checked={settings.isEnabled}
            onCheckedChange={(checked) => updateSetting("isEnabled", checked)}
          />
        </div>

        {/* Default Session */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
            {t("whatsappNotifications.general.defaultSession", "جلسة الإرسال الافتراضية")}
          </Label>
          <Select
            value={settings.defaultSessionId || "auto"}
            onValueChange={(val) =>
              updateSetting("defaultSessionId", val === "auto" ? null : val)
            }
          >
            <SelectTrigger className="h-8 text-xs font-mono">
              <SelectValue placeholder={t("whatsappNotifications.general.autoSession", "تحديد تلقائي")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto" className="text-xs">
                {t("whatsappNotifications.general.autoSession", "تحديد تلقائي (أول جلسة متصلة)")}
              </SelectItem>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id} className="text-xs font-mono">
                  {session.name} ({session.phoneNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sticky Session Switch */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="space-y-0.5">
            <Label className="text-xs font-medium text-foreground">
              {t("whatsappNotifications.general.stickySession", "تثبيت الجلسة لكل عميل")}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t(
                "whatsappNotifications.general.stickySessionDesc",
                "إرسال إشعارات العميل دائماً من نفس الرقم الذي بدأ به المحادثة",
              )}
            </p>
          </div>
          <Switch
            checked={settings.stickySessionEnabled}
            onCheckedChange={(checked) =>
              updateSetting("stickySessionEnabled", checked)
            }
          />
        </div>
      </div>

      {/* 2. Rate Limiting & Quiet Hours */}
      <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
          <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">
            {t("whatsappNotifications.general.safetyAndLimits", "حدود الإرسال وساعات الهدوء")}
          </h3>
        </div>

        {/* Rate Limit */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            {t("whatsappNotifications.general.rateLimit", "الحد الأقصى للرسائل في الدقيقة")}
          </Label>
          <Input
            type="number"
            min={1}
            max={60}
            value={settings.rateLimitPerMinute || 20}
            onChange={(e) =>
              updateSetting(
                "rateLimitPerMinute",
                Number.parseInt(e.target.value, 10) || 20,
              )
            }
            className="h-8 font-mono text-xs tabular-nums"
          />
          <p className="text-[10px] text-muted-foreground">
            {t(
              "whatsappNotifications.general.rateLimitHelp",
              "ينصح بحد أقصى 20 رسالة في الدقيقة لحماية الرقم من الحظر",
            )}
          </p>
        </div>

        {/* Quiet Hours Switch */}
        <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/20 p-3">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {t("whatsappNotifications.general.quietHours", "تفعيل ساعات الهدوء")}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t(
                "whatsappNotifications.general.quietHoursDesc",
                "كتم وإرجاء الرسائل غير الطارئة أثناء ساعات الليل",
              )}
            </p>
          </div>
          <Switch
            checked={settings.quietHoursEnabled}
            onCheckedChange={(checked) =>
              updateSetting("quietHoursEnabled", checked)
            }
          />
        </div>

        {/* Quiet Hours Range */}
        {settings.quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">
                {t("whatsappNotifications.general.quietHoursStart", "بداية الهدوء")}
              </Label>
              <Input
                type="time"
                value={settings.quietHoursStart || "23:00"}
                onChange={(e) => updateSetting("quietHoursStart", e.target.value)}
                className="h-8 font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">
                {t("whatsappNotifications.general.quietHoursEnd", "نهاية الهدوء")}
              </Label>
              <Input
                type="time"
                value={settings.quietHoursEnd || "08:00"}
                onChange={(e) => updateSetting("quietHoursEnd", e.target.value)}
                className="h-8 font-mono text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Bell,
  RefreshCw,
  Save,
  TestTube,
  Cog,
  GitBranch,
} from "lucide-react";
import { Button, buttonVariants } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

interface WhatsAppNotificationsHeaderProps {
  pageTitle: string;
  pageDescription: string;
  eyebrow?: string;
  loading: boolean;
  refreshing: boolean;
  saving: boolean;
  settingsHref: string;
  automationsHref: string;
  onRefresh: () => void;
  onOpenTest: () => void;
  onSave: () => void;
}

export const WhatsAppNotificationsHeader: React.FC<WhatsAppNotificationsHeaderProps> = ({
  pageTitle,
  pageDescription,
  eyebrow,
  loading,
  refreshing,
  saving,
  settingsHref,
  automationsHref,
  onRefresh,
  onOpenTest,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 mt-0.5">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {pageTitle}
            </h1>
            {eyebrow && (
              <Badge variant="outline" className="text-[10px] font-medium">
                {eyebrow}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm max-w-2xl mt-0.5">
            {pageDescription}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {t("common.refresh", "تحديث")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenTest}
          disabled={loading}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <TestTube className="h-3.5 w-3.5 text-muted-foreground" />
          {t("whatsappNotifications.actions.testMessage", "إرسال رسالة تجريبية")}
        </Button>

        <Link
          to={settingsHref}
          className={`${buttonVariants({ variant: "outline", size: "sm" })} h-8 gap-1.5 text-xs font-medium inline-flex items-center`}
        >
          <Cog className="h-3.5 w-3.5 text-muted-foreground" />
          {t("whatsappNotifications.actions.settings", "إعدادات الربط")}
        </Link>

        <Link
          to={automationsHref}
          className={`${buttonVariants({ variant: "outline", size: "sm" })} h-8 gap-1.5 text-xs font-medium inline-flex items-center`}
        >
          <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
          {t("whatsappNotifications.actions.automations", "مسارات الأتمتة")}
        </Link>

        <Button
          size="sm"
          onClick={onSave}
          disabled={loading || saving}
          className="h-8 gap-1.5 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? t("common.saving", "جاري الحفظ...") : t("common.save", "حفظ الإعدادات")}
        </Button>
      </div>
    </div>
  );
};

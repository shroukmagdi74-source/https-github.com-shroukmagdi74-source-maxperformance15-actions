import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, RefreshCw, ExternalLink } from "lucide-react";
import { FacebookIcon } from "../../../components/icons/brands";
import { Button } from "../../../components/ui/button";

interface FacebookOAuthHeaderProps {
  loading: boolean;
  hasConnectedPages: boolean;
  onConnect: (reauthorize?: boolean) => void;
  onRefresh: () => void;
}

export const FacebookOAuthHeader: React.FC<FacebookOAuthHeaderProps> = ({
  loading,
  hasConnectedPages,
  onConnect,
  onRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400">
          <FacebookIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {t("facebookOAuth.pageTitle", "ربط صفحات فيسبوك وإنستجرام")}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {t(
              "facebookOAuth.description",
              "إدارة ربط الصفحات، استقبال الرسائل والتعليقات، وتجديد أذونات الوصول السحابي",
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {t("common.refresh", "تحديث")}
        </Button>

        {hasConnectedPages ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConnect(true)}
              disabled={loading}
              className="h-8 gap-1.5 text-xs font-medium"
              title={t("facebookOAuth.reselectPagesTooltip", "إعادة اختيار الصفحات")}
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              {t("facebookOAuth.reselectPages", "إعادة اختيار الصفحات")}
            </Button>

            <Button
              size="sm"
              onClick={() => onConnect(false)}
              disabled={loading}
              className="h-8 gap-1.5 bg-blue-600 text-xs font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("facebookOAuth.addMorePages", "إضافة صفحات")}
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={() => onConnect(false)}
            disabled={loading}
            className="h-8 gap-1.5 bg-blue-600 text-xs font-medium text-white hover:bg-blue-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("facebookOAuth.connectWithFacebook", "ربط مع فيسبوك")}
          </Button>
        )}
      </div>
    </div>
  );
};

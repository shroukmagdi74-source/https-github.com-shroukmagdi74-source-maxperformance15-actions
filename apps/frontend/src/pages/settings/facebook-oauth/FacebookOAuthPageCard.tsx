import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Trash2, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { FacebookPage } from "./types";

interface FacebookOAuthPageCardProps {
  page: FacebookPage;
  isSelected: boolean;
  loading: boolean;
  onToggleSelect: (pageId: string) => void;
  onReconnect: (pageId: string) => void;
  onDisconnect: (pageId: string) => void;
  onHardDelete: (pageId: string) => void;
}

export const FacebookOAuthPageCard: React.FC<FacebookOAuthPageCardProps> = ({
  page,
  isSelected,
  loading,
  onToggleSelect,
  onReconnect,
  onDisconnect,
  onHardDelete,
}) => {
  const { t, i18n } = useTranslation();

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      i18n.language === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  const isConnected = page.status === "connected";
  const needsReconnect = Boolean(page.needsReconnect);

  return (
    <div
      className={`group flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors ${
        isSelected
          ? "border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10"
          : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(page.id)}
          className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-border text-blue-600 focus:ring-blue-500"
        />

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400">
          <MessageSquare className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="truncate text-xs font-semibold text-foreground sm:text-sm">
              {page.pageName}
            </h4>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              ({page.pageId})
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {page.connectedAt && (
              <span className="font-mono tabular-nums">
                {t("facebookOAuth.connectedSince", { date: formatDate(page.connectedAt) })}
              </span>
            )}
            {page.disconnectedAt && !isConnected && (
              <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {t("facebookOAuth.disconnectedAt", { date: formatDate(page.disconnectedAt) })}
              </span>
            )}
          </div>

          {page.healthMessage && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {page.healthMessage}
            </p>
          )}
        </div>
      </div>

      {/* Badges & Actions */}
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            isConnected && !needsReconnect
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : needsReconnect
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {isConnected
            ? needsReconnect
              ? t("facebookOAuth.needsReconnect", "يحتاج إعادة ربط")
              : t("facebookOAuth.connected", "متصل")
            : t("facebookOAuth.pageNotConnected", "غير متصل")}
        </span>

        {page.attribution === "stale" && (
          <span
            title={t("facebookOAuth.attributionStaleHint")}
            className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300 cursor-help"
          >
            {t("facebookOAuth.attributionStale", "مربوطة بحساب مختلف")}
          </span>
        )}

        {page.attribution === "unattributed" && (
          <span
            title={t("facebookOAuth.attributionUnlinkedHint")}
            className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground cursor-help"
          >
            {t("facebookOAuth.attributionUnlinked", "غير منسوبة لحساب")}
          </span>
        )}

        {page.canReconnect !== false && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReconnect(page.id)}
            disabled={loading}
            className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
            title={t("facebookOAuth.reconnectTooltip", "إعادة الربط")}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}

        {isConnected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDisconnect(page.id)}
            disabled={loading}
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            title={t("facebookOAuth.disconnect", "فصل")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onHardDelete(page.id)}
          disabled={loading}
          className="h-7 w-7 p-0 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          title={t("facebookOAuth.hardDeleteTooltip", "حذف نهائي")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

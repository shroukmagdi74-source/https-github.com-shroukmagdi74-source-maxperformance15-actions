import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertTriangle, Users, ShieldCheck } from "lucide-react";
import type { FacebookUser } from "./types";

interface FacebookOAuthKPIsProps {
  connectedPagesCount: number;
  disconnectedPagesCount: number;
  accountsCount: number;
  facebookUser?: FacebookUser | null;
}

export const FacebookOAuthKPIs: React.FC<FacebookOAuthKPIsProps> = ({
  connectedPagesCount,
  disconnectedPagesCount,
  accountsCount,
  facebookUser,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* 1. Connected Pages */}
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("facebookOAuth.connected", "الصفحات المتصلة")}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {connectedPagesCount}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              {t("common.active", "نشطة")}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Disconnected / Needs Reconnect */}
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
            disconnectedPagesCount > 0
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("facebookOAuth.needsAttention", "تحتاج انتباه")}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {disconnectedPagesCount}
            </span>
            {disconnectedPagesCount > 0 ? (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                {t("facebookOAuth.needsReconnect", "تحتاج إعادة ربط")}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">
                {t("common.none", "لا يوجد")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Accounts Linked */}
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Users className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("facebookOAuth.accountsCountLabel", "الحسابات المربوطة")}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {accountsCount || (facebookUser ? 1 : 0)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {t("facebookOAuth.metaAccounts", "حساب Meta")}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Active Profile */}
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        {facebookUser?.picture ? (
          <img
            src={facebookUser.picture}
            alt={facebookUser.name}
            className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {facebookUser?.name ? facebookUser.name.charAt(0).toUpperCase() : <ShieldCheck className="h-4 w-4" />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground truncate">
            {t("facebookOAuth.linkedAccount", "حساب فيسبوك المعتمد")}
          </p>
          <p className="truncate text-xs font-semibold text-foreground">
            {facebookUser?.name || t("facebookOAuth.noAccountLinked", "غير مسجل")}
          </p>
        </div>
      </div>
    </div>
  );
};

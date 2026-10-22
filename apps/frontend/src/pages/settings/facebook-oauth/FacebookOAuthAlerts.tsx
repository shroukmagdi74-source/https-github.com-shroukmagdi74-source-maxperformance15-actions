import React from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  AlertTriangle,
  X,
  MessageSquare,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { SkippedPage, AffectedCompany } from "./types";

interface FacebookOAuthAlertsProps {
  success: string | null;
  error: string | null;
  skippedPages: SkippedPage[];
  noPageGrants: boolean;
  affectedCompanies: AffectedCompany[];
  reconsenting: boolean;
  forceDisconnecting: string | null;
  userRole?: string;
  onDismissSuccess: () => void;
  onDismissError: () => void;
  onResolveSkipped: () => void;
  onForceDisconnectPage: (pageId: string) => void;
  onFullReconsent: () => void;
}

export const FacebookOAuthAlerts: React.FC<FacebookOAuthAlertsProps> = ({
  success,
  error,
  skippedPages,
  noPageGrants,
  affectedCompanies,
  reconsenting,
  forceDisconnecting,
  userRole,
  onDismissSuccess,
  onDismissError,
  onResolveSkipped,
  onForceDisconnectPage,
  onFullReconsent,
}) => {
  const { t } = useTranslation();

  const canForceClaim =
    userRole === "SUPER_ADMIN" ||
    userRole === "OWNER" ||
    userRole === "MANAGER" ||
    userRole === "COMPANY_ADMIN" ||
    userRole === "ADMIN";

  return (
    <div className="space-y-3">
      {/* Success Notification */}
      {success && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs sm:text-sm font-medium whitespace-pre-line">{success}</p>
          </div>
          <button
            onClick={onDismissSuccess}
            className="rounded p-1 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={onDismissError}
            className="rounded p-1 text-destructive hover:bg-destructive/20"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Skipped Pages Warning */}
      {skippedPages.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {t("facebookOAuth.skippedPagesTitle", { count: skippedPages.length })}
                </h4>
                <p className="mt-0.5 text-xs text-amber-800/90 dark:text-amber-300">
                  {t("facebookOAuth.skippedPagesDesc")}
                </p>
              </div>
            </div>
            <button
              onClick={onResolveSkipped}
              className="rounded p-1 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {skippedPages.map((page) => (
              <div
                key={page.pageId}
                className="flex items-center justify-between gap-3 rounded-md border border-amber-500/20 bg-background/80 p-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {page.pageName}
                    </p>
                    <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      ID: {page.pageId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                    {t("facebookOAuth.skippedPageBoundToOther")}
                  </span>
                  {canForceClaim && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onForceDisconnectPage(page.pageId)}
                      disabled={forceDisconnecting === page.pageId}
                      className="h-7 text-xs font-medium"
                    >
                      {forceDisconnecting === page.pageId
                        ? t("facebookOAuth.forceDisconnecting")
                        : t("facebookOAuth.claimPageToCompany", "ضم الصفحة")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-amber-500/20 pt-2.5">
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
              {t("facebookOAuth.skippedPagesNote")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onResolveSkipped}
              className="h-7 text-xs font-medium text-amber-800 dark:text-amber-200"
            >
              {t("facebookOAuth.skippedPagesAcknowledge")}
            </Button>
          </div>
        </div>
      )}

      {/* Zero Page Grants Guided Alert */}
      {noPageGrants && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {t("facebookOAuth.noPageGrantsTitle")}
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {t("facebookOAuth.noPageGrantsMessage")}
              </p>

              {affectedCompanies.length > 0 && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  {t("facebookOAuth.reconsentWarningCompanies", {
                    companies: affectedCompanies
                      .map((c) => c.companyName)
                      .join("، "),
                  })}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <Button
                  size="sm"
                  onClick={onFullReconsent}
                  disabled={reconsenting}
                  className="h-8 gap-1.5 bg-blue-600 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {reconsenting
                    ? t("facebookOAuth.reconsentProcessing")
                    : t("facebookOAuth.reconsentButton")}
                </Button>
                <span className="text-[11px] text-muted-foreground">
                  {t("facebookOAuth.reconsentManualHint")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

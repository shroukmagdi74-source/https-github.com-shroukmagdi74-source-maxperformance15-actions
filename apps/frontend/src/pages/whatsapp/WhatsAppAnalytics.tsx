import React from "react";
import { AlertTriangle, BarChart3, RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import PeriodSelector from "../../components/common/PeriodSelector";
import { WhatsAppPageShell } from "./components/WhatsAppPageShell";
import {
  useWhatsAppAnalyticsController,
  WhatsAppAnalyticsBreakdownCards,
  WhatsAppAnalyticsHeroCards,
  WhatsAppAnalyticsLogsTable,
  WhatsAppAnalyticsRatesCards,
  type WhatsAppAnalyticsProps,
} from "./notifications-analytics";

export const WhatsAppAnalytics: React.FC<WhatsAppAnalyticsProps> = ({
  companyId,
  companyName,
  superAdminMode = false,
}) => {
  const {
    t,
    pageTitle,
    backHref,
    eyebrow,
    summaryHint,
    unknownRecipient,
    loading,
    refreshing,
    error,
    stats,
    logs,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalLogs,
    setRange,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    handleRefresh,
    formatLocaleDate,
    formatPercent,
    categorySeries,
    topEvents,
    totalPages,
    from,
    to,
    canGoPrevious,
    canGoNext,
    STATUS_LABELS,
    CATEGORY_LABELS,
    EVENT_LABELS,
  } = useWhatsAppAnalyticsController({ companyId, companyName, superAdminMode });

  if (loading) {
    return (
      <WhatsAppPageShell
        title={pageTitle}
        description={t("whatsappAnalytics.description")}
        icon={BarChart3}
        backHref={backHref}
        backLabel={t("common.back") as string}
        eyebrow={eyebrow}
      >
        <div className="grid gap-3 grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </WhatsAppPageShell>
    );
  }

  return (
    <WhatsAppPageShell
      title={pageTitle}
      description={t("whatsappAnalytics.description")}
      icon={BarChart3}
      backHref={backHref}
      backLabel={t("common.back") as string}
      eyebrow={eyebrow}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector
            onRangeChange={(next) => {
              setPage(0);
              setRange(next);
            }}
          />

          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`size-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            {t("common.refresh")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <Alert className="rounded-2xl border-destructive/20 bg-destructive/10 text-destructive">
            <AlertTriangle className="size-4 text-destructive" />
            <AlertTitle>{t("whatsappAnalytics.title")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <WhatsAppAnalyticsHeroCards stats={stats} summaryHint={summaryHint} t={t} />

        <WhatsAppAnalyticsRatesCards
          stats={stats}
          summaryHint={summaryHint}
          formatPercent={formatPercent}
          t={t}
        />

        <WhatsAppAnalyticsBreakdownCards
          stats={stats}
          categorySeries={categorySeries}
          topEvents={topEvents}
          summaryHint={summaryHint}
          categoryLabels={CATEGORY_LABELS}
          eventLabels={EVENT_LABELS}
          t={t}
        />

        <WhatsAppAnalyticsLogsTable
          logs={logs}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          page={page}
          rowsPerPage={rowsPerPage}
          totalLogs={totalLogs}
          totalPages={totalPages}
          from={from}
          to={to}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          summaryHint={summaryHint}
          unknownRecipient={unknownRecipient}
          categoryLabels={CATEGORY_LABELS}
          statusLabels={STATUS_LABELS}
          eventLabels={EVENT_LABELS}
          t={t}
          formatLocaleDate={formatLocaleDate}
          onSetPage={setPage}
          onSetRowsPerPage={setRowsPerPage}
          onSetCategoryFilter={setCategoryFilter}
          onSetStatusFilter={setStatusFilter}
        />
      </div>
    </WhatsAppPageShell>
  );
};

export default WhatsAppAnalytics;

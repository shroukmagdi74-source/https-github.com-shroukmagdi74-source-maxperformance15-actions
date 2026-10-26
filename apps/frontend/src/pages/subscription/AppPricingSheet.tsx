import React from "react";
import { Plus, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import {
  useAppPricingSheetController,
  AppPricingKpiAndFilters,
  AppPricingTableView,
  AppPricingGridView,
  AppPricingDialogs,
} from "./app-pricing";

export default function AppPricingSheet() {
  const c = useAppPricingSheetController();
  const { t, loading, isSuperAdmin, processedApps, paginatedApps, totalPages, page, pageSize } = c;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl font-cairo">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-cairo tracking-tight text-slate-900 dark:text-slate-100">
            {t("subscription.appPricingTitle")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-cairo text-sm">
            {t("subscription.appPricingSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-cairo text-xs gap-1.5 h-9"
            onClick={() => void c.clearFilters()}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {t("common.reload", "تحديث")}
          </Button>

          {isSuperAdmin && (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-cairo text-xs gap-1.5 h-9"
              onClick={() => c.handleOpenDialog()}
            >
              <Plus size={16} />
              {t("subscription.addApp", "إضافة تطبيق")}
            </Button>
          )}
        </div>
      </div>

      {/* KPIs & Filter bar */}
      <AppPricingKpiAndFilters c={c} />

      {/* Main Content Area */}
      {loading ? (
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      ) : processedApps.length === 0 ? (
        <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-20 text-center border border-slate-200 dark:border-slate-800 border-dashed">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Search className="text-slate-400 dark:text-slate-500" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold font-cairo mb-3 text-slate-800 dark:text-slate-200">
            {t("subscription.noResultsFound", "لا توجد نتائج")}
          </CardTitle>
          <CardDescription className="font-cairo text-base max-w-md mx-auto text-slate-500">
            {t(
              "subscription.noResultsHint",
              "جرب تغيير كلمات البحث أو تعديل الفلاتر للوصول إلى التطبيق المطلوب.",
            )}
          </CardDescription>
          <Button
            variant="outline"
            className="mt-6 font-cairo text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/30"
            onClick={c.clearFilters}
          >
            {t("common.clearFilters", "مسح الفلاتر")}
          </Button>
        </Card>
      ) : c.viewMode === "sheet" ? (
        <AppPricingTableView c={c} />
      ) : (
        <AppPricingGridView c={c} />
      )}

      {/* Pagination Controls */}
      {!loading && processedApps.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-800 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-cairo">
              {t("subscription.showingResults", "Showing {{start}}-{{end}} of {{total}}", {
                start: (page - 1) * pageSize + 1,
                end: Math.min(page * pageSize, processedApps.length),
                total: processedApps.length,
              })}
            </span>
            <select
              className="text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 bg-white dark:bg-slate-950 font-cairo"
              value={pageSize}
              onChange={(e) => {
                c.setPageSize(Number(e.target.value));
                c.setPage(1);
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page <= 1}
              onClick={() => c.setPage(Math.max(1, page - 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = startPage + i;
              if (p > totalPages) return null;
              return (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className={`h-8 min-w-[2rem] font-cairo text-xs ${p === page ? "bg-indigo-600" : ""}`}
                  onClick={() => c.setPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page >= totalPages}
              onClick={() => c.setPage(Math.min(totalPages, page + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AppPricingDialogs c={c} />
    </div>
  );
}

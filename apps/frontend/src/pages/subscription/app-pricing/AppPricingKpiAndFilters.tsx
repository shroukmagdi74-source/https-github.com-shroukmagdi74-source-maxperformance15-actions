import React from "react";
import { Search, CheckCircle, Clock, Package, DollarSign } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import type { AppPricingController } from "./useAppPricingSheetController";

const SELECT_CLASS =
  "rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-semibold font-cairo focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

export const AppPricingKpiAndFilters: React.FC<{ c: AppPricingController }> = ({ c }) => {
  const { t, loading, stats } = c;
  const kpis = [
    { label: t("subscription.totalApps"), value: stats.total, icon: Package, tone: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" },
    { label: t("subscription.activatedApps"), value: stats.installed, icon: CheckCircle, tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" },
    { label: t("subscription.avgSubFee"), value: stats.avgSubPrice, suffix: t("subscription.egpPerMonth"), icon: DollarSign, tone: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" },
    { label: t("subscription.freeTrialSupport"), value: stats.withTrial, icon: Clock, tone: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {kpis.map(({ label, value, suffix, icon: Icon, tone }) => (
          <Card key={label} className="border border-slate-200/70 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-3 sm:p-4">
              <CardDescription className="text-slate-500 dark:text-slate-400 text-xs font-bold font-cairo">
                {label}
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-black font-cairo text-slate-800 dark:text-slate-100 flex items-center justify-between mt-1">
                {loading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <span className="flex items-baseline gap-1 font-mono tabular-nums">
                    {value}
                    {suffix && <span className="text-xs font-bold text-slate-400 font-cairo">{suffix}</span>}
                  </span>
                )}
                <span className={`p-2 rounded-lg ${tone}`}>
                  <Icon size={20} strokeWidth={2.5} />
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-md bg-white dark:bg-slate-900 mb-6">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <Input
                type="text"
                placeholder={t("subscription.searchPlaceholder") as string}
                className="pr-10 pl-4 border-slate-200 dark:border-slate-800 dark:bg-slate-950 font-cairo"
                value={c.searchQuery}
                onChange={(e) => c.setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Tabs value={c.selectedPricingModel} onValueChange={c.setSelectedPricingModel} className="hidden lg:block">
                <TabsList className="h-9">
                  <TabsTrigger value="ALL" className="font-cairo text-xs px-3">{t("subscription.all", "الكل")}</TabsTrigger>
                  <TabsTrigger value="FREE" className="font-cairo text-xs px-3">{t("subscription.free", "مجاني")}</TabsTrigger>
                  <TabsTrigger value="SUBSCRIPTION" className="font-cairo text-xs px-3">{t("subscription.subscription", "اشتراك")}</TabsTrigger>
                  <TabsTrigger value="PAY_PER_USE" className="font-cairo text-xs px-3">{t("subscription.payAsYouGo", "حسب الاستخدام")}</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="lg:hidden flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 font-cairo">
                  {t("subscription.pricingLabel")}
                </span>
                <select className={SELECT_CLASS} value={c.selectedPricingModel} onChange={(e) => c.setSelectedPricingModel(e.target.value)}>
                  <option value="ALL">{t("subscription.all")}</option>
                  <option value="FREE">{t("subscription.free")}</option>
                  <option value="SUBSCRIPTION">{t("subscription.subscription")}</option>
                  <option value="PAY_PER_USE">{t("subscription.payAsYouGo")}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 font-cairo">
                  {t("subscription.categoryLabel")}
                </span>
                <select className={SELECT_CLASS} value={c.selectedCategory} onChange={(e) => c.setSelectedCategory(e.target.value)}>
                  <option value="ALL">{t("subscription.allCategories")}</option>
                  {c.categories.map((cat) => (
                    <option key={cat} value={cat}>{c.getCategoryLabel(cat)}</option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 flex gap-0.5 bg-slate-100 dark:bg-slate-950 ml-auto lg:ml-0">
                <Button variant={c.viewMode === "sheet" ? "default" : "ghost"} size="sm" className="h-8 font-cairo text-xs px-3" onClick={() => c.setViewMode("sheet")}>
                  {t("subscription.sheetView")}
                </Button>
                <Button variant={c.viewMode === "grid" ? "default" : "ghost"} size="sm" className="h-8 font-cairo text-xs px-3" onClick={() => c.setViewMode("grid")}>
                  {t("subscription.cardView")}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!loading && c.isFilterActive && c.processedApps.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-cairo">
              {t("subscription.filteredResults", "Filtered results: {{count}}", { count: c.processedApps.length })}
            </span>
            <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 font-cairo text-xs h-7" onClick={c.clearFilters}>
              {t("common.clearFilters", "Clear Filters")}
            </Button>
          </div>
          {c.selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-cairo">
                {t("subscription.selectedCount", "{{count}} selected", { count: c.selectedIds.size })}
              </span>
              <Button variant="outline" size="sm" className="h-8 text-xs font-cairo text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => c.handleBulkToggleActive(true)}>
                {t("subscription.bulkActivate", "Activate All")}
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-cairo text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => c.handleBulkToggleActive(false)}>
                {t("subscription.bulkDeactivate", "Deactivate All")}
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-cairo text-red-600 border-red-200 hover:bg-red-50" onClick={c.handleBulkDelete}>
                {t("subscription.bulkDelete", "Delete Selected")}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

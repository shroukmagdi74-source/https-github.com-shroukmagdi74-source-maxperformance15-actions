import React from "react";
import { Layers, Pencil, Eye, CheckCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { PricingModelBadge, ActiveStatusPill, ToggleWithTooltip, TrialDaysInput } from "./AppPricingPrimitives";
import type { AppPricingController } from "./useAppPricingSheetController";
import type { SortField } from "./types";

export const AppPricingTableView: React.FC<{ c: AppPricingController }> = ({ c }) => {
  const { t, isSuperAdmin, paginatedApps, selectedIds } = c;

  const renderSortIcon = (field: SortField) => {
    if (c.sortField !== field) return <ArrowUpDown size={14} className="text-slate-400 opacity-50" />;
    return c.sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200/60 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto max-h-[70vh]">
        <table className="w-full text-right border-collapse relative">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-4 w-10">
                {isSuperAdmin && (
                  <Checkbox
                    checked={selectedIds.size > 0 && selectedIds.size === paginatedApps.length}
                    onCheckedChange={c.toggleSelectAll}
                    aria-label={t("subscription.selectAll", "Select all")}
                  />
                )}
              </th>
              <th
                className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 font-cairo cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => c.handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  {t("subscription.appName")}
                  {renderSortIcon("name")}
                </div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 font-cairo">
                {t("subscription.pricingModel")}
              </th>
              <th
                className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 font-cairo cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => c.handleSort("monthlyPrice")}
              >
                <div className="flex items-center gap-1">
                  {t("subscription.subscriptionPrice")}
                  {renderSortIcon("monthlyPrice")}
                </div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 font-cairo">
                {t("subscription.yearlyPrice")}
              </th>
              <th
                className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 font-cairo cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => c.handleSort("unitPrice")}
              >
                <div className="flex items-center gap-1">
                  {t("subscription.usagePricing")}
                  {renderSortIcon("unitPrice")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 font-cairo cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => c.handleSort("trialDays")}
              >
                <div className="flex items-center gap-1">
                  {t("subscription.freeTrial")}
                  {renderSortIcon("trialDays")}
                </div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 font-cairo">
                {t("subscription.status")}
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 font-cairo text-center">
                {t("subscription.active", "مفعّل")}
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 font-cairo text-center">
                {t("subscription.action")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedApps.map((app, idx) => (
              <tr
                key={app.id}
                className={`group hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-colors ${
                  idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/30 dark:bg-slate-900/40"
                }`}
              >
                <td className="px-4 py-4">
                  {isSuperAdmin && (
                    <Checkbox
                      checked={selectedIds.has(app.id)}
                      onCheckedChange={() => c.toggleSelectApp(app.id)}
                      aria-label={`Select ${app.name}`}
                    />
                  )}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 font-cairo">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 flex-shrink-0">
                      <Layers size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{c.getAppName(app)}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {c.getCategoryLabel(app.category)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-cairo">
                  <PricingModelBadge t={t} model={app.pricingModel} />
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 font-cairo">
                  <div className="flex items-center gap-1.5 group/price">
                    {app.pricingModel === "SUBSCRIPTION" ? (
                      <span className="font-mono tabular-nums">
                        {app.monthlyPrice || 0}{" "}
                        <span className="text-xs font-normal text-slate-400 font-cairo">{t("subscription.egpPerMonth")}</span>
                      </span>
                    ) : app.pricingModel === "FREE" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-cairo">{t("subscription.free")}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                    {isSuperAdmin && (
                      <button
                        className="opacity-0 group-hover/price:opacity-100 transition-opacity p-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-500 hover:text-indigo-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          c.handleOpenDialog(app);
                        }}
                        title={t("subscription.editApp", "تعديل")}
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 font-cairo">
                  {app.pricingModel === "SUBSCRIPTION" && app.yearlyPrice ? (
                    <span className="font-mono tabular-nums">
                      {app.yearlyPrice}{" "}
                      <span className="text-xs font-normal text-slate-400 font-cairo">{t("subscription.egpPerYear")}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200 font-cairo">
                  {app.unitPrice ? (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="font-mono tabular-nums">
                          {app.unitPrice}{" "}
                          <span className="text-xs font-normal text-slate-400 font-cairo">{t("subscription.egp")}</span>
                        </span>
                        <span className="text-xs font-normal text-slate-400">
                          / {app.unitName ? t(`subscription.units.${app.unitName}`, app.unitName) : t("subscription.unit")}
                        </span>
                      </div>
                      {(app.freeUnitsIncluded ?? 0) > 0 && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                          +{app.freeUnitsIncluded} <span className="font-cairo">{t("subscription.freeUnits", "مجاني")}</span>
                        </span>
                      )}
                      {(app.minimumCharge ?? 0) > 0 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                          <span className="font-cairo">{t("subscription.minCharge", "حد أدنى")}</span>: {app.minimumCharge} {t("subscription.egp")}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-cairo">
                  {isSuperAdmin ? (
                    <TrialDaysInput
                      value={c.trialDaysEdit[app.id] ?? app.trialDays}
                      onChange={(val) => c.setTrialDaysEdit((prev) => ({ ...prev, [app.id]: val }))}
                      onCommit={() => c.commitTrialDays(app)}
                      daysLabel={t("subscription.days")}
                    />
                  ) : app.trialDays > 0 ? (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold font-mono tabular-nums">
                      <span>{app.trialDays}</span>
                      <span className="font-cairo text-xs">{t("subscription.days")}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-xs">{t("subscription.none")}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-cairo">
                  <div className="flex flex-col items-start gap-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        app.isInstalled
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                      }`}
                    >
                      {app.isInstalled ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      {app.isInstalled ? t("subscription.installed") : t("subscription.notInstalled")}
                    </span>
                    {isSuperAdmin && (
                      <ToggleWithTooltip
                        checked={!!app.isInstalled}
                        onToggle={() => void c.handleToggleInstalled(app)}
                        onLabel={t("subscription.uninstall", "إلغاء التثبيت")}
                        offLabel={t("subscription.install", "تثبيت")}
                        className="data-[state=checked]:bg-emerald-500 scale-90"
                      />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <ActiveStatusPill t={t} isActive={app.isActive} />
                    {isSuperAdmin && (
                      <ToggleWithTooltip
                        checked={app.isActive}
                        onToggle={() => void c.handleToggleActive(app)}
                        onLabel={t("subscription.deactivate", "إيقاف التفعيل")}
                        offLabel={t("subscription.activate", "تفعيل")}
                      />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold font-cairo hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"
                      onClick={() => c.setDetailApp(app)}
                    >
                      <Eye size={14} className="ml-1" />
                      {t("subscription.details")}
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          c.handleOpenDialog(app);
                        }}
                      >
                        <Pencil size={14} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

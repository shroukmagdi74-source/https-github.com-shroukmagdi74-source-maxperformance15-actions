import React from "react";
import { Layers, Pencil, Eye, CheckCircle, Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { PricingModelBadge, ActiveStatusPill, ToggleWithTooltip, TrialDaysInput } from "./AppPricingPrimitives";
import type { AppPricingController } from "./useAppPricingSheetController";

export const AppPricingGridView: React.FC<{ c: AppPricingController }> = ({ c }) => {
  const { t, isSuperAdmin, paginatedApps } = c;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedApps.map((app) => (
        <Card
          key={app.id}
          className="border border-slate-200/70 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100/30">
                    <Layers size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold font-cairo text-slate-800 dark:text-slate-100">
                      {c.getAppName(app)}
                    </CardTitle>
                    <CardDescription className="text-xs font-cairo">
                      {c.getCategoryLabel(app.category)}
                    </CardDescription>
                  </div>
                </div>
                <PricingModelBadge t={t} model={app.pricingModel} />
              </div>
            </CardHeader>

            <CardContent className="py-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 font-cairo">
                {app.description}
              </p>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-cairo">
                    {t("subscription.subscriptionFee")}
                  </div>
                  <div className="text-sm font-bold font-cairo text-slate-800 dark:text-slate-200">
                    {app.pricingModel === "SUBSCRIPTION" ? (
                      <div className="flex flex-col">
                        <span className="font-mono tabular-nums">
                          {app.monthlyPrice || 0}{" "}
                          <span className="text-xs font-normal text-slate-400 font-cairo">
                            {t("subscription.egpPerMonth")}
                          </span>
                        </span>
                        {app.yearlyPrice && (
                          <span className="font-mono tabular-nums">
                            {app.yearlyPrice}{" "}
                            <span className="text-xs font-normal text-slate-400 font-cairo">
                              {t("subscription.egpPerYear")}
                            </span>
                          </span>
                        )}
                      </div>
                    ) : app.pricingModel === "FREE" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-cairo">{t("subscription.free")}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-cairo">
                    {t("subscription.usagePricing")}
                  </div>
                  <div className="text-sm font-bold font-cairo text-slate-800 dark:text-slate-200">
                    {app.unitPrice ? (
                      <div className="flex flex-col">
                        <span className="font-mono tabular-nums">
                          {app.unitPrice}{" "}
                          <span className="text-xs font-normal text-slate-400 font-cairo">
                            {t("subscription.egp")}
                          </span>
                        </span>
                        <span className="text-xs font-normal text-slate-400 font-cairo">
                          / {app.unitName ? t(`subscription.units.${app.unitName}`, app.unitName) : t("subscription.unit")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold font-cairo flex items-center gap-1.5">
                {isSuperAdmin ? (
                  <TrialDaysInput
                    value={c.trialDaysEdit[app.id] ?? app.trialDays}
                    onChange={(val) => c.setTrialDaysEdit((prev) => ({ ...prev, [app.id]: val }))}
                    onCommit={() => c.commitTrialDays(app)}
                    daysLabel={t("subscription.days")}
                    compact
                  />
                ) : app.trialDays > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-mono tabular-nums">
                    <Clock size={12} />
                    {app.trialDays} <span className="font-cairo">{t("subscription.daysTrial")}</span>
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">{t("subscription.noTrialPeriod")}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <ActiveStatusPill t={t} isActive={app.isActive} />
                {isSuperAdmin && (
                  <ToggleWithTooltip
                    checked={app.isActive}
                    onToggle={() => void c.handleToggleActive(app)}
                    onLabel={t("subscription.deactivate", "إيقاف التفعيل")}
                    offLabel={t("subscription.activate", "تفعيل")}
                    className="data-[state=checked]:bg-emerald-500 h-5 w-9"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {app.isInstalled && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-cairo">
                  <CheckCircle size={14} />
                  {t("subscription.installed")}
                </span>
              )}
              <div className="flex items-center gap-1 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-cairo text-xs h-8 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/20"
                  onClick={() => c.setDetailApp(app)}
                >
                  <Eye size={13} className="ml-1" />
                  {t("subscription.details")}
                </Button>
                {isSuperAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:text-amber-800 hover:bg-amber-50/50"
                    onClick={() => c.handleOpenDialog(app)}
                  >
                    <Pencil size={14} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

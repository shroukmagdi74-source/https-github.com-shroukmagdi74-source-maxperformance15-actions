import React from "react";
import { Layers, Pencil, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { PricingModelBadge, ActiveStatusPill } from "./AppPricingPrimitives";
import { BULK_DELETE_ID } from "./types";
import type { AppPricingController } from "./useAppPricingSheetController";

export const AppPricingDetailDialog: React.FC<{ c: AppPricingController }> = ({ c }) => {
  const {
    t,
    isSuperAdmin,
    detailApp,
    setDetailApp,
    deleteConfirmId,
    setDeleteConfirmId,
  } = c;

  return (
    <>
      {/* App Detail Dialog */}
      <Dialog
        open={detailApp !== null}
        onOpenChange={(open) => {
          if (!open) setDetailApp(null);
        }}
      >
        <DialogContent className="max-w-2xl font-cairo">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                <Layers size={16} />
              </div>
              {detailApp && c.getAppName(detailApp)}
            </DialogTitle>
          </DialogHeader>

          {detailApp && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  {t("subscription.pricingModel", "نظام التسعير")}
                </p>
                <div>
                  <PricingModelBadge t={t} model={detailApp.pricingModel} />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  {t("subscription.categoryLabel", "الفئة")}
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {c.getCategoryLabel(detailApp.category)}
                </p>
              </div>

              {detailApp.pricingModel === "SUBSCRIPTION" && (
                <>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                      {t("subscription.monthlyPrice", "السعر الشهري")}
                    </p>
                    <p className="text-lg font-black font-mono tabular-nums text-slate-800 dark:text-slate-100">
                      {detailApp.monthlyPrice || 0}{" "}
                      <span className="text-xs font-normal text-slate-400 font-cairo">
                        {t("subscription.egpPerMonth")}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                      {t("subscription.yearlyPrice", "السعر السنوي")}
                    </p>
                    <p className="text-lg font-black font-mono tabular-nums text-slate-800 dark:text-slate-100">
                      {detailApp.yearlyPrice || 0}{" "}
                      <span className="text-xs font-normal text-slate-400 font-cairo">
                        {t("subscription.egpPerYear")}
                      </span>
                    </p>
                  </div>
                </>
              )}

              {detailApp.pricingModel === "PAY_PER_USE" && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                    {t("subscription.usagePricing", "سعر الاستخدام")}
                  </p>
                  <p className="text-lg font-black font-mono tabular-nums text-slate-800 dark:text-slate-100">
                    {detailApp.unitPrice || 0}{" "}
                    <span className="text-xs font-normal text-slate-400 font-cairo">
                      {t("subscription.egp")} / {detailApp.unitName}
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  {t("subscription.freeTrial", "أيام التجربة")}
                </p>
                <p className="text-sm font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {detailApp.trialDays > 0 ? (
                    <>
                      <span>{detailApp.trialDays}</span>{" "}
                      <span className="font-cairo">{t("subscription.days")}</span>
                    </>
                  ) : (
                    <span className="font-cairo">{t("subscription.none")}</span>
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  {t("subscription.status", "الحالة")}
                </p>
                <ActiveStatusPill t={t} isActive={detailApp.isActive} />
              </div>

              <div className="md:col-span-2 space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  {t("subscription.description", "الوصف")}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-cairo">
                  {detailApp.description || "-"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Slug</p>
                <code className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-mono">
                  {detailApp.slug}
                </code>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailApp(null)}>
              {t("common.cancel", "إغلاق")}
            </Button>
            {isSuperAdmin && detailApp && (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => {
                  const target = detailApp;
                  setDetailApp(null);
                  c.handleOpenDialog(target);
                }}
              >
                <Pencil size={14} className="ml-1" />
                {t("subscription.editApp", "تعديل")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <DialogContent className="max-w-md font-cairo">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              {t("subscription.confirmDeleteTitle", "Confirm Delete")}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-slate-600 dark:text-slate-400">
              {deleteConfirmId === BULK_DELETE_ID
                ? t("subscription.confirmBulkDelete", "Are you sure you want to delete the selected apps?")
                : t("subscription.confirmDeleteApp", "Are you sure you want to delete this app?")}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() =>
                void (deleteConfirmId === BULK_DELETE_ID
                  ? c.confirmBulkDelete()
                  : c.confirmDeleteApp())
              }
            >
              {t("common.delete", "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

import React from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { CancellationReason } from "../../../services/cancellationService";
import { StatusOption, FALLBACK_ORDER_STATUSES } from "./types";

export interface OrderUpdateTabProps {
  order: any;
  orderStatuses?: StatusOption[];
  pendingCancellationStatus: string | null;
  cancellationReason: string;
  cancellationReasonOptions: CancellationReason[];
  cancellationReasonOptionsLoading: boolean;
  cancellationAdditionalNotes: string;
  isOverride: boolean;
  isUpdating: boolean;
  canManageOrderStatus: boolean;
  canManagePaymentStatus: boolean;
  isGuestOrder: boolean;
  normalizedPaymentStatus: string;
  handleStatusSelect: (status: string) => void;
  handleUpdatePaymentStatus: (status: string) => void;
  handleUpdateStatus: (status: string, notes?: string) => Promise<boolean>;
  setPendingCancellationStatus: (status: string | null) => void;
  setCancellationReason: (reason: string) => void;
  setCancellationAdditionalNotes: (notes: string) => void;
  setIsOverride: (val: boolean) => void;
  setError: (err: string | null) => void;
}

export const OrderUpdateTab: React.FC<OrderUpdateTabProps> = ({
  order,
  orderStatuses,
  pendingCancellationStatus,
  cancellationReason,
  cancellationReasonOptions,
  cancellationReasonOptionsLoading,
  cancellationAdditionalNotes,
  isOverride,
  isUpdating,
  canManageOrderStatus,
  canManagePaymentStatus,
  isGuestOrder,
  normalizedPaymentStatus,
  handleStatusSelect,
  handleUpdatePaymentStatus,
  handleUpdateStatus,
  setPendingCancellationStatus,
  setCancellationReason,
  setCancellationAdditionalNotes,
  setIsOverride,
  setError,
}) => {
  const { t } = useTranslation();

  const statusesToDisplay =
    orderStatuses && orderStatuses.length > 0
      ? orderStatuses
      : FALLBACK_ORDER_STATUSES;

  return (
    <div>
      <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5 text-xs">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <PencilSquareIcon className="h-3.5 w-3.5" />
        </span>
        {t("orders.updateOrder")}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-card/60 border border-border/60 rounded-xl p-2.5 backdrop-blur-sm">
        {/* Order Status */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("orders.orderStatus")}
          </label>
          <select
            value={(
              pendingCancellationStatus ||
              order.status ||
              "PENDING"
            ).toUpperCase()}
            onChange={(e) => handleStatusSelect(e.target.value)}
            disabled={isUpdating || !canManageOrderStatus}
            className="theme-native-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {statusesToDisplay.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center gap-2">
            <input
              id="override-checkbox-modal"
              type="checkbox"
              checked={isOverride}
              onChange={(e) => setIsOverride(e.target.checked)}
              className="h-4 w-4 rounded border-input text-warning focus:ring-warning"
            />
            <label
              htmlFor="override-checkbox-modal"
              className="text-sm text-muted-foreground"
            >
              {t("orders.overridePathRules")}
            </label>
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("orders.paymentStatus")}
          </label>
          {isGuestOrder || !canManagePaymentStatus ? (
            <div className="w-full px-3 py-2 border border-input rounded-lg bg-muted/50 text-muted-foreground">
              {isGuestOrder
                ? t("orders.notSpecified")
                : t("orders.manageCompanyOnly")}
            </div>
          ) : (
            <select
              value={normalizedPaymentStatus}
              onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
              disabled={isUpdating}
              className="theme-native-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <option value="pending">{t("orders.pendingPayment")}</option>
              <option value="completed">{t("orders.completed")}</option>
              <option value="failed">{t("orders.failed")}</option>
            </select>
          )}
        </div>

        {/* Cancellation Reason Dialog */}
        {pendingCancellationStatus && (
          <div className="sm:col-span-2 rounded-xl border border-destructive/30 bg-destructive/5 p-2.5">
            <label className="block text-sm font-medium text-destructive mb-2">
              {t("orders.cancelReasonTitle")}{" "}
              <span className="text-destructive">*</span>
            </label>
            {cancellationReasonOptions.length > 0 ? (
              <select
                value={cancellationReason}
                onChange={(e) => {
                  setCancellationReason(e.target.value);
                  setError(null);
                }}
                disabled={isUpdating || cancellationReasonOptionsLoading}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-destructive focus:ring-2 focus:ring-destructive/20 disabled:opacity-60 mb-3"
              >
                <option value="">{t("orders.cancelReasonSelect")}</option>
                {cancellationReasonOptions.map((reason) => (
                  <option key={reason.id} value={reason.reason}>
                    {reason.reason}
                  </option>
                ))}
              </select>
            ) : (
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={2}
                disabled={isUpdating}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-destructive focus:ring-2 focus:ring-destructive/20 disabled:opacity-60 mb-3"
                placeholder={t("orders.cancelReasonPlaceholder")}
              />
            )}
            {cancellationReasonOptionsLoading && (
              <p className="mb-2 text-xs text-destructive/80">
                {t("orders.cancelLoadingReasons")}
              </p>
            )}
            <label className="block text-sm font-medium text-destructive mb-1">
              {t("orders.cancelAdditionalNotes")}{" "}
              <span className="text-destructive/60">
                ({t("orders.cancelAdditionalNotesOptional")})
              </span>
            </label>
            <textarea
              value={cancellationAdditionalNotes}
              onChange={(e) => setCancellationAdditionalNotes(e.target.value)}
              rows={2}
              disabled={isUpdating}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-destructive focus:ring-2 focus:ring-destructive/20 disabled:opacity-60"
              placeholder={t("orders.cancelAdditionalNotesPlaceholder")}
            />
            <div className="mt-3 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                disabled={isUpdating || !cancellationReason.trim()}
                onClick={async () => {
                  const notesToSend = cancellationAdditionalNotes.trim()
                    ? cancellationReason.trim() +
                      "\n" +
                      cancellationAdditionalNotes.trim()
                    : cancellationReason.trim();
                  const success = await handleUpdateStatus(
                    pendingCancellationStatus,
                    notesToSend,
                  );
                  if (success) {
                    setPendingCancellationStatus(null);
                    setCancellationReason("");
                    setCancellationAdditionalNotes("");
                  }
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("orders.confirmCancellation")}
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => {
                  setPendingCancellationStatus(null);
                  setCancellationReason("");
                  setCancellationAdditionalNotes("");
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {t("orders.keepCurrentStatus")}
              </button>
            </div>
          </div>
        )}

        {!canManageOrderStatus && (
          <div className="sm:col-span-2 rounded-xl border border-warning/30 bg-warning/5 p-2.5 text-xs font-medium text-warning-foreground">
            {t("orders.merchantFulfillmentNotice")}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderUpdateTab;

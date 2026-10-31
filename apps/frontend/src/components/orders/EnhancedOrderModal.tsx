import React from "react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  EnhancedOrderModalProps,
  useEnhancedOrderModalController,
  ModalHeader,
  ModalTabsBar,
  OrderDetailsTab,
  OrderUpdateTab,
  OrderHistoryTab,
  ModalStickyFooter,
} from "./enhanced-order-modal";

export * from "./enhanced-order-modal";

export const EnhancedOrderModal: React.FC<EnhancedOrderModalProps> = (props) => {
  const { order, isOpen, onClose, orderStatuses, canManagePaymentStatus = true } = props;

  const {
    formatPrice,
    activeTab,
    setActiveTab,
    isUpdating,
    isPrinting,
    error,
    setError,
    pendingCancellationStatus,
    setPendingCancellationStatus,
    cancellationReason,
    setCancellationReason,
    cancellationReasonOptions,
    cancellationReasonOptionsLoading,
    cancellationAdditionalNotes,
    setCancellationAdditionalNotes,
    isOverride,
    setIsOverride,
    modalRef,
    displayItems,
    isGuestOrder,
    normalizedPaymentStatus,
    merchantOrderContext,
    canManageOrderStatus,
    handleStatusSelect,
    handleUpdateStatus,
    handleUpdatePaymentStatus,
    handlePrintInvoice,
    getCustomerDisplayName,
    getLocationDisplayName,
  } = useEnhancedOrderModalController(props);

  if (!isOpen || !order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-slate-950/55 backdrop-blur-md dark:bg-slate-950/75 sm:p-4 overscroll-contain modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative flex max-h-[calc(100vh-0.5rem)] flex-col overflow-hidden rounded-t-[28px] border border-slate-200/70 bg-white/96 shadow-2xl dark:border-slate-700/70 dark:bg-slate-900/96 sm:max-h-[calc(100vh-2rem)] sm:rounded-[24px] modal-panel"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600 sm:hidden" />
        <div className="flex-1 overflow-y-auto px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
          <div className="space-y-3">
            <ModalHeader
              orderNumber={order.orderNumber}
              isIncompleteCart={order.metadata?.isIncompleteCart}
              order={order}
              onClose={onClose}
            />

            <ModalTabsBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            {activeTab === "details" && (
              <OrderDetailsTab
                order={order}
                displayItems={displayItems}
                getCustomerDisplayName={getCustomerDisplayName}
                getLocationDisplayName={getLocationDisplayName}
                formatPrice={formatPrice}
                merchantOrderContext={merchantOrderContext}
              />
            )}

            {activeTab === "update" && (
              <OrderUpdateTab
                order={order}
                orderStatuses={orderStatuses}
                pendingCancellationStatus={pendingCancellationStatus}
                cancellationReason={cancellationReason}
                cancellationReasonOptions={cancellationReasonOptions}
                cancellationReasonOptionsLoading={cancellationReasonOptionsLoading}
                cancellationAdditionalNotes={cancellationAdditionalNotes}
                isOverride={isOverride}
                isUpdating={isUpdating}
                canManageOrderStatus={canManageOrderStatus}
                canManagePaymentStatus={canManagePaymentStatus}
                isGuestOrder={isGuestOrder}
                normalizedPaymentStatus={normalizedPaymentStatus}
                handleStatusSelect={handleStatusSelect}
                handleUpdatePaymentStatus={handleUpdatePaymentStatus}
                handleUpdateStatus={handleUpdateStatus}
                setPendingCancellationStatus={setPendingCancellationStatus}
                setCancellationReason={setCancellationReason}
                setCancellationAdditionalNotes={setCancellationAdditionalNotes}
                setIsOverride={setIsOverride}
                setError={setError}
              />
            )}

            {activeTab === "history" && (
              <OrderHistoryTab order={order} />
            )}
          </div>
        </div>

        <ModalStickyFooter
          orderNumber={order.orderNumber}
          isPrinting={isPrinting}
          onPrintInvoice={handlePrintInvoice}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default EnhancedOrderModal;

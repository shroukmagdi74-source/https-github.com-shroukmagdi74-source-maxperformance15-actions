import React from "react";
import { AlertCircle } from "lucide-react";
import {
  FactoryAgreementDrawerProps,
  useFactoryAgreementDrawer,
  AgreementDrawerHeader,
  AgreementDrawerQuickActions,
  AgreementFinancialStrip,
  AgreementDrawerTabsNav,
  AgreementPaymentsTab,
  AgreementTermsTab,
  AgreementFilesTab,
  AgreementAddPaymentModal,
  AgreementPayModal,
} from "./factory-agreement-drawer";

export * from "./factory-agreement-drawer";

export const FactoryAgreementDrawer: React.FC<FactoryAgreementDrawerProps> = (
  props,
) => {
  const { isOpen, onClose } = props;
  const {
    agreement,
    error,
    activeTab,
    setActiveTab,
    actionLoading,
    showAddPaymentModal,
    setShowAddPaymentModal,
    paymentLabel,
    setPaymentLabel,
    paymentAmount,
    setPaymentAmount,
    paymentDueDate,
    setPaymentDueDate,
    paymentNotes,
    setPaymentNotes,
    payingPayment,
    setPayingPayment,
    payReference,
    setPayReference,
    payNotes,
    setPayNotes,
    uploadingFile,
    handleActivate,
    handleCloseAgreement,
    handleCancelAgreement,
    handleDeleteDraft,
    handleGenerateDefaultPayments,
    handleCreatePayment,
    handleConfirmPay,
    handleCancelPayment,
    handleFileUpload,
    handleDeleteFile,
  } = useFactoryAgreementDrawer(props);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-2xl bg-card border-r border-border shadow-2xl flex flex-col">
          {/* Drawer Top Control Bar */}
          <AgreementDrawerHeader agreement={agreement} onClose={onClose} />

          {/* Error Alert */}
          {error && (
            <div className="mx-5 mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {agreement && (
            <>
              {/* Quick Action Bar */}
              <AgreementDrawerQuickActions
                agreement={agreement}
                actionLoading={actionLoading}
                onActivate={handleActivate}
                onDeleteDraft={handleDeleteDraft}
                onCloseAgreement={handleCloseAgreement}
                onCancelAgreement={handleCancelAgreement}
              />

              {/* Financial Summary Bento Strip */}
              <AgreementFinancialStrip agreement={agreement} />

              {/* Navigation Tabs */}
              <AgreementDrawerTabsNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                agreement={agreement}
              />

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeTab === "payments" && (
                  <AgreementPaymentsTab
                    agreement={agreement}
                    actionLoading={actionLoading}
                    onGenerateDefaultPayments={handleGenerateDefaultPayments}
                    onOpenAddPaymentModal={() => setShowAddPaymentModal(true)}
                    onSelectPaymentToPay={setPayingPayment}
                    onCancelPayment={handleCancelPayment}
                  />
                )}

                {activeTab === "terms" && (
                  <AgreementTermsTab agreement={agreement} />
                )}

                {activeTab === "files" && (
                  <AgreementFilesTab
                    agreement={agreement}
                    uploadingFile={uploadingFile}
                    onFileUpload={handleFileUpload}
                    onDeleteFile={handleDeleteFile}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Manual Add Payment Modal */}
      <AgreementAddPaymentModal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onSubmit={handleCreatePayment}
        actionLoading={actionLoading}
        paymentLabel={paymentLabel}
        onPaymentLabelChange={setPaymentLabel}
        paymentAmount={paymentAmount}
        onPaymentAmountChange={setPaymentAmount}
        paymentDueDate={paymentDueDate}
        onPaymentDueDateChange={setPaymentDueDate}
        paymentNotes={paymentNotes}
        onPaymentNotesChange={setPaymentNotes}
      />

      {/* Pay Confirmation Modal */}
      <AgreementPayModal
        payment={payingPayment}
        onClose={() => setPayingPayment(null)}
        onSubmit={handleConfirmPay}
        actionLoading={actionLoading}
        payReference={payReference}
        onPayReferenceChange={setPayReference}
        payNotes={payNotes}
        onPayNotesChange={setPayNotes}
      />
    </div>
  );
};

export default FactoryAgreementDrawer;

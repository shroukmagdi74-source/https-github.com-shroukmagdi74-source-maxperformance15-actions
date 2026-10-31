import React from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  useSupplierPaymentController,
  PaymentHeader,
  PaymentSupplierInvoiceSection,
  PaymentMethodSection,
  PaymentSummarySidebar,
  PaymentViewVoucher,
  PaymentDeleteDialog,
  PaymentQuickSupplierDialog,
} from "./supplier-payment-form";

const SupplierPaymentForm: React.FC = () => {
  const {
    navigate,
    isEditing,
    setIsEditing,
    isView,
    loading,
    saving,
    deleting,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    suppliers,
    supplierInvoices,
    existingPayment,
    supplierSearchOpen,
    setSupplierSearchOpen,
    supplierSearchQuery,
    setSupplierSearchQuery,
    supplierDropdownRef,
    isQuickSupplierOpen,
    setIsQuickSupplierOpen,
    quickSupplierName,
    setQuickSupplierName,
    quickSupplierPhone,
    setQuickSupplierPhone,
    submittingQuickSupplier,
    formData,
    setFormData,
    selectedSupplier,
    selectedInvoice,
    filteredSuppliers,
    currentPaymentAmount,
    supplierBalance,
    balanceAfterPayment,
    handleCreateQuickSupplier,
    handleSubmit,
    handleDeletePayment,
  } = useSupplierPaymentController();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">جاري تحميل بيانات السند...</p>
      </div>
    );
  }

  // ==========================================
  // VIEW MODE: Official Printable Voucher
  // ==========================================
  if (isView && existingPayment) {
    return (
      <>
        <PaymentViewVoucher
          existingPayment={existingPayment}
          onBack={() => navigate("/procurement/supplier-payments")}
          onEdit={() => setIsEditing(true)}
          onDelete={() => setDeleteConfirmOpen(true)}
          onNewPayment={() => navigate("/procurement/supplier-payments/new")}
        />

        <PaymentDeleteDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          existingPayment={existingPayment}
          deleting={deleting}
          onConfirmDelete={handleDeletePayment}
        />
      </>
    );
  }

  // ==========================================
  // CREATE / EDIT MODE: Record Supplier Payment
  // ==========================================
  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-5 pb-24 md:pb-6">
      {/* Top Header Bar */}
      <PaymentHeader
        isEditing={isEditing}
        paymentNumber={existingPayment?.paymentNumber}
        onBack={() => navigate("/procurement/supplier-payments")}
      />

      <form onSubmit={handleSubmit}>
        {/* Split Layout: 8 cols Form / 4 cols Sticky Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form Fields (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <PaymentSupplierInvoiceSection
              formData={formData}
              setFormData={setFormData}
              suppliers={suppliers}
              supplierInvoices={supplierInvoices}
              selectedSupplier={selectedSupplier}
              selectedInvoice={selectedInvoice}
              filteredSuppliers={filteredSuppliers}
              supplierBalance={supplierBalance}
              supplierSearchOpen={supplierSearchOpen}
              setSupplierSearchOpen={setSupplierSearchOpen}
              supplierSearchQuery={supplierSearchQuery}
              setSupplierSearchQuery={setSupplierSearchQuery}
              supplierDropdownRef={supplierDropdownRef}
              onOpenQuickSupplier={(query) => {
                if (query) setQuickSupplierName(query);
                setIsQuickSupplierOpen(true);
              }}
            />

            <PaymentMethodSection
              formData={formData}
              setFormData={setFormData}
              selectedSupplier={selectedSupplier}
              selectedInvoice={selectedInvoice}
              supplierBalance={supplierBalance}
            />
          </div>

          {/* Sticky Financial Receipt (4 cols on desktop) */}
          <PaymentSummarySidebar
            supplierBalance={supplierBalance}
            currentPaymentAmount={currentPaymentAmount}
            balanceAfterPayment={balanceAfterPayment}
            selectedInvoice={selectedInvoice}
            saving={saving}
            isEditing={isEditing}
            onCancel={() => navigate("/procurement/supplier-payments")}
          />
        </div>
      </form>

      {/* Quick Supplier Dialog */}
      <PaymentQuickSupplierDialog
        open={isQuickSupplierOpen}
        onOpenChange={setIsQuickSupplierOpen}
        quickSupplierName={quickSupplierName}
        setQuickSupplierName={setQuickSupplierName}
        quickSupplierPhone={quickSupplierPhone}
        setQuickSupplierPhone={setQuickSupplierPhone}
        submitting={submittingQuickSupplier}
        onSubmit={handleCreateQuickSupplier}
      />
    </div>
  );
};

export default SupplierPaymentForm;

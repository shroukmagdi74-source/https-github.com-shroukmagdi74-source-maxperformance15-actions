import React from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProcurementCatalogModal } from "./components";
import { QuickAddProductModal } from "../../pages/products/components/QuickAddProductModal";

import {
  usePurchaseInvoiceController,
  InvoiceHeader,
  InvoiceSupplierSection,
  InvoiceItemsTable,
  InvoicePaymentSection,
  QuickSupplierDialog,
} from "./purchase-invoice-form";

const PurchaseInvoiceForm: React.FC = () => {
  const {
    navigate,
    isEdit,
    t,
    loading,
    saving,
    suppliers,
    catalogItems,
    catalogModalOpen,
    setCatalogModalOpen,
    supplierOrders,
    supplierSearchOpen,
    setSupplierSearchOpen,
    supplierSearchQuery,
    setSupplierSearchQuery,
    supplierDropdownRef,
    showAdvancedItemColumns,
    setShowAdvancedItemColumns,
    paymentOption,
    setPaymentOption,
    paymentMethod,
    setPaymentMethod,
    customPaidAmount,
    setCustomPaidAmount,
    treasuryAccounts,
    treasuryAccountId,
    setTreasuryAccountId,
    quickProductModalOpen,
    setQuickProductModalOpen,
    quickProductInitialName,
    handleOpenQuickAddProduct,
    handleProductCreatedSuccess,
    isQuickSupplierOpen,
    setIsQuickSupplierOpen,
    quickSupplierName,
    setQuickSupplierName,
    quickSupplierPhone,
    setQuickSupplierPhone,
    quickSupplierContact,
    setQuickSupplierContact,
    submittingQuickSupplier,
    itemInputRefs,
    formData,
    setFormData,
    items,
    selectedSupplier,
    filteredSuppliers,
    totals,
    updateItem,
    updateItemDetails,
    addItem,
    removeItem,
    handlePriceKeyDown,
    handleAddCatalogItems,
    handleSelectPurchaseOrder,
    handleCreateQuickSupplier,
    handleSubmit,
  } = usePurchaseInvoiceController();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">
          جاري تحميل بيانات الفاتورة والموردين...
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 md:pb-6">
      <InvoiceHeader
        isEdit={isEdit}
        showAdvancedItemColumns={showAdvancedItemColumns}
        setShowAdvancedItemColumns={setShowAdvancedItemColumns}
        onBack={() => navigate("/procurement/purchase-invoices")}
        t={t}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <InvoiceSupplierSection
              formData={formData}
              setFormData={setFormData}
              selectedSupplier={selectedSupplier}
              suppliers={suppliers}
              filteredSuppliers={filteredSuppliers}
              supplierOrders={supplierOrders}
              supplierSearchOpen={supplierSearchOpen}
              setSupplierSearchOpen={setSupplierSearchOpen}
              supplierSearchQuery={supplierSearchQuery}
              setSupplierSearchQuery={setSupplierSearchQuery}
              supplierDropdownRef={supplierDropdownRef}
              setIsQuickSupplierOpen={setIsQuickSupplierOpen}
              setQuickSupplierName={setQuickSupplierName}
              handleSelectPurchaseOrder={handleSelectPurchaseOrder}
              t={t}
            />

            <InvoiceItemsTable
              items={items}
              catalogItems={catalogItems}
              showAdvancedItemColumns={showAdvancedItemColumns}
              itemInputRefs={itemInputRefs}
              updateItem={updateItem}
              updateItemDetails={updateItemDetails}
              addItem={addItem}
              removeItem={removeItem}
              handlePriceKeyDown={handlePriceKeyDown}
              handleOpenQuickAddProduct={handleOpenQuickAddProduct}
              setCatalogModalOpen={setCatalogModalOpen}
              t={t}
            />

            {/* Notes Section */}
            <Card className="border border-border/70 shadow-2xs bg-card" size="sm">
              <CardContent className="p-4 sm:p-5 space-y-2">
                <Label className="text-sm font-semibold">
                  {t(
                    "procurement.purchaseInvoiceForm.notesLabel",
                    "ملاحظات الفاتورة والتسليم",
                  )}
                </Label>
                <Textarea
                  rows={3}
                  placeholder="أي تفاصيل خاصة بالاستلام، طريقة الشحن، أو شروط خاصة بالسداد..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sticky Financial Sidebar (4 cols on desktop) */}
          <InvoicePaymentSection
            itemsCount={items.length}
            totals={totals}
            formData={formData}
            setFormData={setFormData}
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            customPaidAmount={customPaidAmount}
            setCustomPaidAmount={setCustomPaidAmount}
            treasuryAccounts={treasuryAccounts}
            treasuryAccountId={treasuryAccountId}
            setTreasuryAccountId={setTreasuryAccountId}
            saving={saving}
            isEdit={isEdit}
            onCancel={() => navigate("/procurement/purchase-invoices")}
            t={t}
          />
        </div>
      </form>

      <QuickSupplierDialog
        isOpen={isQuickSupplierOpen}
        setIsOpen={setIsQuickSupplierOpen}
        name={quickSupplierName}
        setName={setQuickSupplierName}
        phone={quickSupplierPhone}
        setPhone={setQuickSupplierPhone}
        contact={quickSupplierContact}
        setContact={setQuickSupplierContact}
        submitting={submittingQuickSupplier}
        onSubmit={handleCreateQuickSupplier}
      />

      <ProcurementCatalogModal
        open={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
        onSelectItems={handleAddCatalogItems}
        initialItems={catalogItems}
      />

      {quickProductModalOpen && (
        <QuickAddProductModal
          open={quickProductModalOpen}
          initialName={quickProductInitialName}
          onClose={() => setQuickProductModalOpen(false)}
          onSuccess={handleProductCreatedSuccess}
          showWarehouseSelect={true}
        />
      )}
    </div>
  );
};

export default PurchaseInvoiceForm;

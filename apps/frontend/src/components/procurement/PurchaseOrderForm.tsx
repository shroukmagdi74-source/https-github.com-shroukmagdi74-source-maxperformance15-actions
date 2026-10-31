import React from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ProcurementCatalogModal } from "./components";
import {
  usePurchaseOrderController,
  OrderHeader,
  OrderSupplierSection,
  OrderItemsTable,
  OrderTermsSection,
  OrderSummarySidebar,
  OrderQuickSupplierDialog,
} from "./purchase-order-form";

const PurchaseOrderForm: React.FC = () => {
  const {
    navigate,
    isEdit,
    loading,
    saving,
    suppliers,
    catalogItems,
    catalogModalOpen,
    setCatalogModalOpen,
    supplierSearchOpen,
    setSupplierSearchOpen,
    supplierSearchQuery,
    setSupplierSearchQuery,
    supplierDropdownRef,
    showAdvancedItemColumns,
    setShowAdvancedItemColumns,
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
    handlePriceKeyDown,
    addItem,
    removeItem,
    handleAddCatalogItems,
    handleCreateQuickSupplier,
    handleSubmit,
  } = usePurchaseOrderController();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">جاري تحميل بيانات أمر الشراء والموردين...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 md:pb-6">
      {/* Top Header Bar */}
      <OrderHeader
        isEdit={isEdit}
        showAdvancedItemColumns={showAdvancedItemColumns}
        onBack={() => navigate("/procurement/purchase-orders")}
        onToggleAdvancedColumns={() => setShowAdvancedItemColumns((prev) => !prev)}
      />

      <form onSubmit={handleSubmit}>
        {/* Split Layout: 8 cols Form / 4 cols Sticky Receipt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <OrderSupplierSection
              formData={formData}
              setFormData={setFormData}
              suppliers={suppliers}
              selectedSupplier={selectedSupplier}
              filteredSuppliers={filteredSuppliers}
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

            <OrderItemsTable
              items={items}
              catalogItems={catalogItems}
              showAdvancedItemColumns={showAdvancedItemColumns}
              itemInputRefs={itemInputRefs}
              updateItem={updateItem}
              updateItemDetails={updateItemDetails}
              handlePriceKeyDown={handlePriceKeyDown}
              addItem={addItem}
              removeItem={removeItem}
              onOpenCatalogModal={() => setCatalogModalOpen(true)}
            />

            <OrderTermsSection
              formData={formData}
              setFormData={setFormData}
            />
          </div>

          {/* Sticky Financial Sidebar (4 cols on desktop) */}
          <OrderSummarySidebar
            itemsCount={items.length}
            totals={totals}
            formData={formData}
            setFormData={setFormData}
            saving={saving}
            isEdit={isEdit}
            onCancel={() => navigate("/procurement/purchase-orders")}
          />
        </div>
      </form>

      {/* Quick Supplier Dialog */}
      <OrderQuickSupplierDialog
        open={isQuickSupplierOpen}
        onOpenChange={setIsQuickSupplierOpen}
        quickSupplierName={quickSupplierName}
        setQuickSupplierName={setQuickSupplierName}
        quickSupplierPhone={quickSupplierPhone}
        setQuickSupplierPhone={setQuickSupplierPhone}
        quickSupplierContact={quickSupplierContact}
        setQuickSupplierContact={setQuickSupplierContact}
        submitting={submittingQuickSupplier}
        onSubmit={handleCreateQuickSupplier}
      />

      <ProcurementCatalogModal
        open={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
        onSelectItems={handleAddCatalogItems}
        initialItems={catalogItems}
      />
    </div>
  );
};

export default PurchaseOrderForm;

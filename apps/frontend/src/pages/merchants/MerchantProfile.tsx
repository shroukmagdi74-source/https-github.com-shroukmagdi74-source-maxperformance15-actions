import React from "react";
import {
  MerchantProfileHeader,
  MerchantProfileForm,
  MerchantQuickSummaryCard,
  MerchantOperationsCard,
  MerchantLinkedProductsCard,
  MerchantLinkProductCard,
  MerchantInventorySyncCard,
  getMerchantOperationsTotals,
  useMerchantProfileData,
} from "./merchant-profile";

export const MerchantProfile: React.FC = () => {
  const {
    isDark,
    isEditMode,
    loading,
    saving,
    productsLoading,
    optionsLoading,
    linkingProduct,
    syncingInventory,
    merchant,
    availableProducts,
    warehouses,
    shippingCompanies,
    lastSyncSummary,
    formData,
    linkForm,
    setFormData,
    setLinkForm,
    handleSubmit,
    handleLinkProduct,
    handleSyncInventory,
    navigate,
  } = useMerchantProfileData();

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!merchant) {
    return null;
  }

  const linkedProductIds = new Set(
    (merchant.products || [])
      .map((merchantProduct) => merchantProduct.product?.id)
      .filter((value): value is string => Boolean(value)),
  );
  const fulfillmentModeLabel =
    formData.fulfillmentMode === "COMPANY_WAREHOUSE"
      ? "الشركة تنفذ من مخزنها"
      : "التاجر يشحن من مخزونه";
  const selectedWarehouse = warehouses.find(
    (warehouse) => warehouse.id === formData.defaultWarehouseId,
  );
  const selectedShippingCompany = shippingCompanies.find(
    (company) => company.id === formData.defaultShippingCompanyId,
  );
  const operationsTotals = getMerchantOperationsTotals(merchant);
  const recentOperations = merchant.operationsSummary?.rows || [];
  const syncableProductsCount = (merchant.products || []).filter(
    (merchantProduct) => merchantProduct.syncEnabled,
  ).length;

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"} p-6`}>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <MerchantProfileHeader
          isDark={isDark}
          isEditMode={isEditMode}
          merchantName={merchant.name}
          merchantId={merchant.id}
          onBack={() => navigate("/merchants")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MerchantProfileForm
              isDark={isDark}
              isEditMode={isEditMode}
              formData={formData}
              setFormData={setFormData}
              warehouses={warehouses}
              shippingCompanies={shippingCompanies}
              optionsLoading={optionsLoading}
              saving={saving}
              merchantId={merchant.id}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/merchants/${merchant.id}`)}
            />
          </div>

          <div className="space-y-6">
            <MerchantQuickSummaryCard
              isDark={isDark}
              merchant={merchant}
              selectedWarehouse={selectedWarehouse}
              selectedShippingCompany={selectedShippingCompany}
              operationsTotals={operationsTotals}
              fulfillmentModeLabel={fulfillmentModeLabel}
            />

            <MerchantOperationsCard
              isDark={isDark}
              operationsTotals={operationsTotals}
              recentOperations={recentOperations}
            />

            <MerchantLinkedProductsCard
              isDark={isDark}
              products={merchant.products}
              fulfillmentModeLabel={fulfillmentModeLabel}
            />
          </div>
        </div>

        {!isEditMode && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <MerchantLinkProductCard
              isDark={isDark}
              linkForm={linkForm}
              setLinkForm={setLinkForm}
              availableProducts={availableProducts}
              linkedProductIds={linkedProductIds}
              productsLoading={productsLoading}
              linkingProduct={linkingProduct}
              onSubmit={handleLinkProduct}
            />

            <MerchantInventorySyncCard
              isDark={isDark}
              syncableProductsCount={syncableProductsCount}
              totalProductsCount={merchant.products?.length || 0}
              lastSyncSummary={lastSyncSummary}
              syncingInventory={syncingInventory}
              onSync={handleSyncInventory}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantProfile;

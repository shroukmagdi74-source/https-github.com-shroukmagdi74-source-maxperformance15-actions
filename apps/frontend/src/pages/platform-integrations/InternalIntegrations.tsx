import React from "react";
import {
  useInternalIntegrations,
  InternalIntegrationsHeader,
  InternalIntegrationsTabsNav,
  InternalConnectionsTab,
  InternalRequestsTab,
  InternalConsumersTab,
  InternalFindCompanyTab,
  InternalPullProductsView,
  InternalPullOrdersView,
} from "./internal-integrations";

export const InternalIntegrations: React.FC = () => {
  const {
    user,
    view,
    setView,
    activeTab,
    setActiveTab,
    connections,
    requests,
    consumers,
    searchId,
    setSearchId,
    searching,
    copied,
    selectedProvider,
    providerProducts,
    selectedProductIndexes,
    fetchingProducts,
    importing,
    productSearchQuery,
    setProductSearchQuery,
    respondingIds,
    availableOrders,
    selectedOrderIds,
    fetchingOrders,
    importingOrders,
    totalProviderVariants,
    filteredProducts,
    handleRespond,
    sendRequest,
    updatePermission,
    deleteConnection,
    startPulling,
    startPullingOrders,
    toggleProduct,
    toggleOrder,
    handleImport,
    handleImportOrders,
    handleSelectAll,
    handleDeselectAll,
    handleCopyCompanyId,
  } = useInternalIntegrations();

  if (view === "pull-products" && selectedProvider) {
    return (
      <InternalPullProductsView
        selectedProvider={selectedProvider}
        providerProducts={providerProducts}
        filteredProducts={filteredProducts}
        totalProviderVariants={totalProviderVariants}
        selectedProductIndexes={selectedProductIndexes}
        fetchingProducts={fetchingProducts}
        importing={importing}
        productSearchQuery={productSearchQuery}
        setProductSearchQuery={setProductSearchQuery}
        onBack={() => setView("main")}
        onImport={handleImport}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onToggleProduct={toggleProduct}
      />
    );
  }

  if (view === "pull-orders" && selectedProvider) {
    return (
      <InternalPullOrdersView
        selectedProvider={selectedProvider}
        availableOrders={availableOrders}
        selectedOrderIds={selectedOrderIds}
        fetchingOrders={fetchingOrders}
        importingOrders={importingOrders}
        onBack={() => setView("main")}
        onImportOrders={handleImportOrders}
        onToggleOrder={toggleOrder}
      />
    );
  }

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <InternalIntegrationsHeader />

      <InternalIntegrationsTabsNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectionsCount={connections.length}
        requestsCount={requests.length}
        consumersCount={consumers.length}
      />

      <div className="space-y-4">
        {activeTab === "connections" && (
          <InternalConnectionsTab
            connections={connections}
            onStartPulling={startPulling}
            onStartPullingOrders={startPullingOrders}
            onDeleteConnection={deleteConnection}
          />
        )}

        {activeTab === "requests" && (
          <InternalRequestsTab
            requests={requests}
            respondingIds={respondingIds}
            onRespond={handleRespond}
          />
        )}

        {activeTab === "consumers" && (
          <InternalConsumersTab
            consumers={consumers}
            onUpdatePermission={updatePermission}
            onDeleteConnection={deleteConnection}
          />
        )}

        {activeTab === "find" && (
          <InternalFindCompanyTab
            userCompanyId={user?.companyId}
            searchId={searchId}
            setSearchId={setSearchId}
            searching={searching}
            copied={copied}
            onCopyCompanyId={handleCopyCompanyId}
            onSendRequest={sendRequest}
          />
        )}
      </div>
    </div>
  );
};

export default InternalIntegrations;

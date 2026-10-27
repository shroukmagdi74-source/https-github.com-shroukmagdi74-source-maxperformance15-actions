import React from "react";
import { getDirection } from "../../i18n";
import {
  useUpsellHubState,
  UpsellHubHeader,
  UpsellHubKpiCards,
  UpsellHubPlacementsSwitchboard,
  UpsellHubCatalogTable,
  UpsellHubEditRelationsModal,
} from "./upsell-hub";

export type {
  CatalogProduct,
  ManagedRelationType,
  RelationBuckets,
} from "./upsell-hub";

export default function UpsellHubPage() {
  const {
    conversionLoading,
    pdpCrossSellActive,
    cartUpsellActive,
    postPurchaseActive,
    catalogLoading,
    searchQuery,
    filterType,
    categoryFilter,
    categories,
    stats,
    filteredCatalog,
    selectedProduct,
    activeTab,
    editRelations,
    relationSearch,
    saving,
    candidatesToAdd,
    catalogMap,
    setSearchQuery,
    setFilterType,
    setCategoryFilter,
    setActiveTab,
    setRelationSearch,
    openEditModal,
    closeEditModal,
    handleAddRelation,
    handleRemoveRelation,
    handleMoveRelation,
    handleSaveRelations,
    toggleModule,
  } = useUpsellHubState();

  return (
    <div
      className="mx-auto max-w-7xl space-y-6 p-3 sm:p-6"
      dir={getDirection()}
    >
      <UpsellHubHeader />

      <UpsellHubKpiCards stats={stats} />

      <UpsellHubPlacementsSwitchboard
        conversionLoading={conversionLoading}
        pdpCrossSellActive={pdpCrossSellActive}
        cartUpsellActive={cartUpsellActive}
        postPurchaseActive={postPurchaseActive}
        toggleModule={toggleModule}
      />

      <UpsellHubCatalogTable
        catalogLoading={catalogLoading}
        filteredCatalog={filteredCatalog}
        searchQuery={searchQuery}
        filterType={filterType}
        categoryFilter={categoryFilter}
        categories={categories}
        stats={stats}
        setSearchQuery={setSearchQuery}
        setFilterType={setFilterType}
        setCategoryFilter={setCategoryFilter}
        openEditModal={openEditModal}
      />

      <UpsellHubEditRelationsModal
        selectedProduct={selectedProduct}
        activeTab={activeTab}
        editRelations={editRelations}
        relationSearch={relationSearch}
        saving={saving}
        candidatesToAdd={candidatesToAdd}
        catalogMap={catalogMap}
        setActiveTab={setActiveTab}
        setRelationSearch={setRelationSearch}
        closeEditModal={closeEditModal}
        handleAddRelation={handleAddRelation}
        handleRemoveRelation={handleRemoveRelation}
        handleMoveRelation={handleMoveRelation}
        handleSaveRelations={handleSaveRelations}
      />
    </div>
  );
}

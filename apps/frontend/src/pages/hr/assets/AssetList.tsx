import React from "react";
import AssetForm from "./AssetForm";
import AssetAssignmentModal from "./AssetAssignmentModal";
import {
  AssetListProps,
  useAssetListController,
  AssetListFiltersAndTable,
  AssetListBulkActionsBar,
} from "./asset-list";

const AssetList: React.FC<AssetListProps> = ({ refreshTrigger }) => {
  const {
    assets,
    loading,
    search,
    setSearch,
    filters,
    setFilters,
    categories,
    page,
    hasMore,
    formatPrice,
    editingAsset,
    setEditingAsset,
    assigningAsset,
    setAssigningAsset,
    selectedIds,
    setSelectedIds,
    fetchAssets,
    handleClone,
    handleDelete,
    handleBulkStatusChange,
    handleSelectAll,
    toggleSelect,
  } = useAssetListController(refreshTrigger);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <AssetListFiltersAndTable
        assets={assets}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onToggleSelect={toggleSelect}
        formatPrice={formatPrice}
        onAssignAsset={setAssigningAsset}
        onCloneAsset={handleClone}
        onEditAsset={setEditingAsset}
        onDeleteAsset={handleDelete}
      />

      {editingAsset && (
        <AssetForm
          initialData={editingAsset}
          usePortal={false}
          onClose={() => setEditingAsset(null)}
          onSuccess={() => {
            setEditingAsset(null);
            void fetchAssets(1, true);
          }}
        />
      )}

      {assigningAsset && (
        <AssetAssignmentModal
          asset={assigningAsset}
          type={assigningAsset.type}
          usePortal
          onClose={() => setAssigningAsset(null)}
          onSuccess={() => {
            setAssigningAsset(null);
            void fetchAssets(1, true);
          }}
        />
      )}

      {hasMore && !loading && (
        <div className="p-4 text-center border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => void fetchAssets(page + 1)}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            تحميل المزيد
          </button>
        </div>
      )}

      <AssetListBulkActionsBar
        selectedIds={selectedIds}
        onDeleteSelected={handleDelete}
        onStatusChangeSelected={handleBulkStatusChange}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  );
};

export default AssetList;

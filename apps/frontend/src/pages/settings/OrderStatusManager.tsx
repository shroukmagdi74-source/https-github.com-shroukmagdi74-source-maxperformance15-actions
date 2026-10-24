import React from "react";
import { Tag, Loader2 } from "lucide-react";
import {
  useOrderStatusManagerController,
  OrderStatusHeader,
  OrderStatusTabs,
  StatusCard,
  AddStatusModal,
  ConfirmDeleteStatusModal,
} from "./order-status-manager";

const OrderStatusManager: React.FC = () => {
  const {
    loading,
    syncing,
    activeTab,
    setActiveTab,
    editingStatus,
    setEditingStatus,
    showAddModal,
    setShowAddModal,
    confirmDeleteId,
    setConfirmDeleteId,
    newStatus,
    setNewStatus,
    filteredStatuses,
    tabCounts,
    initializeDefaults,
    createStatus,
    updateStatus,
    deleteStatus,
    confirmDeleteStatus,
    moveStatus,
    handleToggleAllowEdit,
  } = useOrderStatusManagerController();

  return (
    <div className="p-4 sm:p-6 w-full dark:text-white" dir="rtl">
      <OrderStatusHeader
        syncing={syncing}
        onInitializeDefaults={initializeDefaults}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      <OrderStatusTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={tabCounts}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStatuses.map((status, index) => (
            <StatusCard
              key={status.id}
              status={status}
              index={index}
              totalCount={filteredStatuses.length}
              isEditing={editingStatus?.id === status.id}
              editingStatus={editingStatus}
              setEditingStatus={setEditingStatus}
              onMove={moveStatus}
              onUpdate={updateStatus}
              onDelete={deleteStatus}
              onToggleAllowEdit={handleToggleAllowEdit}
            />
          ))}
        </div>
      )}

      {filteredStatuses.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">لا توجد حالات</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
          >
            إضافة حالة جديدة
          </button>
        </div>
      )}

      <AddStatusModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        onCreate={createStatus}
      />

      <ConfirmDeleteStatusModal
        confirmDeleteId={confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDeleteStatus}
      />
    </div>
  );
};

export default OrderStatusManager;

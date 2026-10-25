import React from "react";
import { useTranslation } from "react-i18next";
import { Award, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { ConfirmDialog } from "../../../components/hr/ConfirmDialog";
import {
  useRewardsListController,
  RewardsListStatsAndFilters,
  RewardsListTable,
} from "./list";

const RewardsList: React.FC = () => {
  const { t } = useTranslation();
  const {
    navigate,
    user,
    loading,
    error,
    records,
    statistics,
    pagination,
    setPagination,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleteTarget,
    setDeleteTarget,
    deleting,
    fetchRewards,
    handleStatusUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    resetFilters,
  } = useRewardsListController();

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل المكافآت...
          </p>
        </div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            حدث خطأ
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchRewards()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-8 h-8 text-blue-600" />
            {t("rewards.pageTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("rewards.pageDescription")}
          </p>
        </div>
        <button
          onClick={() => navigate("/hr/rewards/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t("rewards.form.addReward")}
        </button>
      </div>

      {/* Statistics & Filters */}
      <RewardsListStatsAndFilters
        statistics={statistics}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onResetFilters={resetFilters}
        onUpdateFilters={setFilters}
      />

      {/* Records Table */}
      <RewardsListTable
        records={records}
        userRole={user?.role}
        deleting={deleting}
        pagination={pagination}
        onPageChange={(nextPage) =>
          setPagination((prev) => ({ ...prev, page: nextPage }))
        }
        onNavigate={navigate}
        onDeleteClick={handleDeleteClick}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!deleting) setDeleteConfirmOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="حذف المكافأة"
        description="هل تريد حذف هذه المكافأة؟"
        confirmText="تأكيد الحذف"
        type="danger"
        loading={deleting}
        itemName={deleteTarget?.rewardType?.nameAr || deleteTarget?.rewardName}
        itemDetails={
          deleteTarget
            ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName} - ${deleteTarget.appliedMonth}/${deleteTarget.appliedYear}`
            : undefined
        }
      />
    </div>
  );
};

export default RewardsList;

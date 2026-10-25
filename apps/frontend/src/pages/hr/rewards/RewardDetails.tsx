import React from "react";
import {
  Award,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { ConfirmDialog } from "../../../components/hr/ConfirmDialog";
import {
  useRewardDetailsController,
  RewardDetailsMainContent,
  RewardDetailsSidebar,
} from "./details";

const RewardDetails: React.FC = () => {
  const {
    id,
    navigate,
    loading,
    error,
    reward,
    actionLoading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    normalizedStatus,
    canApproveThisReward,
    canEditThisReward,
    canDeleteThisReward,
    handleApprove,
    handleReject,
    handleDeleteConfirm,
  } = useRewardDetailsController();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">جاري تحميل التفاصيل...</p>
        </div>
      </div>
    );
  }

  if (error || !reward) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
          <p className="text-gray-600 mb-4">{error || "المكافأة غير موجودة"}</p>
          <button
            onClick={() => navigate("/hr/rewards")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/hr/rewards")}
            aria-label="العودة للمكافآت"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-8 h-8 text-blue-600" />
              تفاصيل المكافأة
            </h1>
            <p className="text-gray-600 mt-1">عرض كامل تفاصيل المكافأة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canApproveThisReward && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                اعتماد
              </button>
              <button
                onClick={() => {
                  const reason = prompt("أدخل سبب الرفض:");
                  if (reason) handleReject(reason);
                }}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                رفض
              </button>
            </>
          )}
          {canEditThisReward && (
            <button
              onClick={() => navigate(`/hr/rewards/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-5 h-5" />
              تعديل
            </button>
          )}
          {canDeleteThisReward && (
            <button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={actionLoading}
              title="حذف المكافأة"
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 disabled:text-red-50"
            >
              <Trash2 className="w-5 h-5" />
              حذف
            </button>
          )}
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <RewardDetailsMainContent
        reward={reward}
        normalizedStatus={normalizedStatus}
      >
        <RewardDetailsSidebar reward={reward} />
      </RewardDetailsMainContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!actionLoading) setDeleteDialogOpen(open);
        }}
        onConfirm={handleDeleteConfirm}
        title="حذف المكافأة"
        description="هل تريد حذف هذه المكافأة؟"
        confirmText="تأكيد الحذف"
        type="danger"
        loading={actionLoading}
        itemName={reward?.rewardName}
        itemDetails={
          reward
            ? `${reward.user.firstName} ${reward.user.lastName} - ${reward.appliedMonth}/${reward.appliedYear}`
            : undefined
        }
      />
    </div>
  );
};

export default RewardDetails;

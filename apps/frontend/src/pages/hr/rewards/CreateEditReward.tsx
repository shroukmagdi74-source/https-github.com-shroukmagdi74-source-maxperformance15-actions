import React from "react";
import { useTranslation } from "react-i18next";
import { Award, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import {
  useCreateEditRewardController,
  RewardEmployeeAndTypeSection,
  RewardValueAndPeriodSection,
} from "./create-edit";

const CreateEditReward: React.FC = () => {
  const { t } = useTranslation();
  const {
    isEdit,
    navigate,
    loading,
    saving,
    error,
    employees,
    rewardTypes,
    selectedRewardType,
    formData,
    validationErrors,
    seedDefaults,
    handleChange,
    handleSubmit,
  } = useCreateEditRewardController();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/hr/rewards")}
          aria-label="العودة للمكافآت"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-8 h-8 text-blue-600" />
            {isEdit
              ? t("rewards.form.editReward")
              : t("rewards.form.addReward")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEdit
              ? "تعديل بيانات المكافأة"
              : "إنشاء مكافأة يدوية جديدة للموظف"}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
              حدث خطأ
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <RewardEmployeeAndTypeSection
          isEdit={isEdit}
          loading={loading}
          employees={employees}
          rewardTypes={rewardTypes}
          selectedRewardType={selectedRewardType}
          formData={formData}
          validationErrors={validationErrors}
          onChange={handleChange}
          onSeedDefaults={seedDefaults}
        />

        <RewardValueAndPeriodSection
          isEdit={isEdit}
          saving={saving}
          formData={formData}
          validationErrors={validationErrors}
          onChange={handleChange}
          onCancel={() => navigate("/hr/rewards")}
        />
      </form>
    </div>
  );
};

export default CreateEditReward;

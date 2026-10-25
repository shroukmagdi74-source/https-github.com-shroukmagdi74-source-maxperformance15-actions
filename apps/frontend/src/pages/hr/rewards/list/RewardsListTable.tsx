import React from "react";
import { useTranslation } from "react-i18next";
import {
  Award,
  Check,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  canUserApproveReward,
  canUserDeleteReward,
  canUserEditReward,
  normalizeRewardStatus,
  RewardUiStatus,
} from "../rewardRecordUtils";
import { RewardRecord, RewardListPagination } from "./types";
import {
  REWARD_STATUS_BADGE_CONFIG,
  getRewardCategoryBadgeConfig,
} from "./helpers";

interface RewardsListTableProps {
  records: RewardRecord[];
  userRole?: string;
  deleting: boolean;
  pagination: RewardListPagination;
  onPageChange: (nextPage: number) => void;
  onNavigate: (path: string) => void;
  onDeleteClick: (record: RewardRecord) => void;
  onStatusUpdate: (id: string, action: "approve" | "reject") => void;
}

const renderStatusBadge = (status: RewardUiStatus) => {
  const config = REWARD_STATUS_BADGE_CONFIG[status];
  const Icon =
    status === "PENDING"
      ? Clock
      : status === "APPROVED" || status === "APPLIED"
        ? CheckCircle
        : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export const RewardsListTable: React.FC<RewardsListTableProps> = ({
  records,
  userRole,
  deleting,
  pagination,
  onPageChange,
  onNavigate,
  onDeleteClick,
  onStatusUpdate,
}) => {
  const { t } = useTranslation();

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <Award className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          لا توجد مكافآت
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          لم يتم العثور على أي مكافآت بالفلاتر المحددة
        </p>
        <button
          onClick={() => onNavigate("/hr/rewards/create")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t("rewards.form.addReward")}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الموظف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                المكافأة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                التصنيف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                القيمة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الفترة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {records.map((record) => {
              const normalizedStatus = normalizeRewardStatus(record);
              const canApproveThisReward =
                normalizedStatus === "PENDING" &&
                canUserApproveReward(userRole);
              const canEditThisReward =
                normalizedStatus === "PENDING" && canUserEditReward(userRole);
              const canDeleteThisReward = canUserDeleteReward(userRole);
              const catConfig = getRewardCategoryBadgeConfig(
                record.rewardCategory,
              );

              return (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {record.user.firstName} {record.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                        {record.user.employeeNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {record.rewardType?.nameAr || record.rewardName}
                    </div>
                    {record.reason && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {record.reason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${catConfig.className}`}
                    >
                      {catConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      <span className="font-mono tabular-nums">
                        {record.calculatedValue.toLocaleString()}
                      </span>{" "}
                      ج.م
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-mono tabular-nums">
                      {record.appliedMonth}/{record.appliedYear}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(normalizedStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate(`/hr/rewards/${record.id}`)}
                        className="text-blue-600 hover:text-blue-700"
                        title="عرض التفاصيل"
                        aria-label="عرض التفاصيل"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {canDeleteThisReward && (
                        <button
                          onClick={() => onDeleteClick(record)}
                          disabled={deleting}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                          title={t("rewards.delete.tooltip")}
                          aria-label={`${t("rewards.delete.tooltip")} ${record.rewardType?.nameAr || record.rewardName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      {canApproveThisReward && (
                        <>
                          <button
                            onClick={() => onStatusUpdate(record.id, "approve")}
                            className="text-green-600 hover:text-green-700"
                            title="اعتماد"
                            aria-label="اعتماد"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onStatusUpdate(record.id, "reject")}
                            className="text-orange-600 hover:text-orange-700"
                            title="رفض"
                            aria-label="رفض"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {canEditThisReward && (
                        <button
                          onClick={() =>
                            onNavigate(`/hr/rewards/edit/${record.id}`)
                          }
                          className="text-blue-600 hover:text-blue-700"
                          title="تعديل"
                          aria-label="تعديل"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            عرض{" "}
            <span className="font-mono tabular-nums">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            إلى{" "}
            <span className="font-mono tabular-nums">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            من{" "}
            <span className="font-mono tabular-nums">{pagination.total}</span>{" "}
            نتيجة
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

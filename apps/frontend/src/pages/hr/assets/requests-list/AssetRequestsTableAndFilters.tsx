import React from "react";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { AssetRequestAdminRecord } from "./types";
import {
  getAssetRequestBadgeClassName,
  getAssetRequestPriorityBadge,
  getAssetRequestStatusText,
} from "./helpers";

interface AssetRequestsTableAndFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  filterStatus: string;
  onFilterStatusChange: (val: string) => void;
  filteredRequests: AssetRequestAdminRecord[];
  onApproveClick: (req: AssetRequestAdminRecord) => void;
  onRejectClick: (req: AssetRequestAdminRecord) => void;
  onFulfillClick: (req: AssetRequestAdminRecord) => void;
}

export const AssetRequestsTableAndFilters: React.FC<
  AssetRequestsTableAndFiltersProps
> = ({
  searchQuery,
  onSearchQueryChange,
  filterStatus,
  onFilterStatusChange,
  filteredRequests,
  onApproveClick,
  onRejectClick,
  onFulfillClick,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          طلبات العهدة
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">كل الحالات</option>
            <option value="PENDING">قيد الانتظار</option>
            <option value="APPROVED">موافق عليه</option>
            <option value="REJECTED">مرفوض</option>
            <option value="FULFILLED">تم التنفيذ</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                نوع الأصل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                السبب
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                الأولوية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRequests.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {request.assetType}
                  </div>
                  {request.category && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {request.category}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {request.reason}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAssetRequestPriorityBadge(request.priority)}`}
                  >
                    {request.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAssetRequestBadgeClassName(request.status)}`}
                  >
                    {getAssetRequestStatusText(request.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                  {new Date(request.createdAt).toLocaleDateString("ar-EG")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {request.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => onApproveClick(request)}
                          className="text-green-600 hover:text-green-900"
                          title="موافقة"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onRejectClick(request)}
                          className="text-red-600 hover:text-red-900"
                          title="رفض"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {request.status === "APPROVED" && (
                      <button
                        onClick={() => onFulfillClick(request)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="تخصيص أصل"
                      >
                        تخصيص
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              لا توجد طلبات
            </p>
          </div>
        )}
      </div>
    </>
  );
};

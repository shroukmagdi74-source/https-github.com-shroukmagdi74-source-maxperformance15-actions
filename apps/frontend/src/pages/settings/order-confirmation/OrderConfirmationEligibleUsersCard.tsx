import React from "react";
import type { EligibleUser } from "./types";
import { formatUserLabel, formatRoleLabel, formatAvailabilityLabel } from "./types";

export interface OrderConfirmationEligibleUsersCardProps {
  distributionEnabled: boolean;
  eligibleUsers: EligibleUser[];
  isRestrictedToSpecificUsers: boolean;
  eligibleUserSearch: string;
  setEligibleUserSearch: (term: string) => void;
  onAllowAllEligibleUsers: () => void;
  onRestrictToSpecificUsers: () => void;
  onSelectFilteredEligibleUsers: () => void;
  onRemoveHiddenEligibleUsers: () => void;
  hiddenEligibleUserIdsCount: number;
  selectedDistributionUsers: EligibleUser[];
  filteredEligibleUsers: EligibleUser[];
  visuallyIncludedUserIds: Set<string>;
  onToggleEligibleUser: (userId: string) => void;
}

export function OrderConfirmationEligibleUsersCard({
  distributionEnabled,
  eligibleUsers,
  isRestrictedToSpecificUsers,
  eligibleUserSearch,
  setEligibleUserSearch,
  onAllowAllEligibleUsers,
  onRestrictToSpecificUsers,
  onSelectFilteredEligibleUsers,
  onRemoveHiddenEligibleUsers,
  hiddenEligibleUserIdsCount,
  selectedDistributionUsers,
  filteredEligibleUsers,
  visuallyIncludedUserIds,
  onToggleEligibleUser,
}: OrderConfirmationEligibleUsersCardProps) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <h4 className="font-semibold text-gray-900 dark:text-white">الموظفون المؤهلون للتوزيع</h4>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            هذه القائمة هي بوابة التوزيع النهائية. اختر كل المؤهلين، أو قيّد التوزيع على أسماء محددة فقط.
          </p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
            isRestrictedToSpecificUsers
              ? "bg-indigo-600 text-white"
              : "border border-indigo-200 bg-white text-indigo-700 dark:border-indigo-800 dark:bg-gray-900 dark:text-indigo-300"
          }`}
        >
          {isRestrictedToSpecificUsers
            ? `التوزيع محدود على ${selectedDistributionUsers.length} موظف`
            : `التوزيع مفتوح لكل المؤهلين (${eligibleUsers.length})`}
        </div>
      </div>

      {!distributionEnabled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          التوزيع التلقائي غير مفعل حالياً. يمكنك تجهيز القائمة الآن، لكنها لن تُستخدم إلا بعد تفعيل التوزيع.
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <button
          type="button"
          onClick={onAllowAllEligibleUsers}
          className={`rounded-xl border p-3 text-right transition-colors ${
            !isRestrictedToSpecificUsers
              ? "border-indigo-300 bg-white shadow-xs dark:bg-gray-900"
              : "border-gray-200 bg-white/60 hover:bg-white dark:border-gray-700 dark:bg-gray-900/50"
          }`}
        >
          <span className="block text-sm font-semibold text-gray-900 dark:text-white">
            كل المؤهلين حسب الدور
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            أي مدير أو موظف ضمن الأدوار المختارة يدخل في التوزيع.
          </span>
        </button>
        <button
          type="button"
          onClick={onRestrictToSpecificUsers}
          className={`rounded-xl border p-3 text-right transition-colors ${
            isRestrictedToSpecificUsers
              ? "border-indigo-300 bg-white shadow-xs dark:bg-gray-900"
              : "border-gray-200 bg-white/60 hover:bg-white dark:border-gray-700 dark:bg-gray-900/50"
          }`}
        >
          <span className="block text-sm font-semibold text-gray-900 dark:text-white">
            موظفون محددون فقط
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            الأسماء المحددة هنا فقط هي التي ستدخل في الاختيار الآلي.
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={eligibleUserSearch}
          onChange={(e) => setEligibleUserSearch(e.target.value)}
          placeholder="ابحث باسم الموظف، البريد، الدور، أو الحالة"
          className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm lg:max-w-md dark:border-indigo-900/60 dark:bg-gray-900"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSelectFilteredEligibleUsers}
            disabled={filteredEligibleUsers.length === 0}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            تحديد نتائج البحث
          </button>
          {hiddenEligibleUserIdsCount > 0 && (
            <button
              type="button"
              onClick={onRemoveHiddenEligibleUsers}
              className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs text-amber-800 transition hover:bg-amber-200"
            >
              إزالة {hiddenEligibleUserIdsCount} اختيار غير ظاهر
            </button>
          )}
        </div>
      </div>

      {isRestrictedToSpecificUsers && (
        <div className="flex flex-wrap gap-2">
          {selectedDistributionUsers.length === 0 ? (
            <span className="text-xs text-amber-700 dark:text-amber-300">
              يوجد اختيارات محفوظة لكنها غير ظاهرة ضمن الأدوار الحالية.
            </span>
          ) : (
            selectedDistributionUsers.map((user) => (
              <span
                key={user.id}
                className="rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs text-indigo-700 dark:border-indigo-900 dark:bg-gray-900 dark:text-indigo-300"
              >
                {formatUserLabel(user)}
              </span>
            ))
          )}
        </div>
      )}

      {eligibleUsers.length === 0 ? (
        <div className="text-xs text-gray-500">
          لا يوجد مستخدمون متاحون ضمن الأدوار المختارة حالياً. جرّب إضافة دور من الأدوار المسموحة ثم احفظ.
        </div>
      ) : filteredEligibleUsers.length === 0 ? (
        <div className="text-xs text-gray-500">لا توجد نتائج مطابقة للبحث الحالي.</div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEligibleUsers.map((user) => (
            <label
              key={user.id}
              className={`flex items-start gap-2 rounded-lg border p-3 text-sm transition-colors cursor-pointer ${
                visuallyIncludedUserIds.has(user.id)
                  ? "border-indigo-300 bg-white dark:bg-gray-900"
                  : "border-gray-200 bg-white/70 dark:border-gray-700 dark:bg-gray-900/60"
              }`}
            >
              <input
                type="checkbox"
                checked={visuallyIncludedUserIds.has(user.id)}
                onChange={() => onToggleEligibleUser(user.id)}
                className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                <span className="block font-medium text-gray-900 dark:text-white">
                  {formatUserLabel(user)}
                </span>
                <span className="block text-xs text-gray-500">
                  {formatRoleLabel(user.role)} • {formatAvailabilityLabel(user.availability)}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
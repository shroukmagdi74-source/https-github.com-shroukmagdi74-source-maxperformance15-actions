import React from "react";
import { RewardType } from "./types";
import { getCategoryLabel, getMethodLabel } from "./helpers";

interface RewardTypeSummaryCardProps {
  selectedRewardType: RewardType;
}

export const RewardTypeSummaryCard: React.FC<RewardTypeSummaryCardProps> = ({
  selectedRewardType,
}) => {
  return (
    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
            نوع المكافأة المختارة
          </p>
          <p className="text-sm text-blue-900 dark:text-blue-100 font-bold">
            {selectedRewardType.nameAr || selectedRewardType.name}
          </p>
        </div>
        <div className="text-left">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-left">
            التصنيف
          </p>
          <p className="text-sm text-blue-900 dark:text-blue-100">
            {getCategoryLabel(selectedRewardType.category)}
          </p>
        </div>
      </div>

      <div className="border-t border-blue-100 dark:border-blue-800 pt-2 grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
            طريقة الحساب
          </p>
          <p className="text-sm text-blue-900 dark:text-blue-100">
            {getMethodLabel(selectedRewardType.calculationMethod)}
          </p>
        </div>
        <div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
            القيمة الافتراضية
          </p>
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <span className="font-mono tabular-nums">
              {selectedRewardType.calculationMethod === "FIXED_AMOUNT"
                ? selectedRewardType.value.toLocaleString()
                : `${selectedRewardType.value}%`}
            </span>
            {selectedRewardType.calculationMethod === "FIXED_AMOUNT" && " ج.م"}
          </p>
        </div>
      </div>

      {selectedRewardType.eligibilityConditions && (
        <div className="border-t border-blue-100 dark:border-blue-800 pt-2">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">
            شروط الاستحقاق الواجب توفرها:
          </p>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            {(selectedRewardType.eligibilityConditions.minTargetProgress ?? 0) >
              0 && (
              <li>
                تحقيق تارجت لا يقل عن{" "}
                <span className="font-mono tabular-nums">
                  %
                  {
                    selectedRewardType.eligibilityConditions
                      .minTargetProgress
                  }
                </span>
              </li>
            )}
            {selectedRewardType.eligibilityConditions.maxLatenessCount === 0 &&
              selectedRewardType.category === "PUNCTUALITY" && (
                <li>عدم وجود أي تأخيرات خلال الشهر</li>
              )}
            {selectedRewardType.eligibilityConditions.maxAbsenceCount === 0 && (
              <li>عدم وجود أي أيام غياب</li>
            )}
            {(selectedRewardType.eligibilityConditions.maxErrorRate ?? 0) >
              0 && (
              <li>
                نسبة أخطاء أقل من{" "}
                <span className="font-mono tabular-nums">
                  %{selectedRewardType.eligibilityConditions.maxErrorRate}
                </span>
              </li>
            )}
            {selectedRewardType.eligibilityConditions
              .requiresManagerNomination && (
              <li>يتطلب ترشيح من المدير المباشر</li>
            )}
            {selectedRewardType.eligibilityConditions.requiresHRApproval && (
              <li>يتطلب موافقة قسم الموارد البشرية</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

import React from "react";
import { Info } from "lucide-react";
import { RewardDetailsRecord } from "./types";
import { deriveRewardTypeMeta } from "./helpers";

interface RewardDetailsSidebarProps {
  reward: RewardDetailsRecord;
}

export const RewardDetailsSidebar: React.FC<RewardDetailsSidebarProps> = ({
  reward,
}) => {
  const {
    rewardTypeName,
    rewardTypeNameAr,
    rewardTypeCalculationMethod,
    rewardTypeFrequency,
    rewardTypeDescription,
  } = deriveRewardTypeMeta(reward);

  return (
    <div className="space-y-6">
      {/* Reward Type Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          نوع المكافأة
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">الاسم</p>
            <p className="text-base font-medium text-gray-900">
              {rewardTypeName}
            </p>
          </div>
          {rewardTypeNameAr && (
            <div>
              <p className="text-sm text-gray-600">الاسم بالعربية</p>
              <p className="text-base font-medium text-gray-900">
                {rewardTypeNameAr}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">طريقة الحساب</p>
            <p className="text-base font-medium text-gray-900">
              {rewardTypeCalculationMethod}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">التكرار</p>
            <p className="text-base font-medium text-gray-900">
              {rewardTypeFrequency}
            </p>
          </div>
          {rewardTypeDescription && (
            <div>
              <p className="text-sm text-gray-600">الوصف</p>
              <p className="text-sm text-gray-700">{rewardTypeDescription}</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          السجل الزمني
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">تم الإنشاء</p>
              <p className="text-xs text-gray-600 font-mono tabular-nums">
                {new Date(reward.createdAt).toLocaleString("ar-EG")}
              </p>
            </div>
          </div>

          {reward.approvedAt && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">تم الاعتماد</p>
                <p className="text-xs text-gray-600 font-mono tabular-nums">
                  {new Date(reward.approvedAt).toLocaleString("ar-EG")}
                </p>
              </div>
            </div>
          )}

          {reward.appliedAt && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">تم التطبيق</p>
                <p className="text-xs text-gray-600 font-mono tabular-nums">
                  {new Date(reward.appliedAt).toLocaleString("ar-EG")}
                </p>
              </div>
            </div>
          )}

          {reward.voidedAt && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">تم الإلغاء</p>
                <p className="text-xs text-gray-600 font-mono tabular-nums">
                  {new Date(reward.voidedAt).toLocaleString("ar-EG")}
                </p>
                {reward.voidReason && (
                  <p className="text-xs text-gray-600 mt-1">
                    السبب: {reward.voidReason}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

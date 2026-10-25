import React from "react";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  User,
  XCircle,
} from "lucide-react";
import { RewardUiStatus } from "../rewardRecordUtils";
import { RewardDetailsRecord } from "./types";
import {
  REWARD_DETAILS_STATUS_CONFIG,
  formatCalculationDetails,
} from "./helpers";

interface RewardDetailsMainContentProps {
  reward: RewardDetailsRecord;
  normalizedStatus: RewardUiStatus;
  children?: React.ReactNode;
}

const renderStatusBadge = (status: RewardUiStatus) => {
  const config = REWARD_DETAILS_STATUS_CONFIG[status];
  const Icon =
    status === "PENDING"
      ? Clock
      : status === "APPROVED" || status === "APPLIED"
        ? CheckCircle
        : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${config.className}`}
    >
      <Icon className="w-5 h-5" />
      {config.label}
    </span>
  );
};

export const RewardDetailsMainContent: React.FC<
  RewardDetailsMainContentProps
> = ({ reward, normalizedStatus, children }) => {
  const formattedCalculationDetails = formatCalculationDetails(
    reward.calculationDetails,
  );

  return (
    <>
      {/* Status Banner */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              حالة المكافأة
            </h2>
            {renderStatusBadge(normalizedStatus)}
          </div>
          {reward.isIncludedInPayroll && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-800 font-medium">
                مدرجة في كشف الرواتب
              </p>
            </div>
          )}
          {reward.isLocked && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-800 font-medium">
                مقفلة - لا يمكن التعديل
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
        {/* Employee Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            معلومات الموظف
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">الاسم</p>
              <p className="text-base font-medium text-gray-900">
                {reward.user.firstName} {reward.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">رقم الموظف</p>
              <p className="text-base font-medium text-gray-900 font-mono tabular-nums">
                {reward.user.employeeNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">البريد الإلكتروني</p>
              <p className="text-base font-medium text-gray-900 font-mono">
                {reward.user.email}
              </p>
            </div>
            {reward.user.departmentRelation && (
              <div>
                <p className="text-sm text-gray-600">القسم</p>
                <p className="text-base font-medium text-gray-900">
                  {reward.user.departmentRelation.name}
                </p>
              </div>
            )}
            {reward.user.positionRelation && (
              <div>
                <p className="text-sm text-gray-600">المنصب</p>
                <p className="text-base font-medium text-gray-900">
                  {reward.user.positionRelation.title}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reward Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            تفاصيل المكافأة
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">اسم المكافأة</p>
              <p className="text-base font-medium text-gray-900">
                {reward.rewardName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">التصنيف</p>
              <p className="text-base font-medium text-gray-900">
                {reward.rewardCategory}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">القيمة المحسوبة</p>
              <p className="text-2xl font-bold text-green-600">
                <span className="font-mono tabular-nums">
                  {reward.calculatedValue.toLocaleString()}
                </span>{" "}
                ج.م
              </p>
            </div>
            {reward.reason && (
              <div>
                <p className="text-sm text-gray-600">السبب</p>
                <p className="text-base text-gray-900">{reward.reason}</p>
              </div>
            )}
            {formattedCalculationDetails && (
              <div>
                <p className="text-sm text-gray-600">تفاصيل الحساب</p>
                <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded mt-1 overflow-x-auto font-mono">
                  {formattedCalculationDetails}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Period Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            الفترة الزمنية
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">تاريخ البداية</p>
              <p className="text-base font-medium text-gray-900 font-mono tabular-nums">
                {new Date(reward.periodStart).toLocaleDateString("ar-EG")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">تاريخ النهاية</p>
              <p className="text-base font-medium text-gray-900 font-mono tabular-nums">
                {new Date(reward.periodEnd).toLocaleDateString("ar-EG")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">الشهر المطبق</p>
              <p className="text-base font-medium text-gray-900 font-mono tabular-nums">
                {reward.appliedMonth}/{reward.appliedYear}
              </p>
            </div>
          </div>
        </div>
        </div>
        {children}
      </div>
    </>
  );
};

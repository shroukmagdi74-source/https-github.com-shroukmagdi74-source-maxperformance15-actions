import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { AffiliateSettingsData } from "./types";

interface AffiliateStatusCardsProps {
  settings: AffiliateSettingsData;
  isDark: boolean;
  onToggleIsActive: (val: boolean) => void;
  onToggleAutoApprove: (val: boolean) => void;
}

export const AffiliateStatusCards: React.FC<AffiliateStatusCardsProps> = ({
  settings,
  isDark,
  onToggleIsActive,
  onToggleAutoApprove,
}) => {
  return (
    <div className="space-y-4">
      <h2
        className={`text-lg font-bold border-b pb-2 ${
          isDark
            ? "text-white border-gray-700"
            : "text-gray-900 border-gray-200"
        }`}
      >
        حالة النظام والتسجيل
      </h2>

      {/* Card 1: حالة نظام المسوقين */}
      <div
        className={`p-5 rounded-xl border transition-all ${
          isDark
            ? settings.isActive
              ? "border-blue-700/60 bg-blue-950/20"
              : "border-gray-700 bg-gray-800/40"
            : settings.isActive
              ? "border-blue-200 bg-blue-50/50"
              : "border-gray-200 bg-gray-50/70"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`font-bold text-base ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                حالة نظام المسوقين (تسجيل المسوقين)
              </h3>
              {settings.isActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  مفعل (يستقبل تسجيلات)
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                  معطل (التسجيل مغلق)
                </span>
              )}
            </div>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              تفعيل واستقبال تسجيل مسوقين جدد عبر رابط المتجر الرسمي
            </p>
          </div>

          <label
            htmlFor="system-is-active-switch"
            className="inline-flex items-center gap-3 cursor-pointer self-start sm:self-auto select-none"
          >
            <span
              className={`text-sm font-semibold ${
                settings.isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {settings.isActive ? "تشغيل" : "إيقاف"}
            </span>
            <div className="relative inline-block w-12 h-6" dir="ltr">
              <input
                id="system-is-active-switch"
                type="checkbox"
                aria-label="حالة نظام المسوقين"
                className="sr-only"
                checked={settings.isActive}
                onChange={(e) => onToggleIsActive(e.target.checked)}
              />
              <div
                className={`block w-12 h-6 rounded-full transition-colors ${
                  settings.isActive
                    ? "bg-blue-600"
                    : isDark
                      ? "bg-gray-700 border border-gray-600"
                      : "bg-gray-300"
                }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${
                  settings.isActive ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Card 2: الموافقة التلقائية على المسوقين الجدد */}
      <div
        className={`p-5 rounded-xl border transition-all ${
          isDark
            ? settings.autoApproveAffiliates
              ? "border-emerald-700/60 bg-emerald-950/20"
              : "border-gray-700 bg-gray-800/40"
            : settings.autoApproveAffiliates
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-gray-200 bg-gray-50/70"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`font-bold text-base ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                الموافقة التلقائية على المسوقين الجدد
              </h3>
              {settings.autoApproveAffiliates ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  مفعلة تلقائياً (تفعيل فوري)
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  يتطلب موافقة يدوية من الإدارة
                </span>
              )}
            </div>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              تفعيل حساب المسوق فور التسجيل مباشرة لتمكينه من بدء التسويق دون
              انتظار موافقة يدوية
            </p>
          </div>

          <label
            htmlFor="auto-approve-affiliates-switch"
            className="inline-flex items-center gap-3 cursor-pointer self-start sm:self-auto select-none"
          >
            <span
              className={`text-sm font-semibold ${
                settings.autoApproveAffiliates
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {settings.autoApproveAffiliates ? "مفعل" : "معطل"}
            </span>
            <div className="relative inline-block w-12 h-6" dir="ltr">
              <input
                id="auto-approve-affiliates-switch"
                type="checkbox"
                aria-label="الموافقة التلقائية على المسوقين الجدد"
                className="sr-only"
                checked={settings.autoApproveAffiliates}
                onChange={(e) => onToggleAutoApprove(e.target.checked)}
              />
              <div
                className={`block w-12 h-6 rounded-full transition-colors ${
                  settings.autoApproveAffiliates
                    ? "bg-emerald-600 dark:bg-emerald-500"
                    : isDark
                      ? "bg-gray-700 border border-gray-600"
                      : "bg-gray-300"
                }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${
                  settings.autoApproveAffiliates
                    ? "translate-x-6"
                    : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Crown, Trophy, Plus, RefreshCw, Loader2, Info } from "lucide-react";

interface LoyaltyTiersHeaderProps {
  onRefresh: () => void;
  onOpenPresetModal: () => void;
  onOpenNewTierModal: () => void;
  tiersEnabled: boolean;
  tiersToggleSaving: boolean;
  tiersToggleMsg: string;
  onToggleTiersEnabled: (enabled: boolean) => void;
}

export const LoyaltyTiersHeader: React.FC<LoyaltyTiersHeaderProps> = ({
  onRefresh,
  onOpenPresetModal,
  onOpenNewTierModal,
  tiersEnabled,
  tiersToggleSaving,
  tiersToggleMsg,
  onToggleTiersEnabled,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            مستويات العملاء (Tiers)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            تعريف شرائح العملاء ومميزات كل مستوى (VIP, Gold, etc.)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
          <button
            onClick={onOpenPresetModal}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="إنشاء مستويات من قالب جاهز"
          >
            <Trophy className="w-4 h-4" />
            قالب جاهز
          </button>
          <button
            onClick={onOpenNewTierModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            مستوى جديد
          </button>
        </div>
      </div>

      {/* 🆕 تفعيل نظام المستويات — مستقل عن الخصم التلقائي */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm space-y-3 border border-purple-200 dark:border-purple-700">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-500 shrink-0" />
            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                تفعيل نظام المستويات
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                شغّل المستويات عشان يطبّق خصم/مزايا المستوى على الأوردر (مستقل عن الخصم التلقائي).
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={tiersEnabled}
              disabled={tiersToggleSaving}
              onChange={(e) => onToggleTiersEnabled(e.target.checked)}
              className="h-5 w-5 accent-purple-600 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {tiersEnabled ? "مفعّل" : "متوقف"}
            </span>
          </label>
        </div>
        {tiersToggleSaving && <Loader2 className="h-4 w-4 animate-spin text-purple-500" />}
        {tiersToggleMsg && (
          <p
            className={`text-sm font-medium ${
              tiersToggleMsg.includes("✓")
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {tiersToggleMsg}
          </p>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3 border border-blue-100 dark:border-blue-900/40">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          تستخدم هذه المستويات أيضاً في <strong>نظام الكاش باك</strong> لتحديد
          نسب مختلفة لكل شريحة عملاء. يمكنك تعديل نسب الكاش باك من صفحة "إعدادات
          الكاش باك".
        </p>
      </div>
    </div>
  );
};

import React from "react";
import {
  CalculatorIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { CampaignInputs, PredictionResults } from "./types";
import { CampaignRiskBadge } from "./CampaignRiskBadge";

interface CampaignAdvancedFinancialAnalysisProps {
  inputs: CampaignInputs;
  currentResults: PredictionResults;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
}

export const CampaignAdvancedFinancialAnalysis: React.FC<
  CampaignAdvancedFinancialAnalysisProps
> = ({ inputs, currentResults, formatCurrency, formatNumber }) => {
  return (
    <>
      {/* Advanced Financial Banner */}
      <div className="business-bg-primary-solid rounded-xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CalculatorIcon className="w-6 h-6" />
          تحليل مالي متقدم
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="business-bg-accent-glass rounded-lg p-4">
            <p className="text-sm opacity-80 mb-1">
              عدد المحادثات المتوقعة
            </p>
            <p className="text-3xl font-bold tabular-nums">
              {formatNumber(currentResults.expectedConversations)}
            </p>
            <p className="text-xs mt-1 opacity-70">
              بناءً على نسبة رد {inputs.expectedResponseRate}%
            </p>
          </div>
          <div className="business-bg-accent-glass rounded-lg p-4">
            <p className="text-sm opacity-80 mb-1">
              عدد الأوردرات المتوقعة (كامل الجمهور)
            </p>
            <p className="text-3xl font-bold tabular-nums">
              {formatNumber(currentResults.expectedConversions)}
            </p>
            <p className="text-xs mt-1 opacity-70">
              بناءً على نسبة تحويل {inputs.expectedConversionRate}%
            </p>
          </div>
          <div className="business-bg-accent-glass rounded-lg p-4">
            <p className="text-sm opacity-80 mb-1">
              الإيرادات المتوقعة
            </p>
            <p className="text-3xl font-bold tabular-nums">
              {formatCurrency(currentResults.expectedRevenue)}
            </p>
            <p className="text-xs mt-1 opacity-70">
              بمتوسط {inputs.averageOrderValue} ج.م/أوردر
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards (Detailed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="business-bg-brand-gradient rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CurrencyDollarIcon className="h-12 w-12 opacity-80" />
            <CampaignRiskBadge roi={currentResults.expectedRoi} />
          </div>
          <p className="text-sm opacity-90 mb-1">الإيرادات المتوقعة</p>
          <p className="text-3xl font-bold tabular-nums">
            {formatCurrency(currentResults.expectedRevenue)}
          </p>
        </div>

        <div className="business-bg-success-gradient rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <ArrowTrendingUpIcon className="h-12 w-12 opacity-80" />
            <div className="business-bg-accent-glass-strong rounded-full p-2">
              <span className="text-lg font-bold tabular-nums">
                {currentResults.expectedRoi?.toFixed(0) || 0}%
              </span>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">الربح المتوقع</p>
          <p className="text-3xl font-bold tabular-nums">
            {formatCurrency(currentResults.expectedProfit)}
          </p>
        </div>

        <div className="business-bg-secondary-gradient rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <UsersIcon className="h-12 w-12 opacity-80" />
            <div className="business-bg-accent-glass-strong rounded-full p-2">
              <span className="text-lg font-bold tabular-nums">
                {formatNumber(currentResults.expectedConversions)}
              </span>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">التحويلات المتوقعة</p>
          <p className="text-3xl font-bold tabular-nums">
            {formatNumber(currentResults.expectedConversions)}
          </p>
          <p className="text-xs opacity-75 mt-1">
            من {formatNumber(currentResults.expectedConversations)} محادثة
          </p>
        </div>

        <div className="business-bg-warning-gradient rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CalculatorIcon className="h-12 w-12 opacity-80" />
            <div className="business-bg-accent-glass-strong rounded-full p-2">
              <span className="text-lg font-bold">CPA</span>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">تكلفة اكتساب العميل</p>
          <p className="text-3xl font-bold tabular-nums">
            {formatCurrency(currentResults.costPerAcquisition)}
          </p>
        </div>
      </div>

      {/* Break-Even Analysis */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          تحليل نقطة التعادل
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-xl">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              وحدات التعادل المطلوبة
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {formatNumber(currentResults.breakEvenUnits)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              منتج/خدمة
            </p>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">
              إيرادات التعادل
            </p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(currentResults.breakEvenRevenue)}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              المبلغ المطلوب تحقيقه
            </p>
          </div>
          <div className="p-4 business-bg-secondary-soft rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              فائض التعادل
            </p>
            <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 tabular-nums">
              {formatNumber(
                Math.max(
                  0,
                  currentResults.expectedConversions -
                    currentResults.breakEvenUnits,
                ),
              )}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              وحدات فوق التعادل
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

import React from "react";
import { CurrencyDollarIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { CampaignInputs, HistoricalDefaults } from "./types";

interface CampaignAdvancedSettingsProps {
  inputs: CampaignInputs;
  setInputs: React.Dispatch<React.SetStateAction<CampaignInputs>>;
  defaults: HistoricalDefaults | null;
}

export const CampaignAdvancedSettings: React.FC<CampaignAdvancedSettingsProps> = ({
  inputs,
  setInputs,
  defaults,
}) => {
  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          الافتراضات المالية
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              إجمالي الجمهور المستهدف
            </label>
            <input
              type="number"
              value={inputs.targetAudienceSize}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  targetAudienceSize: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border business-control-border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              تكلفة الرسالة (ج.م)
            </label>
            <input
              type="number"
              step="0.01"
              value={inputs.costPerMessage}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  costPerMessage: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border business-control-border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              متوسط قيمة الأوردر (ج.م)
            </label>
            <input
              type="number"
              value={inputs.averageOrderValue}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  averageOrderValue: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border business-control-border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          افتراضات الأداء (%)
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              معدل التحويل المتوقع (%)
            </label>
            <input
              type="number"
              value={inputs.expectedConversionRate}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  expectedConversionRate: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border business-control-border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              يُستخدم للتوقعات المستقبلية بناءً على الإرسال الناجح
            </p>
          </div>
          {/* Use Historical Data Toggle */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inputs.useHistoricalData}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setInputs({
                    ...inputs,
                    useHistoricalData: checked,
                  });
                  if (checked && defaults) {
                    setInputs((prev) => ({
                      ...prev,
                      useHistoricalData: true,
                      expectedConversionRate: defaults.avgConversionRate,
                      costPerMessage: defaults.costPerMessage,
                    }));
                  }
                }}
                className="w-5 h-5 text-blue-600 dark:text-blue-400 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  استخدام البيانات التاريخية
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

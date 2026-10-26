import React from "react";
import {
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { CampaignInputs } from "./types";

interface CampaignLiveInputsCardProps {
  inputs: CampaignInputs;
  setInputs: React.Dispatch<React.SetStateAction<CampaignInputs>>;
  showAdvanced: boolean;
  setShowAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CampaignLiveInputsCard: React.FC<CampaignLiveInputsCardProps> = ({
  inputs,
  setInputs,
  showAdvanced,
  setShowAdvanced,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        بيانات الحملة المباشرة
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            اسم المنتج
          </label>
          <input
            type="text"
            value={inputs.productName}
            onChange={(e) =>
              setInputs({ ...inputs, productName: e.target.value })
            }
            className="w-full px-4 py-2 border business-control-border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="مثال: عرض سماعات بلوتوث"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              التارجيت اليومي
            </label>
            <input
              type="number"
              value={inputs.dailyTarget}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  dailyTarget: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border business-control-border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              تارجت الاوردرات
            </label>
            <input
              type="number"
              value={inputs.orderTarget}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  orderTarget: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border business-control-border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد الرسايل الناجح (الإجمالي)
            </label>
            <input
              type="number"
              value={inputs.successfulMessages}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  successfulMessages: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border business-control-border rounded-lg bg-emerald-50 dark:bg-emerald-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد الرسايل الفاشل (الإجمالي)
            </label>
            <input
              type="number"
              value={inputs.failedMessages}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  failedMessages: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border business-control-border rounded-lg bg-red-50 dark:bg-red-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-bold"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد الردود المستلمة (العملاء اللي ردوا)
            </label>
            <input
              type="number"
              value={inputs.repliesReceived}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  repliesReceived: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border business-control-border rounded-lg business-bg-secondary-soft text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 font-bold"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            عدد الاوردرات الحالي
          </label>
          <input
            type="number"
            value={inputs.currentOrders}
            onChange={(e) =>
              setInputs({
                ...inputs,
                currentOrders: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2 border business-control-border rounded-lg bg-blue-50 dark:bg-blue-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-xl"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1"
        >
          {showAdvanced
            ? "إخفاء الإعدادات المتقدمة"
            : "إظهار إعدادات الحسابات المتقدمة"}
          {showAdvanced ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

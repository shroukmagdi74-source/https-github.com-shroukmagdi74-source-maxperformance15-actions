import React from "react";
import { Clock as ClockIcon, Plus as PlusIcon, Trash2 as TrashIcon } from "lucide-react";
import { SettingsData, StatusItem, getSafeHexColor } from "./types";

interface DevTaskGeneralTabProps {
  settings: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData | null>>;
  updateStatus: (index: number, field: keyof StatusItem, value: string) => void;
  addStatus: () => void;
  removeStatus: (index: number) => void;
}

export const DevTaskGeneralTab: React.FC<DevTaskGeneralTabProps> = ({
  settings,
  setSettings,
  updateStatus,
  addStatus,
  removeStatus,
}) => {
  return (
    <div className="space-y-8">
      {/* Timezone Settings */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-3 mb-4">
          <ClockIcon className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            إعدادات المنطقة الزمنية
          </h3>
        </div>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            المنطقة الزمنية للنظام
          </label>
          <select
            id="system-timezone"
            name="systemTimezone"
            aria-label="المنطقة الزمنية للنظام"
            value={settings.timezone || "UTC"}
            onChange={(e) =>
              setSettings({ ...settings, timezone: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="UTC">UTC (Universal Time)</option>
            <option value="Africa/Cairo">القاهرة (EET - UTC+2/3)</option>
            <option value="Asia/Riyadh">الرياض (AST - UTC+3)</option>
            <option value="Asia/Dubai">دبي (GST - UTC+4)</option>
            <option value="Europe/London">لندن (GMT - UTC+0/1)</option>
            <option value="America/New_York">نيويورك (EST - UTC-5/4)</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            تستخدم هذه المنطقة الزمنية في حسابات الـ "Dashboard" والتقارير
            اليومية لضمان دقة البيانات حسب توقيت شركتك.
          </p>
        </div>
      </div>

      {/* Task Statuses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            حالات المهام (Statuses)
          </h3>
          <button
            onClick={addStatus}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
          >
            <PlusIcon className="h-4 w-4" /> إضافة حالة
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-gray-500 bg-gray-50 dark:bg-gray-700/50 uppercase">
              <tr>
                <th className="px-4 py-3">الكود (Value)</th>
                <th className="px-4 py-3">الاسم الظاهر (Label)</th>
                <th className="px-4 py-3">اللون</th>
                <th className="px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {settings.taskStatuses.map((status, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">
                    <input
                      id={`status-value-${idx}`}
                      name={`statusValue-${idx}`}
                      aria-label={`كود الحالة ${idx + 1}`}
                      value={status.value}
                      onChange={(e) =>
                        updateStatus(idx, "value", e.target.value)
                      }
                      className="w-full bg-transparent border-none focus:ring-0 font-mono text-xs"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      id={`status-label-${idx}`}
                      name={`statusLabel-${idx}`}
                      aria-label={`اسم الحالة ${idx + 1}`}
                      value={status.label}
                      onChange={(e) =>
                        updateStatus(idx, "label", e.target.value)
                      }
                      className="w-full border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 text-xs"
                    />
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <input
                      id={`status-color-${idx}`}
                      name={`statusColor-${idx}`}
                      aria-label={`لون الحالة ${idx + 1}`}
                      type="color"
                      value={getSafeHexColor(status.color)}
                      onChange={(e) =>
                        updateStatus(idx, "color", e.target.value)
                      }
                      className="h-8 w-8 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-400 font-mono">
                      {getSafeHexColor(status.color)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeStatus(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                      aria-label={`حذف الحالة ${status.label || idx + 1}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

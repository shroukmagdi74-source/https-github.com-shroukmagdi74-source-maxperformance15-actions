import React from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import type { NewStatusInput, OrderStatusType } from "./types";
import {
  PRESET_COLORS,
  AVAILABLE_ICONS,
  SYSTEM_STATUSES,
} from "./types";
import { ICON_MAP } from "./iconMap";

export interface AddStatusModalProps {
  show: boolean;
  onClose: () => void;
  newStatus: NewStatusInput;
  setNewStatus: (status: NewStatusInput) => void;
  onCreate: () => void;
}

export function AddStatusModal({
  show,
  onClose,
  newStatus,
  setNewStatus,
  onCreate,
}: AddStatusModalProps) {
  if (!show) return null;

  const isUnmappedCustom =
    newStatus.code?.trim() &&
    !SYSTEM_STATUSES.includes(newStatus.code.trim().toUpperCase() as any) &&
    !newStatus.mapsToSystem;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            إضافة حالة جديدة
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 dark:text-gray-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                الكود *
              </label>
              <input
                type="text"
                value={newStatus.code}
                onChange={(e) =>
                  setNewStatus({
                    ...newStatus,
                    code: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                  })
                }
                placeholder="مثال: READY_TO_SHIP"
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                النوع
              </label>
              <select
                value={newStatus.statusType}
                onChange={(e) =>
                  setNewStatus({
                    ...newStatus,
                    statusType: e.target.value as OrderStatusType,
                  })
                }
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="order">حالة طلب</option>
                <option value="payment">حالة دفع</option>
                <option value="shipping">حالة شحن</option>
                <option value="preparation">حالة تجهيز</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                الاسم بالعربية *
              </label>
              <input
                type="text"
                value={newStatus.name}
                onChange={(e) =>
                  setNewStatus({ ...newStatus, name: e.target.value })
                }
                placeholder="مثال: جاهز للشحن"
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                الاسم بالإنجليزية
              </label>
              <input
                type="text"
                value={newStatus.nameEn}
                onChange={(e) =>
                  setNewStatus({ ...newStatus, nameEn: e.target.value })
                }
                placeholder="Ready to Ship"
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              الوصف
            </label>
            <textarea
              value={newStatus.description}
              onChange={(e) =>
                setNewStatus({ ...newStatus, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              اللون
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewStatus({ ...newStatus, color })}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-105 ${
                    newStatus.color === color
                      ? "border-gray-900 dark:border-white scale-110 shadow-xs"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              الأيقونة
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewStatus({ ...newStatus, icon })}
                  className={`p-2 rounded-xl border transition-colors ${
                    newStatus.icon === icon
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {ICON_MAP[icon]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                ربط بحالة النظام
              </label>
              <select
                value={newStatus.mapsToSystem}
                onChange={(e) =>
                  setNewStatus({
                    ...newStatus,
                    mapsToSystem: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- بدون ربط --</option>
                {SYSTEM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {isUnmappedCustom && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  حالة مخصصة بدون ربط بحالة نظام لا يمكن تطبيقها على أي طلب — اختر ربطًا.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                حالة WooCommerce
              </label>
              <input
                type="text"
                value={newStatus.wooCommerceStatus}
                onChange={(e) =>
                  setNewStatus({
                    ...newStatus,
                    wooCommerceStatus: e.target.value,
                  })
                }
                placeholder="مثال: processing"
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newStatus.notifyCustomer}
                onChange={(e) =>
                  setNewStatus({
                    ...newStatus,
                    notifyCustomer: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                إشعار العميل
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newStatus.notifyAdmin}
                onChange={(e) =>
                  setNewStatus({
                    ...newStatus,
                    notifyAdmin: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                إشعار الإدارة
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-2 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
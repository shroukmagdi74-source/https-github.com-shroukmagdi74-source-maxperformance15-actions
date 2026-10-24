import React from "react";
import { Save, X, AlertTriangle } from "lucide-react";
import type { OrderStatus } from "./types";
import { PRESET_COLORS, SYSTEM_STATUSES } from "./types";

export interface StatusCardEditProps {
  editingStatus: OrderStatus;
  setEditingStatus: (status: OrderStatus) => void;
  onSave: (status: OrderStatus) => void;
  onCancel: () => void;
}

export function StatusCardEdit({
  editingStatus,
  setEditingStatus,
  onSave,
  onCancel,
}: StatusCardEditProps) {
  const isUnmappedCustomStatus =
    editingStatus.code?.trim() &&
    !SYSTEM_STATUSES.includes(editingStatus.code.trim().toUpperCase() as any) &&
    !editingStatus.mapsToSystem;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            الاسم
          </label>
          <input
            type="text"
            value={editingStatus.name}
            onChange={(e) =>
              setEditingStatus({
                ...editingStatus,
                name: e.target.value,
              })
            }
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            الاسم بالإنجليزية
          </label>
          <input
            type="text"
            value={editingStatus.nameEn || ""}
            onChange={(e) =>
              setEditingStatus({
                ...editingStatus,
                nameEn: e.target.value,
              })
            }
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            اللون
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setEditingStatus({ ...editingStatus, color })}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-105 ${
                  editingStatus.color === color
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
            ربط بحالة النظام
          </label>
          <select
            value={editingStatus.mapsToSystem || ""}
            onChange={(e) =>
              setEditingStatus({
                ...editingStatus,
                mapsToSystem: e.target.value,
              })
            }
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- بدون ربط --</option>
            {SYSTEM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {isUnmappedCustomStatus && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              حالة مخصصة بدون ربط بحالة نظام لا يمكن تطبيقها على أي طلب — اختر ربطًا.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={editingStatus.notifyCustomer}
            onChange={(e) =>
              setEditingStatus({
                ...editingStatus,
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
            checked={editingStatus.notifyAdmin}
            onChange={(e) =>
              setEditingStatus({
                ...editingStatus,
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

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onSave(editingStatus)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold shadow-xs transition"
        >
          <Save className="w-4 h-4" />
          حفظ
        </button>
      </div>
    </div>
  );
}
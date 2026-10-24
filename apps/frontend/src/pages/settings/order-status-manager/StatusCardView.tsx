import React from "react";
import {
  Tag,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Link2,
  AlertTriangle,
  ShoppingCart,
  Bell,
  Lock,
  Unlock,
  ShieldAlert,
} from "lucide-react";
import type { OrderStatus } from "./types";
import { SYSTEM_STATUSES } from "./types";
import { ICON_MAP } from "./iconMap";

export interface StatusCardViewProps {
  status: OrderStatus;
  index: number;
  totalCount: number;
  onMove: (index: number, direction: "up" | "down") => void;
  onEdit: (status: OrderStatus) => void;
  onDelete: (id: string) => void;
  onToggleAllowEdit: (status: OrderStatus) => void;
}

export function StatusCardView({
  status,
  index,
  totalCount,
  onMove,
  onEdit,
  onDelete,
  onToggleAllowEdit,
}: StatusCardViewProps) {
  const isUnmappedCustomStatus =
    !status.mapsToSystem &&
    status.code?.trim() &&
    !SYSTEM_STATUSES.includes(status.code.trim().toUpperCase() as any);

  return (
    <div>
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Reordering Up/Down */}
        <div className="hidden sm:flex flex-col gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => onMove(index, "up")}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 transition"
            title="نقل للأعلى"
            aria-label="نقل للأعلى"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, "down")}
            disabled={index === totalCount - 1}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 transition"
            title="نقل للأسفل"
            aria-label="نقل للأسفل"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Icon & Color Badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
          style={{ backgroundColor: status.color }}
        >
          {ICON_MAP[status.icon || "Tag"] || <Tag className="w-4 h-4" />}
        </div>

        {/* Main Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              {status.name}
            </span>
            {status.nameEn && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({status.nameEn})
              </span>
            )}
            <span className="text-[11px] font-mono tabular-nums px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
              {status.code}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-1.5 flex-wrap text-xs text-gray-500 dark:text-gray-400">
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                status.source === "system"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : status.source === "woocommerce"
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {status.source === "system"
                ? "نظام"
                : status.source === "woocommerce"
                ? "WooCommerce"
                : "مخصص"}
            </span>
            {status.mapsToSystem && (
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Link2 className="w-3 h-3 text-slate-400" />
                {status.mapsToSystem}
              </span>
            )}
            {isUnmappedCustomStatus && (
              <span
                className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium"
                title="حالة مخصصة بدون ربط بحالة نظام — لا يمكن تطبيقها على أي طلب. عدّلها وأضف ربطًا."
              >
                <AlertTriangle className="w-3 h-3" />
                بدون ربط
              </span>
            )}
            {status.wooCommerceStatus && (
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <ShoppingCart className="w-3 h-3" />
                {status.wooCommerceStatus}
              </span>
            )}
            {(status.notifyCustomer || status.notifyAdmin) && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Bell className="w-3 h-3" />
                إشعارات
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => onEdit(status)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
            title="تعديل"
            aria-label="تعديل الحالة"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(status.id)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
            title="حذف"
            aria-label="حذف الحالة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lock/Unlock Allow Edit Row */}
      <div className="mt-3 flex items-center gap-3 border-t border-gray-100 dark:border-gray-700/80 pt-3">
        <button
          type="button"
          onClick={() => onToggleAllowEdit(status)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            status.allowStatusEdit === false
              ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
              : "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
          }`}
        >
          {status.allowStatusEdit === false ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Unlock className="w-3.5 h-3.5" />
          )}
          {status.allowStatusEdit === false
            ? "غير مسموح بالتعديل"
            : "مسموح بالتعديل"}
        </button>
        {status.allowStatusEdit === false && (
          <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            الأوردرات في هذه الحالة لن يستطيع أحد تعديل بياناتها (سعر/منتجات)
          </span>
        )}
      </div>
    </div>
  );
}
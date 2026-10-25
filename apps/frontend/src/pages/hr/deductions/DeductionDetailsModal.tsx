import React from "react";
import { X } from "lucide-react";
import {
  Deduction,
  DEDUCTION_TYPES,
  DEDUCTION_STATUS,
} from "./types";
import { formatCurrency, formatDateWithDay } from "./helpers";

interface DeductionDetailsModalProps {
  open: boolean;
  selectedDeduction: Deduction | null;
  onClose: () => void;
}

export const DeductionDetailsModal: React.FC<DeductionDetailsModalProps> = ({
  open,
  selectedDeduction,
  onClose,
}) => {
  if (!open || !selectedDeduction) return null;

  const statusInfo =
    DEDUCTION_STATUS[
      selectedDeduction.status as keyof typeof DEDUCTION_STATUS
    ] || DEDUCTION_STATUS.PENDING;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[80vh] overflow-y-auto">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              تفاصيل الخصم
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  الموظف
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {selectedDeduction.employee?.firstName}{" "}
                  {selectedDeduction.employee?.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  رقم الموظف
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white font-mono tabular-nums">
                  {selectedDeduction.employee?.employeeNumber || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  النوع
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {DEDUCTION_TYPES[
                    selectedDeduction.type as keyof typeof DEDUCTION_TYPES
                  ] || selectedDeduction.type}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  المبلغ
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white font-mono tabular-nums">
                  {formatCurrency(selectedDeduction.amount)}
                </p>
              </div>

              {selectedDeduction.category && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    التصنيف
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedDeduction.category}
                  </p>
                </div>
              )}

              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  السبب
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {selectedDeduction.reason}
                </p>
              </div>

              {selectedDeduction.description && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    الوصف
                  </p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {selectedDeduction.description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  التاريخ الفعلي
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white font-mono tabular-nums">
                  {formatDateWithDay(selectedDeduction.date)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  الحالة
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>

              {selectedDeduction.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    سبب الرفض
                  </p>
                  <p className="text-base text-red-600 dark:text-red-400">
                    {selectedDeduction.rejectionReason}
                  </p>
                </div>
              )}

              {selectedDeduction.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ملاحظات
                  </p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {selectedDeduction.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

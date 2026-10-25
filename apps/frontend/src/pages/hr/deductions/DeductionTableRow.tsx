import React from "react";
import { Eye, Edit2, Trash2 } from "lucide-react";
import {
  Deduction,
  DEDUCTION_TYPES,
  DEDUCTION_STATUS,
} from "./types";
import { formatCurrency, formatDateWithDay } from "./helpers";

interface DeductionTableRowProps {
  deduction: Deduction;
  onViewDetails: (deduction: Deduction) => void;
  onEdit: (deduction: Deduction) => void;
  onDelete: (id: string) => void;
}

export const DeductionTableRow: React.FC<DeductionTableRowProps> = ({
  deduction,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const statusInfo =
    DEDUCTION_STATUS[deduction.status as keyof typeof DEDUCTION_STATUS] ||
    DEDUCTION_STATUS.PENDING;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {deduction.employee?.firstName} {deduction.employee?.lastName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono tabular-nums">
            {deduction.employee?.employeeNumber}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900 dark:text-white">
          {DEDUCTION_TYPES[deduction.type as keyof typeof DEDUCTION_TYPES] ||
            deduction.type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900 dark:text-white font-mono tabular-nums">
          {formatCurrency(deduction.amount)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-900 dark:text-white line-clamp-2">
          {deduction.reason}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900 dark:text-white font-mono tabular-nums">
          {formatDateWithDay(deduction.date)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => onViewDetails(deduction)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="عرض التفاصيل"
          >
            <Eye className="h-5 w-5" />
          </button>

          {deduction.status === "PENDING" && (
            <button
              onClick={() => onEdit(deduction)}
              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 p-1 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              title="تعديل"
            >
              <Edit2 className="h-5 w-5" />
            </button>
          )}

          {!deduction.appliedToPayroll && (
            <button
              onClick={() => onDelete(deduction.id)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              title="حذف"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

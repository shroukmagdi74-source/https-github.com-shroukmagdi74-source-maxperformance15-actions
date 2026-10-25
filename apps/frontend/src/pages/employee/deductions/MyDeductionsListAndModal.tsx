import React from "react";
import {
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import type { TFunction } from "i18next";
import {
  Deduction,
  DEDUCTION_STATUS,
  DEDUCTION_TYPES,
  formatDeductionCurrency,
  formatDeductionDate,
} from "./types";

interface MyDeductionsListAndModalProps {
  t: TFunction;
  filteredDeductions: Deduction[];
  selectedDeduction: Deduction | null;
  showDetailsModal: boolean;
  onOpenDetails: (deduction: Deduction) => void;
  onCloseDetails: () => void;
}

export const MyDeductionsListAndModal: React.FC<
  MyDeductionsListAndModalProps
> = ({
  t,
  filteredDeductions,
  selectedDeduction,
  showDetailsModal,
  onOpenDetails,
  onCloseDetails,
}) => {
  return (
    <>
      <div className="space-y-4">
        {filteredDeductions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t("employee.deductions.noDeductions")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("employee.deductions.noDeductionsDesc")}
            </p>
          </div>
        ) : (
          filteredDeductions.map((deduction) => {
            const StatusIcon =
              DEDUCTION_STATUS[deduction.status]?.icon || Info;

            return (
              <div
                key={deduction.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow border dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 space-x-reverse mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {t(
                            DEDUCTION_TYPES[deduction.type] ||
                              "employee.deductions.typeOther",
                          )}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${DEDUCTION_STATUS[deduction.status]?.color}`}
                        >
                          <StatusIcon className="h-3 w-3 inline ml-1" />
                          {t(
                            DEDUCTION_STATUS[deduction.status]?.labelKey ||
                              "employee.deductions.pendingStatus",
                          )}
                        </span>
                        {deduction.category && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {deduction.category}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {deduction.reason}
                      </p>

                      <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 ml-1" />
                          <span className="font-medium font-mono tabular-nums text-red-600 dark:text-red-400">
                            {formatDeductionCurrency(deduction.amount)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 ml-1" />
                          <span className="font-mono tabular-nums">
                            {deduction.effectiveMonth}/{deduction.effectiveYear}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 ml-1" />
                          <span className="font-mono tabular-nums">
                            {formatDeductionDate(deduction.date)}
                          </span>
                        </div>
                      </div>

                      {deduction.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                          <p className="text-sm text-red-800 dark:text-red-400">
                            <strong>
                              {t("employee.deductions.rejectionReason")}
                            </strong>{" "}
                            {deduction.rejectionReason}
                          </p>
                        </div>
                      )}

                      {deduction.appliedToPayroll && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-400">
                            <CheckCircle className="h-4 w-4 inline ml-1" />
                            {t("employee.deductions.appliedToSalary")}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onOpenDetails(deduction)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                    >
                      {t("employee.deductions.viewDetails")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showDetailsModal && selectedDeduction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t("employee.deductions.detailsTitle")}
                </h3>
                <button
                  onClick={onCloseDetails}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="إغلاق"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("employee.deductions.type")}
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {t(
                        DEDUCTION_TYPES[selectedDeduction.type] ||
                          "employee.deductions.typeOther",
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("employee.deductions.amount")}
                    </p>
                    <p className="text-base font-medium font-mono tabular-nums text-red-600 dark:text-red-400">
                      {formatDeductionCurrency(selectedDeduction.amount)}
                    </p>
                  </div>

                  {selectedDeduction.category && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("employee.deductions.category")}
                      </p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {selectedDeduction.category}
                      </p>
                    </div>
                  )}

                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("employee.deductions.reason")}
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {selectedDeduction.reason}
                    </p>
                  </div>

                  {selectedDeduction.description && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("employee.deductions.description")}
                      </p>
                      <p className="text-base text-gray-900 dark:text-white">
                        {selectedDeduction.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("employee.deductions.date")}
                    </p>
                    <p className="text-base font-medium font-mono tabular-nums text-gray-900 dark:text-white">
                      {formatDeductionDate(selectedDeduction.date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("employee.deductions.effectiveDate")}
                    </p>
                    <p className="text-base font-medium font-mono tabular-nums text-gray-900 dark:text-white">
                      {selectedDeduction.effectiveMonth}/
                      {selectedDeduction.effectiveYear}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("employee.deductions.statusLabel")}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${DEDUCTION_STATUS[selectedDeduction.status]?.color}`}
                    >
                      {t(
                        DEDUCTION_STATUS[selectedDeduction.status]?.labelKey ||
                          "employee.deductions.pendingStatus",
                      )}
                    </span>
                  </div>

                  {selectedDeduction.approvedAt && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("employee.deductions.approvalDate")}
                      </p>
                      <p className="text-base font-mono tabular-nums text-green-600 dark:text-green-400">
                        {formatDeductionDate(selectedDeduction.approvedAt)}
                      </p>
                    </div>
                  )}

                  {selectedDeduction.rejectionReason && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("employee.deductions.rejectionReason")}
                      </p>
                      <p className="text-base text-red-600 dark:text-red-400">
                        {selectedDeduction.rejectionReason}
                      </p>
                    </div>
                  )}

                  {selectedDeduction.appliedToPayroll && (
                    <div className="col-span-2">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                          <CheckCircle className="h-4 w-4 inline ml-1" />
                          {t("employee.deductions.appliedToSalary")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={onCloseDetails}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  {t("employee.common.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

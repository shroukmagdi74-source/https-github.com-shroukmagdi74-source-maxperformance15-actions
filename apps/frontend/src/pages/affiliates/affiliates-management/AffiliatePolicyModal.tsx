import React from "react";
import { Affiliate, AffiliatePolicyFormData } from "./types";

interface AffiliatePolicyModalProps {
  isDark: boolean;
  affiliate: Affiliate | null;
  policyForm: AffiliatePolicyFormData;
  setPolicyForm: React.Dispatch<React.SetStateAction<AffiliatePolicyFormData>>;
  savingPolicy: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const AffiliatePolicyModal: React.FC<AffiliatePolicyModalProps> = ({
  isDark,
  affiliate,
  policyForm,
  setPolicyForm,
  savingPolicy,
  onClose,
  onSave,
}) => {
  if (!affiliate) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${
          isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            ضوابط المسوق
          </h2>
          <p
            className={`mt-2 text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {affiliate.user.firstName} {affiliate.user.lastName}
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              الحد الأدنى للسحب
            </label>
            <input
              type="number"
              min="0"
              aria-label="الحد الأدنى للسحب"
              value={policyForm.minPayout}
              onChange={(e) =>
                setPolicyForm({
                  ...policyForm,
                  minPayout: Number(e.target.value),
                })
              }
              className={`w-full rounded-xl border px-4 py-2 tabular-nums ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>

          <label
            className={`flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer ${
              isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div>
              <p
                className={`font-medium ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                السماح بالطلبات المباشرة
              </p>
              <p className="text-xs text-gray-500">
                تمكين المسوق من إنشاء طلبات نيابة عن العملاء
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="السماح بالطلبات المباشرة"
              checked={policyForm.canCreateOrdersForOthers}
              onChange={(e) =>
                setPolicyForm({
                  ...policyForm,
                  canCreateOrdersForOthers: e.target.checked,
                })
              }
              className="h-4 w-4 text-indigo-600 rounded border-gray-300"
            />
          </label>

          <label
            className={`flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer ${
              isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div>
              <p
                className={`font-medium ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                عرض بيانات العملاء
              </p>
              <p className="text-xs text-gray-500">
                إظهار بيانات العميل في صفحات العملاء والإحالات
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="عرض بيانات العملاء"
              checked={policyForm.canViewCustomerData}
              onChange={(e) =>
                setPolicyForm({
                  ...policyForm,
                  canViewCustomerData: e.target.checked,
                })
              }
              className="h-4 w-4 text-indigo-600 rounded border-gray-300"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              isDark
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={savingPolicy}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {savingPolicy ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </div>
  );
};

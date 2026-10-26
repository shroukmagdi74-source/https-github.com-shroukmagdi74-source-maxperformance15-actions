import React from "react";
import { CreditCard, X, Loader2, Save } from "lucide-react";
import { PAYMENT_METHOD_NAMES, PaymentFormState } from "./types";

interface ServiceOrderPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentForm: PaymentFormState;
  setPaymentForm: React.Dispatch<React.SetStateAction<PaymentFormState>>;
  savingPayment: boolean;
  handleSavePayment: (e: React.FormEvent) => void;
}

export const ServiceOrderPaymentModal: React.FC<ServiceOrderPaymentModalProps> = ({
  isOpen,
  onClose,
  paymentForm,
  setPaymentForm,
  savingPayment,
  handleSavePayment,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              تسجيل دفعة / عربون مالي
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSavePayment} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              السعر الإجمالي للخدمة:
            </label>
            <input
              type="number"
              required
              value={paymentForm.totalAmount}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  totalAmount: Number(e.target.value),
                })
              }
              className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              المبلغ المحصل الآن (الدفعة / العربون):
            </label>
            <input
              type="number"
              placeholder="مثال: 500"
              value={paymentForm.newPaymentAmount}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  newPaymentAmount: e.target.value,
                })
              }
              className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              طريقة الدفع:
            </label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  paymentMethod: e.target.value,
                })
              }
              className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40"
            >
              {Object.entries(PAYMENT_METHOD_NAMES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              ملاحظة الدفعة (اختياري):
            </label>
            <input
              type="text"
              placeholder="مثال: عربون مقدم لبدء العمل"
              value={paymentForm.newPaymentNote}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  newPaymentNote: e.target.value,
                })
              }
              className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-500 hover:bg-gray-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={savingPayment}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              {savingPayment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ وتحديث الحساب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

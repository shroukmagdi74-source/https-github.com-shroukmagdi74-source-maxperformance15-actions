import React from "react";
import { Printer, Send } from "lucide-react";

interface ServiceOrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  shortId: string;
  currentPaymentStatus: { label: string; color: string; badge: string };
  companySettings: any;
  onSendViaWhatsApp: () => void;
}

export const ServiceOrderInvoiceModal: React.FC<ServiceOrderInvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  shortId,
  currentPaymentStatus,
  companySettings,
  onSendViaWhatsApp,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b pb-4 border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-xs font-bold text-primary-600 block uppercase tracking-wider">
              فاتورة خدمة معتمدة
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">
              {order.payment?.invoiceNumber || `SRV-${shortId}`}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              تاريخ الإصدار: {new Date(order.createdAt).toLocaleDateString("ar-EG")}
            </p>
          </div>

          <div className="text-left">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${currentPaymentStatus.color}`}
            >
              {currentPaymentStatus.label}
            </span>
          </div>
        </div>

        {/* Bill To Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs">
          <div>
            <span className="text-gray-400 block mb-0.5">فاتورة إلى:</span>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {order.customerName}
            </p>
            <p className="text-gray-500 font-mono mt-0.5 tabular-nums" dir="ltr">
              {order.phone}
            </p>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">تفاصيل الخدمة:</span>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {order.service?.name || "خدمة"}
            </p>
            <p className="text-gray-500 mt-0.5">الطلب رقم: {shortId}</p>
          </div>
        </div>

        {/* Invoice Table Breakdown */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="p-3 font-semibold">بند الخدمة</th>
                <th className="p-3 font-semibold text-center">الكمية</th>
                <th className="p-3 font-semibold text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="p-3">
                  <span className="font-bold text-gray-900 dark:text-white block">
                    {order.service?.name}
                  </span>
                  {order.description && (
                    <span className="text-[11px] text-gray-400 line-clamp-1">
                      {order.description}
                    </span>
                  )}
                </td>
                <td className="p-3 text-center tabular-nums">1</td>
                <td className="p-3 text-left font-bold tabular-nums">
                  {order.payment?.totalAmount || 0} ج.م
                </td>
              </tr>
            </tbody>
          </table>

          {/* Financial Totals */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">إجمالي الحساب:</span>
              <span className="font-bold text-gray-900 dark:text-white tabular-nums">
                {order.payment?.totalAmount || 0} ج.م
              </span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>المسدد (عربون/دفعات):</span>
              <span className="font-bold tabular-nums">
                {order.payment?.paidAmount || 0} ج.م
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-rose-600 dark:text-rose-400 pt-1 border-t border-gray-200 dark:border-gray-700">
              <span>المبلغ المتبقي المطلوب:</span>
              <span className="tabular-nums">
                {order.payment?.remainingAmount || 0} ج.م
              </span>
            </div>
          </div>
        </div>

        {/* Payment Accounts from Settings */}
        {(companySettings?.vodafoneCashNumber ||
          companySettings?.instapayAddress) && (
          <div className="p-3.5 rounded-2xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 text-xs space-y-1.5">
            <span className="font-bold text-primary-800 dark:text-primary-300 block">
              طرق التحصيل المعتمدة:
            </span>
            {companySettings?.vodafoneCashNumber && (
              <p className="text-gray-700 dark:text-gray-300">
                📱 فودافون كاش:{" "}
                <span className="font-mono font-bold" dir="ltr">
                  {companySettings.vodafoneCashNumber}
                </span>
              </p>
            )}
            {companySettings?.instapayAddress && (
              <p className="text-gray-700 dark:text-gray-300">
                ⚡ إنستاباي:{" "}
                <span className="font-mono font-bold" dir="ltr">
                  {companySettings.instapayAddress}
                </span>
              </p>
            )}
          </div>
        )}

        {companySettings?.paymentTerms && (
          <p className="text-[11px] text-gray-400 text-center italic">
            {companySettings.paymentTerms}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-500 hover:bg-gray-100"
          >
            إغلاق
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة</span>
            </button>

            <button
              type="button"
              onClick={onSendViaWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>إرسال للعميل عبر واتساب</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

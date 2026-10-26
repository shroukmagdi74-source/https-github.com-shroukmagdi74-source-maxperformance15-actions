import React from "react";
import { CreditCard, Plus, Receipt, Send } from "lucide-react";

interface ServiceOrderFinanceCardProps {
  order: any;
  onOpenPaymentModal: () => void;
  onOpenInvoiceModal: () => void;
  onSendInvoiceWhatsApp: () => void;
}

export const ServiceOrderFinanceCard: React.FC<ServiceOrderFinanceCardProps> = ({
  order,
  onOpenPaymentModal,
  onOpenInvoiceModal,
  onSendInvoiceWhatsApp,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700/60">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          الماليات وحالة الدفع
        </h3>
        <button
          type="button"
          onClick={onOpenPaymentModal}
          className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>تسجيل دفعة</span>
        </button>
      </div>

      {/* Financial Summary */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center p-2 rounded-xl bg-gray-50 dark:bg-gray-900/40">
          <span className="text-gray-500">السعر الإجمالي:</span>
          <span className="font-bold text-gray-900 dark:text-white tabular-nums">
            {order.payment?.totalAmount || 0} ج.م
          </span>
        </div>
        <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
          <span>المدفوع (عربون/تحصيل):</span>
          <span className="font-bold tabular-nums">
            {order.payment?.paidAmount || 0} ج.م
          </span>
        </div>
        <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300">
          <span>المبلغ المتبقي:</span>
          <span className="font-bold tabular-nums">
            {order.payment?.remainingAmount || 0} ج.م
          </span>
        </div>
      </div>

      {/* Action Buttons for Invoice */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenInvoiceModal}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl transition-colors"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>عرض الفاتورة</span>
        </button>

        <button
          type="button"
          onClick={onSendInvoiceWhatsApp}
          className="flex items-center justify-center p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl transition-colors"
          title="إرسال الفاتورة عبر واتساب"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

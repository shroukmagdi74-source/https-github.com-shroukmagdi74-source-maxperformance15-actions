import React from "react";
import { Sparkles, Plus, Ban } from "lucide-react";
import type { FactoryAgreement, FactoryAgreementPayment } from "./types";

export interface AgreementPaymentsTabProps {
  agreement: FactoryAgreement;
  actionLoading: boolean;
  onGenerateDefaultPayments: () => void;
  onOpenAddPaymentModal: () => void;
  onSelectPaymentToPay: (payment: FactoryAgreementPayment) => void;
  onCancelPayment: (paymentId: string) => void;
}

export const AgreementPaymentsTab: React.FC<AgreementPaymentsTabProps> = ({
  agreement,
  actionLoading,
  onGenerateDefaultPayments,
  onOpenAddPaymentModal,
  onSelectPaymentToPay,
  onCancelPayment,
}) => {
  return (
    <div className="space-y-4">
      {/* Actions row */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-bold text-foreground">
          دفعات المصنع المستحقة ومواعيد السداد
        </h4>
        <div className="flex items-center gap-2">
          {(!agreement?.payments || agreement.payments.length === 0) && (
            <button
              onClick={onGenerateDefaultPayments}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              توليد تلقائي (70/20/10)
            </button>
          )}
          <button
            onClick={onOpenAddPaymentModal}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة دفعة يدوية
          </button>
        </div>
      </div>

      {/* Payments Table */}
      {agreement?.payments && agreement.payments.length > 0 ? (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/40 border-b border-border/70 text-muted-foreground text-[11px]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">#</th>
                <th className="py-2.5 px-3 font-semibold">المسمى</th>
                <th className="py-2.5 px-3 font-semibold">القيمة</th>
                <th className="py-2.5 px-3 font-semibold">النسبة</th>
                <th className="py-2.5 px-3 font-semibold">الاستحقاق</th>
                <th className="py-2.5 px-3 font-semibold">الحالة</th>
                <th className="py-2.5 px-3 font-semibold text-center">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {agreement.payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-mono text-muted-foreground">
                    {p.seq}
                  </td>
                  <td className="py-3 px-3 font-medium text-foreground">
                    {p.label}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-foreground tabular-nums">
                    {Number(p.amount).toLocaleString("en-US")} ج.م
                  </td>
                  <td className="py-3 px-3 font-mono text-muted-foreground tabular-nums">
                    {p.percent ? `${p.percent}%` : "-"}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">
                    {p.dueDate
                      ? new Date(p.dueDate).toLocaleDateString("ar-EG")
                      : "-"}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        p.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : p.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {p.status === "PAID"
                        ? "مدفوعة (PAID)"
                        : p.status === "PENDING"
                        ? "قيد الانتظار"
                        : "ملغاة"}
                    </span>
                    {p.paidAt && (
                      <span className="block text-[9px] text-muted-foreground mt-0.5 font-mono">
                        سُددت في:{" "}
                        {new Date(p.paidAt).toLocaleDateString("ar-EG")}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.status === "PENDING" && (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectPaymentToPay(p)}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors"
                        >
                          تسجيل سداد
                        </button>
                        <button
                          onClick={() => onCancelPayment(p.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                          title="إلغاء الدفعة"
                          aria-label="إلغاء الدفعة"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-10 text-center border-2 border-dashed border-border/70 rounded-xl">
          <p className="text-xs text-muted-foreground">
            لم يتم توليد أو إضافة أي دفعات لهذه الاتفاقية بعد
          </p>
          <button
            onClick={onGenerateDefaultPayments}
            className="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-transform active:scale-[0.98]"
          >
            توليد جدول الدفعات التلقائي (70/20/10)
          </button>
        </div>
      )}
    </div>
  );
};

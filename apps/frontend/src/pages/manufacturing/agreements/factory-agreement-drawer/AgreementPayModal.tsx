import React from "react";
import { X } from "lucide-react";
import type { FactoryAgreementPayment } from "./types";

export interface AgreementPayModalProps {
  payment: FactoryAgreementPayment | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  actionLoading: boolean;
  payReference: string;
  onPayReferenceChange: (val: string) => void;
  payNotes: string;
  onPayNotesChange: (val: string) => void;
}

export const AgreementPayModal: React.FC<AgreementPayModalProps> = ({
  payment,
  onClose,
  onSubmit,
  actionLoading,
  payReference,
  onPayReferenceChange,
  payNotes,
  onPayNotesChange,
}) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-sm font-bold text-foreground">
            تسجيل سداد الدفعة: {payment.label}
          </h3>
          <button
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div className="p-3 bg-muted/30 rounded-xl border border-border/40">
            <span className="text-[11px] text-muted-foreground block">
              مبلغ الدفعة المطلوب سداده:
            </span>
            <strong className="text-base font-bold text-emerald-600 font-mono tabular-nums">
              {Number(payment.amount).toLocaleString("en-US")} ج.م
            </strong>
          </div>
          <div>
            <label className="block font-medium text-foreground mb-1">
              رقم الإيصال / الشيك / الحوالة (المرجع)
            </label>
            <input
              type="text"
              placeholder="مثال: CHK-9901 أو إيصال تحويل بنكي"
              value={payReference}
              onChange={(e) => onPayReferenceChange(e.target.value)}
              className="w-full p-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-foreground mb-1">
              ملاحظات السداد
            </label>
            <input
              type="text"
              placeholder="ملاحظات الحسابات وتأكيد التحويل للمصنع..."
              value={payNotes}
              onChange={(e) => onPayNotesChange(e.target.value)}
              className="w-full p-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              تأكيد سداد الدفعة (PAID)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

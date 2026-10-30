import React from "react";
import type { FactoryAgreement } from "./types";

export interface AgreementFinancialStripProps {
  agreement: FactoryAgreement;
}

export const AgreementFinancialStrip: React.FC<
  AgreementFinancialStripProps
> = ({ agreement }) => {
  return (
    <div className="px-5 py-3 border-b border-border/60 bg-card grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40">
        <span className="text-[11px] text-muted-foreground block">
          قيمة الاتفاقية:
        </span>
        <strong className="text-sm font-bold text-foreground font-mono tabular-nums">
          {agreement.totalValue?.toLocaleString("en-US")} {agreement.currency}
        </strong>
        <span className="text-[10px] text-muted-foreground block mt-0.5">
          تسعير: {agreement.pricingMode}
        </span>
      </div>

      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40">
        <span className="text-[11px] text-muted-foreground block">
          المسدد فعلياً:
        </span>
        <strong className="text-sm font-bold text-emerald-600 font-mono tabular-nums">
          {agreement.paidAmount?.toLocaleString("en-US")} {agreement.currency}
        </strong>
        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5 tabular-nums">
          {agreement.paidPercent}% مسدد
        </span>
      </div>

      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40">
        <span className="text-[11px] text-muted-foreground block">
          قيد الانتظار:
        </span>
        <strong className="text-sm font-bold text-amber-600 font-mono tabular-nums">
          {agreement.pendingAmount?.toLocaleString("en-US")}{" "}
          {agreement.currency}
        </strong>
        <span className="text-[10px] text-muted-foreground block mt-0.5">
          باقي دفعات مجدولة
        </span>
      </div>

      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40">
        <span className="text-[11px] text-muted-foreground block">
          المتبقي غير مجدول:
        </span>
        <strong className="text-sm font-bold text-foreground font-mono tabular-nums">
          {agreement.remainingAmount?.toLocaleString("en-US")}{" "}
          {agreement.currency}
        </strong>
        <div className="w-full bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all"
            style={{ width: `${agreement.paidPercent || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

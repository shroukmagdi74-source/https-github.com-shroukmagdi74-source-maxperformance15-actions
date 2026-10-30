import React from "react";
import { Building2, CheckCircle2, Trash2, Check } from "lucide-react";
import type { FactoryAgreement } from "./types";

export interface AgreementDrawerQuickActionsProps {
  agreement: FactoryAgreement;
  actionLoading: boolean;
  onActivate: () => void;
  onDeleteDraft: () => void;
  onCloseAgreement: () => void;
  onCancelAgreement: () => void;
}

export const AgreementDrawerQuickActions: React.FC<
  AgreementDrawerQuickActionsProps
> = ({
  agreement,
  actionLoading,
  onActivate,
  onDeleteDraft,
  onCloseAgreement,
  onCancelAgreement,
}) => {
  return (
    <div className="px-5 py-2.5 bg-muted/10 border-b border-border/50 flex items-center justify-between gap-2 overflow-x-auto text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="w-4 h-4" />
        <span className="font-medium text-foreground">
          {agreement.partnerFactory?.name}
        </span>
        {agreement.order && (
          <span className="text-muted-foreground font-mono">
            • أمر تشغيل: {agreement.order.orderNumber}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {agreement.status === "DRAFT" && (
          <>
            <button
              onClick={onActivate}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 transition-transform active:scale-[0.98]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              تفعيل الاتفاقية
            </button>
            <button
              onClick={onDeleteDraft}
              disabled={actionLoading}
              className="px-2.5 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف
            </button>
          </>
        )}

        {agreement.status === "ACTIVE" && (
          <button
            onClick={onCloseAgreement}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            إغلاق الاتفاقية
          </button>
        )}

        {agreement.status !== "CANCELLED" &&
          agreement.status !== "CLOSED" && (
            <button
              onClick={onCancelAgreement}
              disabled={actionLoading}
              className="px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-muted/50 text-xs"
            >
              إلغاء
            </button>
          )}
      </div>
    </div>
  );
};

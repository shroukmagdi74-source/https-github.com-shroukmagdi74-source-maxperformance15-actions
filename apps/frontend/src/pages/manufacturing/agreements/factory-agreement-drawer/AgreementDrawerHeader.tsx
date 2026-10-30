import React from "react";
import { X, FileSignature } from "lucide-react";
import type { FactoryAgreement } from "./types";

export interface AgreementDrawerHeaderProps {
  agreement: FactoryAgreement | null;
  onClose: () => void;
}

export const AgreementDrawerHeader: React.FC<AgreementDrawerHeaderProps> = ({
  agreement,
  onClose,
}) => {
  return (
    <div className="px-5 py-3.5 border-b border-border/70 bg-muted/20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <FileSignature className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-foreground">
              {agreement?.code || "FA-...."}
            </span>
            {agreement && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  agreement.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : agreement.status === "DRAFT"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : agreement.status === "CLOSED"
                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {agreement.status === "ACTIVE"
                  ? "نشطة (ACTIVE)"
                  : agreement.status === "DRAFT"
                  ? "مسودة (DRAFT)"
                  : agreement.status === "CLOSED"
                  ? "مغلقة (CLOSED)"
                  : "ملغاة (CANCELLED)"}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-foreground truncate max-w-xs sm:max-w-md">
            {agreement?.title || "تفاصيل الاتفاقية"}
          </h3>
        </div>
      </div>

      <button
        onClick={onClose}
        aria-label="إغلاق"
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

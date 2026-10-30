import React from "react";
import { DollarSign, FileText, Paperclip } from "lucide-react";
import type { AgreementTab, FactoryAgreement } from "./types";

export interface AgreementDrawerTabsNavProps {
  activeTab: AgreementTab;
  onTabChange: (tab: AgreementTab) => void;
  agreement: FactoryAgreement | null;
}

export const AgreementDrawerTabsNav: React.FC<AgreementDrawerTabsNavProps> = ({
  activeTab,
  onTabChange,
  agreement,
}) => {
  return (
    <div className="px-5 border-b border-border/60 bg-muted/10 flex items-center gap-4 text-xs font-medium">
      <button
        onClick={() => onTabChange("payments")}
        className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
          activeTab === "payments"
            ? "border-primary text-primary font-bold"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        <DollarSign className="w-4 h-4" />
        جدول الدفعات ({agreement?.payments?.length || 0})
      </button>
      <button
        onClick={() => onTabChange("terms")}
        className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
          activeTab === "terms"
            ? "border-primary text-primary font-bold"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        <FileText className="w-4 h-4" />
        البنود التعاقدية (العشرة)
      </button>
      <button
        onClick={() => onTabChange("files")}
        className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
          activeTab === "files"
            ? "border-primary text-primary font-bold"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        <Paperclip className="w-4 h-4" />
        المرفقات والعقود ({agreement?.files?.length || 0})
      </button>
    </div>
  );
};

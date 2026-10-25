import React from "react";
import { Key, Webhook, Code2, Plus, Cpu } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { HRApiTab } from "./types";

interface HRApiHeaderAndTabsProps {
  activeTab: HRApiTab;
  onTabChange: (tab: HRApiTab) => void;
  keysCount: number;
  onOpenCreateModal: () => void;
}

export const HRApiHeaderAndTabs: React.FC<HRApiHeaderAndTabsProps> = ({
  activeTab,
  onTabChange,
  keysCount,
  onOpenCreateModal,
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              الربط الخارجي وأدوات الذكاء الاصطناعي (HR API & Integrations)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            إدارة مفاتيح API الآمنة، واستقبال بصمات الأجهزة، والتكامل مع نماذج الذكاء الاصطناعي وأنظمة الـ ERP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء مفتاح جديد</span>
          </Button>
        </div>
      </div>

      <div className="flex border-b border-border/40 space-x-reverse space-x-4">
        <button
          onClick={() => onTabChange("keys")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "keys"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Key className="h-4 w-4" />
          <span>
            مفاتيح الـ API (<span className="font-mono tabular-nums">{keysCount}</span>)
          </span>
        </button>

        <button
          onClick={() => onTabChange("webhooks")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "webhooks"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Webhook className="h-4 w-4" />
          <span>الـ Webhooks والأحداث اللحظية</span>
        </button>

        <button
          onClick={() => onTabChange("docs")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "docs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>توثيق الذكاء الاصطناعي (OpenAPI)</span>
        </button>
      </div>
    </>
  );
};

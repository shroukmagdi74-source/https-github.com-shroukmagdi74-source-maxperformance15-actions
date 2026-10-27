import React from "react";
import { Building2, Download, RefreshCw, Plus, Loader2, Filter } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";

interface CompaniesHeaderProps {
  total: number;
  activeCompanies: number;
  isLoading: boolean;
  filterOpen: boolean;
  filterCount: number;
  onExport: () => void;
  onRefresh: () => void;
  onCreateCompany: () => void;
  onToggleFilter: () => void;
}

export const CompaniesHeader: React.FC<CompaniesHeaderProps> = ({
  total,
  activeCompanies,
  isLoading,
  filterOpen,
  filterCount,
  onExport,
  onRefresh,
  onCreateCompany,
  onToggleFilter,
}) => {
  return (
    <div className="flex flex-col gap-2.5 p-3 sm:p-4 border-b border-border/60 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-center shrink-0">
          <Building2 className="size-4 text-foreground/80" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              إدارة الشركات
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-mono tabular-nums text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {total} شركة • {activeCompanies} نشطة
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            قاعدة بيانات الشركات المشتركة ومتابعة دورة حياة العملاء
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-mono active:scale-[0.98] transition-transform"
          onClick={onExport}
          disabled={!total}
        >
          <Download className="size-3.5" />
          <span>تصدير</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-mono active:scale-[0.98] transition-transform"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          <span>تحديث</span>
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium bg-primary text-primary-foreground active:scale-[0.98] transition-transform"
          onClick={onCreateCompany}
        >
          <Plus className="size-3.5" />
          <span>إضافة شركة</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs transition-all active:scale-[0.98]",
            filterOpen ? "bg-muted text-foreground border-border" : "text-muted-foreground"
          )}
          onClick={onToggleFilter}
        >
          <Filter className="size-3.5" />
          <span>فلاتر</span>
          {filterCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-mono text-primary-foreground">
              {filterCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

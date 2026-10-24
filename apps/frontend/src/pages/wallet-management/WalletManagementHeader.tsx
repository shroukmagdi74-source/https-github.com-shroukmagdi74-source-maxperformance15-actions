import React from "react";
import { Landmark, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WalletManagementHeaderProps {
  activeWalletsCount: number;
  activeTabDescription: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export const WalletManagementHeader: React.FC<WalletManagementHeaderProps> = ({
  activeWalletsCount,
  activeTabDescription,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-center shrink-0">
          <Landmark className="size-4 text-foreground/80" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              إدارة المحافظ والمدفوعات
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-mono tabular-nums text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {activeWalletsCount} محفظة نشطة
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {activeTabDescription}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 gap-1.5 text-xs font-mono active:scale-[0.98] transition-transform"
        >
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          <span>تحديث البيانات</span>
        </Button>
      </div>
    </div>
  );
};

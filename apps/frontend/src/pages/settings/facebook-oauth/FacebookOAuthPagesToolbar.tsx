import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface FacebookOAuthPagesToolbarProps {
  totalCount: number;
  selectedCount: number;
  allPagesSelected: boolean;
  selectedReconnectableCount: number;
  selectedConnectedCount: number;
  loading: boolean;
  onToggleSelectAll: () => void;
  onReconnectSelected: () => void;
  onDisconnectSelected: () => void;
  onHardDeleteSelected: () => void;
}

export const FacebookOAuthPagesToolbar: React.FC<FacebookOAuthPagesToolbarProps> = ({
  totalCount,
  selectedCount,
  allPagesSelected,
  selectedReconnectableCount,
  selectedConnectedCount,
  loading,
  onToggleSelectAll,
  onReconnectSelected,
  onDisconnectSelected,
  onHardDeleteSelected,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border/60 bg-muted/40 p-2.5 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-foreground">
        <input
          type="checkbox"
          checked={allPagesSelected}
          onChange={onToggleSelectAll}
          className="h-3.5 w-3.5 rounded border-border text-blue-600 focus:ring-blue-500"
        />
        <span>{t("facebookOAuth.selectAll", "تحديد الكل")}</span>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          ({selectedCount} / {totalCount})
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onReconnectSelected}
          disabled={loading || selectedReconnectableCount === 0}
          className="h-7 gap-1 border-emerald-500/30 text-[11px] font-medium text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
        >
          <RefreshCw className="h-3 w-3" />
          {t("facebookOAuth.reconnectSelected", "إعادة ربط المحدد")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onDisconnectSelected}
          disabled={loading || selectedConnectedCount === 0}
          className="h-7 gap-1 border-destructive/30 text-[11px] font-medium text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3 w-3" />
          {t("facebookOAuth.disconnectSelected", "فصل المحدد")}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onHardDeleteSelected}
          disabled={loading || selectedCount === 0}
          className="h-7 gap-1 text-[11px] font-medium text-destructive hover:bg-destructive/15"
        >
          <Trash2 className="h-3 w-3" />
          {t("facebookOAuth.deletePermanently", "حذف نهائي")}
        </Button>
      </div>
    </div>
  );
};

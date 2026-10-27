import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Bot, Loader2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentProfilesEmptyStateProps {
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onRetry: () => void;
  onOpenCreate: () => void;
}

export const AgentProfilesEmptyState: React.FC<AgentProfilesEmptyStateProps> = ({
  loading,
  error,
  selectedId,
  onRetry,
  onOpenCreate,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 py-20">
        <Loader2 className="size-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-4">
        <AlertCircle className="size-10 text-destructive mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">
          {t("agentProfiles.header.loadFailed", "فشل تحميل بيانات الوكيل")}
        </p>
        <p className="text-xs text-muted-foreground mb-4 max-w-sm">{error}</p>
        {selectedId && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" />
            {t("common.retry", "إعادة المحاولة")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
      <Bot className="size-12 text-muted-foreground/30 mb-3" />
      <p className="text-xs text-muted-foreground mb-4">
        {t("agentProfiles.header.noSelectionHint", "اختر وكيلاً لعرض التفاصيل")}
      </p>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs"
        onClick={onOpenCreate}
      >
        <Plus className="size-3.5 ml-1" />
        {t("agentProfiles.sidebar.addTitle", "إضافة وكيل ذكي")}
      </Button>
    </div>
  );
};

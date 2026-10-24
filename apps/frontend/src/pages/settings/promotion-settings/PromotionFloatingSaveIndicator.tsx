import { useTranslation } from "react-i18next";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaveState } from "./types";

export interface PromotionFloatingSaveIndicatorProps {
  saveState: SaveState;
}

export function PromotionFloatingSaveIndicator({
  saveState,
}: PromotionFloatingSaveIndicatorProps) {
  const { t } = useTranslation();

  if (saveState === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2 text-xs font-bold shadow-lg transition-colors",
        saveState === "saving"
          ? "border-amber-200 bg-amber-50/95 text-amber-800"
          : "border-emerald-200 bg-emerald-50/95 text-emerald-800",
      )}
    >
      <span className="flex items-center gap-2">
        {saveState === "saving" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5" />
        )}
        {saveState === "saving"
          ? t("promotionSettings.saveSaving")
          : t("promotionSettings.saveSaved")}
      </span>
    </div>
  );
}

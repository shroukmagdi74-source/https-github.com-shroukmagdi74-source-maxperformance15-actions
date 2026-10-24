import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletStatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export const WalletStatusBadge: React.FC<WalletStatusBadgeProps> = ({
  active,
  activeLabel = "نشط",
  inactiveLabel = "غير نشط",
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        active
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border/70 bg-muted/60 text-muted-foreground",
      )}
    >
      {active ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
      {active ? activeLabel : inactiveLabel}
    </span>
  );
};

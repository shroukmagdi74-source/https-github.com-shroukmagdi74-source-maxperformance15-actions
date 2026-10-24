import React from "react";
import { cn } from "@/lib/utils";

interface WalletTelemetryRibbonProps {
  totalWallets: number;
  activeWallets: number;
  pendingReceiptsCount: number;
  companyBalanceDisplay: string;
}

export const WalletTelemetryRibbon: React.FC<WalletTelemetryRibbonProps> = ({
  totalWallets,
  activeWallets,
  pendingReceiptsCount,
  companyBalanceDisplay,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-x-reverse divide-y sm:divide-y-0 divide-border/60 rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="p-3 sm:p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">أرقام المحافظ</span>
          <span className="size-1.5 rounded-full bg-blue-500" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground">
            {totalWallets}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
          {activeWallets} نشطة
        </p>
      </div>

      <div className="p-3 sm:p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">المحافظ المفعلة</span>
          <span className="size-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
            {activeWallets}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] font-mono text-muted-foreground">وسائل دفع جاهزة</p>
      </div>

      <div className="p-3 sm:p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">الإيصالات المعلقة</span>
          <span
            className={cn(
              "size-1.5 rounded-full",
              pendingReceiptsCount > 0 ? "bg-amber-500" : "bg-emerald-500",
            )}
          />
        </div>
        <div className="mt-2">
          <span
            className={cn(
              "text-xl font-bold font-mono tabular-nums tracking-tight",
              pendingReceiptsCount > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground",
            )}
          >
            {pendingReceiptsCount}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] font-mono text-muted-foreground">
          {pendingReceiptsCount > 0 ? "تحتاج اعتمادًا" : "مراجعة مكتملة"}
        </p>
      </div>

      <div className="p-3 sm:p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">أرصدة الشركات</span>
          <span className="size-1.5 rounded-full bg-purple-500" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground">
            {companyBalanceDisplay}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] font-mono text-muted-foreground">إجمالي الرصيد المتاح</p>
      </div>
    </div>
  );
};

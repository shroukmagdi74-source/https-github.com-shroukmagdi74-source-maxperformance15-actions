import React from "react";
import { Clock, LayoutDashboard, RefreshCw, Users } from "lucide-react";

import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

interface SuperAdminDashboardHeaderProps {
  user?: {
    firstName?: string;
    lastName?: string;
  } | null;
  isRefreshing: boolean;
  onOpenActiveUsers: () => void;
  onRefresh: () => void;
}

export const SuperAdminDashboardHeader: React.FC<SuperAdminDashboardHeaderProps> = ({
  user,
  isRefreshing,
  onOpenActiveUsers,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-center shrink-0">
          <LayoutDashboard className="size-4.5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              لوحة تحكم مدير النظام
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border border-border/80 bg-muted/30">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              متصل
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            مرحباً {user?.firstName} {user?.lastName} · نظرة موحدة على النبض التشغيلي لمنصة MaxP
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-1 text-xs">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-mono text-muted-foreground">
            {new Date().toLocaleDateString("ar-EG", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>

        <Button
          onClick={onOpenActiveUsers}
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs font-mono active:scale-[0.98] transition-transform"
        >
          <Users className="ml-1.5 size-3.5" />
          المستخدمون النشطون
        </Button>

        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          size="sm"
          className="h-8 rounded-lg text-xs font-mono active:scale-[0.98] transition-transform"
        >
          <RefreshCw
            className={cn("ml-1.5 size-3.5", isRefreshing && "animate-spin")}
          />
          {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
        </Button>
      </div>
    </div>
  );
};

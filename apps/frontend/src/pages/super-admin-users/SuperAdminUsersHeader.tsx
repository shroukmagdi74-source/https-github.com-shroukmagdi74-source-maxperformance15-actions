import React from "react";
import { Plus, RefreshCw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuperAdminUsersHeaderProps {
  totalCount: number;
  page: number;
  totalPages: number;
  loading: boolean;
  onRefresh: () => void;
  onCreateUser: () => void;
}

export const SuperAdminUsersHeader: React.FC<SuperAdminUsersHeaderProps> = ({
  totalCount,
  page,
  totalPages,
  loading,
  onRefresh,
  onCreateUser,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-center shrink-0">
          <UserRound className="size-4 text-foreground/80" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              إدارة المستخدمين
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-mono tabular-nums text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {totalCount} مستخدم • صفحة {page} من {Math.max(totalPages, 1)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            التحكم في حسابات مسؤولي المنصة والصلاحيات وتتبع حالات النشاط
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 gap-1.5 text-xs font-mono active:scale-[0.98] transition-transform"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          <span>تحديث</span>
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onCreateUser}
          className="h-8 gap-1.5 text-xs font-medium bg-primary text-primary-foreground active:scale-[0.98] transition-transform"
        >
          <Plus className="size-3.5" />
          <span>إضافة مستخدم</span>
        </Button>
      </div>
    </div>
  );
};

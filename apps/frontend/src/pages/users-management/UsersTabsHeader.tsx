import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, MailPlus, UserCheck, Users, UserX } from "lucide-react";
import type { UsersTabValue } from "./useUsersManagementController";

interface UsersTabsHeaderProps {
  activeTab: UsersTabValue;
  statusCounts: {
    total: number;
    active: number;
    neverLoggedIn: number;
    inactive: number;
  };
  totalCount: number;
  invitationsCount: number;
}

export const UsersTabsHeader: React.FC<UsersTabsHeaderProps> = ({
  statusCounts,
  totalCount,
  invitationsCount,
}) => {
  return (
    <TabsList className="w-full justify-start overflow-x-auto rounded-lg bg-muted/40 p-1 border border-border/60 h-auto">
      <TabsTrigger
        value="all"
        className="rounded-md px-3 py-1 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs"
      >
        <Users className="size-3.5" />
        <span>كل المستخدمين</span>
        <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono font-semibold tabular-nums">
          {statusCounts.total || totalCount}
        </span>
      </TabsTrigger>
      <TabsTrigger
        value="active"
        className="rounded-md px-3 py-1 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs"
      >
        <UserCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>النشطون فعلياً</span>
        <span className="rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 text-[10px] font-mono font-semibold tabular-nums">
          {statusCounts.active}
        </span>
      </TabsTrigger>
      <TabsTrigger
        value="never_logged_in"
        className="rounded-md px-3 py-1 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs"
      >
        <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
        <span>لم يسجلوا الدخول</span>
        <span className="rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 text-[10px] font-mono font-semibold tabular-nums">
          {statusCounts.neverLoggedIn}
        </span>
      </TabsTrigger>
      <TabsTrigger
        value="inactive"
        className="rounded-md px-3 py-1 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs"
      >
        <UserX className="size-3.5 text-rose-600 dark:text-rose-400" />
        <span>غير النشطين</span>
        <span className="rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 text-[10px] font-mono font-semibold tabular-nums">
          {statusCounts.inactive}
        </span>
      </TabsTrigger>
      <TabsTrigger
        value="invitations"
        className="rounded-md px-3 py-1 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs"
      >
        <MailPlus className="size-3.5 text-sky-600 dark:text-sky-400" />
        <span>الدعوات المعلقة</span>
        <span className="rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 text-[10px] font-mono font-semibold tabular-nums">
          {invitationsCount}
        </span>
      </TabsTrigger>
    </TabsList>
  );
};

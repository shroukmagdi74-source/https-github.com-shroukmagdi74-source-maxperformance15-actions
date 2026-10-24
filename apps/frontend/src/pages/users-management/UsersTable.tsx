import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { type UserRecord } from "./types";
import { UserTableRow } from "./UserTableRow";
import type { UsersTabValue } from "./useUsersManagementController";

interface UsersTableProps {
  users: UserRecord[];
  loading: boolean;
  totalCount: number;
  activeTab: UsersTabValue;
  selectedUsers: string[];
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelectUser: (userId: string) => void;
  onRefresh: () => void;
  getRoleDisplayName: (role: string, user?: UserRecord) => string;
  onViewDetails: (user: UserRecord) => void;
  onEditUser: (user: UserRecord) => void;
  onQuickToggleStatus: (user: UserRecord) => void;
  onRequestResetPassword: (user: UserRecord) => void;
  onRequestDeleteUser: (user: UserRecord) => void;
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  currentUserId?: string;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  totalCount,
  activeTab,
  selectedUsers,
  isAllSelected,
  isSomeSelected,
  onToggleSelectAll,
  onToggleSelectUser,
  onRefresh,
  getRoleDisplayName,
  onViewDetails,
  onEditUser,
  onQuickToggleStatus,
  onRequestResetPassword,
  onRequestDeleteUser,
  page,
  totalPages,
  onPageChange,
  currentUserId,
}) => {
  const { t } = useTranslation();
  const isInitialLoading = loading && users.length === 0;

  const tabTitle =
    activeTab === "active"
      ? "النشطون فعلياً"
      : activeTab === "never_logged_in"
        ? "لم يسجلوا الدخول بعد"
        : activeTab === "inactive"
          ? "المستخدمون غير النشطين"
          : "قائمة المستخدمين";

  return (
    <div className="rounded-xl border border-border/80 dark:border-border/60 bg-card shadow-2xs overflow-hidden">
      <div className="p-3 border-b border-border/60 flex items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{tabTitle}</span>
          <span className="rounded bg-muted px-1.5 py-0.2 text-[11px] font-mono text-muted-foreground tabular-nums">
            {totalCount}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7.5 px-2.5 text-xs rounded-lg border-border/70 active:scale-[0.98]"
          onClick={onRefresh}
        >
          <RefreshCw className={cn("size-3.5 ml-1", loading ? "animate-spin" : undefined)} />
          تحديث
        </Button>
      </div>

      {isInitialLoading ? (
        <div className="flex min-h-[18rem] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-right">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onCheckedChange={onToggleSelectAll}
                      aria-label="تحديد كل المستخدمين"
                    />
                  </TableHead>
                  <TableHead className="text-right">{t("users.table.user", "المستخدم")}</TableHead>
                  <TableHead className="text-right">{t("users.table.email", "البريد")}</TableHead>
                  <TableHead className="text-right">{t("users.table.role", "الدور")}</TableHead>
                  <TableHead className="text-right">ملف الموظف</TableHead>
                  <TableHead className="text-right">{t("users.table.status", "الحالة")}</TableHead>
                  <TableHead className="text-right">{t("users.table.actions", "الإجراءات")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((entry) => (
                  <UserTableRow
                    key={entry.id}
                    entry={entry}
                    users={users}
                    currentUserId={currentUserId}
                    isSelected={selectedUsers.includes(entry.id)}
                    onToggleSelect={onToggleSelectUser}
                    getRoleDisplayName={getRoleDisplayName}
                    onViewDetails={onViewDetails}
                    onEditUser={onEditUser}
                    onQuickToggleStatus={onQuickToggleStatus}
                    onRequestResetPassword={onRequestResetPassword}
                    onRequestDeleteUser={onRequestDeleteUser}
                  />
                ))}
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                      لا توجد نتائج مطابقة للفلاتر الحالية.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between bg-muted/10">
            <p className="text-xs text-muted-foreground font-mono tabular-nums">
              صفحة {Math.min(page, Math.max(totalPages, 1))} من {Math.max(totalPages, 1)}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => onPageChange(Math.max(page - 1, 1))}
                disabled={page <= 1 || loading}
              >
                السابق
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => onPageChange(totalPages > 0 ? Math.min(page + 1, totalPages) : page + 1)}
                disabled={loading || totalPages === 0 || page >= totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

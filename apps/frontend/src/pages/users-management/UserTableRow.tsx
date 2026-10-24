import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Eye,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getImageUrl } from "../../utils/imageUrl";
import { getProtectedUserActionMessage } from "../../utils/usersManagementGuards";
import {
  type UserRecord,
  getInitials,
  formatRelativeLoginTime,
  getRoleBadgeClassName,
  getEmployeeStatusClassName,
  getEmployeeStatusLabel,
  renderUserActivityBadge,
} from "./types";

interface UserTableRowProps {
  entry: UserRecord;
  users: UserRecord[];
  currentUserId?: string;
  isSelected: boolean;
  onToggleSelect: (userId: string) => void;
  getRoleDisplayName: (role: string, user?: UserRecord) => string;
  onViewDetails: (user: UserRecord) => void;
  onEditUser: (user: UserRecord) => void;
  onQuickToggleStatus: (user: UserRecord) => void;
  onRequestResetPassword: (user: UserRecord) => void;
  onRequestDeleteUser: (user: UserRecord) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  entry,
  users,
  currentUserId,
  isSelected,
  onToggleSelect,
  getRoleDisplayName,
  onViewDetails,
  onEditUser,
  onQuickToggleStatus,
  onRequestResetPassword,
  onRequestDeleteUser,
}) => {
  const { t } = useTranslation();

  const deleteGuardMessage = getProtectedUserActionMessage({
    users,
    targetedUserIds: [entry.id],
    currentUserId,
    action: "delete",
  });
  const disableDelete = Boolean(deleteGuardMessage);

  return (
    <TableRow
      key={entry.id}
      data-state={isSelected ? "selected" : undefined}
      className="hover:bg-muted/20"
    >
      <TableCell className="w-12">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(entry.id)}
          aria-label={`تحديد ${entry.firstName} ${entry.lastName}`}
        />
      </TableCell>
      <TableCell className="min-w-[16rem]">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage
              src={getImageUrl(entry.avatar) || undefined}
              alt={entry.email}
            />
            <AvatarFallback>
              {getInitials(entry.firstName, entry.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              {entry.firstName} {entry.lastName}
            </p>
            <p className="text-xs text-muted-foreground font-mono">{entry.email}</p>
            <div className="flex items-center gap-1.5 text-[11px]">
              {!entry.lastLoginAt ? (
                <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-3" />
                  لم يسجل دخول بعد
                </span>
              ) : (
                <span className="text-muted-foreground tabular-nums">
                  آخر ظهور: {formatRelativeLoginTime(entry.lastLoginAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs">{entry.email}</TableCell>
      <TableCell>
        <Badge
          className={cn("rounded-full border", getRoleBadgeClassName(entry.role))}
        >
          {getRoleDisplayName(entry.role, entry)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="space-y-1 text-sm">
          <p>{entry.employee?.department?.name || "بدون قسم"}</p>
          <p className="text-muted-foreground text-xs">
            {entry.employee?.position?.title || "بدون منصب"}
          </p>
          {entry.employee?.status ? (
            <Badge
              className={cn(
                "rounded-full border text-[11px]",
                getEmployeeStatusClassName(entry.employee.status),
              )}
            >
              {getEmployeeStatusLabel(entry.employee.status)}
            </Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell>{renderUserActivityBadge(entry)}</TableCell>
      <TableCell>
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="إجراءات المستخدم"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuItem onClick={() => onViewDetails(entry)}>
                <Eye className="size-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditUser(entry)}>
                <Pencil className="size-4" />
                {t("users.actions.edit", "تعديل")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onQuickToggleStatus(entry)}>
                {entry.isActive ? (
                  <>
                    <UserX className="size-4 text-rose-500" />
                    تعطيل الحساب
                  </>
                ) : (
                  <>
                    <UserCheck className="size-4 text-emerald-500" />
                    تفعيل الحساب
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRequestResetPassword(entry)}>
                <KeyRound className="size-4" />
                إعادة تعيين كلمة المرور
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={disableDelete}
                onClick={() => onRequestDeleteUser(entry)}
              >
                <Trash2 className="size-4" />
                {disableDelete
                  ? deleteGuardMessage
                  : t("users.actions.delete", "حذف")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

import React from "react";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/utils/imageUrl";
import {
  type UserRecord,
  getAvailabilityClassName,
  getAvailabilityLabel,
  getInitials,
  getRoleClassName,
  getRoleLabel,
  getStatusClassName,
} from "./types";

interface SuperAdminUserRowProps {
  user: UserRecord;
  onViewDetails: (user: UserRecord) => void;
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
}

export const SuperAdminUserCardMobile: React.FC<SuperAdminUserRowProps> = ({
  user,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-[2rem] border border-border/70 bg-background/80 p-4 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-12 border border-white/20">
            <AvatarImage src={getImageUrl(user.avatar) || undefined} alt={user.email} />
            <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-sm text-muted-foreground font-mono">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon-sm" className="rounded-full" />
            }
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">إجراءات المستخدم</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(user)}>
              <Eye className="size-4" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="size-4" />
              تعديل المستخدم
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(user)}
            >
              <Trash2 className="size-4" />
              حذف المستخدم
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className={cn("rounded-full border px-3 py-1", getRoleClassName(user.role))}>
          {getRoleLabel(user.role)}
        </Badge>
        <Badge className={cn("rounded-full border px-3 py-1", getStatusClassName(user.isActive))}>
          {user.isActive ? "نشط" : "غير نشط"}
        </Badge>
        <Badge
          className={cn(
            "rounded-full border px-3 py-1",
            getAvailabilityClassName(user.availability),
          )}
        >
          {getAvailabilityLabel(user.availability)}
        </Badge>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-mono tabular-nums">
        {user.department && <span>{user.department}</span>}
        {user.department && user.phone && <span>·</span>}
        {user.phone && <span dir="ltr">{user.phone}</span>}
      </div>
    </div>
  );
};

export const SuperAdminUserTableRow: React.FC<SuperAdminUserRowProps> = ({
  user,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  return (
    <TableRow key={user.id}>
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10 border border-white/20">
            <AvatarImage src={getImageUrl(user.avatar) || undefined} alt={user.email} />
            <AvatarFallback>
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-sm text-muted-foreground font-mono">
              {user.email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={cn("rounded-full border px-3 py-1", getRoleClassName(user.role))}>
          {getRoleLabel(user.role)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1.5">
          <Badge
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs",
              getStatusClassName(user.isActive),
            )}
          >
            {user.isActive ? "نشط" : "غير نشط"}
          </Badge>
          <Badge
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs",
              getAvailabilityClassName(user.availability),
            )}
          >
            {getAvailabilityLabel(user.availability)}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon-sm" className="rounded-full" />
            }
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">إجراءات المستخدم</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(user)}>
              <Eye className="size-4" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="size-4" />
              تعديل المستخدم
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(user)}
            >
              <Trash2 className="size-4" />
              حذف المستخدم
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

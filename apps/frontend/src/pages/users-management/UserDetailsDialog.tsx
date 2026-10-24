import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Pencil, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "../../utils/imageUrl";
import {
  type UserRecord,
  getInitials,
  formatDate,
  formatDateTime,
  getRoleBadgeClassName,
  getAccountStatusClassName,
  getEmployeeStatusClassName,
  getEmployeeStatusLabel,
} from "./types";

interface UserDetailsDialogProps {
  user: UserRecord | null;
  onClose: () => void;
  onEdit: (user: UserRecord) => void;
  getRoleDisplayName: (role: string, user?: UserRecord) => string;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  onClose,
  onEdit,
  getRoleDisplayName,
}) => {
  if (!user) return null;

  const detailsDepartmentColor = user.employee?.department?.color || undefined;

  return (
    <Dialog open={user !== null} onOpenChange={(isOpen) => (!isOpen ? onClose() : undefined)}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage
                src={getImageUrl(user.avatar) || undefined}
                alt={user.email}
              />
              <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-base font-bold">
                {user.firstName} {user.lastName}
              </DialogTitle>
              <DialogDescription className="text-xs font-mono">{user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/80 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-violet-500/10 p-1.5">
                  <Eye className="size-3.5 text-violet-600" />
                </div>
                <p className="font-semibold text-xs text-foreground">المعلومات الأساسية</p>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">البريد الإلكتروني</span>
                  <span className="font-mono">{user.email}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">الهاتف</span>
                  <span className="font-mono">{user.phone || "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">الدور</span>
                  <Badge className={cn("rounded-full border text-[11px]", getRoleBadgeClassName(user.role))}>
                    {getRoleDisplayName(user.role, user)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">الحالة</span>
                  <Badge
                    className={cn(
                      "rounded-full border text-[11px]",
                      getAccountStatusClassName(Boolean(user.isActive)),
                    )}
                  >
                    {user.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">توثيق البريد</span>
                  <span>{user.isEmailVerified ? "نعم" : "لا"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">آخر دخول</span>
                  <span className="font-mono tabular-nums">{formatDateTime(user.lastLoginAt)}</span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/80 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-emerald-500/10 p-1.5">
                  <Users className="size-3.5 text-emerald-600" />
                </div>
                <p className="font-semibold text-xs text-foreground">ملف الموظف</p>
              </div>
              {user.employee ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">رقم الموظف</span>
                    <span className="font-mono">{user.employee.employeeNumber || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">القسم</span>
                    {user.employee.department?.name ? (
                      <Badge
                        variant="outline"
                        className="rounded-full text-[11px]"
                        style={
                          detailsDepartmentColor
                            ? {
                                backgroundColor: `${detailsDepartmentColor}20`,
                                borderColor: detailsDepartmentColor,
                                color: detailsDepartmentColor,
                              }
                            : undefined
                        }
                      >
                        {user.employee.department.name}
                      </Badge>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">المنصب</span>
                    <span>{user.employee.position?.title || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">حالة الموظف</span>
                    <Badge
                      className={cn(
                        "rounded-full border text-[11px]",
                        getEmployeeStatusClassName(user.employee.status),
                      )}
                    >
                      {getEmployeeStatusLabel(user.employee.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">تاريخ التعيين</span>
                    <span className="font-mono tabular-nums">{formatDate(user.employee.hireDate)}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground text-center">
                  لا يوجد ملف موظف مرتبط بهذا الحساب حتى الآن.
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/80 p-4 md:col-span-2">
              <p className="mb-3 font-semibold text-xs text-foreground">معلومات إضافية</p>
              <div className="grid gap-3 text-xs md:grid-cols-3">
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <p className="text-[11px] text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="mt-1 font-mono tabular-nums">{formatDateTime(user.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <p className="text-[11px] text-muted-foreground">آخر تحديث</p>
                  <p className="mt-1 font-mono tabular-nums">{formatDateTime(user.updatedAt)}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <p className="text-[11px] text-muted-foreground">معرّف المستخدم</p>
                  <p className="mt-1 break-all font-mono">{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border/70 p-3 bg-muted/20">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            إغلاق
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onEdit(user);
              onClose();
            }}
            className="gap-1.5"
          >
            <Pencil className="size-3.5" />
            تعديل الحساب
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

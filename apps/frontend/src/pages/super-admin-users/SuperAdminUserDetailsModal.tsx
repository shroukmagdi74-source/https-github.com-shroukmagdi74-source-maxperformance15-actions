import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getImageUrl } from "@/utils/imageUrl";
import {
  type UserRecord,
  formatDateTime,
  getAvailabilityLabel,
  getInitials,
  getRoleLabel,
  normalizeSkillsValue,
} from "./types";

interface SuperAdminUserDetailsModalProps {
  user: UserRecord | null;
  onClose: () => void;
}

export const SuperAdminUserDetailsModal: React.FC<SuperAdminUserDetailsModalProps> = ({
  user,
  onClose,
}) => {
  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>تفاصيل المستخدم</DialogTitle>
          <DialogDescription>
            عرض سريع للحالة الحالية والبيانات الرئيسية للحساب.
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-[2rem] border border-border/70 bg-muted/40 p-4">
              <Avatar className="size-14 border border-white/20">
                <AvatarImage src={getImageUrl(user.avatar) || undefined} alt={user.email} />
                <AvatarFallback>
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-sm text-muted-foreground font-mono">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground">الدور</p>
                <p className="mt-1 font-medium text-foreground">
                  {getRoleLabel(user.role)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground">القسم</p>
                <p className="mt-1 font-medium text-foreground">
                  {user.department || "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground">الهاتف</p>
                <p className="mt-1 font-medium text-foreground font-mono tabular-nums">
                  {user.phone || "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground">التواجد</p>
                <p className="mt-1 font-medium text-foreground">
                  {getAvailabilityLabel(user.availability)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground">الحالة</p>
                <p className="mt-1 font-medium text-foreground">
                  {user.isActive ? "نشط" : "غير نشط"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground">آخر تسجيل دخول</p>
                <p className="mt-1 font-medium text-foreground font-mono tabular-nums">
                  {formatDateTime(user.lastLoginAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 md:col-span-2">
                <p className="text-xs text-muted-foreground">المهارات</p>
                <p className="mt-1 font-medium text-foreground">
                  {normalizeSkillsValue(user.skills) || "-"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

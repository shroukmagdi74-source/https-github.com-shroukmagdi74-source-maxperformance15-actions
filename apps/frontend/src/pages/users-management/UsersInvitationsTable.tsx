import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownToLine, Loader2, Mail, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  type InvitationRecord,
  isInvitationExpired,
  getRoleBadgeClassName,
  formatDate,
} from "./types";

interface UsersInvitationsTableProps {
  invitations: InvitationRecord[];
  invitationsLoading: boolean;
  onRefresh: () => void;
  getRoleDisplayName: (role: string) => string;
  onCopyInvitationLink: (invitation: InvitationRecord) => void;
  onResendInvitation: (id: string) => void;
  onRequestCancelInvitation: (invitation: InvitationRecord) => void;
}

export const UsersInvitationsTable: React.FC<UsersInvitationsTableProps> = ({
  invitations,
  invitationsLoading,
  onRefresh,
  getRoleDisplayName,
  onCopyInvitationLink,
  onResendInvitation,
  onRequestCancelInvitation,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="border-border/80 dark:border-border/60">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold">
            {t("users.pendingInvitations", { count: invitations.length }) ||
              `الدعوات المعلقة (${invitations.length})`}
          </CardTitle>
          <CardDescription className="text-xs">
            {t(
              "users.invitationsDescription",
              "متابعة وإدارة الدعوات المرسلة لأعضاء الفريق الجدد.",
            )}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs gap-1.5"
          onClick={onRefresh}
        >
          <RefreshCw className={cn("size-3.5", invitationsLoading ? "animate-spin" : undefined)} />
          تحديث
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {invitationsLoading ? (
          <div className="flex min-h-[14rem] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-card/70 p-6 text-center">
            <Mail className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium text-foreground text-sm">لا توجد دعوات معلقة</p>
            <p className="mt-1 text-xs text-muted-foreground">
              كل الدعوات إما تم قبولها أو انتهت صلاحيتها بالفعل.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => {
              const expired = isInvitationExpired(invitation.expiresAt);
              return (
                <article
                  key={invitation.id}
                  className="rounded-xl border border-border/70 bg-card/80 p-3.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {invitation.firstName} {invitation.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground font-mono">
                        {invitation.email}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          aria-label="إجراءات الدعوة"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={8}>
                        <DropdownMenuItem
                          disabled={expired}
                          onClick={() => onCopyInvitationLink(invitation)}
                        >
                          <ArrowDownToLine className="size-4" />
                          نسخ الرابط
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={expired}
                          onClick={() => onResendInvitation(invitation.id)}
                        >
                          <RefreshCw className="size-4" />
                          إعادة الإرسال
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onRequestCancelInvitation(invitation)}
                        >
                          <Trash2 className="size-4" />
                          إلغاء الدعوة
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge
                      className={cn(
                        "rounded-full border text-[11px]",
                        getRoleBadgeClassName(invitation.role),
                      )}
                    >
                      {getRoleDisplayName(invitation.role)}
                    </Badge>
                    <Badge
                      className={cn(
                        "rounded-full border text-[11px]",
                        expired
                          ? "border-rose-200 bg-rose-500/10 text-rose-700"
                          : "border-amber-200 bg-amber-500/10 text-amber-700",
                      )}
                    >
                      {expired ? "منتهية" : "معلقة"}
                    </Badge>
                  </div>

                  <div className="mt-3 grid gap-2 rounded-lg bg-muted/40 p-2.5 text-xs font-mono tabular-nums">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground font-sans">تاريخ الإرسال</span>
                      <span>{formatDate(invitation.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground font-sans">تاريخ الانتهاء</span>
                      <span>{formatDate(invitation.expiresAt)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

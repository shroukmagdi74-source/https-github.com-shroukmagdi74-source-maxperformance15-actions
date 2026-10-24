import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Link2, Plus, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UsersManagementHeaderProps {
  onOpenEmployeeInviteModal: () => void;
  onOpenAddUser: () => void;
  onOpenInviteDialog: () => void;
  onExportCsv: () => void;
  hasUsers: boolean;
}

export const UsersManagementHeader: React.FC<UsersManagementHeaderProps> = ({
  onOpenEmployeeInviteModal,
  onOpenAddUser,
  onOpenInviteDialog,
  onExportCsv,
  hasUsers,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          {t("users.title", "إدارة المستخدمين")}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t(
            "users.pageDescription",
            "إدارة ومتابعة أعضاء الفريق، صلاحيات الوصول، والدعوات من مكان واحد.",
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className="h-8.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-2xs transition-all active:scale-[0.98]"
          onClick={onOpenEmployeeInviteModal}
        >
          <Link2 className="size-3.5 ml-1.5" />
          دعوة موظف برابط
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8.5 px-3 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/50 transition-all active:scale-[0.98]"
          onClick={onOpenAddUser}
        >
          <Plus className="size-3.5 ml-1" />
          {t("users.addNewUser", "إضافة مستخدم")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8.5 px-3 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/50 transition-all active:scale-[0.98]"
          onClick={onOpenInviteDialog}
        >
          <UserPlus className="size-3.5 ml-1" />
          {t("users.inviteUser", "دعوة مستخدم")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8.5 px-3 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/50 transition-all active:scale-[0.98]"
          onClick={onExportCsv}
          disabled={!hasUsers}
        >
          <ArrowDownToLine className="size-3.5 ml-1" />
          {t("users.exportCsv", "تصدير CSV")}
        </Button>
      </div>
    </div>
  );
};

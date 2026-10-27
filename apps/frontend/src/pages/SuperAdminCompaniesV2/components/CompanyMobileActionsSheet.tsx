import React from "react";
import {
  Eye,
  CheckCircle2,
  Pencil,
  Users,
  Facebook,
  ArrowLeftRight,
  UserPlus,
  LogIn,
  Trash2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../components/ui/sheet";
import type { Company } from "../types";

interface CompanyMobileActionsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onOpenDetails: (company: Company) => void;
  onOpenFollowUp: (company: Company) => void;
  onEdit: (company: Company) => void;
  onOpenUsers: (company: Company) => void;
  onOpenFacebookPages: (company: Company) => void;
  onTransferOwnership: (company: Company) => void;
  onAddEmployee: (company: Company) => void;
  onLoginAsAdmin: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export const CompanyMobileActionsSheet: React.FC<CompanyMobileActionsSheetProps> = ({
  isOpen,
  onOpenChange,
  company,
  onOpenDetails,
  onOpenFollowUp,
  onEdit,
  onOpenUsers,
  onOpenFacebookPages,
  onTransferOwnership,
  onAddEmployee,
  onLoginAsAdmin,
  onDelete,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-lg border-t border-border/60 bg-white px-0 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-0 dark:bg-card"
        dir="rtl"
      >
        <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-muted" />
        <SheetHeader className="px-4 pb-3 pt-4 text-right">
          <SheetTitle className="text-right text-lg font-black">
            {company?.name || "إجراءات"}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4">
          {company ? (
            <div className="grid gap-2">
              {[
                {
                  key: "details",
                  icon: Eye,
                  label: "عرض التفاصيل",
                  action: () => {
                    onOpenChange(false);
                    onOpenDetails(company);
                  },
                },
                {
                  key: "followup",
                  icon: CheckCircle2,
                  label: "إدارة المتابعة",
                  action: () => {
                    onOpenChange(false);
                    onOpenFollowUp(company);
                  },
                },
                {
                  key: "edit",
                  icon: Pencil,
                  label: "تعديل",
                  action: () => {
                    onOpenChange(false);
                    onEdit(company);
                  },
                },
                {
                  key: "users",
                  icon: Users,
                  label: "الأعضاء",
                  action: () => {
                    onOpenChange(false);
                    onOpenUsers(company);
                  },
                },
                {
                  key: "pages",
                  icon: Facebook,
                  label: "صفحات فيسبوك",
                  action: () => {
                    onOpenChange(false);
                    onOpenFacebookPages(company);
                  },
                },
                {
                  key: "transfer",
                  icon: ArrowLeftRight,
                  label: "نقل الملكية",
                  action: () => {
                    onOpenChange(false);
                    onTransferOwnership(company);
                  },
                },
                {
                  key: "employee",
                  icon: UserPlus,
                  label: "إضافة موظف",
                  action: () => {
                    onOpenChange(false);
                    onAddEmployee(company);
                  },
                },
                {
                  key: "login",
                  icon: LogIn,
                  label: "دخول كأدمن",
                  action: () => {
                    onOpenChange(false);
                    onLoginAsAdmin(company);
                  },
                  tone: "text-primary font-black",
                },
                {
                  key: "delete",
                  icon: Trash2,
                  label: "حذف",
                  action: () => {
                    onOpenChange(false);
                    onDelete(company);
                  },
                  tone: "text-rose-600 font-black",
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={cn(
                    "flex h-13 w-full items-center gap-3 rounded-lg border border-border/60 bg-white px-5 text-[13px] font-bold shadow-sm dark:bg-card",
                    item.tone
                  )}
                  onClick={item.action}
                >
                  <item.icon className="size-4.5 opacity-70" /> {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

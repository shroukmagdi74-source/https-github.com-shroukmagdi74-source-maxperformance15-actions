import React from "react";
import {
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  Eye,
  KeyRound,
  LogIn,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { cn } from "../../../../lib/utils";
import type { Company } from "../../types";
import { getStorefrontUrl } from "../../utils";

interface CompanyRowActionsProps {
  company: Company;
  onOpenDetails: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  onOpenUsers: (company: Company) => void;
  onOpenFollowUp: (company: Company) => void;
  onOpenFacebookPages: (company: Company) => void;
  onOpenWhatsApp?: (company: Company) => void;
  onTransferOwnership: (company: Company) => void;
  onAddEmployee: (company: Company) => void;
  onLoginAsAdmin: (company: Company) => void;
}

export const CompanyRowActions: React.FC<CompanyRowActionsProps> = ({
  company,
  onOpenDetails,
  onEdit,
  onDelete,
  onOpenUsers,
  onOpenFollowUp,
  onOpenFacebookPages,
  onOpenWhatsApp,
  onTransferOwnership,
  onAddEmployee,
  onLoginAsAdmin,
}) => {
  const storefrontUrl = getStorefrontUrl(company);

  const dropdownActions = [
    {
      key: "details",
      icon: Eye,
      label: "عرض التفاصيل الكاملة",
      action: () => onOpenDetails(company),
    },
    {
      key: "edit",
      icon: Pencil,
      label: "تعديل بيانات الشركة",
      action: () => onEdit(company),
    },
    {
      key: "users",
      icon: Users,
      label: "إدارة أعضاء الفريق",
      action: () => onOpenUsers(company),
    },
    {
      key: "pages",
      icon: Building2,
      label: "صفحات فيسبوك",
      action: () => onOpenFacebookPages(company),
    },
    ...(onOpenWhatsApp && company.phone
      ? [
          {
            key: "whatsapp",
            icon: MessageCircle,
            label: "مراسلة واتساب",
            action: () => onOpenWhatsApp(company),
            tone: "text-emerald-600 font-black" as const,
          },
        ]
      : []),
    ...(storefrontUrl
      ? [
          {
            key: "storefront",
            icon: ExternalLink,
            label: "فتح المتجر المباشر",
            action: () => window.open(storefrontUrl, "_blank"),
          },
        ]
      : []),
    {
      key: "owner",
      icon: ArrowLeftRight,
      label: "نقل ملكية الشركة",
      action: () => onTransferOwnership(company),
    },
    {
      key: "employee",
      icon: UserPlus,
      label: "إضافة موظف جديد",
      action: () => onAddEmployee(company),
    },
    {
      key: "delete",
      icon: Trash2,
      label: "حذف الشركة",
      action: () => onDelete(company),
      tone: "text-rose-600 font-black" as const,
    },
  ];

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Quick 1-Click Login as Admin */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs font-black text-primary border-primary/30 hover:bg-primary/10 gap-1 shadow-2xs transition-all cursor-pointer"
            onClick={() => onLoginAsAdmin(company)}
          >
            <KeyRound className="size-3 text-primary" />
            <span className="hidden xl:inline">دخول كأدمن</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="rounded-lg bg-white text-xs font-bold shadow-md dark:bg-card">
          دخول مباشر كأدمن للمتجر (Impersonate)
        </TooltipContent>
      </Tooltip>

      {/* Quick View Details */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
            onClick={() => onOpenDetails(company)}
          >
            <Eye className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="rounded-lg bg-white text-xs font-bold shadow-md dark:bg-card">
          عرض التفاصيل
        </TooltipContent>
      </Tooltip>

      {/* Overflow menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`إجراءات ${company.name}`}
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <MoreHorizontal className="size-3.5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-lg border-border/60 p-1 shadow-lg"
        >
          {[
            {
              key: "login",
              icon: LogIn,
              label: "دخول كأدمن (Impersonate)",
              action: () => onLoginAsAdmin(company),
              tone: "text-primary font-black" as const,
            },
            {
              key: "followup",
              icon: CheckCircle2,
              label: "إدارة المتابعة والتذكير",
              action: () => onOpenFollowUp(company),
            },
            { key: "sep1", sep: true },
            ...dropdownActions,
          ].map((item: any) =>
            item.sep ? (
              <DropdownMenuSeparator key={item.key} className="bg-border/40" />
            ) : (
              <DropdownMenuItem
                key={item.key}
                onClick={item.action}
                className={cn(
                  "rounded px-2.5 py-1.5 text-[13px] font-semibold focus:bg-primary/10 focus:text-primary cursor-pointer",
                  item.tone,
                )}
              >
                <item.icon className="ml-1.5 size-3.5 opacity-70" aria-hidden="true" />
                {item.label}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

import React from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Facebook,
  KeyRound,
  Mail,
  MessageCircle,
  Phone,
  Store,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { cn } from "../../../../lib/utils";
import type { Company } from "../../types";
import { getCount, getStorefrontUrl, getSubscriptionBadge } from "../../utils";
import { getCallStatusColor, getCallStatusLabel, getWhatsAppUrl } from "./helpers";

interface CompaniesTableMobileViewProps {
  companies: Company[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  expandedId: string | null;
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
  onOpenDetails: (company: Company) => void;
  onOpenUsers: (company: Company) => void;
  onOpenFacebookPages: (company: Company) => void;
  onOpenFollowUp: (company: Company) => void;
  onOpenWhatsApp?: (company: Company) => void;
  onTransferOwnership: (company: Company) => void;
  onAddEmployee: (company: Company) => void;
  onLoginAsAdmin: (company: Company) => void;
}

export const CompaniesTableMobileView: React.FC<CompaniesTableMobileViewProps> = ({
  companies,
  selectedIds,
  onToggleSelect,
  expandedId,
  setExpandedId,
  onOpenDetails,
  onOpenUsers,
  onOpenFacebookPages,
  onOpenFollowUp,
  onOpenWhatsApp,
  onTransferOwnership,
  onAddEmployee,
  onLoginAsAdmin,
}) => {
  return (
    <div className="space-y-2.5">
      {companies.map((company) => {
        const isExpanded = expandedId === company.id;
        const attention =
          company.followUpAutomation?.needsEscalation ||
          company.followUpAutomation?.needsUrgentEscalation;
        const critical = company.followUpAutomation?.needsUrgentEscalation;
        const waUrl = getWhatsAppUrl(company.phone);
        const storefrontUrl = getStorefrontUrl(company);
        const subBadge = getSubscriptionBadge(company);
        const productsCount = company._count?.products ?? 0;
        const ordersCount = company._count?.orders ?? 0;
        const balance = company.wallet?.balance ?? 0;

        return (
          <div
            key={company.id}
            className={cn(
              "rounded-xl border bg-white shadow-2xs transition-all dark:bg-card p-3",
              critical
                ? "border-r-4 border-r-rose-500 border-rose-200/80 bg-rose-50/[0.15]"
                : attention
                ? "border-r-4 border-r-amber-500 border-amber-200/80 bg-amber-50/[0.15]"
                : "border-border/60",
            )}
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-border/30">
              <div className="flex items-start gap-2 min-w-0">
                <Checkbox
                  aria-label={`تحديد ${company.name}`}
                  checked={selectedIds.includes(company.id)}
                  onCheckedChange={() => onToggleSelect(company.id)}
                  className="size-4 mt-0.5 rounded border-border/70"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      className="text-right text-sm font-black text-foreground hover:text-primary transition-colors truncate max-w-[200px]"
                      onClick={() => onOpenDetails(company)}
                    >
                      {company.name}
                    </button>
                    {storefrontUrl ? (
                      <a
                        href={storefrontUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[10px] font-black text-primary bg-primary/10 border border-primary/20"
                      >
                        <Store className="size-2.5" /> متجر ↗
                      </a>
                    ) : null}
                  </div>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground/70 truncate mt-0.5">
                    <Mail className="size-2.5 shrink-0" /> {company.email}
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className={cn("rounded-full px-2 py-0.5 text-[10px] font-black shrink-0", subBadge.tone)}
              >
                {subBadge.label}
              </Badge>
            </div>

            {/* 4 Essential Operational Metrics */}
            <div className="grid grid-cols-4 gap-1.5 py-2">
              <div className="rounded-lg bg-muted/20 p-1.5 text-center">
                <p className="text-xs font-black tabular-nums text-foreground">{productsCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground">منتج</p>
              </div>
              <div className="rounded-lg bg-muted/20 p-1.5 text-center">
                <p className="text-xs font-black tabular-nums text-emerald-600">{ordersCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground">طلب</p>
              </div>
              <div className="rounded-lg bg-muted/20 p-1.5 text-center">
                <p className="text-xs font-black tabular-nums text-blue-600">
                  {getCount(company, "customers")}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground">عميل</p>
              </div>
              <div className="rounded-lg bg-muted/20 p-1.5 text-center">
                <p className="text-xs font-black tabular-nums font-mono text-foreground">{balance}</p>
                <p className="text-[10px] font-bold text-muted-foreground">رصيد</p>
              </div>
            </div>

            {/* Mobile Quick Action Buttons Bar */}
            <div className="flex items-center gap-1.5 pt-1">
              <Button
                type="button"
                size="sm"
                className="h-8 flex-1 rounded-lg text-xs font-black shadow-2xs gap-1"
                onClick={() => onLoginAsAdmin(company)}
              >
                <KeyRound className="size-3.5" /> دخول كأدمن
              </Button>

              {waUrl ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 rounded-lg text-xs font-black border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100"
                  onClick={() =>
                    onOpenWhatsApp ? onOpenWhatsApp(company) : window.open(waUrl, "_blank")
                  }
                >
                  <MessageCircle className="size-3.5" />
                </Button>
              ) : null}

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-2.5 rounded-lg text-xs font-black"
                onClick={() => onOpenFollowUp(company)}
                title="متابعة"
              >
                <CheckCircle2 className="size-3.5 text-muted-foreground" />
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-2.5 rounded-lg text-xs font-black"
                onClick={() => onOpenDetails(company)}
                title="التفاصيل"
              >
                <Eye className="size-3.5 text-muted-foreground" />
              </Button>

              <button
                type="button"
                aria-label={isExpanded ? "طي التفاصيل" : "عرض المزيد"}
                onClick={() => setExpandedId(isExpanded ? null : company.id)}
                className="flex size-8 items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:bg-muted"
              >
                {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>
            </div>

            {/* Mobile Expanded Drawer */}
            {isExpanded && (
              <div className="mt-2.5 space-y-2 border-t border-border/40 pt-2 text-xs">
                {company.phone && (
                  <p className="flex items-center gap-1.5 text-muted-foreground font-mono tabular-nums dir-ltr">
                    <Phone className="size-3 text-primary" /> {company.phone}
                  </p>
                )}
                {company.followUp?.callStatus ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">حالة الاتصال:</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[10px] font-black",
                        getCallStatusColor(company.followUp.callStatus),
                      )}
                    >
                      {getCallStatusLabel(company.followUp.callStatus)}
                    </span>
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-bold"
                    onClick={() => onOpenUsers(company)}
                  >
                    <Users className="ml-1 size-3" /> الأعضاء
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-bold"
                    onClick={() => onOpenFacebookPages(company)}
                  >
                    <Facebook className="ml-1 size-3" /> الصفحات
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-bold"
                    onClick={() => onAddEmployee(company)}
                  >
                    <UserPlus className="ml-1 size-3" /> إضافة موظف
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-bold"
                    onClick={() => onTransferOwnership(company)}
                  >
                    <ArrowLeftRight className="ml-1 size-3" /> نقل ملكية
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

import React, { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  MessageCircle,
  Package,
  Phone,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { cn } from "../../../../lib/utils";
import type { Company } from "../../types";
import { getCount, getStorefrontDisplay, getStorefrontUrl, getSubscriptionBadge } from "../../utils";
import { getCallStatusColor, getCallStatusLabel, getWhatsAppUrl } from "./helpers";
import { CompanyRowActions } from "./CompanyRowActions";

const columnHelper = createColumnHelper<Company>();

interface UseCompanyTableColumnsOptions {
  selectedIds: string[];
  isAllVisibleSelected: boolean;
  isSomeVisibleSelected: boolean;
  expandedId: string | null;
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
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

export function useCompanyTableColumns({
  selectedIds,
  isAllVisibleSelected,
  isSomeVisibleSelected,
  expandedId,
  setExpandedId,
  onToggleSelect,
  onToggleSelectAll,
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
}: UseCompanyTableColumnsOptions) {
  return useMemo(
    () => [
      columnHelper.display({
        id: "expand",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            aria-label={expandedId === row.original.id ? "طي التفاصيل" : "عرض التفاصيل"}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedId(expandedId === row.original.id ? null : row.original.id);
            }}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            {expandedId === row.original.id ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>
        ),
        meta: { className: "w-8" },
      }),
      columnHelper.display({
        id: "select",
        header: () => (
          <Checkbox
            aria-label={
              isAllVisibleSelected ? "إلغاء تحديد الشركات الظاهرة" : "تحديد الشركات الظاهرة"
            }
            checked={isAllVisibleSelected}
            indeterminate={isSomeVisibleSelected}
            onCheckedChange={(checked) => onToggleSelectAll(Boolean(checked))}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`تحديد ${row.original.name}`}
            checked={selectedIds.includes(row.original.id)}
            onCheckedChange={() => onToggleSelect(row.original.id)}
          />
        ),
        meta: { className: "w-10" },
      }),
      columnHelper.accessor("name", {
        header: "الشركة والمتجر",
        cell: ({ row }) => {
          const company = row.original;
          const waUrl = getWhatsAppUrl(company.phone);
          const storefrontUrl = getStorefrontUrl(company);
          const storefrontDisplay = getStorefrontDisplay(company);

          return (
            <div className="space-y-1 py-1 min-w-[190px]">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  className="text-right text-xs font-black text-foreground hover:text-primary transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(company);
                  }}
                >
                  {company.name}
                </button>
                {storefrontUrl ? (
                  <a
                    href={storefrontUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/25 shrink-0"
                    title={`معاينة المتجر الحي: ${storefrontDisplay}`}
                  >
                    <Store className="size-2.5" />
                    متجر
                    <ExternalLink className="size-2 opacity-60" />
                  </a>
                ) : null}
                {company.businessSpecialty ? (
                  <Badge
                    variant="outline"
                    className="inline-flex items-center gap-1 rounded-full border-primary/25 bg-primary/5 px-2 py-0.5 text-[10px] font-black text-primary"
                  >
                    <span className="size-1.5 rounded-full bg-primary" />
                    {company.businessSpecialty.nameAr || company.businessSpecialty.nameEn}
                  </Badge>
                ) : (
                  <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground/70 bg-muted/40 border border-border/40">
                    عام
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <Mail className="size-3" />
                {company.email}
              </p>
              {company.phone ? (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground/80 dir-ltr font-mono tabular-nums">
                    <Phone className="size-2.5 opacity-70" />
                    {company.phone}
                  </span>
                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
                      title="مراسلة واتساب فورية"
                    >
                      <MessageCircle className="size-2.5" /> واتساب
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "subscription",
        header: "الاشتراك والمحفظة",
        cell: ({ row }) => {
          const company = row.original;
          const subBadge = getSubscriptionBadge(company);
          const balance = company.wallet?.balance ?? 0;
          const isLowBalance = balance <= 0;

          return (
            <div className="space-y-1 py-1 min-w-[140px]">
              <Badge
                variant="outline"
                className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-black", subBadge.tone)}
              >
                {subBadge.label}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs">
                <Wallet
                  className={cn("size-3", isLowBalance ? "text-amber-500" : "text-emerald-600")}
                />
                <span className="text-[11px] font-bold text-muted-foreground/70">المحفظة:</span>
                <span
                  className={cn(
                    "font-mono font-black tabular-nums text-[11px]",
                    isLowBalance ? "text-amber-600 dark:text-amber-400" : "text-foreground",
                  )}
                >
                  {balance.toLocaleString("en-US")} {company.currency || "EGP"}
                </span>
              </div>
            </div>
          );
        },
        meta: { className: "hidden md:table-cell" },
      }),
      columnHelper.display({
        id: "operational",
        header: "النشاط التشغيلي",
        cell: ({ row }) => {
          const company = row.original;
          const productsCount = company._count?.products ?? 0;
          const ordersCount = company._count?.orders ?? 0;
          const customersCount = getCount(company, "customers");
          const isStuckOnboarding = productsCount === 0 && ordersCount === 0;

          return (
            <div className="space-y-1 py-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex cursor-help items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-black text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
                      <Package className="size-3 text-indigo-500" />
                      <span className="tabular-nums">{productsCount}</span>
                      <span className="text-[10px] font-bold text-indigo-600/70">منتج</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>عدد المنتجات المضافة في المتجر</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex cursor-help items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-black text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <ShoppingBag className="size-3 text-emerald-500" />
                      <span className="tabular-nums">{ordersCount}</span>
                      <span className="text-[10px] font-bold text-emerald-600/70">طلب</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>عدد طلبات المتجر الكلية</TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground/80">
                  <Users className="size-2.5 text-muted-foreground/60" />
                  <span className="tabular-nums">{customersCount}</span> عميل
                </span>
                {isStuckOnboarding ? (
                  <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[9px] font-black text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800">
                    لم يضف منتجات
                  </span>
                ) : null}
              </div>
            </div>
          );
        },
        meta: { className: "hidden lg:table-cell" },
      }),
      columnHelper.accessor("isActive", {
        header: "الحالة والمتابعة",
        cell: ({ row }) => {
          const company = row.original;
          const active = company.isActive;
          const followUpAuto = company.followUpAutomation;
          const isCritical = followUpAuto?.needsUrgentEscalation;
          const isAttention = followUpAuto?.needsEscalation && !isCritical;
          const callStatus = company.followUp?.callStatus;

          return (
            <div className="space-y-1 py-1">
              <div className="flex items-center gap-1.5">
                {isCritical ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-rose-300 bg-rose-50 px-2 py-0.5 text-[11px] font-black text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300"
                  >
                    <span className="ml-1 size-1.5 rounded-full bg-rose-500 animate-pulse" />
                    حرجة
                  </Badge>
                ) : isAttention ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    <span className="ml-1 size-1.5 rounded-full bg-amber-500" />
                    متابعة
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-black",
                      active
                        ? "border-emerald-200/60 bg-emerald-50/50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400",
                    )}
                  >
                    <span
                      className={cn(
                        "ml-1 size-1.5 rounded-full",
                        active ? "bg-emerald-500" : "bg-slate-400",
                      )}
                    />
                    {active ? "نشطة" : "متوقفة"}
                  </Badge>
                )}
              </div>
              {callStatus && callStatus !== "not_called" ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[10px] font-black",
                    getCallStatusColor(callStatus),
                  )}
                >
                  <Phone className="size-2.5" /> {getCallStatusLabel(callStatus)}
                </span>
              ) : null}
            </div>
          );
        },
        meta: { className: "hidden sm:table-cell" },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <CompanyRowActions
            company={row.original}
            onOpenDetails={onOpenDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenUsers={onOpenUsers}
            onOpenFollowUp={onOpenFollowUp}
            onOpenFacebookPages={onOpenFacebookPages}
            onOpenWhatsApp={onOpenWhatsApp}
            onTransferOwnership={onTransferOwnership}
            onAddEmployee={onAddEmployee}
            onLoginAsAdmin={onLoginAsAdmin}
          />
        ),
      }),
    ],
    [
      selectedIds,
      isAllVisibleSelected,
      isSomeVisibleSelected,
      expandedId,
      setExpandedId,
      onAddEmployee,
      onDelete,
      onEdit,
      onLoginAsAdmin,
      onOpenDetails,
      onOpenFacebookPages,
      onOpenFollowUp,
      onOpenUsers,
      onOpenWhatsApp,
      onToggleSelect,
      onToggleSelectAll,
      onTransferOwnership,
    ],
  );
}

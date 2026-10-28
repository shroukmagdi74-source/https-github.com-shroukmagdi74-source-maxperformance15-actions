import React from "react";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  KeyRound,
  MessageCircle,
  Package,
  Pencil,
  Store,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { cn } from "../../../../lib/utils";
import { getStorefrontDisplay, getStorefrontUrl } from "../../utils";
import { getCallStatusColor, getCallStatusLabel, getWhatsAppUrl } from "./helpers";
import { ExpandedRowContentProps } from "./types";

export const CompaniesTableExpandedRow: React.FC<ExpandedRowContentProps> = ({
  company,
  onOpenDetails,
  onOpenFollowUp,
  onLoginAsAdmin,
  onOpenWhatsApp,
}) => {
  const followUp = company.followUp;
  const waUrl = getWhatsAppUrl(company.phone);
  const storefrontUrl = getStorefrontUrl(company);
  const storefrontDisplay = getStorefrontDisplay(company);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* 1. Store & Technical Info */}
      <div className="space-y-3 rounded-xl border border-border/50 bg-white p-4 dark:bg-card">
        <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
          <Store className="size-3.5 text-primary" /> تفاصيل المتجر والموقع
        </p>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-muted-foreground">رابط المتجر الحي: </span>
            {storefrontUrl ? (
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noreferrer"
                className="font-black text-primary hover:underline inline-flex items-center gap-1"
              >
                {storefrontDisplay} <ExternalLink className="size-2.5" />
              </a>
            ) : (
              <span className="text-muted-foreground/60 font-medium">لم يتم إنشاء slug</span>
            )}
          </div>
          {company.customDomain ? (
            <div>
              <span className="text-muted-foreground">دومين مخصص: </span>
              <span className="font-mono font-bold text-foreground">{company.customDomain}</span>
            </div>
          ) : null}
          <div>
            <span className="text-muted-foreground">تاريخ التسجيل: </span>
            <span className="font-bold text-foreground">
              {company.createdAt
                ? new Date(company.createdAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">العملة الأساسية: </span>
            <span className="font-bold text-foreground">{company.currency}</span>
          </div>
        </div>
      </div>

      {/* 2. Follow-Up & CRM Status */}
      <div className="space-y-3 rounded-xl border border-border/50 bg-white p-4 dark:bg-card">
        <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-600" /> المتابعة والاتصال
        </p>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-muted-foreground">المسؤول: </span>
            <span className="font-bold text-foreground">
              {followUp?.assignedOwner.label || "غير مسند"}
            </span>
          </div>
          {followUp?.callStatus ? (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">حالة المكالمة: </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[11px] font-black",
                  getCallStatusColor(followUp.callStatus),
                )}
              >
                {getCallStatusLabel(followUp.callStatus)}
              </span>
            </div>
          ) : null}
          {followUp?.nextActionAt ? (
            <div>
              <span className="text-muted-foreground">الموعد القادم: </span>
              <span className="font-bold text-amber-700 dark:text-amber-300">
                {new Date(followUp.nextActionAt).toLocaleString("ar-EG", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : null}
          <div className="pt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs font-bold"
              onClick={() => onOpenFollowUp(company)}
            >
              <Pencil className="ml-1 size-3" /> تعديل المتابعة
            </Button>
            {waUrl ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() =>
                  onOpenWhatsApp ? onOpenWhatsApp(company) : window.open(waUrl, "_blank")
                }
              >
                <MessageCircle className="ml-1 size-3" /> واتساب
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* 3. Installed Apps & Quick Admin Action */}
      <div className="space-y-3 rounded-xl border border-border/50 bg-white p-4 dark:bg-card">
        <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
          <Package className="size-3.5 text-indigo-500" /> التطبيقات والخدمات
        </p>
        <div className="space-y-2 text-xs">
          {company.installedApps && company.installedApps.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {company.installedApps.map((app) => (
                <span
                  key={app.id}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/10 bg-primary/5 px-2 py-0.5 text-[10px] font-bold text-primary"
                >
                  {app.appName}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground/60 italic">لا توجد تطبيقات إضافية مثبتة</p>
          )}
          <div className="pt-3 border-t border-border/30 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 flex-1 text-xs font-black gap-1 cursor-pointer"
              onClick={() => onLoginAsAdmin(company)}
            >
              <KeyRound className="size-3.5" /> دخول كأدمن للمتجر
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs font-bold cursor-pointer"
              onClick={() => onOpenDetails(company)}
            >
              <Eye className="ml-1 size-3.5" /> التفاصيل
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

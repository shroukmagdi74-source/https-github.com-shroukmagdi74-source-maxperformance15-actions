import React from "react";
import { ChevronRight, Clock, Sparkles, Star } from "lucide-react";
import type { MarketplaceApp as MPA } from "@/types/marketplace";
import { formatInstallCount, normalizeRequiredApps } from "@/utils/marketplace";
import { formatNumber } from "../../types/appDetailsTypes";

interface AppDetailsHeaderProps {
  app: MPA;
  onBack: () => void;
}

const CATEGORY_AR: Record<string, string> = {
  ANALYTICS: "التحليلات",
  MARKETING: "التسويق",
  ORDER_OPS: "الطلبات والتنفيذ",
  PRODUCTIVITY: "الإنتاجية",
  COMMUNICATION: "التواصل",
  ECOMMERCE: "المتجر والمنتجات",
  HR: "الموارد البشرية",
  MEDICAL: "النظام الطبي",
  AI: "الذكاء الاصطناعي",
  CRM: "إدارة العملاء",
  FINANCE: "المالية",
  INTEGRATION: "التكاملات",
  SHIPPING: "الشحن والتوصيل",
  GAMIFICATION: "التحفيز والولاء",
  WAREHOUSE: "المخزون والمستودعات",
  ACCOUNTING: "الفواتير والمحاسبة",
  WHOLESALE: "البيع بالجملة",
  PROCUREMENT: "المشتريات والموردين",
  PAYMENTS: "الدفع والتحصيل",
};

function priceText(app: MPA) {
  if (app.pricingModel === "FREE") return "مجاني";
  if (app.pricingModel === "PAY_PER_USE" && Number(app.unitPrice) > 0) {
    return `${app.unitPrice} ج / ${app.unitName || "وحدة"}`;
  }
  if (Number(app.monthlyPrice) > 0) return `${formatNumber(Number(app.monthlyPrice))} ج / شهر`;
  return "مجاني";
}

/**
 * App page hero: one title, one value line, then a numeric strip.
 * Deliberately borderless — the page reads as one surface, not a stack of boxes.
 */
export const AppDetailsHeader: React.FC<AppDetailsHeaderProps> = ({ app, onBack }) => {
  const category = CATEGORY_AR[(app.category || "").toUpperCase()] || "";
  const requiredApps = normalizeRequiredApps(app.requiredApps);

  return (
    <div className="text-right">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} />
        الرجوع إلى التطبيقات
      </button>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-[12px] font-semibold text-muted-foreground">
        {category && <span>{category}</span>}
        {app.isFeatured && (
          <span className="inline-flex items-center gap-1 text-amber-600">
            <Sparkles size={12} /> مميز
          </span>
        )}
        {app.rating > 0 && (
          <span className="inline-flex items-center gap-1 text-amber-600">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            {app.rating.toFixed(1)}
            <span className="font-normal text-muted-foreground">({formatNumber(app.reviewCount)})</span>
          </span>
        )}
      </div>

      <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-[40px]">
        {app.name}
      </h1>

      {app.description && (
        <p className="mt-3 max-w-[62ch] text-[15px] font-medium leading-8 text-muted-foreground sm:text-base">
          {app.description}
        </p>
      )}

      <dl className="mt-7 flex flex-wrap border-y border-border/60">
        <div className="min-w-[120px] flex-1 border-l border-border/60 py-3.5 pl-4 first:border-l-0 first:pl-0">
          <dt className="mb-0.5 text-[11px] font-semibold text-muted-foreground">السعر</dt>
          <dd className="text-[15px] font-bold tabular-nums text-foreground">{priceText(app)}</dd>
        </div>
        {app.trialDays > 0 && (
          <div className="min-w-[120px] flex-1 border-l border-border/60 py-3.5 pl-4">
            <dt className="mb-0.5 text-[11px] font-semibold text-muted-foreground">التجربة</dt>
            <dd className="inline-flex items-center gap-1.5 text-[15px] font-bold text-foreground">
              <Clock size={13} className="text-emerald-600" />
              تجربة {app.trialDays} يوم
            </dd>
          </div>
        )}
        {app.installCount > 0 && (
          <div className="min-w-[120px] flex-1 border-l border-border/60 py-3.5 pl-4">
            <dt className="mb-0.5 text-[11px] font-semibold text-muted-foreground">مستخدم في</dt>
            <dd className="text-[15px] font-bold tabular-nums text-foreground">
              {formatInstallCount(app.installCount)} متجر
            </dd>
          </div>
        )}
        {requiredApps.length > 0 && (
          <div className="min-w-[120px] flex-1 border-l border-border/60 py-3.5 pl-4">
            <dt className="mb-0.5 text-[11px] font-semibold text-muted-foreground">بيتطلب مع</dt>
            <dd className="text-[15px] font-bold text-foreground">{requiredApps.join(" · ")}</dd>
          </div>
        )}
      </dl>
    </div>
  );
};

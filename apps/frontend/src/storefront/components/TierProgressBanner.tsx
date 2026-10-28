import { useCheckoutStore, StorefrontTierProgress } from "../store/useCheckoutStore";
import { formatMoney, formatNumber } from "../utils/localeFormat";

const METHOD_LABELS: Record<string, string> = {
  POINTS: "نقطة",
  SPENT: "ج.م",
  ITEMS: "قطعة",
  ORDER_COUNT: "أوردر",
};

const formatTierMetric = (
  method: string,
  value: number | string | null | undefined,
  fallbackLabel?: string,
): string => {
  if (method === "SPENT") {
    return formatMoney(value);
  }
  const label = METHOD_LABELS[method] || fallbackLabel;
  const amount = formatNumber(value, { maximumFractionDigits: 0 });
  return label ? `${amount} ${label}` : amount;
};

function benefitsSummary(tier: any): string[] {
  const out: string[] = [];
  const b = tier?.benefits;
  if (!b) return out;
  if (b.freeShipping) out.push("شحن مجاني");
  const pct = Number(b.discountPercent || 0);
  if (pct > 0) out.push(`خصم ${pct}%`);
  return out;
}

function TierProgressCard({ progress }: { progress: StorefrontTierProgress }) {
  const tier = progress.tier;
  const next = progress.nextTier;
  const tierBenefits = benefitsSummary(tier);
  const nextBenefits = benefitsSummary(next);
  return (
    <div
      className="rounded-xl border bg-gradient-to-l from-emerald-50 to-white px-4 py-3 shadow-sm"
      style={tier?.color ? { borderColor: `${tier.color}55` } : undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: tier?.color || '#10b981' }}
          />
          {tier?.nameAr || tier?.name || "عميل مميز"}
        </span>
        {tierBenefits.length > 0 && (
          <span className="text-xs font-semibold text-emerald-700">
            {tierBenefits.join(" · ")}
          </span>
        )}
      </div>

      {next && (
        <p className="mt-2 text-sm text-gray-700">
          <span className="font-bold text-emerald-700">
            فاضل {formatTierMetric(progress.method, next.remainingMetric, progress.metricLabel)}
          </span>{" "}
          وتترقى لمستوى{" "}
          <span className="font-bold">{next.nameAr || next.name}</span>
          {nextBenefits.length > 0 && (
            <>
              {" "}
              وتحصل على <span className="font-semibold">{nextBenefits.join(" و")}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * بانر مستوى العميل — بيظهر لما العميل يدخل رقمه في صفحة الدفع
 */
export default function TierProgressBanner() {
  const tierProgress = useCheckoutStore((s) => s.tierProgress);
  if (!tierProgress) return null;
  // بانر المستوى يظهر لو نظام المستويات مفعّل (مستقل عن الخصم التلقائي)
  if (tierProgress.tiersEnabled !== true) return null;
  return <TierProgressCard progress={tierProgress} />;
}

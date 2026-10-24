import React from "react";
import { Check, MessageCircle, CreditCard } from "lucide-react";
import {
  PRICE_PER_DAY,
  WHATSAPP_CONSULT_URL,
  csbFmt,
  INDIVIDUAL_TOTAL,
  BUNDLE_PRICE,
} from "./csbData";
import { CsbInvoice } from "./CsbInvoice";
import { MergedPricingResult } from "./useBundlePricing";

interface Props {
  onSubscribe: () => void;
  isCheckingOut: boolean;
  pricing?: MergedPricingResult;
}

export const CsbHero: React.FC<Props> = ({ onSubscribe, isCheckingOut, pricing }) => {
  const bundlePrice = pricing?.bundlePrice ?? BUNDLE_PRICE;
  const individualTotal = pricing?.individualTotal ?? INDIVIDUAL_TOTAL;
  const pricePerDay = pricing?.pricePerDay ?? PRICE_PER_DAY;

  return (
    <header className="csb-hero">
      <div className="csb-hero-copy">
        <span className="csb-kicker">
          <i aria-hidden="true" />
          باقة المتجر الكاملة — نظام واحد لأي متجر أونلاين
        </span>

        <h1>
          متجرك كله في نظام واحد — <span className="csb-h1-green">{csbFmt(bundlePrice)} ج.م</span> في الشهر
        </h1>

        <p className="csb-hero-sub">
          من رسالة العميل لحد صافي الربح: المتجر والواتساب والشحن والمخزون والمرتجعات
          والتحليلات — بـ{csbFmt(pricePerDay)} ج.م في اليوم تقريبًا، بدل {csbFmt(individualTotal)} لو
          اشتريت الأدوات واحدة واحدة.
        </p>

        <div className="csb-hero-ctas">
          <button
            type="button"
            className="csb-btn csb-btn-primary"
            onClick={onSubscribe}
            disabled={isCheckingOut}
          >
            <CreditCard size={16} strokeWidth={2.2} />
            {isCheckingOut ? "بنجهز الدفع…" : `اشترك الآن — ${csbFmt(bundlePrice)} ج.م/شهر`}
          </button>
          <a
            href={WHATSAPP_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="csb-btn csb-btn-ghost"
          >
            <MessageCircle size={16} strokeWidth={2.2} />
            اسأل قبل ما تشترك
          </a>
        </div>

        <div className="csb-hero-trust">
          <span>
            <Check size={13} strokeWidth={3} />
            تفعيل فوري للأدوات بعد الدفع
          </span>
          <span>
            <Check size={13} strokeWidth={3} />
            إلغاء في أي وقت
          </span>
          <span>
            <Check size={13} strokeWidth={3} />
            اشتراك واحد بيشمل كل حاجة
          </span>
        </div>
      </div>

      <CsbInvoice onSubscribe={onSubscribe} pricing={pricing} />
    </header>
  );
};

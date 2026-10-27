import React from "react";
import { Zap, AlertCircle } from "lucide-react";
import { getDirection } from "../../../i18n";
import type { PostPurchaseOfferConfig } from "../../../types/postPurchaseOffer";

interface PostPurchaseOfferStatusCardProps {
  offer: PostPurchaseOfferConfig;
  setOffer: React.Dispatch<React.SetStateAction<PostPurchaseOfferConfig>>;
}

export const PostPurchaseOfferStatusCard: React.FC<
  PostPurchaseOfferStatusCardProps
> = ({ offer, setOffer }) => {
  const isRtl = getDirection() === "rtl";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            حالة العرض الخاص بعد الطلب
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            تفعيل أو تعطيل توجيه المشتري لصفحة العرض بعد الشيك آوت
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={offer.enabled}
          onClick={() =>
            setOffer((prev) => ({ ...prev, enabled: !prev.enabled }))
          }
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
            offer.enabled ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
              offer.enabled
                ? isRtl
                  ? "-translate-x-6"
                  : "translate-x-6"
                : isRtl
                  ? "-translate-x-1"
                  : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {offer.enabled && !offer.productId && (
        <div className="rounded-xl border border-amber-300/80 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            يرجى اختيار المنتج المعروض من الكتالوج أدناه لتفعيل العرض للعملاء.
          </span>
        </div>
      )}
    </div>
  );
};

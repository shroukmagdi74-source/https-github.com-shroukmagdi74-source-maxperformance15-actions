import React, { useEffect, useState } from "react";
import { ArrowRightLeft, Check, Heart } from "lucide-react";

const INACTIVE_TAB_DEMO_TITLE = "عرضك لسه مستنيك — كمّل شراءك";

export const InactiveTabDemo = () => {
  const [state, setState] = useState<"idle" | "armed" | "done">("idle");

  useEffect(() => {
    if (state !== "armed") {
      return;
    }

    const originalTitle = window.document.title;

    const handleVisibility = () => {
      if (window.document.visibilityState === "hidden") {
        window.document.title = INACTIVE_TAB_DEMO_TITLE;
      } else {
        setState("done");
        window.setTimeout(() => {
          window.document.title = originalTitle;
        }, 2500);
      }
    };

    window.document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.document.removeEventListener("visibilitychange", handleVisibility);
      if (window.document.title === INACTIVE_TAB_DEMO_TITLE) {
        window.document.title = originalTitle;
      }
    };
  }, [state]);

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
      <p className="text-xs leading-6 text-gray-700">
        الأداة دي مش ليها شكل على الصفحة — بتغير عنوان التاب نفسه لما العميل يسيب الموقع
        ويرجع، فبترجّعه للعرض تاني.
      </p>
      {state === "idle" ? (
        <button
          type="button"
          onClick={() => setState("armed")}
          className="rounded-lg bg-gray-900 px-4 py-2 text-[11px] font-black text-white transition-colors hover:bg-gray-800"
        >
          جرّبها الآن
        </button>
      ) : null}
      {state === "armed" ? (
        <p className="text-[11px] font-black text-amber-700">
          سيب التاب دلوقتي وارجع تاني — وهتلاقي العنوان اتغير.
        </p>
      ) : null}
      {state === "done" ? (
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-black text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          ده بالظبط اللي هيشوفه العميل — عنوان التاب بقى «{INACTIVE_TAB_DEMO_TITLE}».
        </p>
      ) : null}
    </div>
  );
};

export const ProductWishlistPreview = () => {
  const [wishlisted, setWishlisted] = useState(true);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
        <div className="aspect-[4/3] w-full bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white shadow-sm font-mono tabular-nums">
              خصم 20%
            </span>
            <button
              type="button"
              onClick={() => setWishlisted((prev) => !prev)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all ${
                wishlisted
                  ? "border-[#d7b2a0] bg-[#fff2ec] text-[#b3533b] scale-105"
                  : "border-gray-200 bg-white/95 text-gray-400 hover:text-gray-700"
              }`}
              aria-label="Wishlist button"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/90 p-2.5 backdrop-blur-sm border border-gray-200/80">
            <div>
              <p className="text-xs font-black text-gray-900">سنيكرز سبورت بلاتفورم</p>
              <p className="text-[11px] font-bold text-gray-500 font-mono tabular-nums">1,250 ج.م</p>
            </div>
            <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded-md">
              {wishlisted ? "مضاف للمفضلة" : "اضغط للقلب"}
            </span>
          </div>
        </div>
      </div>
      <p className="text-[11px] leading-5 text-gray-500 text-center">
        زر القلب يظهر مباشرة فوق صور المنتج في المعرض وعلى بطاقات المنتجات بالمتجر لتسهيل حفظ المنتجات المفضلة.
      </p>
    </div>
  );
};

export const ProductComparisonPreview = () => {
  const [compared, setCompared] = useState(true);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
        <div className="aspect-[4/3] w-full bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-black text-white">
              معرض الصور
            </span>
            <button
              type="button"
              onClick={() => setCompared((prev) => !prev)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all ${
                compared
                  ? "border-[#d4beae] bg-[#fff5ec] text-[#8f5c44] scale-105"
                  : "border-gray-200 bg-white/95 text-gray-400 hover:text-gray-700"
              }`}
              aria-label="Compare button"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/90 p-2.5 backdrop-blur-sm border border-gray-200/80">
            <div>
              <p className="text-xs font-black text-gray-900">سنيكرز سبورت بلاتفورم</p>
              <p className="text-[11px] font-bold text-gray-500 font-mono tabular-nums">1,250 ج.م</p>
            </div>
            <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded-md">
              {compared ? "محدد للمقارنة" : "اضغط للمقارنة"}
            </span>
          </div>
        </div>
      </div>
      <p className="text-[11px] leading-5 text-gray-500 text-center">
        زر المقارنة يتيح للعميل وضع المنتج في قائمة المقارنة للمفاضلة بين الخصائص والمواصفات بسهولة.
      </p>
    </div>
  );
};

import React from "react";
import { Check, ShoppingCart, Truck } from "lucide-react";
import {
  formatEgp,
  getFieldValueFromSettings,
  MiniThumb,
  type ConversionToolPreviewContext,
} from "./types";

export const StickyAddToCartPreview = () => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
    <div className="flex min-w-0 items-center gap-2.5">
      <MiniThumb className="h-9 w-9" />
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-gray-900">
          شنطة جلد نسائية — أسود
        </p>
        <p className="text-[11px] font-black text-gray-700">1,299 ج.م</p>
      </div>
    </div>
    <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-[11px] font-black text-white">
      <ShoppingCart className="h-3.5 w-3.5" />
      أضف للسلة
    </span>
  </div>
);

const CROSS_SELL_ITEMS = [
  { name: "شيلان جلد مطابق", price: "349 ج.م" },
  { name: "حزام جلد طبيعي", price: "259 ج.م" },
];

export const CrossSellPreview = ({ settings }: { settings?: Record<string, unknown> }) => {
  const copy = (settings?.["copy"] as Record<string, unknown>) || {};
  const title = String(copy["crossSellTitle"] || "").trim() || "يكمّل اختيارك";

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-black text-gray-500">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {CROSS_SELL_ITEMS.map((item) => (
          <div
            key={item.name}
            className="rounded-xl border border-gray-200 bg-white p-2.5"
          >
            <MiniThumb className="mb-2 h-14 w-full" />
            <p className="truncate text-[11px] font-bold text-gray-900">{item.name}</p>
            <p className="mt-0.5 flex items-center justify-between text-[11px] font-black text-gray-700">
              {item.price}
              <span className="rounded-md bg-gray-900 px-2 py-0.5 text-[10px] text-white">
                +
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BoughtTogetherPreview = ({ settings }: { settings?: Record<string, unknown> }) => {
  const copy = (settings?.["copy"] as Record<string, unknown>) || {};
  const ui = (settings?.["ui"] as Record<string, unknown>) || {};
  const title = String(copy["boughtTogetherTitle"] || "").trim() || "كتير من العملاء بيشتروا التلاتة مع بعض";
  const desc = String(copy["boughtTogetherDescription"] || "").trim();
  const addLabel = String(copy["bundleAddLabel"] || "").trim() || "أضف الباقة";
  const style = String(ui["boughtTogetherStyle"] || "stacked");

  return (
    <div className="space-y-2.5 rounded-xl border border-gray-200 bg-white p-3">
      <div>
        <p className="text-[11px] font-black text-gray-900">{title}</p>
        {desc ? <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p> : null}
      </div>
      <div className={`flex items-center gap-1.5 ${style === "stacked" ? "flex-wrap" : ""}`}>
        {["شنطة", "شيلان", "حزام"].map((name, index) => (
          <React.Fragment key={name}>
            {index > 0 ? <span className="text-[11px] font-black text-gray-400">+</span> : null}
            <span className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 text-[11px] font-bold text-gray-800">
              <MiniThumb className="h-6 w-6" />
              {name}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-2">
        <p className="text-[11px] font-black text-emerald-800">
          الباقة كاملة: 1,750 ج.م <span className="font-bold line-through opacity-70">2,100 ج.م</span>
        </p>
        <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-black text-white">
          {addLabel}
        </span>
      </div>
    </div>
  );
};

const BULK_TIERS = [
  { quantity: "قطعتين", discount: "10%" },
  { quantity: "3 قطع", discount: "15%", best: true },
  { quantity: "4 قطع أو أكتر", discount: "20%" },
];

export const BulkSavingsPreview = () => (
  <div className="space-y-2">
    <p className="text-[11px] font-black text-gray-500">اشترِ أكتر ووفّر — الخصم بيحسب تلقائي</p>
    {BULK_TIERS.map((tier) => (
      <div
        key={tier.quantity}
        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
          tier.best
            ? "border-emerald-300 bg-emerald-50"
            : "border-gray-200 bg-white"
        }`}
      >
        <p className="text-xs font-bold text-gray-900">{tier.quantity}</p>
        <p
          className={`text-xs font-black ${
            tier.best ? "text-emerald-700" : "text-gray-700"
          }`}
        >
          وفّر {tier.discount}
        </p>
      </div>
    ))}
  </div>
);

export const BuyMoreSaveMorePreview = () => (
  <div className="space-y-2.5 rounded-xl border border-gray-200 bg-white p-3">
    <p className="text-xs font-black text-gray-900">اشترِ أكثر وفّر أكثر</p>
    <p className="text-[11px] leading-5 text-gray-500">
      امزج أي منتجات من المجموعة ووصّل لأقل سعر — الخصم بيتطبق على السلة.
    </p>
    <div className="grid grid-cols-3 gap-2 text-center">
      {["2 قطع = 10%", "3 قطع = 15%", "5 قطع = 25%"].map((label) => (
        <p
          key={label}
          className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-2 py-2 text-[11px] font-black text-gray-800"
        >
          {label}
        </p>
      ))}
    </div>
  </div>
);

const FREE_SHIPPING_SIMULATED_CART = 460;

export const FreeShippingBarPreview = ({ settings }: ConversionToolPreviewContext) => {
  const threshold = Number(
    Number(getFieldValueFromSettings(settings, "thresholds.freeShippingAmount") || 0),
  );

  if (!threshold || threshold <= 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-center text-[11px] font-bold text-gray-500">
        حدّد مبلغ الشحن المجاني من الإعدادات جانبًا — الشريط هيتملى قدامك فورًا
      </div>
    );
  }

  const progress = Math.min(1, FREE_SHIPPING_SIMULATED_CART / threshold);
  const remaining = Math.max(0, Math.ceil(threshold - FREE_SHIPPING_SIMULATED_CART));
  const qualified = remaining <= 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <Truck className={`h-4 w-4 shrink-0 ${qualified ? "text-emerald-600" : "text-gray-500"}`} />
        <p className="text-xs font-bold text-gray-900">
          {qualified
            ? "مبروك! شحن طلبك بقى مجاني"
            : `فاضل ${formatEgp(remaining)} بس وتشحن مجانًا`}
        </p>
        {qualified ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : null}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            qualified ? "bg-emerald-500" : "bg-gray-900"
          }`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <p className="mt-2 text-[10px] font-bold text-gray-400">
        سلة تجريبية بقيمة {formatEgp(FREE_SHIPPING_SIMULATED_CART)}
      </p>
    </div>
  );
};

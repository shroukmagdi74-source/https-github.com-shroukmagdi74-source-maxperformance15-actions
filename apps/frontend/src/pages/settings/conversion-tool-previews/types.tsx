import React from "react";
import { ShoppingBag, Star } from "lucide-react";
import type { JsonRecord } from "../useConversionTools";
import { getDeepValue } from "../useConversionTools";

/**
 * "نافذة المتجر" — المعاينة تمثل Storefront التاجر وهي فاتحة بطبيعتها،
 * فبنثبت التوكنات الفاتحة جواها مهما كان وضع اللوحة (دارك/لايت).
 * كمان بتعزل توكنات shadcn المتغيرة مع .dark عن مكوّنات المتجر.
 */
export const LIGHT_PREVIEW_TOKENS = {
  "--primary": "#4f46e5",
  "--primary-foreground": "#ffffff",
  "--background": "#ffffff",
  "--foreground": "#111827",
  "--muted": "#f3f4f6",
  "--muted-foreground": "#6b7280",
  "--card": "#ffffff",
  "--border": "#e5e7eb",
  "--radius": "0.75rem",
} as React.CSSProperties;

export interface ConversionToolPreviewContext {
  /** قيم إعدادات التطبيق (بما فيها التعديلات غير المحفوظة) — المعاينة تقرأ منها لحظيًا */
  settings: JsonRecord;
}

export const getFieldValueFromSettings = (settings: JsonRecord, path: string): unknown =>
  getDeepValue(settings, path.split("."));

export const pad2 = (value: number) => String(value).padStart(2, "0");

export const formatEgp = (value: number) => `${value.toLocaleString("ar-EG")} ج.م`;

/* ── أدوات مساعدة للنسخ الوهمية ─────────────────────────────── */

export const MiniThumb = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300 ${className}`}
  >
    <ShoppingBag className="h-4 w-4" />
  </div>
);

export const Stars = () => (
  <span className="flex items-center gap-0.5 text-amber-400">
    {[0, 1, 2, 3, 4].map((index) => (
      <Star key={index} className="h-3 w-3 fill-current" />
    ))}
  </span>
);

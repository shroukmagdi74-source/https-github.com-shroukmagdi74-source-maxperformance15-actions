import React from "react";
import { ShoppingBag } from "lucide-react";
import type { ConversionToolDisplayKind } from "../conversionToolMeta";
import type { CanvasView } from "./types";

interface StoreCanvasFrameProps {
  view: CanvasView;
  displayKind: ConversionToolDisplayKind;
  children: React.ReactNode;
}

export const StoreCanvasFrame: React.FC<StoreCanvasFrameProps> = ({
  view,
  displayKind,
  children,
}) => (
  <div className="flex min-h-[240px] items-start justify-center rounded-2xl border border-stone-200/80 bg-stone-100/70 p-3 dark:border-stone-800 dark:bg-stone-900/60 sm:min-h-[420px] sm:p-6">
    <div
      className={`w-full transition-[max-width] duration-200 ease-out ${
        view === "mobile" ? "max-w-[420px]" : "max-w-full"
      }`}
    >
      {/* شريط متصفح رمزي يفصل "عالم المتجر" عن "عالم اللوحة" */}
      <div className="flex items-center gap-2 rounded-t-xl border border-b-0 border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
        <span className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" />
          <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" />
          <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" />
        </span>
        <span className="mx-auto rounded-md bg-white px-3 py-0.5 text-[10px] font-bold text-gray-400 dark:bg-gray-800 font-mono">
          متجر-التاجر.maxp.online
        </span>
      </div>
      {/* عالم المتجر فاتح دائمًا — النافذة لا تتبع وضع اللوحة */}
      <div className="space-y-4 rounded-b-xl border border-t-0 border-gray-200 bg-white p-4 text-gray-900 shadow-sm sm:p-5">
        {displayKind === "pdp" ? (
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-900">
            <span className="text-xs font-black text-gray-900 dark:text-white">
              متجر التاجر
            </span>
            <ShoppingBag className="h-4 w-4 text-gray-300" />
          </div>
        ) : null}
        {children}
      </div>
    </div>
  </div>
);

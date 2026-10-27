import React from "react";
import { Package, ShoppingCart, Zap } from "lucide-react";
import { ToggleSwitch } from "../../settings/useConversionTools";

interface UpsellHubPlacementsSwitchboardProps {
  conversionLoading: boolean;
  pdpCrossSellActive: boolean;
  cartUpsellActive: boolean;
  postPurchaseActive: boolean;
  toggleModule: (moduleKey: string, currentValue: boolean) => Promise<void>;
}

export const UpsellHubPlacementsSwitchboard: React.FC<
  UpsellHubPlacementsSwitchboardProps
> = ({
  conversionLoading,
  pdpCrossSellActive,
  cartUpsellActive,
  postPurchaseActive,
  toggleModule,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-gray-900 sm:text-base dark:text-white">
          مواضع ظهور العروض في المتجر (Placements)
        </h2>
        <span className="text-xs text-gray-500">
          تفعيل أو تعطيل مباشر بنقرة واحدة
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {/* Touchpoint 1: Product Page */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <Package className="h-3 w-3" />
                Product Page
              </span>
              <ToggleSwitch
                label="تفعيل عروض صفحة المنتج"
                checked={pdpCrossSellActive}
                disabled={conversionLoading}
                onToggle={() => void toggleModule("crossSell", pdpCrossSellActive)}
              />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              صفحة المنتج (Frequently Bought Together)
            </h3>
            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
              عرض منتجات تكميلية ومكملات ترفع القيمة مباشرة أسفل تفاصيل المنتج.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 text-[11px] font-bold text-gray-500 dark:border-gray-800">
            <span
              className={`h-2 w-2 rounded-full ${pdpCrossSellActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
            />
            {pdpCrossSellActive ? "يعمل على المتجر الآن" : "متوقف مؤقتاً"}
          </div>
        </div>

        {/* Touchpoint 2: Cart Drawer */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                <ShoppingCart className="h-3 w-3" />
                Cart Drawer
              </span>
              <ToggleSwitch
                label="تفعيل مكملات السلة"
                checked={cartUpsellActive}
                disabled={conversionLoading}
                onToggle={() => void toggleModule("cartUpsell", cartUpsellActive)}
              />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              سلة المشتريات (Cart Quick Add)
            </h3>
            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
              اقتراح مكملات سريعة بنقرة واحدة داخل السلة قبل التوجه للدفع.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 text-[11px] font-bold text-gray-500 dark:border-gray-800">
            <span
              className={`h-2 w-2 rounded-full ${cartUpsellActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
            />
            {cartUpsellActive ? "يعمل على المتجر الآن" : "متوقف مؤقتاً"}
          </div>
        </div>

        {/* Touchpoint 3: Thank You Page */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Zap className="h-3 w-3" />
                Thank You Page
              </span>
              <ToggleSwitch
                label="تفعيل عروض ما بعد الطلب"
                checked={postPurchaseActive}
                disabled={conversionLoading}
                onToggle={() =>
                  void toggleModule("postPurchaseUpsell", postPurchaseActive)
                }
              />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              صفحة الشكر (Post-Purchase Upgrade)
            </h3>
            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
              عرض ترقية فوري مميز بعد إتمام الطلب بنقرة واحدة قبل التجهيز.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 text-[11px] font-bold text-gray-500 dark:border-gray-800">
            <span
              className={`h-2 w-2 rounded-full ${postPurchaseActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
            />
            {postPurchaseActive ? "يعمل على المتجر الآن" : "متوقف مؤقتاً"}
          </div>
        </div>
      </div>
    </div>
  );
};

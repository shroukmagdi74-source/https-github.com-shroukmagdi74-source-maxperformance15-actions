import React from "react";
import { SlidersHorizontal, Zap, Truck } from "lucide-react";
import { type CustomerLoyaltyTier } from "./types";

interface TierBenefitsSectionProps {
  editingTier: Partial<CustomerLoyaltyTier>;
  setEditingTier: React.Dispatch<
    React.SetStateAction<Partial<CustomerLoyaltyTier> | null>
  >;
}

export const TierBenefitsSection: React.FC<TierBenefitsSectionProps> = ({
  editingTier,
  setEditingTier,
}) => {
  return (
    <>
      {/* ⚙️ شروط مركبة إضافية للتأهل (Compound Conditions) */}
      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-600" />
          <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
            شروط مركبة إضافية للتأهل للمستوى (اختياري)
          </label>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          يمكنك اشتراط عدد طلبات محدد أو حد أدنى للإنفاق بجانب الشرط الرئيسي للترقية للمستوى.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              الحد الأدنى لعدد الطلبات المكتملة
            </label>
            <input
              type="number"
              min={0}
              placeholder="مثلاً: 3 طلبات"
              value={editingTier.conditions?.minOrders ?? ""}
              onChange={(e) =>
                setEditingTier({
                  ...editingTier,
                  conditions: {
                    ...editingTier.conditions,
                    minOrders: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              الحد الأدنى لإجمالي الإنفاق (ج.م)
            </label>
            <input
              type="number"
              min={0}
              placeholder="مثلاً: 2000 ج.م"
              value={editingTier.conditions?.minSpent ?? ""}
              onChange={(e) =>
                setEditingTier({
                  ...editingTier,
                  conditions: {
                    ...editingTier.conditions,
                    minSpent: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 🎁 مميزات ومكافآت المستوى المطبقة فعلياً */}
      <div className="space-y-4 p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-800/40">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <label className="text-sm font-bold text-gray-900 dark:text-white">
            مميزات ومكافآت المستوى (تُطبق تلقائياً على طلبات عملاء هذا المستوى)
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ميزة الخصم مع القيمة المتغيرة */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span>خصم على الطلبات (%)</span>
              <span className="text-[11px] text-gray-400 font-normal">0 = بدون خصم</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={editingTier.discountPercent ?? 0}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : Number(e.target.value);
                  setEditingTier({ ...editingTier, discountPercent: val });
                }}
                placeholder="مثال: 10"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 select-none">
                %
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              نسبة الخصم التي يتم تطبيقها تلقائياً على إجمالي مشتريات العميل عند الطلب.
            </p>
          </div>

          {/* ميزة شحن مجاني */}
          <div className="space-y-1.5 flex flex-col justify-between">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              شحن مجاني
            </label>
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                setEditingTier({
                  ...editingTier,
                  freeShipping: !editingTier.freeShipping,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEditingTier({
                    ...editingTier,
                    freeShipping: !editingTier.freeShipping,
                  });
                }
              }}
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                editingTier.freeShipping
                  ? "bg-purple-100/60 dark:bg-purple-900/40 border-purple-400 dark:border-purple-600 shadow-sm"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <Truck
                  className={`w-4 h-4 ${
                    editingTier.freeShipping
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-400"
                  }`}
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  تفعيل الشحن المجاني
                </span>
              </div>
              <div
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  editingTier.freeShipping
                    ? "bg-purple-600 justify-end"
                    : "bg-gray-300 dark:bg-gray-600 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              إعفاء العميل في هذا المستوى من رسوم الشحن تلقائياً عند الدفع.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

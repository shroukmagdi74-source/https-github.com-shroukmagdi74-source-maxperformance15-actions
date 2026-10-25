import React from "react";
import type {
  CashbackSettings,
  CashbackDraft,
  CustomerLoyaltyTier,
} from "./types";
import { getTierIcon } from "./helpers";

interface LoyaltyCashbackTabProps {
  cashbackSettings: CashbackSettings | null;
  cashbackDraft: CashbackDraft | null;
  tiers: CustomerLoyaltyTier[];
  isSaving: boolean;
  onSave: () => void;
  onUpdateField: <K extends keyof CashbackDraft>(
    key: K,
    value: CashbackDraft[K],
  ) => void;
  onUpdateTierOverride: (tierId: string, val: string) => void;
}

export const LoyaltyCashbackTab: React.FC<LoyaltyCashbackTabProps> = ({
  cashbackSettings,
  cashbackDraft,
  tiers,
  isSaving,
  onSave,
  onUpdateField,
  onUpdateTierOverride,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              إعدادات الكاش باك
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              تحديد نسبة الكاش باك وطريقة الحساب والحدود
            </p>
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={!cashbackDraft || isSaving}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm ${
              !cashbackDraft || isSaving
                ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {isSaving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>

        {!cashbackDraft ? (
          <div className="text-sm text-gray-600 dark:text-gray-300 py-4">
            تعذر تحميل إعدادات الكاش باك أو لا توجد إعدادات مفعلة.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  نسبة الكاش باك (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={cashbackDraft.cashbackPercent}
                  onChange={(e) =>
                    onUpdateField("cashbackPercent", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  الحد الأقصى للطلب (0 = بدون حد)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={cashbackDraft.maxPerOrder}
                  onChange={(e) =>
                    onUpdateField("maxPerOrder", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="مثلاً: 250"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  أساس الحساب
                </label>
                <select
                  value={cashbackDraft.base}
                  onChange={(e) =>
                    onUpdateField(
                      "base",
                      e.target.value === "subtotal" ? "subtotal" : "total",
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="total">إجمالي الطلب (total)</option>
                  <option value="subtotal">
                    قبل الشحن والضريبة (subtotal)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  الحالة
                </label>
                <select
                  value={cashbackDraft.status}
                  onChange={(e) =>
                    onUpdateField(
                      "status",
                      e.target.value as CashbackSettings["status"],
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ACTIVE">نشط</option>
                  <option value="INACTIVE">غير نشط</option>
                  <option value="DRAFT">مسودة</option>
                  <option value="SUSPENDED">معلق</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600/70 pt-6">
              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                تخصيص الشرائح (Override Tiers)
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                يمكنك تحديد نسبة كاش باك مختلفة لكل مستوى عملاء. اترك الحقل
                فارغاً لاستخدام النسبة الافتراضية.
              </p>

              {tiers.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                  لا توجد مستويات معرفة.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      <div
                        className="p-2.5 rounded-lg shrink-0"
                        style={{
                          backgroundColor: tier.color + "20",
                          color: tier.color,
                        }}
                      >
                        {getTierIcon(tier.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                          {tier.nameAr || tier.name}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          placeholder={`الافتراضي (${cashbackDraft.cashbackPercent}%)`}
                          value={cashbackDraft.tierOverrides?.[tier.id] ?? ""}
                          onChange={(e) =>
                            onUpdateTierOverride(tier.id, e.target.value)
                          }
                          className="mt-1 w-full px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {cashbackSettings && (
          <div className="mt-5 text-xs text-gray-500 dark:text-gray-400 font-mono">
            Program ID: {cashbackSettings.id}
          </div>
        )}
      </div>
    </div>
  );
};

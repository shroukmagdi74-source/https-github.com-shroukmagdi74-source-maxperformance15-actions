import React from "react";
import { Crown, Zap } from "lucide-react";
import type { CustomerLoyaltyTier } from "./types";
import { getTierIcon } from "./helpers";

interface LoyaltyTiersTabProps {
  tiers: CustomerLoyaltyTier[];
  onCreateTier?: () => void;
}

export const LoyaltyTiersTab: React.FC<LoyaltyTiersTabProps> = ({
  tiers,
  onCreateTier,
}) => {
  if (tiers.length === 0) {
    return (
      <div className="text-center py-12">
        <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          لا توجد مستويات
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
          أنشئ مستويات لبرامج الولاء
        </p>
        {onCreateTier && (
          <button
            type="button"
            onClick={onCreateTier}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm text-sm"
          >
            إنشاء مستوى جديد
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-xl shadow-sm"
              style={{
                backgroundColor: tier.color + "20",
                color: tier.color,
              }}
            >
              {getTierIcon(tier.icon)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {tier.nameAr || tier.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                {tier.customersCount} عميل
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4 border-t border-b border-gray-200 dark:border-gray-600/70 py-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                النقاط الدنيا:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                {tier.minPoints.toLocaleString()}
              </span>
            </div>
            {tier.maxPoints && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  النقاط القصوى:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                  {tier.maxPoints.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              المزايا المتاحة:
            </p>
            {tier.benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

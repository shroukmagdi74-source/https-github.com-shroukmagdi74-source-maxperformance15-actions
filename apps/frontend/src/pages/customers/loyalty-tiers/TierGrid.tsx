import React from "react";
import { MapPin } from "lucide-react";
import { type CustomerLoyaltyTier, EGYPT_GOVERNORATES } from "./types";
import { TierCard } from "./TierCard";

interface TierGridProps {
  tiers: CustomerLoyaltyTier[];
  selectedGovFilter: string;
  setSelectedGovFilter: (filter: string) => void;
  onEdit: (tier: CustomerLoyaltyTier) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const TierGrid: React.FC<TierGridProps> = ({
  tiers,
  selectedGovFilter,
  setSelectedGovFilter,
  onEdit,
  onDelete,
}) => {
  const displayedTiers = tiers.filter((t) => {
    if (selectedGovFilter === "ALL") return true;
    if (selectedGovFilter === "GLOBAL")
      return !t.targetGovernorates || t.targetGovernorates.length === 0;
    return (
      Array.isArray(t.targetGovernorates) &&
      t.targetGovernorates.includes(selectedGovFilter)
    );
  });

  return (
    <div className="space-y-6">
      {/* 🌍 شريط تصفية المستويات حسب المحافظات */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
          <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>تصفية المستويات حسب النطاق الجغرافي:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedGovFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedGovFilter === "ALL"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            الكل ({tiers.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedGovFilter("GLOBAL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedGovFilter === "GLOBAL"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            🌐 عام لكافة المحافظات (
            {
              tiers.filter(
                (t) =>
                  !t.targetGovernorates || t.targetGovernorates.length === 0
              ).length
            }
            )
          </button>
          <select
            value={
              selectedGovFilter === "ALL" || selectedGovFilter === "GLOBAL"
                ? ""
                : selectedGovFilter
            }
            onChange={(e) => setSelectedGovFilter(e.target.value || "ALL")}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-800 dark:text-gray-200"
          >
            <option value="">اختر محافظة معينة...</option>
            {EGYPT_GOVERNORATES.map((gov) => {
              const count = tiers.filter(
                (t) =>
                  t.targetGovernorates && t.targetGovernorates.includes(gov)
              ).length;
              return (
                <option key={gov} value={gov}>
                  {gov} {count > 0 ? `(${count})` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {displayedTiers.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            لا توجد مستويات مطابقة لهذا النطاق الجغرافي
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

import React from "react";
import {
  Crown,
  Medal,
  Gem,
  Trophy,
  Award,
  Trash2,
  Edit,
  MapPin,
  Globe,
  SlidersHorizontal,
  Zap,
  Truck,
  Users,
} from "lucide-react";
import { type CustomerLoyaltyTier } from "./types";

interface TierCardProps {
  tier: CustomerLoyaltyTier;
  onEdit: (tier: CustomerLoyaltyTier) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const getTierIcon = (iconName: string) => {
  switch (iconName) {
    case "crown":
      return <Crown className="w-6 h-6" />;
    case "medal":
      return <Medal className="w-6 h-6" />;
    case "gem":
      return <Gem className="w-6 h-6" />;
    case "trophy":
      return <Trophy className="w-6 h-6" />;
    default:
      return <Award className="w-6 h-6" />;
  }
};

export const TierCard: React.FC<TierCardProps> = ({ tier, onEdit, onDelete }) => {
  return (
    <div className="relative group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button
          onClick={(e) => onDelete(tier.id, e)}
          className="p-1.5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 transition-colors"
          title="حذف المستوى"
          aria-label="حذف المستوى"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 📍 بادج النطاق الجغرافي والشروط */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {tier.targetGovernorates && tier.targetGovernorates.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <MapPin className="w-3 h-3 text-indigo-500" />
            {tier.targetGovernorates.join("، ")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            <Globe className="w-3 h-3 text-gray-500" />
            جميع المحافظات
          </span>
        )}
        {tier.conditions && (tier.conditions.minOrders || tier.conditions.minSpent) ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
            شرط مركب
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="p-4 rounded-xl shadow-sm"
          style={{
            backgroundColor: tier.color + "20",
            color: tier.color,
          }}
        >
          {getTierIcon(tier.icon)}
        </div>
        <div>
          <h3 className="font-bold text-xl text-gray-900 dark:text-white">
            {tier.nameAr || tier.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
            <Users className="w-3.5 h-3.5" />
            <span>{tier.customersCount} عميل</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            الحد الأدنى للنقاط:
          </span>
          <span className="font-bold text-gray-900 dark:text-white tabular-nums">
            {tier.minPoints?.toLocaleString() || 0}
          </span>
        </div>
        {tier.maxPoints ? (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              الحد الأقصى للنقاط:
            </span>
            <span className="font-bold text-gray-900 dark:text-white tabular-nums">
              {tier.maxPoints.toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>

      {tier.conditions && (tier.conditions.minOrders || tier.conditions.minSpent) ? (
        <div className="mb-4 p-2.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 rounded-lg text-xs space-y-1 text-amber-900 dark:text-amber-200">
          <span className="font-bold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            شروط إضافية للتأهل:
          </span>
          {tier.conditions.minOrders ? (
            <div>
              • حد أدنى: <span className="font-bold tabular-nums">{tier.conditions.minOrders}</span> طلب مكتمل
            </div>
          ) : null}
          {tier.conditions.minSpent ? (
            <div>
              • حد أدنى للإنفاق: <span className="font-bold tabular-nums">{Number(tier.conditions.minSpent).toLocaleString()}</span> ج.م
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          مميزات المستوى:
        </p>
        {Number(tier.discountPercent) > 0 || tier.freeShipping || (tier.benefits && tier.benefits.length > 0) ? (
          <div className="space-y-1.5">
            {Number(tier.discountPercent) > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/40">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>خصم <span className="tabular-nums">{tier.discountPercent}</span>% على الطلبات</span>
              </div>
            )}
            {tier.freeShipping && (
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1.5 rounded-lg border border-blue-200/80 dark:border-blue-800/40">
                <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>شحن مجاني على كافة الطلبات</span>
              </div>
            )}
            {tier.benefits?.filter((b: string) => !b.includes("شحن مجاني") && !b.includes("خصم")).map((benefit: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 px-1 py-0.5"
              >
                <Zap className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">
            لا توجد مميزات مضافة
          </span>
        )}
      </div>

      <button
        onClick={() => onEdit(tier)}
        className="w-full mt-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
      >
        <Edit className="w-4 h-4" />
        تعديل المستوى
      </button>
    </div>
  );
};

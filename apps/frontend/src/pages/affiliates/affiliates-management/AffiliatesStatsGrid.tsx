import React from "react";

interface AffiliatesStatsGridProps {
  isDark: boolean;
  stats: {
    totalCount: number;
    pendingCount: number;
    totalSales: number;
    totalEarnings: string;
  };
}

export const AffiliatesStatsGrid: React.FC<AffiliatesStatsGridProps> = ({
  isDark,
  stats,
}) => {
  const cardClass = `p-3.5 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border ${
    isDark
      ? "bg-gray-800 border-gray-700 text-white"
      : "bg-white border-gray-100 text-gray-900"
  }`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 mb-5 sm:mb-8">
      <div className={cardClass}>
        <div className="text-xs sm:text-sm text-gray-400 mb-1">الجمهور المستهدف</div>
        <div className="text-xl sm:text-3xl font-bold text-indigo-500 tabular-nums">
          {stats.totalCount}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
          إجمالي المسوقين المسجلين
        </div>
      </div>

      <div className={cardClass}>
        <div className="text-xs sm:text-sm text-gray-400 mb-1">ينتظرون التفعيل</div>
        <div className="text-xl sm:text-3xl font-bold text-orange-500 tabular-nums">
          {stats.pendingCount}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
          طلبات تسجيل جديدة لم تراجع
        </div>
      </div>

      <div className={cardClass}>
        <div className="text-xs sm:text-sm text-gray-400 mb-1">إجمالي المبيعات</div>
        <div className="text-xl sm:text-3xl font-bold text-green-500 tabular-nums">
          {stats.totalSales}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
          إجمالي الطلبات المحققة
        </div>
      </div>

      <div className={cardClass}>
        <div className="text-xs sm:text-sm text-gray-400 mb-1">إجمالي العمولات</div>
        <div className="text-xl sm:text-3xl font-bold text-blue-500 tabular-nums">
          {stats.totalEarnings}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
          جنيه مصري مستحقة للمسوقين
        </div>
      </div>
    </div>
  );
};

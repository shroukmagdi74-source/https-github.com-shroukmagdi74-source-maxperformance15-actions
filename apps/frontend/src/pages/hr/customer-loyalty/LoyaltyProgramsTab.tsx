import React from "react";
import { Gift } from "lucide-react";
import type { CustomerLoyaltyProgram } from "./types";
import { getProgramIcon, getStatusColor, getStatusLabel } from "./helpers";

interface LoyaltyProgramsTabProps {
  programs: CustomerLoyaltyProgram[];
  onCreateProgram: () => void;
}

export const LoyaltyProgramsTab: React.FC<LoyaltyProgramsTabProps> = ({
  programs,
  onCreateProgram,
}) => {
  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          لا توجد برامج ولاء
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
          ابدأ بإنشاء برنامج ولاء للعملاء
        </p>
        <button
          type="button"
          onClick={onCreateProgram}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm text-sm"
        >
          إنشاء برنامج جديد
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {programs.map((program) => (
        <div
          key={program.id}
          className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-lg ${
                  program.status === "ACTIVE"
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                }`}
              >
                {getProgramIcon(program.type)}
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(
                  program.status,
                )}`}
              >
                {getStatusLabel(program.status)}
              </span>
            </div>

            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              {program.nameAr || program.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {program.description}
            </p>

            <div className="space-y-2 text-sm border-t border-gray-200 dark:border-gray-600/80 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  نقاط لكل عملية:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                  {program.pointsPerPurchase}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  العملاء:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                  {program.customersCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  معدل الاستبدال:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                  {program.redemptionRate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              type="button"
              className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
            >
              تعديل
            </button>
            <button
              type="button"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              عرض
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

interface AffiliatesHeaderProps {
  isDark: boolean;
}

export const AffiliatesHeader: React.FC<AffiliatesHeaderProps> = ({ isDark }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 sm:mb-8 gap-3 sm:gap-4">
      <div>
        <h1
          className={`text-xl sm:text-3xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } flex items-center`}
        >
          <UserGroupIcon className="h-7 w-7 sm:h-9 sm:w-9 ml-2.5 sm:ml-3 text-indigo-500" />
          إدارة شبكة المسوقين (Premium)
        </h1>
        <p
          className={`mt-1 sm:mt-2 text-xs sm:text-base ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          تحكم كامل في المسوقين والعمولات والبيانات المالية.
        </p>
      </div>
    </div>
  );
};

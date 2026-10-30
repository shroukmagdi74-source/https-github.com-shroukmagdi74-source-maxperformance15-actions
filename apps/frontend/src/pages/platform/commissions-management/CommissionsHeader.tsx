import React from "react";

export interface CommissionsHeaderProps {
  isDark: boolean;
}

export const CommissionsHeader: React.FC<CommissionsHeaderProps> = ({ isDark }) => {
  return (
    <div className="mb-6">
      <h1
        className={`text-3xl font-bold ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        إدارة العمولات
      </h1>
      <p className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-2`}>
        عرض وإدارة العمولات وطلبات سحب المسوقين
      </p>
    </div>
  );
};

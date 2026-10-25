import React from "react";

export const DashboardSkeleton: React.FC = () => (
  <div className="p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
        ></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
        ></div>
      ))}
    </div>
  </div>
);

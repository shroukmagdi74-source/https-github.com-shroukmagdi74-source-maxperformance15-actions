import React, { type ReactNode } from "react";

export const Card: React.FC<{
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}> = ({ title, icon, action, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b dark:border-gray-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        {icon ? <span className="text-blue-600 dark:text-blue-400">{icon}</span> : null}
        {title}
      </h3>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export const Row: React.FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b dark:border-gray-700/50 last:border-0 text-sm">
    <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
    <span className="font-medium text-gray-900 dark:text-gray-100 text-left">{children}</span>
  </div>
);

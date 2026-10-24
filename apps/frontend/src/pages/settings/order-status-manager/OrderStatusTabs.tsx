import React from "react";
import { Package, CreditCard, Truck, Cog } from "lucide-react";
import type { OrderStatusType } from "./types";

export interface OrderStatusTabsProps {
  activeTab: OrderStatusType;
  setActiveTab: (tab: OrderStatusType) => void;
  counts?: Partial<Record<OrderStatusType, number>>;
}

export function OrderStatusTabs({
  activeTab,
  setActiveTab,
  counts = {},
}: OrderStatusTabsProps) {
  const tabs: Array<{ id: OrderStatusType; label: string; icon: React.ReactNode }> = [
    { id: "order", label: "حالات الطلبات", icon: <Package className="w-4 h-4" /> },
    { id: "payment", label: "حالات الدفع", icon: <CreditCard className="w-4 h-4" /> },
    { id: "shipping", label: "حالات الشحن", icon: <Truck className="w-4 h-4" /> },
    { id: "preparation", label: "حالات التجهيز", icon: <Cog className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto sm:flex-wrap no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
      {tabs.map((tab) => {
        const count = counts[tab.id];
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              isActive
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {count !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums ${
                  isActive
                    ? "bg-blue-700/80 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
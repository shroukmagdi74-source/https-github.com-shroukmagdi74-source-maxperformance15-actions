import React from "react";
import { useTranslation } from "react-i18next";
import { CounterKey, Counters } from "./types";
import { KPI_CARDS } from "./constants";

interface RadiologyKpiCardsProps {
  counters: Counters | null;
  isCounterActive: (key: CounterKey) => boolean;
  toggleCounter: (key: CounterKey) => void;
}

export const RadiologyKpiCards: React.FC<RadiologyKpiCardsProps> = ({
  counters,
  isCounterActive,
  toggleCounter,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {KPI_CARDS.map((card) => {
        const value = counters ? counters[card.key] : undefined;
        const active = isCounterActive(card.key);
        const clickable = card.key !== "total";
        return (
          <button
            key={card.key}
            type="button"
            disabled={!clickable}
            onClick={() => toggleCounter(card.key)}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-3 sm:p-4 flex items-start gap-3 text-right transition-colors ${
              active
                ? "border-blue-400 ring-1 ring-blue-400 dark:border-blue-500"
                : "border-gray-200 dark:border-gray-700"
            } ${clickable ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/60" : "cursor-default"}`}
          >
            <span className={`p-2 rounded-lg shrink-0 ${card.iconCls}`}>
              <card.icon className="w-5 h-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                {t(card.labelKey)}
              </span>
              {value === undefined ? (
                <span className="block mt-1.5 h-6 w-10 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : (
                <span className="block mt-0.5 text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                  {value}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

import React from "react";
import { Cloud, Smartphone, HelpCircle } from "lucide-react";
import { RoutingInfo } from "./types";
import { normalizeDigits } from "./formatters";

interface SourceBadgeProps {
  source: RoutingInfo;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold";
  if (source.key === "meta") {
    return (
      <span
        className={`${base} bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300`}
        title={normalizeDigits(source.desc)}
      >
        <Cloud className="h-3 w-3" />
        Meta Cloud API
      </span>
    );
  }
  if (source.key === "wa") {
    return (
      <span
        className={`${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300`}
        title={normalizeDigits(source.desc)}
      >
        <Smartphone className="h-3 w-3" />
        واتساب عادي
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300`}
      title={normalizeDigits(source.desc)}
    >
      <HelpCircle className="h-3 w-3" />
      غير محدد
    </span>
  );
};

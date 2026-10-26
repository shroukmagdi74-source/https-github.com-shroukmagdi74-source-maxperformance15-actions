import React from "react";
import {
  ExclamationTriangleIcon,
  MinusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface CampaignRiskBadgeProps {
  roi: number;
}

export const CampaignRiskBadge: React.FC<CampaignRiskBadgeProps> = ({ roi }) => {
  if (roi < 0) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
        <ExclamationTriangleIcon className="w-4 h-4 ml-1" />
        مخاطر عالية
      </span>
    );
  } else if (roi < 50) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
        <MinusIcon className="w-4 h-4 ml-1" />
        مخاطر متوسطة
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
        <CheckCircleIcon className="w-4 h-4 ml-1" />
        فرصة ممتازة
      </span>
    );
  }
};

import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { ActionKind } from "./types";
import { ACTION_META } from "./constants";

interface RadiologyBulkActionBarProps {
  selectedCount: number;
  bulkBusy: ActionKind | null;
  onBulkAction: (action: ActionKind) => void;
  onClearSelection: () => void;
}

export const RadiologyBulkActionBar: React.FC<RadiologyBulkActionBarProps> = ({
  selectedCount,
  bulkBusy,
  onBulkAction,
  onClearSelection,
}) => {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 px-4 py-3 flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {t("radiology.bulk.selected", { count: selectedCount })}
        </span>
        <button
          onClick={() => void onBulkAction("review")}
          disabled={bulkBusy !== null}
          className={`px-3 py-1.5 text-sm rounded-lg border font-medium flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${ACTION_META.review.cls}`}
        >
          {bulkBusy === "review" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {t("radiology.bulk.review")}
        </button>
        <button
          onClick={() => void onBulkAction("sign")}
          disabled={bulkBusy !== null}
          className={`px-3 py-1.5 text-sm rounded-lg border font-medium flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${ACTION_META.sign.cls}`}
        >
          {bulkBusy === "sign" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {t("radiology.bulk.sign")}
        </button>
        <button
          onClick={() => void onBulkAction("deliver")}
          disabled={bulkBusy !== null}
          className={`px-3 py-1.5 text-sm rounded-lg border font-medium flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${ACTION_META.deliver.cls}`}
        >
          {bulkBusy === "deliver" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {t("radiology.bulk.deliver")}
        </button>
        <button
          onClick={onClearSelection}
          disabled={bulkBusy !== null}
          className="px-3 py-1.5 text-sm rounded-lg border dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
        >
          {t("radiology.bulk.done")}
        </button>
      </div>
    </div>
  );
};

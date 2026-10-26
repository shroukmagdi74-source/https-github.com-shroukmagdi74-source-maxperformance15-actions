import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2, X as XMarkIcon } from "lucide-react";
import { MODAL_CONTENT_CLS, MODAL_INPUT_CLS } from "../shared";

interface ScheduleCardScanModalProps {
  cardScan: string | null;
  cardOcrBusy: boolean;
  cardScanTarget: "newPatient" | null;
  nationalIdValue: string;
  onNationalIdChange: (val: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export const ScheduleCardScanModal: React.FC<ScheduleCardScanModalProps> = ({
  cardScan,
  cardOcrBusy,
  cardScanTarget,
  nationalIdValue,
  onNationalIdChange,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!cardScan) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className={MODAL_CONTENT_CLS} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {t("radiology.schedule.cardScanTitle")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label={t("radiology.cancel") as string}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <img
          src={cardScan}
          alt="البطاقة"
          className="w-full max-h-64 object-contain rounded-lg border dark:border-gray-600 mb-4"
        />
        {cardOcrBusy ? (
          <p className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("radiology.schedule.cardOcrReading")}
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {t("radiology.schedule.cardScanHint")}
          </p>
        )}
        {cardScanTarget === "newPatient" ? (
          <input
            className={MODAL_INPUT_CLS}
            dir="ltr"
            value={nationalIdValue}
            onChange={(e) =>
              onNationalIdChange(
                e.target.value.replace(/\D/g, "").slice(0, 14),
              )
            }
            placeholder={t("radiology.schedule.nationalId14")}
          />
        ) : null}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded-lg"
          >
            {t("radiology.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={cardOcrBusy}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {t("radiology.schedule.cardScanConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

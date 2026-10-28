import React from "react";
import { Loader2, X as XMarkIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MODAL_CONTENT_CLS, MODAL_INPUT_CLS } from "../shared";
import { PAY_METHODS } from "./types";

interface StudyPaymentModalProps {
  isOpen: boolean;
  type: "PAY" | "REFUND" | null;
  onClose: () => void;
  savingPay: boolean;
  payAmount: string;
  setPayAmount: (val: string) => void;
  payMethod: string;
  setPayMethod: (val: string) => void;
  payNote: string;
  setPayNote: (val: string) => void;
  onRecordPayment: () => Promise<void>;
  onRecordRefund: () => Promise<void>;
}

export const StudyPaymentModal: React.FC<StudyPaymentModalProps> = ({
  isOpen,
  type,
  onClose,
  savingPay,
  payAmount,
  setPayAmount,
  payMethod,
  setPayMethod,
  payNote,
  setPayNote,
  onRecordPayment,
  onRecordRefund,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !type) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={() => !savingPay && onClose()}
    >
      <div className={MODAL_CONTENT_CLS} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {type === "PAY" ? t("radiology.details.recordPayment") : t("radiology.details.refund")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg dark:text-gray-300 cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              {t("radiology.insuranceInvoices.amountRequired")}
            </label>
            <input
              type="number"
              min={0}
              className={`${MODAL_INPUT_CLS} tabular-nums`}
              dir="ltr"
              placeholder={t("radiology.studies.amountPlaceholder") as string}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </div>
          {type === "PAY" ? (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                {t("radiology.insuranceInvoices.paymentMethod")}
              </label>
              <select
                className={MODAL_INPUT_CLS}
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                {PAY_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {t(`radiology.paymentMethod.${m}`)}
                  </option>
                ))}
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          ) : null}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              {t("radiology.insuranceInvoices.note")}
            </label>
            <input
              className={MODAL_INPUT_CLS}
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              placeholder={t("radiology.insuranceInvoices.notesOptionalPlaceholder") as string}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={savingPay}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded-lg disabled:opacity-50 cursor-pointer"
          >
            {t("radiology.cancel")}
          </button>
          <button
            onClick={type === "PAY" ? () => void onRecordPayment() : () => void onRecordRefund()}
            disabled={savingPay}
            className={`px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer ${
              type === "PAY" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {savingPay ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {type === "PAY" ? t("radiology.details.recordPayment") : t("radiology.details.refund")}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Banknote, CreditCard, MessageSquare, Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RadiologyPaymentStatusMap, RadiologyStudy } from "../shared";
import { Card } from "./CardRow";
import { billingTypeText, fmtDateTime, fmtMoney, methodText, renderBadge, signed } from "./helpers";
import {
  StudyDetailsAppointment,
  StudyDetailsPayment,
  StudyDetailsShiftPayment,
  StudyDetailsTotals,
} from "./types";

interface StudyPaymentCardProps {
  study: RadiologyStudy;
  totals: StudyDetailsTotals;
  payments: StudyDetailsPayment[];
  shiftPayments: StudyDetailsShiftPayment[];
  appointment?: StudyDetailsAppointment | null;
  onOpenPayModal: (type: "PAY" | "REFUND") => void;
}

export const StudyPaymentCard: React.FC<StudyPaymentCardProps> = ({
  study,
  totals,
  payments,
  shiftPayments,
  appointment,
  onOpenPayModal,
}) => {
  const { t } = useTranslation();
  const billingType = totals.billingType;

  return (
    <div className="space-y-6 lg:col-span-1">
      <Card
        title={t("radiology.details.payment")}
        icon={<CreditCard className="w-5 h-5" />}
        action={renderBadge(RadiologyPaymentStatusMap, totals.paymentStatus || study.paymentStatus, t)}
      >
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-2.5 text-center">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("radiology.details.total")}
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {fmtMoney(totals.total, t("radiology.currency"))}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2.5 text-center">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("radiology.details.paid")}
            </p>
            <p className="text-base font-bold text-green-600 dark:text-green-400 tabular-nums">
              {fmtMoney(totals.paidAmount, t("radiology.currency"))}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-2.5 text-center">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("radiology.details.remaining")}
            </p>
            <p className="text-base font-bold text-red-600 dark:text-red-400 tabular-nums">
              {fmtMoney(totals.remaining, t("radiology.currency"))}
            </p>
          </div>
        </div>

        {billingType ? (
          <div className="mb-4">
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                billingType === "INSURANCE"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {billingTypeText(billingType, t)}
            </span>
          </div>
        ) : null}

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onOpenPayModal("PAY")}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm cursor-pointer"
          >
            <Banknote className="w-4 h-4" />
            {t("radiology.details.recordPayment")}
          </button>
          <button
            onClick={() => onOpenPayModal("REFUND")}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
            {t("radiology.details.refund")}
          </button>
        </div>

        {payments.length === 0 && shiftPayments.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
            {t("radiology.details.noPayments")}
          </p>
        ) : (
          <>
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 py-2 border-b dark:border-gray-700/50 last:border-0 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {methodText(p.method, t)}
                    {p.paidBy ? ` — ${p.paidBy}` : ""}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {p.note ? `${p.note} — ` : ""}
                    {fmtDateTime(p.createdAt)}
                  </p>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400 shrink-0 tabular-nums">
                  {signed(p.amount)}
                </span>
              </div>
            ))}
            {shiftPayments.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  {t("radiology.cashierShifts.title")}
                </p>
                {shiftPayments.map((sp, i) => (
                  <div
                    key={sp.id || `${sp.shiftId || "shift"}-${i}`}
                    className="flex items-center justify-between gap-2 py-1.5 border-b dark:border-gray-700/50 last:border-0 text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {methodText(sp.method, t)}
                      {sp.note ? ` — ${sp.note}` : ""}
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400 shrink-0 tabular-nums">
                      {signed(sp.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}
      </Card>

      <Card title={t("radiology.details.notes")} icon={<MessageSquare className="w-5 h-5" />}>
        {!study.notes && !appointment?.notes ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">{t("radiology.notAvailable")}</p>
        ) : (
          <div className="space-y-3 text-sm">
            {study.notes ? (
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{study.notes}</p>
            ) : null}
            {appointment?.notes ? (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  {t("radiology.details.appointment")}
                </p>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {appointment.notes}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
};

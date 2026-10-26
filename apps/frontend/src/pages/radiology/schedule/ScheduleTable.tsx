import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Pencil,
  Trash2,
  ArrowRightLeft,
  RefreshCw,
  UserCheck,
  Info,
  Banknote,
  X as XMarkIcon,
} from "lucide-react";
import {
  RadiologyIdSettings,
  formatSequentialId,
  parsePatientFlags,
  flagMeta,
  tryParseJSON,
} from "../shared";
import {
  Appointment,
  STATUS_META,
  STATUS_CHAIN,
  ScheduleForm,
  SortConfig,
  emptyForm,
} from "./types";
import { fmtDate } from "./helpers";

interface ScheduleTableProps {
  items: Appointment[];
  sortedItems: Appointment[];
  total: number;
  loading: boolean;
  sort: SortConfig | null;
  onToggleSort: (key: string) => void;
  selected: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleSelectAll: () => void;
  isManagerUser: boolean;
  insuranceCompanies: { id: string; name: string }[];
  idSettings: RadiologyIdSettings;
  bulkBusy: "checkin" | "convert" | null;
  onRunBulk: (action: "checkin" | "convert") => void;
  onClearSelected: () => void;
  onEdit: (form: ScheduleForm) => void;
  onAdvance: (appointment: Appointment) => void;
  onConvert: (appointment: Appointment) => void;
  onRemove: (appointment: Appointment) => void;
  onLoadMore: () => void;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  items,
  sortedItems,
  total,
  loading,
  sort,
  onToggleSort,
  selected,
  onToggleSelected,
  onToggleSelectAll,
  isManagerUser,
  insuranceCompanies,
  idSettings,
  bulkBusy,
  onRunBulk,
  onClearSelected,
  onEdit,
  onAdvance,
  onConvert,
  onRemove,
  onLoadMore,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-center py-16 text-gray-400 dark:text-gray-500">
        {t("radiology.schedule.noBookings")}
      </p>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
              <th className="py-3 px-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600"
                  checked={
                    items.length > 0 && items.every((a) => selected.has(a.id))
                  }
                  onChange={onToggleSelectAll}
                  title={t("radiology.schedule.selectAll") as string}
                />
              </th>
              {[
                {
                  key: "bookingId",
                  label: t("radiology.schedule.bookingId"),
                  sortable: false,
                },
                {
                  key: "patient",
                  label: t("radiology.schedule.patient"),
                  sortable: true,
                },
                {
                  key: "exam",
                  label: t("radiology.schedule.exam"),
                  sortable: true,
                },
                {
                  key: "amount",
                  label: t("radiology.schedule.amount"),
                  sortable: true,
                },
                {
                  key: "date",
                  label: t("radiology.schedule.date"),
                  sortable: true,
                },
                {
                  key: "time",
                  label: t("radiology.schedule.time"),
                  sortable: true,
                },
                {
                  key: "status",
                  label: t("radiology.schedule.status"),
                  sortable: true,
                },
                {
                  key: "notes",
                  label: t("radiology.schedule.notes"),
                  sortable: false,
                },
                {
                  key: "actions",
                  label: t("radiology.actions"),
                  sortable: false,
                },
              ].map((h) => (
                <th
                  key={h.key}
                  className="text-right py-3 px-4 whitespace-nowrap"
                >
                  {h.sortable ? (
                    <button
                      onClick={() => onToggleSort(h.key)}
                      className="flex items-center gap-1 font-medium"
                    >
                      {h.label}
                      {sort?.key === h.key
                        ? sort.dir === "asc"
                          ? "▲"
                          : "▼"
                        : null}
                    </button>
                  ) : (
                    h.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((a) => {
              const meta = STATUS_META[a.status] || STATUS_META["SCHEDULED"];
              return (
                <tr
                  key={a.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600"
                      checked={selected.has(a.id)}
                      onChange={() => onToggleSelected(a.id)}
                    />
                  </td>
                  <td
                    className="py-3 px-4 text-gray-700 dark:text-gray-300"
                    dir="ltr"
                  >
                    <span className="text-xs font-mono font-medium">
                      {formatSequentialId(
                        idSettings.bookingPrefix,
                        a.bookingNo,
                        idSettings.digits,
                        idSettings.enabled,
                      ) || a.id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {a.patientName}
                    {a.emergency ? (
                      <span className="mr-2 text-xs text-red-500">
                        {t("radiology.schedule.emergency")}
                      </span>
                    ) : null}
                    {parsePatientFlags(a.patientFlags).map((f) => {
                      const flag = flagMeta(f);
                      return flag ? (
                        <span
                          key={f}
                          className={`mr-1.5 px-2 py-0.5 rounded-full text-[11px] ${flag.color}`}
                        >
                          {flag.label}
                        </span>
                      ) : null;
                    })}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                    {a.examTypeName || "—"}
                    {a.examTypeIds &&
                    (Array.isArray(a.examTypeIds)
                      ? a.examTypeIds.length
                      : 1) > 1 ? (
                      <span className="mr-1.5 text-xs text-blue-600 dark:text-blue-400">
                        +
                        {Array.isArray(a.examTypeIds)
                          ? a.examTypeIds.length - 1
                          : 0}
                      </span>
                    ) : null}
                    {a.deviceName ? (
                      <span className="mr-1.5 text-xs text-gray-400">
                        ({a.deviceName})
                      </span>
                    ) : null}
                    {(() => {
                      const pt =
                        a.payerType ||
                        (a.insuranceCompanyId
                          ? "INSURANCE"
                          : a.referralSourceId
                            ? "REFERRAL"
                            : a.isExternalReferral
                              ? "PARTNER"
                              : "CUSTOMER");
                      let pl: string | null = null;
                      if (pt === "INSURANCE")
                        pl =
                          a.insuranceCompanyName ||
                          insuranceCompanies.find(
                            (c) => c.id === a.insuranceCompanyId,
                          )?.name ||
                          null;
                      else if (pt === "REFERRAL")
                        pl = a.referralSourceName || null;
                      else if (pt === "PARTNER")
                        pl = a.externalPartnerName || null;
                      if (!pl) return null;
                      return (
                        <span
                          className="mr-1.5 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300"
                          title={t("radiology.schedule.payer") as string}
                        >
                          <Banknote className="w-3 h-3" />
                          {pl}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400 tabular-nums">
                    {a.additionAmount
                      ? `${Number(a.additionAmount).toFixed(0)} ${t("radiology.currency")}`
                      : "—"}
                  </td>
                  <td className="py-3 px-4 tabular-nums">
                    {fmtDate(a.appointmentDate)}
                  </td>
                  <td className="py-3 px-4 tabular-nums" dir="ltr">
                    {a.appointmentTime || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${meta?.color}`}
                    >
                      {t(meta?.label as never)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 dark:text-gray-500 max-w-[160px] truncate">
                    {a.notes || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          navigate(
                            a.studyId
                              ? `/radiology/study/${a.studyId}`
                              : `/radiology/appointment/${a.id}`,
                          )
                        }
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        title={t("radiology.details.viewDetails") as string}
                        aria-label={t("radiology.details.viewDetails") as string}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          onEdit({
                            ...emptyForm(),
                            id: a.id,
                            patientId:
                              (a as { patientId?: string }).patientId || "",
                            patientName: a.patientName,
                            patientPhone: a.patientPhone || "",
                            patientGender: a.patientGender || "",
                            patientAge: a.patientAge || "",
                            nationalId:
                              (a as { nationalId?: string }).nationalId || "",
                            insuranceNumber:
                              (a as { insuranceNumber?: string })
                                .insuranceNumber || "",
                            patientFlags: parsePatientFlags(
                              (a as { patientFlags?: string[] | string })
                                .patientFlags,
                            ),
                            examTypeIds: Array.isArray(
                              (a as { examTypeIds?: string[] | string })
                                .examTypeIds,
                            )
                              ? (a as { examTypeIds?: string[] })
                                  .examTypeIds || []
                              : tryParseJSON<string[]>(
                                  (a as { examTypeIds?: string })
                                    .examTypeIds || "[]",
                                ) || [],
                            deviceId:
                              (a as { deviceId?: string }).deviceId || "",
                            insuranceCompanyId: a.insuranceCompanyId || "",
                            payerType:
                              a.payerType ||
                              (a.insuranceCompanyId ? "INSURANCE" : "CUSTOMER"),
                            referralSourceId: a.referralSourceId || "",
                            externalPartnerId: a.externalPartnerId || "",
                            paymentDestination:
                              a.paymentDestination || "ME",
                            additionIds: Array.isArray(a.additionIds)
                              ? (a.additionIds as string[])
                              : tryParseJSON<string[]>(
                                  a.additionIds || "[]",
                                ) || [],
                            referringPhysicianId:
                              (a as { referringPhysicianId?: string })
                                .referringPhysicianId || "",
                            referralDoctor: a.referralDoctor || "",
                            emergency: !!a.emergency,
                            appointmentDate: a.appointmentDate
                              ? a.appointmentDate.slice(0, 10)
                              : "",
                            appointmentTime: a.appointmentTime || "",
                            status: a.status,
                            notes: a.notes || "",
                          })
                        }
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        title={t("radiology.schedule.edit") as string}
                        aria-label={t("radiology.schedule.edit") as string}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {a.status !== "CANCELLED" && a.status !== "DONE" ? (
                        <button
                          onClick={() => onConvert(a)}
                          className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                          title={
                            t("radiology.schedule.convertToStudy") as string
                          }
                          aria-label={
                            t("radiology.schedule.convertToStudy") as string
                          }
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      ) : null}
                      {STATUS_CHAIN[a.status] ? (
                        <button
                          onClick={() => onAdvance(a)}
                          className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                          title={
                            t("radiology.schedule.advanceStatus") as string
                          }
                          aria-label={
                            t("radiology.schedule.advanceStatus") as string
                          }
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      ) : null}
                      {isManagerUser ? (
                        <button
                          onClick={() => onRemove(a)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          title={t("radiology.schedule.delete") as string}
                          aria-label={t("radiology.schedule.delete") as string}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t("radiology.schedule.selectedCount", { count: selected.size })}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onRunBulk("checkin")}
              disabled={!!bulkBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50"
            >
              {bulkBusy === "checkin" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
              {t("radiology.schedule.bulkCheckin")}
            </button>
            {isManagerUser ? (
              <button
                onClick={() => onRunBulk("convert")}
                disabled={!!bulkBusy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 disabled:opacity-50"
              >
                {bulkBusy === "convert" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                )}
                {t("radiology.schedule.bulkConvert")}
              </button>
            ) : null}
            {isManagerUser ? (
              <button
                onClick={onClearSelected}
                className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title={t("radiology.cancel") as string}
                aria-label={t("radiology.cancel") as string}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {t("radiology.schedule.showingCount", {
            shown: items.length,
            total,
          })}
        </span>
        {items.length < total ? (
          <button
            onClick={onLoadMore}
            className="flex items-center gap-1.5 px-4 py-2 border dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t("radiology.schedule.loadMore")}
          </button>
        ) : null}
      </div>
    </div>
  );
};

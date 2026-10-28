import React from "react";
import { useTranslation } from "react-i18next";
import {
  RadiologyReportStatusMap,
  flagMeta,
  parsePatientFlags,
} from "../shared";
import { ReportStudy } from "./types";

interface RadiologyReportStudyHeaderProps {
  study: ReportStudy | null;
  reportStatus?: string | null;
}

export const RadiologyReportStudyHeader: React.FC<RadiologyReportStudyHeaderProps> = ({
  study,
  reportStatus,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {study ? (
        <div className="mb-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-sm">{study.patientName || "—"}</p>
            <span
              className="text-xs text-gray-500 dark:text-gray-400 font-mono"
              dir="ltr"
            >
              {study.studyNumber || study.id.slice(0, 8)}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {study.examTypeName || study.examType?.name || "—"}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {parsePatientFlags(study.patientFlags).map((f) => {
              const meta = flagMeta(f);
              return meta ? (
                <span
                  key={f}
                  className={`px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap ${meta.color}`}
                >
                  {meta.label}
                </span>
              ) : null;
            })}
            {study.emergency ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                {t("radiology.studies.emergency")}
              </span>
            ) : null}
            {study.withContrast ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                {t("radiology.reception.withContrast")}
              </span>
            ) : null}
            {study.billingType ? (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap ${
                  study.billingType === "INSURANCE"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {study.billingType === "INSURANCE"
                  ? t("radiology.details.billingType.INSURANCE")
                  : t("radiology.details.billingType.PATIENT")}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {reportStatus ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {t("radiology.reports.reportStatusLabel")}{" "}
          {t(RadiologyReportStatusMap[reportStatus]?.label ?? reportStatus)}
        </p>
      ) : null}
    </>
  );
};

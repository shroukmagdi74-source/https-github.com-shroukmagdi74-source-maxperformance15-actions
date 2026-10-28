import React from "react";
import { Stethoscope, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { flagMeta, RadiologyStudy } from "../shared";
import { Card, Row } from "./CardRow";
import { billingTypeText, fmtMoney, genderText } from "./helpers";
import { StudyDetailsAppointment } from "./types";

interface StudyPatientExamCardProps {
  study: RadiologyStudy;
  appointment?: StudyDetailsAppointment | null;
  flags: string[];
  billingType?: string;
}

export const StudyPatientExamCard: React.FC<StudyPatientExamCardProps> = ({
  study,
  appointment,
  flags,
  billingType,
}) => {
  const { t } = useTranslation();
  const modality = study.examType?.category || "";

  return (
    <>
      <Card
        title={t("radiology.details.patient")}
        icon={<User className="w-5 h-5" />}
        action={
          <div className="flex items-center gap-1.5 flex-wrap">
            {study.emergency ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                {t("radiology.studies.emergency")}
              </span>
            ) : null}
            {study.withContrast ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                {t("radiology.reception.withContrast")}
              </span>
            ) : null}
          </div>
        }
      >
        <Row label={t("radiology.patients.name")}>{study.patientName || "—"}</Row>
        <Row label={t("radiology.schedule.phone")}>
          <span dir="ltr">{study.patientPhone || "—"}</span>
        </Row>
        <Row label={t("radiology.schedule.gender")}>{genderText(study.patientGender, t)}</Row>
        <Row label={t("radiology.schedule.age")}>
          {study.patientAge ? <span dir="ltr">{study.patientAge}</span> : "—"}
        </Row>
        {study.nationalId ? (
          <Row label={t("radiology.studies.nationalId")}>
            <span dir="ltr">{study.nationalId}</span>
          </Row>
        ) : null}
        {study.insuranceNumber ? (
          <Row label={t("radiology.studies.insuranceNumber")}>
            <span dir="ltr">{study.insuranceNumber}</span>
          </Row>
        ) : null}
        {flags.length > 0 ? (
          <div className="flex items-start justify-between gap-3 py-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400 shrink-0">
              {t("radiology.schedule.medicalRiskFlags")}
            </span>
            <span className="flex flex-wrap gap-1 justify-end">
              {flags.map((f) => {
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
            </span>
          </div>
        ) : null}
      </Card>

      <Card title={t("radiology.details.exam")} icon={<Stethoscope className="w-5 h-5" />}>
        <Row label={t("radiology.studies.examType")}>
          {study.examTypeName || study.examType?.name || "—"}
        </Row>
        {modality ? <Row label={t("radiology.settings.modalities")}>{modality}</Row> : null}
        {study.deviceName ? (
          <Row label={t("radiology.schedule.device")}>{study.deviceName}</Row>
        ) : null}
        {study.additionAmount ? (
          <Row label={t("radiology.reception.examAdditions")}>
            <span className="tabular-nums">{fmtMoney(study.additionAmount, t("radiology.currency"))}</span>
          </Row>
        ) : null}
        {study.referralDoctor ? (
          <Row label={t("radiology.reception.referringDoctor")}>{study.referralDoctor}</Row>
        ) : null}
        {study.referralSourceName ? (
          <Row label={t("radiology.details.referralSource")}>{study.referralSourceName}</Row>
        ) : null}
        {study.marketingRepName ? (
          <Row label={t("radiology.details.marketingRep")}>{study.marketingRepName}</Row>
        ) : null}
        {study.isExternalReferral ? (
          <Row label={t("radiology.details.externalReferral")}>
            <span className="flex items-center gap-2 flex-wrap justify-end">
              <span className="px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                {t("radiology.details.externalReferralBadge")}
              </span>
              {study.externalPartnerName || "—"}
            </span>
          </Row>
        ) : null}
        {appointment?.insuranceCompanyName || billingType ? (
          <Row label={t("radiology.schedule.insuranceOptional")}>
            <span className="flex items-center gap-2 flex-wrap justify-end">
              {appointment?.insuranceCompanyName || ""}
              {billingType ? (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap ${
                    billingType === "INSURANCE"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {billingTypeText(billingType, t)}
                </span>
              ) : null}
            </span>
          </Row>
        ) : null}
      </Card>
    </>
  );
};

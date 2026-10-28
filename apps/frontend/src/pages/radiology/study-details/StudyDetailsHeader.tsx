import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  derivePrimaryStage,
  RadiologyOrderStatusMap,
  RadiologyPaymentStatusMap,
  RadiologyStatusMap,
  RadiologyStudy,
} from "../shared";
import StageBadge from "../StageBadge";
import { fmtDate, renderBadge } from "./helpers";
import { StudyDetailsTotals } from "./types";

interface StudyDetailsHeaderProps {
  study: RadiologyStudy;
  totals: StudyDetailsTotals;
}

export const StudyDetailsHeader: React.FC<StudyDetailsHeaderProps> = ({ study, totals }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b dark:border-gray-700">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/radiology/studies")}
          className="flex items-center gap-2 px-3 py-2 border dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          {t("radiology.details.back")}
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {t("radiology.details.title")}
            <span className="text-blue-600 dark:text-blue-400" dir="ltr">
              {study.studyNumber || study.id.slice(0, 8)}
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{fmtDate(study.createdAt)}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {t("radiology.stageLabel")}
          </span>
          <StageBadge stage={derivePrimaryStage(study)} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {t("radiology.details.orderStatus")}
          </span>
          {renderBadge(RadiologyOrderStatusMap, study.orderStatus, t)}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {t("radiology.details.preparationStatus")}
          </span>
          {renderBadge(RadiologyStatusMap, study.status, t)}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {t("radiology.details.paymentStatus")}
          </span>
          {renderBadge(RadiologyPaymentStatusMap, totals.paymentStatus || study.paymentStatus, t)}
        </div>
      </div>
    </div>
  );
};

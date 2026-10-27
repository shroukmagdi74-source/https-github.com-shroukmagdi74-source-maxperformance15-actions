import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BellAlertIcon, ShieldCheckIcon, CheckIcon } from "@heroicons/react/24/outline";
import api from "../../../services/api";
import { useDateFormat } from "../../../hooks/useDateFormat";
import { WarningRecord } from "./types";
import { SectionCard } from "./ProfileWidgets";

interface ProfileWarningsTabProps {
  warnings: WarningRecord[];
  onAcknowledgeSuccess: () => void;
}

export const ProfileWarningsTab: React.FC<ProfileWarningsTabProps> = ({
  warnings,
  onAcknowledgeSuccess,
}) => {
  const { t } = useTranslation();
  const { formatDate } = useDateFormat();

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await api.post(`/hr/warnings/${id}/acknowledge`);
      if ((res.data as any)?.success) {
        toast.success(t("employee.profile.acknowledgeSuccess"));
        onAcknowledgeSuccess();
      }
    } catch {
      toast.error(t("employee.profile.acknowledgeFailed"));
    }
  };

  return (
    <div className="mt-0 focus-visible:outline-none">
      <SectionCard
        icon={BellAlertIcon}
        title={`${t("employee.profile.warningsLog")} ${warnings.length > 0 ? `(${warnings.length})` : ""}`}
        accent="rose"
      >
        {warnings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheckIcon className="w-10 h-10 text-emerald-500/60" />
            </div>
            <p className="text-emerald-400 text-sm font-semibold">{t("employee.profile.noWarnings")}</p>
            <p className="text-slate-500 text-xs mt-1">{t("employee.profile.cleanRecord")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {warnings.map((warning) => {
              const sev =
                warning.severity === "critical"
                  ? {
                      border: "border-red-500/30 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5",
                      badge: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
                      label: t("employee.profile.warningSeverityCritical"),
                    }
                  : warning.severity === "major"
                  ? {
                      border: "border-orange-500/30 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/5",
                      badge: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400",
                      label: t("employee.profile.warningSeverityMajor"),
                    }
                  : {
                      border: "border-blue-500/30 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5",
                      badge: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
                      label: t("employee.profile.warningSeverityAlert"),
                    };

              return (
                <div key={warning.id} className={`p-5 rounded-xl border ${sev.border} transition-all`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{warning.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 tabular-nums">
                        {warning.incidentDate ? formatDate(warning.incidentDate) : "—"}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${sev.badge}`}>{sev.label}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{warning.description}</p>
                  {warning.actionTaken && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 mb-1">
                        {t("employee.profile.actionTaken")}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{warning.actionTaken}</p>
                    </div>
                  )}
                  {!warning.acknowledgedAt ? (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleAcknowledge(warning.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                      >
                        <CheckIcon className="w-3.5 h-3.5" /> {t("employee.warnings.acknowledge")}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>{t("employee.warnings.acknowledged", { date: warning.acknowledgedAt ? formatDate(warning.acknowledgedAt) : "—" })}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

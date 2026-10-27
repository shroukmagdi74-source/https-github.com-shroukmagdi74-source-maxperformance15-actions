import React from "react";
import { useTranslation } from "react-i18next";
import { BriefcaseIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { useDateFormat } from "../../../hooks/useDateFormat";
import { Employee } from "./types";
import { calculateTenure, getContractLabels } from "./helpers";
import { SectionCard, InfoField, AnimatedNumber } from "./ProfileWidgets";

interface ProfileJobTabProps {
  employee: Employee | null;
}

export const ProfileJobTab: React.FC<ProfileJobTabProps> = ({ employee }) => {
  const { t } = useTranslation();
  const { formatDate } = useDateFormat();
  const contractLabels = getContractLabels(t);

  const jobDetailsList = [
    { label: t("employee.profile.employeeNumber"), value: employee?.employeeNumber || "" },
    { label: t("employee.profile.jobTitle"), value: employee?.position?.title || "" },
    { label: t("employee.profile.department"), value: employee?.department?.name || "" },
    {
      label: t("employee.profile.contractType"),
      value: contractLabels[employee?.contractType || ""] || employee?.contractType || "",
    },
    { label: t("employee.profile.joinDate"), value: employee?.hireDate ? formatDate(employee.hireDate) : "" },
    { label: t("employee.profile.serviceDuration"), value: calculateTenure(employee?.hireDate || "", t) },
    {
      label: t("employee.profile.directManager"),
      value: employee?.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : "",
    },
  ];

  const financialItems = [
    {
      label: t("employee.profile.baseSalary"),
      value: employee?.baseSalary,
      suffix: "",
      unit: t("employee.profile.egpMonth"),
      accent: "emerald",
    },
    {
      label: t("employee.profile.annualLeaveBalance"),
      value: employee?.annualLeaveBalance,
      suffix: "",
      unit: t("employee.profile.dayAvailable"),
      accent: "indigo",
    },
    {
      label: t("employee.profile.sickLeaveBalance"),
      value: employee?.sickLeaveBalance,
      suffix: "",
      unit: t("employee.profile.dayAvailable"),
      accent: "violet",
    },
  ];

  const accentMap: Record<string, string> = {
    emerald: "from-emerald-600 to-teal-600 shadow-emerald-500/30",
    indigo: "from-indigo-600 to-blue-600 shadow-indigo-500/30",
    violet: "from-violet-600 to-purple-600 shadow-violet-500/30",
  };

  return (
    <div className="mt-0 focus-visible:outline-none space-y-5">
      <SectionCard icon={BriefcaseIcon} title={t("employee.profile.jobDetails")} accent="indigo">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {jobDetailsList.map((item) => (
            <InfoField key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={BanknotesIcon} title={t("employee.profile.financialInfo")} accent="emerald">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          {financialItems.map((item) => (
            <div
              key={item.label}
              className={`relative p-5 rounded-2xl bg-gradient-to-br ${accentMap[item.accent]} shadow-lg text-center overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/5" />
              <p className="text-xs font-semibold text-white/70 mb-2 relative">{item.label}</p>
              <p className="text-3xl font-extrabold text-white relative">
                {item.value != null ? <AnimatedNumber value={Number(item.value)} /> : "—"}
              </p>
              <p className="text-xs text-white/60 mt-1 relative">{item.unit}</p>
            </div>
          ))}
        </div>
        {(employee?.bankName || employee?.bankIban) && (
          <div className="pt-5 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <InfoField label={t("employee.profile.bankName")} value={employee?.bankName || ""} />
            <InfoField label={t("employee.profile.iban")} value={employee?.bankIban || ""} />
          </div>
        )}
      </SectionCard>
    </div>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useDateFormat } from "../../../hooks/useDateFormat";
import { DefaultPageSelector } from "../../../components/settings/DefaultPageSelector";
import { Employee, ProfileFormData } from "./types";
import { calculateTenure } from "./helpers";

interface ProfileOverviewTabProps {
  employee: Employee | null;
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  isEditing: boolean;
  hasHrBasic: boolean;
  defaultPage: string;
  settingsLoading: boolean;
  onDefaultPageChange: (page: string) => void;
}

export const ProfileOverviewTab: React.FC<ProfileOverviewTabProps> = ({
  employee,
  formData,
  setFormData,
  isEditing,
  hasHrBasic,
  defaultPage,
  settingsLoading,
  onDefaultPageChange,
}) => {
  const { t } = useTranslation();
  const { formatDate } = useDateFormat();

  const statsData = [
    {
      label: t("employee.profile.joinDate"),
      value: employee?.hireDate ? formatDate(employee.hireDate) : "—",
      icon: CalendarDaysIcon,
      gradient: "from-violet-600 to-indigo-600",
      glow: "shadow-violet-500/30",
    },
    {
      label: t("employee.profile.serviceDuration"),
      value: calculateTenure(employee?.hireDate || "", t),
      icon: ClockIcon,
      gradient: "from-indigo-600 to-blue-600",
      glow: "shadow-indigo-500/30",
    },
    {
      label: t("employee.profile.annualLeave"),
      value: `${employee?.annualLeaveBalance ?? 0} ${t("employee.common.day")}`,
      icon: SparklesIcon,
      gradient: "from-emerald-600 to-teal-600",
      glow: "shadow-emerald-500/30",
    },
    {
      label: t("employee.profile.sickLeave"),
      value: `${employee?.sickLeaveBalance ?? 0} ${t("employee.common.day")}`,
      icon: ShieldCheckIcon,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/30",
    },
  ];

  return (
    <div className="mt-0 space-y-6 focus-visible:outline-none">
      {hasHrBasic && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statsData.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden p-5 rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all group cursor-default"
            >
              <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className={`w-10 h-10 mb-4 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.glow} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight tabular-nums">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="p-5 rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            {t("employee.profile.quickContact")}
          </p>
          <div className="space-y-3">
            {[
              { icon: EnvelopeIcon, value: formData.email, label: t("employee.profile.email") },
              { icon: PhoneIcon, value: formData.phone, label: t("employee.profile.phone"), editable: true, fkey: "phone" as keyof typeof formData },
              { icon: MapPinIcon, value: formData.city ? `${formData.city}، ${formData.country}` : formData.country || "", label: t("employee.profile.location") },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 dark:bg-violet-500/15 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                {isEditing && item.editable && item.fkey ? (
                  <input
                    value={formData[item.fkey]}
                    onChange={(e) => setFormData((p) => ({ ...p, [item.fkey!]: e.target.value }))}
                    className="flex-1 px-3 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                ) : (
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item.value || "—"}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Default Landing Page */}
      <div className="rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-slate-800/30 p-5 transition-all">
        <DefaultPageSelector
          value={defaultPage}
          onChange={onDefaultPageChange}
          disabled={settingsLoading}
        />
      </div>
    </div>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CakeIcon, GiftIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../../../hooks/useTheme";
import { useDateFormat } from "../../../hooks/useDateFormat";
import { Employee } from "./types";
import { calculateAge, getNextOccasion } from "./helpers";

interface ProfileEventsTabProps {
  employee: Employee | null;
}

export const ProfileEventsTab: React.FC<ProfileEventsTabProps> = ({ employee }) => {
  const { t } = useTranslation();
  const { derivedTheme } = useTheme();
  const { formatDate } = useDateFormat();

  return (
    <div className="mt-0 focus-visible:outline-none">
      <div className="grid md:grid-cols-2 gap-5">
        {/* Birthday */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden p-8 rounded-2xl border ${
            derivedTheme === "dark" ? "border-pink-500/20" : "border-pink-200"
          } text-center`}
          style={{
            background:
              derivedTheme === "dark"
                ? "linear-gradient(135deg, #4a1942 0%, #1e0514 100%)"
                : "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                derivedTheme === "dark"
                  ? "radial-gradient(ellipse 60% 60% at 80% 30%, rgba(236,72,153,0.2) 0%, transparent 60%)"
                  : "radial-gradient(ellipse 60% 60% at 80% 30%, rgba(251,113,133,0.1) 0%, transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <CakeIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${derivedTheme === "dark" ? "text-white" : "text-pink-900"} mb-2`}>
              {t("employee.profile.nextBirthday")}
            </h3>
            {employee?.dateOfBirth ? (
              <>
                <p
                  className={`text-sm ${
                    derivedTheme === "dark" ? "text-pink-300/70" : "text-pink-600/70"
                  } mb-6 tabular-nums`}
                >
                  {formatDate(getNextOccasion(employee.dateOfBirth)?.date.toISOString() || "")}
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                  <div
                    className={`p-4 rounded-xl ${
                      derivedTheme === "dark" ? "bg-white/10" : "bg-white/60"
                    } backdrop-blur shadow-sm`}
                  >
                    <span
                      className={`block text-3xl font-extrabold tabular-nums ${
                        derivedTheme === "dark" ? "text-pink-300" : "text-pink-600"
                      }`}
                    >
                      {getNextOccasion(employee.dateOfBirth)?.days}
                    </span>
                    <span className={`text-xs ${derivedTheme === "dark" ? "text-pink-300/60" : "text-pink-600/60"}`}>
                      {t("employee.profile.daysRemaining")}
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-xl ${
                      derivedTheme === "dark" ? "bg-white/10" : "bg-white/60"
                    } backdrop-blur shadow-sm`}
                  >
                    <span
                      className={`block text-3xl font-extrabold tabular-nums ${
                        derivedTheme === "dark" ? "text-rose-300" : "text-rose-600"
                      }`}
                    >
                      {(calculateAge(employee.dateOfBirth) as number) + 1}
                    </span>
                    <span className={`text-xs ${derivedTheme === "dark" ? "text-rose-300/60" : "text-rose-600/60"}`}>
                      {t("employee.profile.yearsOld")}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm">{t("employee.profile.noBirthdaySet")}</p>
            )}
          </div>
        </motion.div>

        {/* Anniversary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative overflow-hidden p-8 rounded-2xl border ${
            derivedTheme === "dark" ? "border-violet-500/20" : "border-violet-200"
          } text-center`}
          style={{
            background:
              derivedTheme === "dark"
                ? "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)"
                : "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 60% 60% at 20% 70%, rgba(139,92,246,0.3) 0%, transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <GiftIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${derivedTheme === "dark" ? "text-white" : "text-violet-900"} mb-2`}>
              {t("employee.profile.workAnniversary")}
            </h3>
            {employee?.hireDate ? (
              <>
                <p className="text-sm text-violet-600 dark:text-violet-300/70 mb-6 tabular-nums">
                  {formatDate(getNextOccasion(employee.hireDate)?.date.toISOString() || "")}
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                  <div className="p-4 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur border border-white/20">
                    <span className="block text-3xl font-extrabold text-violet-600 dark:text-violet-300 tabular-nums">
                      {getNextOccasion(employee.hireDate)?.days}
                    </span>
                    <span className="text-xs text-violet-600/60 dark:text-violet-300/60">
                      {t("employee.profile.daysRemaining")}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur border border-white/20">
                    <span className="block text-3xl font-extrabold text-indigo-600 dark:text-indigo-300 tabular-nums">
                      {Math.floor(
                        (new Date().getTime() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24)
                      )}
                    </span>
                    <span className="text-xs text-indigo-600/60 dark:text-indigo-300/60">
                      {t("employee.profile.daysWorked")}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-500 dark:text-slate-500 text-sm">{t("employee.profile.noJoinDateSet")}</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

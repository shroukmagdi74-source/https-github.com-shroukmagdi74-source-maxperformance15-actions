import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ClipboardDocumentListIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { useDateFormat } from "../../../hooks/useDateFormat";
import { CustodyAsset } from "./types";
import { SectionCard } from "./ProfileWidgets";

interface ProfileCustodyTabProps {
  myCustody: CustodyAsset[];
}

export const ProfileCustodyTab: React.FC<ProfileCustodyTabProps> = ({ myCustody }) => {
  const { t } = useTranslation();
  const { formatDate } = useDateFormat();

  return (
    <div className="mt-0 focus-visible:outline-none">
      <SectionCard
        icon={ClipboardDocumentListIcon}
        title={`${t("employee.profile.myAssets")} ${myCustody.length > 0 ? `(${myCustody.length})` : ""}`}
        accent="violet"
      >
        {myCustody.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <ComputerDesktopIcon className="w-10 h-10 text-violet-500/40" />
            </div>
            <p className="text-slate-500 text-sm">{t("employee.profile.noCustody")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCustody.map((asset) => (
              <motion.div
                key={asset.id}
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/10 dark:from-violet-600/30 to-indigo-600/10 dark:to-indigo-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ComputerDesktopIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      asset.status === "ASSIGNED"
                        ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {asset.status === "ASSIGNED" ? t("employee.profile.statusAssigned") : asset.status}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{asset.name}</h4>
                <div className="space-y-1 text-xs text-slate-500">
                  {asset.code && (
                    <div className="flex justify-between">
                      <span>{t("employee.custody.code")}</span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">{asset.code}</span>
                    </div>
                  )}
                  {asset.serialNumber && (
                    <div className="flex justify-between">
                      <span>{t("employee.custody.serialNumber")}</span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">{asset.serialNumber}</span>
                    </div>
                  )}
                  {asset.assignedDate && (
                    <div className="flex justify-between">
                      <span>{t("employee.custody.receiveDate")}</span>
                      <span className="tabular-nums">{formatDate(asset.assignedDate)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

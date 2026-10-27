import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useDateFormat } from "../../../hooks/useDateFormat";
import { Employee } from "./types";
import { SectionCard } from "./ProfileWidgets";

interface ProfileDocumentsTabProps {
  employee: Employee | null;
}

export const ProfileDocumentsTab: React.FC<ProfileDocumentsTabProps> = ({ employee }) => {
  const { t } = useTranslation();
  const { formatDate } = useDateFormat();

  return (
    <div className="mt-0 focus-visible:outline-none">
      <SectionCard icon={DocumentTextIcon} title={t("employee.profile.myDocuments")} accent="indigo">
        {!employee?.documents_rel?.length ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <DocumentTextIcon className="w-10 h-10 text-indigo-500/40" />
            </div>
            <p className="text-slate-500 text-sm">{t("employee.profile.noDocuments")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employee.documents_rel.map((doc, idx) => (
              <motion.div
                key={`${doc.type}-${idx}`}
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/10 dark:from-red-600/30 to-rose-600/10 dark:to-rose-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DocumentTextIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                    {doc.type}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white truncate">{doc.title || doc.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 tabular-nums">
                  {doc.createdAt ? formatDate(doc.createdAt) : "—"}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

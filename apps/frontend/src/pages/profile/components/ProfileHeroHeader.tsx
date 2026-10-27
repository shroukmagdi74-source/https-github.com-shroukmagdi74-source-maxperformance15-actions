import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { Employee, ProfileFormData, MerchantUserExtras } from "./types";
import { getInitials, getStatusConfig } from "./helpers";

interface ProfileHeroHeaderProps {
  user: any;
  employee: Employee | null;
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  saving: boolean;
  uploading: boolean;
  onSave: () => void;
  onAvatarClick: () => void;
}

export const ProfileHeroHeader: React.FC<ProfileHeroHeaderProps> = ({
  user,
  employee,
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  saving,
  uploading,
  onSave,
  onAvatarClick,
}) => {
  const { t } = useTranslation();
  const statusConfig = getStatusConfig(t);
  const userAvatar = (user as typeof user & MerchantUserExtras)?.avatar || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden mb-6 border border-white/[0.06]"
    >
      {/* Cover */}
      <div
        className="relative h-40 sm:h-52"
        style={{
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #1a0533 100%)",
        }}
      >
        {/* Animated shimmer lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(139,92,246,0.15) 40px, rgba(139,92,246,0.15) 41px)",
            }}
          />
        </div>
        {/* Blobs */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 65%)", transform: "translate(30%, -40%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 65%)", transform: "translate(-30%, 40%)" }}
        />

        {/* Actions row top-right */}
        <div className="absolute top-4 left-4">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-2"
              >
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-violet-500/40 disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                  {saving ? t("employee.common.saving") : t("employee.common.save")}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-black/30 hover:bg-black/50 text-white rounded-xl transition-all border border-white/20 backdrop-blur"
                >
                  <XMarkIcon className="w-4 h-4" /> {t("employee.common.cancel")}
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-black/30 hover:bg-black/50 text-white rounded-xl transition-all border border-white/20 backdrop-blur hover:border-violet-400/50"
              >
                <PencilIcon className="w-4 h-4" /> {t("profile.editProfile")}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Avatar + Info row, overlapping cover */}
      <div className="relative px-6 sm:px-8 pb-6 bg-white dark:bg-[#0d0d1a] transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
          {/* Avatar */}
          <div className="relative cursor-pointer group shrink-0" onClick={onAvatarClick}>
            <div
              className="absolute -inset-1.5 rounded-2xl opacity-80 blur-md"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            />
            <div className="relative">
              {employee?.avatar || userAvatar ? (
                <img
                  src={employee?.avatar || userAvatar}
                  alt="avatar"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-violet-500/40"
                />
              ) : (
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center border-2 border-violet-500/30"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6d28d9 100%)" }}
                >
                  <span className="text-white font-black text-3xl sm:text-4xl">
                    {getInitials(formData.firstName, formData.lastName)}
                  </span>
                </div>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-violet-400" />
              </div>
            )}
            {!uploading && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 rounded-2xl transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center gap-1">
                  <CameraIcon className="w-6 h-6 text-white" />
                  <span className="text-[10px] text-white/90 font-semibold">{t("employee.profile.updateAvatar")}</span>
                </div>
              </div>
            )}
            <span className="absolute -bottom-1 -left-1 w-4 h-4 bg-emerald-400 border-2 border-white dark:border-[#0d0d1a] rounded-full shadow shadow-emerald-500/60 transition-colors duration-300" />
          </div>

          {/* Name & role */}
          <div className="flex-1 pt-2 sm:pt-0 sm:pb-1 text-slate-900 dark:text-white">
            {isEditing ? (
              <div className="flex gap-2 mb-2 flex-wrap">
                <input
                  value={formData.firstName}
                  onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                  className="px-3 py-2 text-lg font-bold rounded-xl border border-violet-500/40 bg-violet-50 dark:bg-violet-950/40 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 outline-none w-36"
                  placeholder={t("employee.profile.firstNamePlaceholder")}
                />
                <input
                  value={formData.lastName}
                  onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                  className="px-3 py-2 text-lg font-bold rounded-xl border border-violet-500/40 bg-violet-50 dark:bg-violet-950/40 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 outline-none w-36"
                  placeholder={t("employee.profile.lastNamePlaceholder")}
                />
              </div>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1.5 transition-colors">
                {formData.firstName} {formData.lastName}
              </h1>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                const currentStatus = employee?.status ? statusConfig[employee.status] : null;
                if (!currentStatus) return null;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ring-1 ring-inset ${currentStatus.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot} animate-pulse`} />
                    {currentStatus.label}
                  </span>
                );
              })()}
              <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                <BriefcaseIcon className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                {employee?.position?.title || t("employee.profile.employeeTitle")}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                <BuildingOfficeIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                {employee?.department?.name || t("employee.profile.noDepartment")}
              </span>
              {employee?.employeeNumber && (
                <span className="font-mono text-xs bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-lg border border-violet-200 dark:border-violet-500/20">
                  #{employee.employeeNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

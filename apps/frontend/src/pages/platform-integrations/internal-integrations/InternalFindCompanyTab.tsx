import React from "react";
import { useTranslation } from "react-i18next";
import {
  BuildingOfficeIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export interface InternalFindCompanyTabProps {
  userCompanyId?: string;
  searchId: string;
  setSearchId: (id: string) => void;
  searching: boolean;
  copied: boolean;
  onCopyCompanyId: () => void;
  onSendRequest: () => void;
}

export const InternalFindCompanyTab: React.FC<InternalFindCompanyTabProps> = ({
  userCompanyId,
  searchId,
  setSearchId,
  searching,
  copied,
  onCopyCompanyId,
  onSendRequest,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-2xl mx-auto py-8 space-y-6">
      {/* Company ID Card */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <BuildingOfficeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {t("platform.k_51")}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
          <code
            className="flex-1 text-sm font-mono text-gray-900 dark:text-white dir-ltr text-left break-all tabular-nums"
            style={{ direction: "ltr" }}
          >
            {userCompanyId || "—"}
          </code>
          <button
            onClick={onCopyCompanyId}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors shrink-0"
          >
            <ClipboardDocumentIcon className="w-3.5 h-3.5" />
            {copied ? t("platform.k_52") : t("platform.k_53")}
          </button>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          {t("platform.k_104")}
        </p>
      </div>

      <h3 className="text-lg font-semibold text-center">
        {t("platform.k_54")}
      </h3>
      <div className="space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder={t("platform.k_55")}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 outline-none placeholder:text-right"
            dir="rtl"
          />
        </div>
        <button
          onClick={onSendRequest}
          disabled={searching || !searchId}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {searching ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            t("platform.k_56")
          )}
        </button>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl">
          <p className="text-xs text-yellow-800 dark:text-yellow-400">
            {t("platform.k_105")}
          </p>
        </div>
      </div>
    </div>
  );
};

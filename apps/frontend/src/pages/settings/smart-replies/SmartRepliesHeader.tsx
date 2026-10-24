import React from "react";
import { useTranslation } from "react-i18next";
import {
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export interface SmartRepliesHeaderProps {
  onBack: () => void;
  onAddTemplate: () => void;
}

export function SmartRepliesHeader({
  onBack,
  onAddTemplate,
}: SmartRepliesHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-5 sm:mb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -mr-1 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            title={t("smartReplies.back") || "رجوع"}
            aria-label={t("smartReplies.back") || "رجوع"}
          >
            <ArrowLeftIcon className="h-5 w-5 rtl:rotate-180" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                <ChatBubbleLeftRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <span className="truncate">
                {t("smartReplies.pageTitle") || "الردود التلقائية الذكية"}
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 hidden sm:block truncate">
              {t("smartReplies.pageSubtitle") ||
                "إدارة وتعديل قوالب الردود التلقائية ورسائل خدمة العملاء الموجهة للعملاء"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddTemplate}
          className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <PlusIcon className="h-4 w-4" />
          <span>{t("smartReplies.addRule") || "إضافة قالب جديد"}</span>
        </button>
      </div>
    </div>
  );
}

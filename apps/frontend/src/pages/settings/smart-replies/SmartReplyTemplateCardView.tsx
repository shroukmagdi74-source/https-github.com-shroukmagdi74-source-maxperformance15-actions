import React from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { SmartReplyChannelBadges } from "./SmartReplyChannelBadges";
import type { AutoReplyTemplate } from "./types";

export interface SmartReplyTemplateCardViewProps {
  template: AutoReplyTemplate;
  expandedResponses: Record<string, boolean>;
  onEdit: (template: AutoReplyTemplate) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (templateId: string, idx: number) => void;
}

export function SmartReplyTemplateCardView({
  template,
  expandedResponses,
  onEdit,
  onDelete,
  onToggleExpand,
}: SmartReplyTemplateCardViewProps) {
  const { t } = useTranslation();

  return (
    <div className="p-3.5 sm:p-5 hover:bg-gray-50/60 dark:hover:bg-gray-750/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        {/* Main Info */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-start">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                {template.name || "قالب رد تلقائي"}
              </h3>
              <SmartReplyChannelBadges channels={template.channels} />
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold font-mono tabular-nums bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                {template.keywords.length} كلمات
              </span>
              {template.responses.length > 1 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold font-mono tabular-nums bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  {template.responses.length} بدائل
                </span>
              )}
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex sm:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => onEdit(template)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 active:scale-95 border border-indigo-200 dark:border-indigo-800/80 rounded-lg transition-colors cursor-pointer"
                title="تعديل القالب"
              >
                <PencilIcon className="h-3.5 w-3.5" />
                <span>تعديل</span>
              </button>
              {!template.isDefault && (
                <button
                  type="button"
                  onClick={() => onDelete(template.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 active:scale-95 border border-red-200 dark:border-red-800/70 rounded-lg transition-colors cursor-pointer"
                  title="حذف القالب"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Keywords Chips */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold ml-1">
              الكلمات الدالة:
            </span>
            {template.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-md text-[11px] font-medium border border-gray-200/60 dark:border-gray-600/50"
              >
                {kw}
              </span>
            ))}
          </div>

          {/* Responses */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              نص الرد التلقائي:
            </div>

            {template.responses.map((resp, idx) => {
              const lines = resp.split("\n");
              const isLong = resp.length > 140 || lines.length > 3;
              const isExpanded = !!expandedResponses[`${template.id}_${idx}`];

              return (
                <div
                  key={idx}
                  className="relative p-3 bg-slate-50/90 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-right transition-all"
                  dir="rtl"
                >
                  {template.responses.length > 1 && (
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      الرد البديل {idx + 1}:
                    </div>
                  )}

                  <div
                    className={`text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-sans whitespace-pre-wrap break-words dir-rtl text-right ${
                      isLong && !isExpanded
                        ? "line-clamp-3 max-h-20 overflow-hidden"
                        : ""
                    }`}
                  >
                    {resp}
                  </div>

                  {isLong && (
                    <button
                      type="button"
                      onClick={() => onToggleExpand(template.id, idx)}
                      className="mt-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUpIcon className="w-3.5 h-3.5" />
                          <span>عرض أقل</span>
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className="w-3.5 h-3.5" />
                          <span className="font-mono tabular-nums">
                            عرض النص بالكامل ({lines.length} أسطر)
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-2 self-start shrink-0 pt-1">
          <button
            type="button"
            onClick={() => onEdit(template)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/80 rounded-xl transition-colors shadow-xs cursor-pointer active:scale-95"
            title="تعديل القالب والردود والكلمات المفتاحية"
          >
            <PencilIcon className="h-4 w-4" />
            <span>{t("smartReplies.edit") || "تعديل"}</span>
          </button>

          {!template.isDefault && (
            <button
              type="button"
              onClick={() => onDelete(template.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/70 rounded-xl transition-colors cursor-pointer active:scale-95"
              title="حذف القالب"
            >
              <TrashIcon className="h-4 w-4" />
              <span>{t("smartReplies.delete") || "حذف"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useTranslation } from "react-i18next";
import {
  CheckIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ALL_CHANNELS,
  DEFAULT_CHANNELS,
  type AutoReplyTemplate,
  type SmartReplyChannel,
} from "./types";

export interface SmartReplyTemplateCardEditProps {
  template: AutoReplyTemplate;
  isCreatingNew: boolean;
  newKeyword: string;
  saving: boolean;
  onUpdateTemplate: (updates: Partial<AutoReplyTemplate>) => void;
  onNewKeywordChange: (val: string) => void;
  onAddKeyword: () => void;
  onRemoveKeyword: (idx: number) => void;
  onResponseChange: (idx: number, val: string) => void;
  onAddResponse: () => void;
  onRemoveResponse: (idx: number) => void;
  onToggleChannel: (channelId: SmartReplyChannel) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function SmartReplyTemplateCardEdit({
  template,
  isCreatingNew,
  newKeyword,
  saving,
  onUpdateTemplate,
  onNewKeywordChange,
  onAddKeyword,
  onRemoveKeyword,
  onResponseChange,
  onAddResponse,
  onRemoveResponse,
  onToggleChannel,
  onSave,
  onCancel,
}: SmartReplyTemplateCardEditProps) {
  const { t } = useTranslation();
  const targetChannels =
    Array.isArray(template.channels) && template.channels.length > 0
      ? template.channels
      : DEFAULT_CHANNELS;

  return (
    <div className="p-3.5 sm:p-6 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-4 border-y-2 border-indigo-500/40 relative">
      {/* Edit Header */}
      <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
            {isCreatingNew ? (
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </span>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">
            {isCreatingNew
              ? "إضافة قالب رد تلقائي جديد"
              : t("smartReplies.editTemplate") || "تعديل القالب"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {isCreatingNew ? "قالب جديد" : "جاري التعديل"}
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors cursor-pointer"
            title="إلغاء التعديل"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Name Input */}
      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
          {t("smartReplies.ruleName") || "اسم القالب / التصنيف"}
        </label>
        <input
          type="text"
          value={template.name}
          onChange={(e) => onUpdateTemplate({ name: e.target.value })}
          className="w-full px-3.5 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          placeholder="مثال: رسالة الترحيب، أسعار الشحن، الاستفسار عن المقاسات"
        />
      </div>

      {/* Target Channels */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
            القنوات المستهدفة لهذا القالب
          </label>
          <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">
            {targetChannels.length} قنوات محددة
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 sm:flex-wrap -mx-1 px-1">
          {ALL_CHANNELS.map((channel) => {
            const isSelected = targetChannels.includes(channel.id);
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => onToggleChannel(channel.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 active:scale-95 ${
                  isSelected ? channel.activeClass : channel.inactiveClass
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
                <span>{channel.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keywords */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
            {t("smartReplies.keywords") || "الكلمات المفتاحية الدالة"}
          </label>
          <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">
            {template.keywords.length} كلمة دالة
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[36px] p-2 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl">
          {template.keywords.length === 0 ? (
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
              لم يتم إضافة كلمات دالة بعد
            </span>
          ) : (
            template.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-200 rounded-lg text-xs font-semibold"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => onRemoveKeyword(idx)}
                  className="hover:text-red-500 p-0.5 rounded-full hover:bg-white/40 dark:hover:bg-black/20 transition-colors"
                  title="إزالة الكلمة"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 min-w-0 w-full">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => onNewKeywordChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddKeyword();
              }
            }}
            className="min-w-0 flex-1 px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder={
              t("smartReplies.keywordPlaceholder") ||
              "مثال: السلام عليكم، متوفر، السعر"
            }
          />
          <button
            type="button"
            onClick={onAddKeyword}
            className="shrink-0 px-3.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>إضافة</span>
          </button>
        </div>
      </div>

      {/* Responses */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
            {t("smartReplies.replyContent") || "نصوص الرد التلقائي"}
          </label>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            يدعم الأسطر المتعددة
          </span>
        </div>

        <div className="space-y-3">
          {template.responses.map((resp, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-3.5 bg-white dark:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                <span className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>
                    {template.responses.length > 1
                      ? `الرد البديل رقم ${idx + 1}`
                      : "نص الرد التلقائي"}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono tabular-nums">
                    {resp.length} حرف • {resp.split("\n").length} سطر
                  </span>
                  {template.responses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveResponse(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 inline-flex items-center gap-1 transition-colors"
                      title="حذف هذا الرد البديل"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      <span className="text-xs">حذف</span>
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={Math.min(8, Math.max(3, resp.split("\n").length + 1))}
                value={resp}
                onChange={(e) => onResponseChange(idx, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed whitespace-pre-wrap dir-rtl text-right resize-y transition-all"
                placeholder={
                  t("smartReplies.templatePlaceholder") ||
                  "اكتب نص الرد التلقائي هنا... استخدم Enter لكتابة أسطر مرتبة تحت بعضها"
                }
                dir="rtl"
              />

              {resp.trim().length > 0 && (
                <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-right">
                  <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1 mb-1.5">
                    <EyeIcon className="w-3 h-3" />
                    <span>معاينة شكل الرد للعميل:</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words leading-relaxed font-sans bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-700">
                    {resp}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={onAddResponse}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1.5 p-1 active:scale-95"
          >
            <PlusIcon className="h-4 w-4" />
            <span>
              {t("smartReplies.addAlternativeResponse") ||
                "+ إضافة رد بديل آخر (يتم التبديل عشوائياً بينها)"}
            </span>
          </button>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-16 sm:static z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-2.5 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-indigo-200 dark:border-indigo-800 shadow-lg sm:shadow-none flex items-center justify-between sm:justify-start gap-2.5 pt-3 sm:border-t sm:border-indigo-100 sm:dark:border-indigo-900/50 mt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-97 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
        >
          <CheckIcon className="h-4 w-4" />
          <span>
            {saving
              ? t("smartReplies.saving") || "جاري الحفظ..."
              : t("smartReplies.saveChanges") || "حفظ التعديلات"}
          </span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-97 text-gray-700 dark:text-gray-300 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
          <span>{t("smartReplies.cancel") || "إلغاء"}</span>
        </button>
      </div>
    </div>
  );
}

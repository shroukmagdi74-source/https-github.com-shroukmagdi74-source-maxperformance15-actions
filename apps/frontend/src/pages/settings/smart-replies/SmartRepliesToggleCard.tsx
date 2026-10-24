import React from "react";
import { useTranslation } from "react-i18next";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { ALL_CHANNELS, type SmartReplyChannel } from "./types";

export interface SmartRepliesToggleCardProps {
  enabled: boolean;
  channels: SmartReplyChannel[];
  saving: boolean;
  onToggleEnable: () => void;
  onToggleChannel: (channelId: SmartReplyChannel) => void;
}

export function SmartRepliesToggleCard({
  enabled,
  channels,
  saving,
  onToggleEnable,
  onToggleChannel,
}: SmartRepliesToggleCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-2xl shadow-xs border p-4 sm:p-5 transition-all duration-200 ${
        enabled
          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-600/60 shadow-emerald-500/5"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2 sm:p-2.5 rounded-xl shrink-0 transition-colors ${
              enabled
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400"
                : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
            }`}
          >
            <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">
              {t("smartReplies.enableTitle") || "الردود التلقائية"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden xs:block truncate">
              {enabled
                ? t("smartReplies.enableDesc") ||
                  "القوالب مفعلة وتعمل تلقائياً عند مطابقة الكلمات"
                : t("smartReplies.disabledDesc") ||
                  "الردود التلقائية متوقفة حالياً"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span
            className={`text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1.5 transition-colors ${
              enabled
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                enabled
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-gray-400 dark:bg-gray-500"
              }`}
            />
            {enabled
              ? t("smartReplies.active") || "نشط"
              : t("smartReplies.inactive") || "معطل"}
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={onToggleEnable}
            dir="ltr"
            className={`relative inline-flex h-7 w-12 sm:w-14 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
              enabled
                ? "bg-emerald-600 dark:bg-emerald-500 shadow-xs"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <span className="sr-only">
              {t("smartReplies.enableTitle") || "الردود التلقائية"}
            </span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                enabled ? "translate-x-5 sm:translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Global Channel Selector */}
      <div
        className={`mt-4 pt-3 border-t transition-opacity ${
          enabled
            ? "border-emerald-200/70 dark:border-emerald-800/60"
            : "border-gray-200 dark:border-gray-700 opacity-60"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
              المنصات المدعومة للرد التلقائي:
            </span>
            <span className="text-[11px] text-gray-400 sm:hidden">
              (اسحب للتمرير ↔)
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 sm:flex-wrap -mx-1 px-1">
            {ALL_CHANNELS.map((channel) => {
              const isChannelActive = channels.includes(channel.id);
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => onToggleChannel(channel.id)}
                  disabled={saving}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 active:scale-95 ${
                    isChannelActive
                      ? channel.activeClass
                      : channel.inactiveClass
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isChannelActive
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-gray-400"
                    }`}
                  />
                  <span>{channel.shortLabel}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-black/5 dark:bg-white/10">
                    {isChannelActive ? "مفعل" : "معطل"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

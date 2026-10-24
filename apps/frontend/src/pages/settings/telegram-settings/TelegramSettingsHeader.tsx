import React from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import type { TelegramTab } from "./types";

export interface TelegramSettingsHeaderProps {
  activeTab: TelegramTab;
  setActiveTab: (tab: TelegramTab) => void;
  botsCount: number;
  userbotsCount: number;
  derivedTheme: string;
}

export function TelegramSettingsHeader({
  activeTab,
  setActiveTab,
  botsCount,
  userbotsCount,
  derivedTheme,
}: TelegramSettingsHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
            <PaperAirplaneIcon className="h-6 w-6 transform -rotate-45" />
          </div>
          <div>
            <h1
              className={`text-2xl font-bold ${
                derivedTheme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Telegram Integration
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage Telegram Bots and Userbot client sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className={`flex gap-2 border-b ${
          derivedTheme === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab("bots")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === "bots"
              ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <span>Telegram Bots</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {botsCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("userbots")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === "userbots"
              ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <span>Telegram Userbots</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {userbotsCount}
          </span>
        </button>
      </div>
    </div>
  );
}
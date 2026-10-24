import React from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

export interface TelegramAddBotModalProps {
  showAddForm: boolean;
  onClose: () => void;
  newBotLabel: string;
  setNewBotLabel: (val: string) => void;
  newBotToken: string;
  setNewBotToken: (val: string) => void;
  onConnect: () => void;
  isLoading: boolean;
  derivedTheme: string;
}

export function TelegramAddBotModal({
  showAddForm,
  onClose,
  newBotLabel,
  setNewBotLabel,
  newBotToken,
  setNewBotToken,
  onConnect,
  isLoading,
  derivedTheme,
}: TelegramAddBotModalProps) {
  if (!showAddForm) return null;

  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm transition-all ${
        derivedTheme === "dark"
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2
          className={`text-base font-bold ${
            derivedTheme === "dark" ? "text-white" : "text-slate-900"
          }`}
        >
          Connect New Bot
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
        >
          <XCircleIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className={`block text-xs font-semibold ${
              derivedTheme === "dark" ? "text-slate-300" : "text-slate-700"
            } mb-1`}
          >
            Label (Optional)
          </label>
          <input
            type="text"
            value={newBotLabel}
            onChange={(e) => setNewBotLabel(e.target.value)}
            placeholder="e.g. Sales Bot, Support Team"
            className={`w-full rounded-xl border p-3 text-xs outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${
              derivedTheme === "dark"
                ? "border-slate-700 bg-slate-800 text-white placeholder-slate-500"
                : "border-slate-300 bg-white text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
        <div>
          <label
            className={`block text-xs font-semibold ${
              derivedTheme === "dark" ? "text-slate-300" : "text-slate-700"
            } mb-1`}
          >
            Bot API Token <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newBotToken}
            onChange={(e) => setNewBotToken(e.target.value)}
            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
            className={`w-full rounded-xl border p-3 font-mono text-xs outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${
              derivedTheme === "dark"
                ? "border-slate-700 bg-slate-800 text-white placeholder-slate-500"
                : "border-slate-300 bg-white text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onConnect}
            disabled={isLoading || !newBotToken}
            className={`flex-1 rounded-xl py-2.5 text-xs font-semibold text-white transition-all ${
              isLoading || !newBotToken
                ? "cursor-not-allowed bg-sky-300 dark:bg-sky-900/50"
                : "bg-sky-600 hover:bg-sky-700 shadow-xs"
            }`}
          >
            {isLoading ? "Connecting..." : "Connect Bot"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
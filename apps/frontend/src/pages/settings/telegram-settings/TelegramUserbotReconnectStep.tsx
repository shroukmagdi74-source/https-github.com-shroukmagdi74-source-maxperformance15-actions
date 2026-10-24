import React from "react";

export interface TelegramUserbotReconnectStepProps {
  newUserbotLabel: string;
  newUserbotPhone: string;
  setNewUserbotPhone: (val: string) => void;
  isLoading: boolean;
  onStartConnection: () => void;
  onResetForm: () => void;
  derivedTheme: string;
}

export function TelegramUserbotReconnectStep({
  newUserbotLabel,
  newUserbotPhone,
  setNewUserbotPhone,
  isLoading,
  onStartConnection,
  onResetForm,
  derivedTheme,
}: TelegramUserbotReconnectStepProps) {
  return (
    <>
      <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
        <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
          Enter your phone number to receive a login code for <strong>{newUserbotLabel}</strong>.
          <span className="block mt-1 text-[11px] text-slate-500">
            API Credentials are already safely stored.
          </span>
        </p>
      </div>
      <div>
        <label
          className={`block text-xs font-semibold ${
            derivedTheme === "dark" ? "text-slate-300" : "text-slate-700"
          } mb-1`}
        >
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={newUserbotPhone}
          onChange={(e) => setNewUserbotPhone(e.target.value)}
          placeholder="+1234567890"
          className={`w-full rounded-xl border p-3 font-mono text-xs outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
            derivedTheme === "dark"
              ? "border-slate-700 bg-slate-800 text-white placeholder-slate-500"
              : "border-slate-300 bg-white text-slate-900 placeholder-slate-400"
          }`}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onStartConnection}
          disabled={isLoading || !newUserbotPhone}
          className={`flex-1 rounded-xl py-2.5 text-xs font-semibold text-white transition-all ${
            isLoading || !newUserbotPhone
              ? "cursor-not-allowed bg-emerald-300 dark:bg-emerald-900/50"
              : "bg-emerald-600 hover:bg-emerald-700 shadow-xs"
          }`}
        >
          {isLoading ? "Sending Code..." : "Send Login Code"}
        </button>
        <button
          type="button"
          onClick={onResetForm}
          disabled={isLoading}
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </>
  );
}
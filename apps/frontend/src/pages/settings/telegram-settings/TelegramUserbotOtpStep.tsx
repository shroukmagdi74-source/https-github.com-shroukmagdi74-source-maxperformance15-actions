import React from "react";

export interface TelegramUserbotOtpStepProps {
  verificationCode: string;
  setVerificationCode: (val: string) => void;
  isLoading: boolean;
  onVerifyCode: () => void;
  onResetForm: () => void;
  derivedTheme: string;
}

export function TelegramUserbotOtpStep({
  verificationCode,
  setVerificationCode,
  isLoading,
  onVerifyCode,
  onResetForm,
  derivedTheme,
}: TelegramUserbotOtpStepProps) {
  return (
    <>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
        <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
          We&apos;ve sent a verification code to your Telegram account (not SMS). Please check your Telegram app messages.
        </p>
      </div>
      <div>
        <label
          className={`block text-xs font-semibold ${
            derivedTheme === "dark" ? "text-slate-300" : "text-slate-700"
          } mb-1`}
        >
          Verification Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="12345"
          maxLength={5}
          className={`w-full rounded-xl border p-3 text-center font-mono text-base tracking-widest outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
            derivedTheme === "dark"
              ? "border-slate-700 bg-slate-800 text-white placeholder-slate-500"
              : "border-slate-300 bg-white text-slate-900 placeholder-slate-400"
          }`}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onVerifyCode}
          disabled={isLoading || !verificationCode}
          className={`flex-1 rounded-xl py-2.5 text-xs font-semibold text-white transition-all ${
            isLoading || !verificationCode
              ? "cursor-not-allowed bg-emerald-300 dark:bg-emerald-900/50"
              : "bg-emerald-600 hover:bg-emerald-700 shadow-xs"
          }`}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
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
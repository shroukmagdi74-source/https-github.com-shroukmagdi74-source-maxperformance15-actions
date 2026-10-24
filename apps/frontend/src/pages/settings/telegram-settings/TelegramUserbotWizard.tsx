import React from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import type { TelegramConnectionStep } from "./types";
import { TelegramUserbotInitStep } from "./TelegramUserbotInitStep";
import { TelegramUserbotOtpStep } from "./TelegramUserbotOtpStep";
import { TelegramUserbotReconnectStep } from "./TelegramUserbotReconnectStep";
import { TelegramUserbot2faStep } from "./TelegramUserbot2faStep";

export interface TelegramUserbotWizardProps {
  showAddUserbotForm: boolean;
  connectionStep: TelegramConnectionStep;
  newUserbotLabel: string;
  setNewUserbotLabel: (val: string) => void;
  newUserbotApiId: string;
  setNewUserbotApiId: (val: string) => void;
  newUserbotApiHash: string;
  setNewUserbotApiHash: (val: string) => void;
  newUserbotPhone: string;
  setNewUserbotPhone: (val: string) => void;
  verificationCode: string;
  setVerificationCode: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showApiHash: boolean;
  setShowApiHash: (val: boolean) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  isLoading: boolean;
  onStartConnection: () => void;
  onVerifyCode: () => void;
  onResetForm: () => void;
  derivedTheme: string;
}

export function TelegramUserbotWizard({
  showAddUserbotForm,
  connectionStep,
  newUserbotLabel,
  setNewUserbotLabel,
  newUserbotApiId,
  setNewUserbotApiId,
  newUserbotApiHash,
  setNewUserbotApiHash,
  newUserbotPhone,
  setNewUserbotPhone,
  verificationCode,
  setVerificationCode,
  password,
  setPassword,
  showApiHash,
  setShowApiHash,
  showPassword,
  setShowPassword,
  isLoading,
  onStartConnection,
  onVerifyCode,
  onResetForm,
  derivedTheme,
}: TelegramUserbotWizardProps) {
  if (!showAddUserbotForm) return null;

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
          {connectionStep === "INIT" && "Add New Userbot"}
          {connectionStep === "RECONNECT_PHONE" && "Reconnect Userbot"}
          {connectionStep === "OTP" && "Verify Phone Number"}
          {connectionStep === "2FA" && "Two-Step Verification"}
        </h2>
        <button
          type="button"
          onClick={onResetForm}
          aria-label="Close"
          className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
        >
          <XCircleIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-4">
        {connectionStep === "INIT" && (
          <TelegramUserbotInitStep
            newUserbotLabel={newUserbotLabel}
            setNewUserbotLabel={setNewUserbotLabel}
            newUserbotApiId={newUserbotApiId}
            setNewUserbotApiId={setNewUserbotApiId}
            newUserbotApiHash={newUserbotApiHash}
            setNewUserbotApiHash={setNewUserbotApiHash}
            newUserbotPhone={newUserbotPhone}
            setNewUserbotPhone={setNewUserbotPhone}
            showApiHash={showApiHash}
            setShowApiHash={setShowApiHash}
            isLoading={isLoading}
            onStartConnection={onStartConnection}
            onResetForm={onResetForm}
            derivedTheme={derivedTheme}
          />
        )}

        {connectionStep === "OTP" && (
          <TelegramUserbotOtpStep
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            isLoading={isLoading}
            onVerifyCode={onVerifyCode}
            onResetForm={onResetForm}
            derivedTheme={derivedTheme}
          />
        )}

        {connectionStep === "RECONNECT_PHONE" && (
          <TelegramUserbotReconnectStep
            newUserbotLabel={newUserbotLabel}
            newUserbotPhone={newUserbotPhone}
            setNewUserbotPhone={setNewUserbotPhone}
            isLoading={isLoading}
            onStartConnection={onStartConnection}
            onResetForm={onResetForm}
            derivedTheme={derivedTheme}
          />
        )}

        {connectionStep === "2FA" && (
          <TelegramUserbot2faStep
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            onVerifyCode={onVerifyCode}
            onResetForm={onResetForm}
            derivedTheme={derivedTheme}
          />
        )}
      </div>
    </div>
  );
}
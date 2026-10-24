import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import type { TelegramUserbot, TelegramConnectionStep } from "./types";
import { TelegramUserbotWizard } from "./TelegramUserbotWizard";

export interface TelegramUserbotsTabProps {
  userbots: TelegramUserbot[];
  isLoading: boolean;
  showAddUserbotForm: boolean;
  setShowAddUserbotForm: (show: boolean) => void;
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
  onStartConnection: () => void;
  onAskReconnect: (userbot: TelegramUserbot) => void;
  onVerifyCode: () => void;
  onDeleteUserbot: (userbotId: string) => void;
  onToggleInbox: (userbot: TelegramUserbot) => void;
  onResetForm: () => void;
  derivedTheme: string;
}

export function TelegramUserbotsTab({
  userbots,
  isLoading,
  showAddUserbotForm,
  setShowAddUserbotForm,
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
  onStartConnection,
  onAskReconnect,
  onVerifyCode,
  onDeleteUserbot,
  onToggleInbox,
  onResetForm,
  derivedTheme,
}: TelegramUserbotsTabProps) {
  return (
    <div className="space-y-6">
      {!showAddUserbotForm && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowAddUserbotForm(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
          >
            <UserIcon className="h-4 w-4" />
            <span>+ Add New Userbot</span>
          </button>
        </div>
      )}

      {/* Helper Banner */}
      <div
        className={`rounded-2xl border p-4 ${
          derivedTheme === "dark"
            ? "border-emerald-900/60 bg-emerald-950/20 text-emerald-300"
            : "border-emerald-100 bg-emerald-50/60 text-emerald-800"
        }`}
      >
        <p className="text-xs leading-relaxed">
          Connect your personal Telegram accounts to manage chats directly from the platform.
          Obtain your API credentials from{" "}
          <a
            href="https://my.telegram.org/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline transition hover:text-emerald-600"
          >
            my.telegram.org/apps
          </a>
          .
        </p>
      </div>

      {/* Userbots List */}
      <div className="space-y-3">
        {userbots.length === 0 && !showAddUserbotForm && (
          <div
            className={`rounded-2xl border-2 border-dashed py-12 text-center ${
              derivedTheme === "dark"
                ? "border-slate-800 bg-slate-900/40 text-slate-400"
                : "border-slate-200 bg-slate-50/60 text-slate-500"
            }`}
          >
            <UserIcon className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Userbots Connected
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Add your first Telegram userbot session to handle direct conversations.
            </p>
            <button
              type="button"
              onClick={() => setShowAddUserbotForm(true)}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Add Userbot
            </button>
          </div>
        )}

        {userbots.map((userbot) => (
          <div
            key={userbot.id}
            className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border p-4 shadow-xs transition-colors ${
              derivedTheme === "dark"
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200/80 bg-white"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  derivedTheme === "dark"
                    ? "bg-emerald-950/50 text-emerald-400"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h3
                  className={`text-sm font-bold ${
                    derivedTheme === "dark" ? "text-white" : "text-slate-900"
                  }`}
                >
                  {userbot.label || "Telegram Userbot"}
                </h3>
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500">
                  <span className="font-mono tabular-nums">
                    API ID: {userbot.apiId ? `***${userbot.apiId.slice(-4)}` : "Not set"}
                  </span>
                  {userbot.sessionString ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Connected
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      Not Connected
                    </span>
                  )}
                  {userbot.inboxEnabled && userbot.sessionString && (
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                      Inbox
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {userbot.sessionString && (
                <button
                  type="button"
                  onClick={() => onToggleInbox(userbot)}
                  className={`rounded-xl px-3 py-1.5 font-mono text-[10px] font-bold transition-colors ${
                    userbot.inboxEnabled
                      ? "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {userbot.inboxEnabled ? "Inbox ON" : "Inbox OFF"}
                </button>
              )}
              {!userbot.sessionString && (
                <button
                  type="button"
                  onClick={() => onAskReconnect(userbot)}
                  disabled={isLoading}
                  className="rounded-xl border border-sky-200 px-3.5 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-50 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-950/30"
                >
                  Connect
                </button>
              )}
              <button
                type="button"
                onClick={() => onDeleteUserbot(userbot.id)}
                disabled={isLoading}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 dark:border-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <TelegramUserbotWizard
        showAddUserbotForm={showAddUserbotForm}
        connectionStep={connectionStep}
        newUserbotLabel={newUserbotLabel}
        setNewUserbotLabel={setNewUserbotLabel}
        newUserbotApiId={newUserbotApiId}
        setNewUserbotApiId={setNewUserbotApiId}
        newUserbotApiHash={newUserbotApiHash}
        setNewUserbotApiHash={setNewUserbotApiHash}
        newUserbotPhone={newUserbotPhone}
        setNewUserbotPhone={setNewUserbotPhone}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        password={password}
        setPassword={setPassword}
        showApiHash={showApiHash}
        setShowApiHash={setShowApiHash}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isLoading={isLoading}
        onStartConnection={onStartConnection}
        onVerifyCode={onVerifyCode}
        onResetForm={onResetForm}
        derivedTheme={derivedTheme}
      />
    </div>
  );
}
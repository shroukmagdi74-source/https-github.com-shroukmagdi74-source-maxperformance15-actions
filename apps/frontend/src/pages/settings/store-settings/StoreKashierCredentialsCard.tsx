import React, { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const PAYMENT_CARD_CLS =
  "bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-5 shadow-sm";
const PAYMENT_LABEL_CLS =
  "block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5";
const PAYMENT_INPUT_CLS =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-gray-900 placeholder:text-slate-400 shadow-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30";

export interface KashierGatewayConfig {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  mode: "test" | "live";
}

interface StoreKashierCredentialsCardProps {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isConfigured: boolean;
  gatewayConfig: KashierGatewayConfig;
  handleConfigChange: (key: string, value: string) => void;
  handleDelete: () => void;
}

export const StoreKashierCredentialsCard: React.FC<StoreKashierCredentialsCardProps> = ({
  isEditing,
  setIsEditing,
  isConfigured,
  gatewayConfig,
  handleConfigChange,
  handleDelete,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  if (isEditing) {
    return (
      <div className={PAYMENT_CARD_CLS}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
              بيانات الاعتماد (Credentials)
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              أدخل مفاتيح التاجر من لوحة تحكم Kashier.
            </p>
          </div>
          {isConfigured && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              إلغاء التعديل
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={PAYMENT_LABEL_CLS}>Merchant ID</label>
            <input
              type="text"
              value={gatewayConfig.merchantId}
              onChange={(e) =>
                handleConfigChange("merchantId", e.target.value)
              }
              className={PAYMENT_INPUT_CLS}
              placeholder="MID-XXXX-XXX"
            />
          </div>
          <div>
            <label className={PAYMENT_LABEL_CLS}>API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={gatewayConfig.apiKey}
                onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                className={`${PAYMENT_INPUT_CLS} pl-10 font-mono`}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                dir="ltr"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowApiKey((prev) => !prev)}
                className="absolute inset-y-0 left-0 px-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label={showApiKey ? "إخفاء المفتاح" : "إظهار المفتاح"}
              >
                {showApiKey ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className={PAYMENT_LABEL_CLS}>Secret Key</label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                value={gatewayConfig.secretKey}
                onChange={(e) =>
                  handleConfigChange("secretKey", e.target.value)
                }
                className={`${PAYMENT_INPUT_CLS} pl-10 font-mono`}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                dir="ltr"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowSecretKey((prev) => !prev)}
                className="absolute inset-y-0 left-0 px-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label={showSecretKey ? "إخفاء المفتاح" : "إظهار المفتاح"}
              >
                {showSecretKey ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className={PAYMENT_LABEL_CLS}>الوضع</label>
            <select
              value={gatewayConfig.mode}
              onChange={(e) => handleConfigChange("mode", e.target.value)}
              className={PAYMENT_INPUT_CLS}
            >
              <option value="test">Test (Sandbox)</option>
              <option value="live">Live</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={PAYMENT_CARD_CLS}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            بيانات الاعتماد (Credentials)
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            تفاصيل الاتصال النشط ببوابة دفع Kashier.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-900 transition-colors"
          >
            <PencilIcon className="w-3.5 h-3.5" />
            تعديل البيانات
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-950/30 transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            إزالة الإعدادات
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 block">
            Merchant ID
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800/80 inline-block">
            {gatewayConfig.merchantId}
          </span>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 block">
            الوضع (Mode)
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg inline-block uppercase ${
              gatewayConfig.mode === "live"
                ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50"
                : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
            }`}
          >
            {gatewayConfig.mode === "live" ? "Live" : "Test (Sandbox)"}
          </span>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 block">
            API Key
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800/80 inline-block">
            {gatewayConfig.apiKey}
          </span>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 block">
            Secret Key
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800/80 inline-block">
            {gatewayConfig.secretKey}
          </span>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { InformationCircleIcon, KeyIcon } from "@heroicons/react/24/outline";

interface TurboApiKeyCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  hasApiKey: boolean;
  maskedApiKey: string;
  showApiKey: boolean;
  apiKey: string;
  saving: boolean;
  onToggleShowApiKey: () => void;
  onChangeApiKey: (key: string) => void;
  onTestConnection: () => void;
}

export const TurboApiKeyCard: React.FC<TurboApiKeyCardProps> = ({
  t,
  hasApiKey,
  maskedApiKey,
  showApiKey,
  apiKey,
  saving,
  onToggleShowApiKey,
  onChangeApiKey,
  onTestConnection,
}) => {
  return (
    <div className="border-t dark:border-gray-700 pt-6">
      <div className="flex items-center mb-4">
        <KeyIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 ml-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Turbo API Key
        </h3>
      </div>

      <div className="space-y-4">
        {hasApiKey && maskedApiKey && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t("turbo.k_27")}
            </p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded tabular-nums">
                {maskedApiKey}
              </code>
              <button
                type="button"
                onClick={onToggleShowApiKey}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                {showApiKey ? t("turbo.k_14") : t("turbo.k_15")}
              </button>
            </div>
          </div>
        )}

        {(showApiKey || !hasApiKey) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {hasApiKey ? t("turbo.k_16") : "Turbo API Key"}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onChangeApiKey(e.target.value)}
              placeholder={t("turbo.k_17")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t("turbo.k_28")}{" "}
              <a
                href="https://portal.turbo-eg.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t("turbo.k_29")}
              </a>
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onTestConnection}
          disabled={saving || (!apiKey && !hasApiKey)}
          className="inline-flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          <InformationCircleIcon className="h-4 w-4 ml-1" />
          {t("turbo.k_30")}
        </button>
      </div>
    </div>
  );
};

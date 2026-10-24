import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  FireIcon,
  FunnelIcon,
  InformationCircleIcon,
  KeyIcon,
  PlayCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { ExternalLinkIcon } from './ClarityLogo';
import { ClarityValidationErrors } from './types';
import { StorefrontSettings } from '../../../services/storefrontSettingsService';

interface ClarityCredentialsCardProps {
  settings: StorefrontSettings | null;
  clarityProjectId: string;
  isConnected: boolean;
  hasSaved: boolean;
  copied: boolean;
  saving: boolean;
  validationErrors: ClarityValidationErrors;
  clarityDashboardUrl: string;
  onProjectIdChange: (value: string) => void;
  onApiTokenChange: (value: string) => void;
  onCopyId: () => void;
  onSave: () => void;
  onDisconnect: () => void;
}

export const ClarityCredentialsCard: React.FC<ClarityCredentialsCardProps> = ({
  settings,
  clarityProjectId,
  isConnected,
  hasSaved,
  copied,
  saving,
  validationErrors,
  clarityDashboardUrl,
  onProjectIdChange,
  onApiTokenChange,
  onCopyId,
  onSave,
  onDisconnect,
}) => {
  const { t } = useTranslation();

  const helperId = 'clarityProjectIdHelp';
  const helperTokenId = 'clarityApiTokenHelp';
  const errorId = 'clarityProjectIdError';
  const errorTokenId = 'clarityApiTokenError';

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="space-y-6 p-6">
        <div>
          <label
            htmlFor="clarityProjectId"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Clarity Project ID
          </label>
          <div className="flex overflow-hidden rounded-lg border border-gray-300 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-600 divide-x rtl:divide-x-reverse">
            <span className="inline-flex items-center bg-gray-50 px-3 text-sm text-gray-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-400">
              ID
            </span>
            <input
              type="text"
              id="clarityProjectId"
              value={clarityProjectId}
              onChange={(e) => onProjectIdChange(e.target.value)}
              className="min-w-0 flex-1 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder-gray-400 dark:bg-slate-900 dark:text-white"
              placeholder={t('clarity.projectIdPlaceholder', 'مثال: k3a9mz1b')}
              dir="ltr"
              aria-describedby={validationErrors.projectId ? errorId : helperId}
              aria-invalid={Boolean(validationErrors.projectId)}
              maxLength={10}
            />
            <button
              type="button"
              onClick={onCopyId}
              aria-label={t('clarity.copyId', 'نسخ الـ ID')}
              tabIndex={clarityProjectId ? 0 : -1}
              className={`inline-flex items-center bg-gray-50 px-3 text-gray-400 transition-all hover:text-gray-600 dark:bg-slate-700 dark:hover:text-gray-300 ${
                clarityProjectId ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              {copied ? (
                <CheckCircleIconSolid className="h-4 w-4 text-green-500" aria-hidden="true" />
              ) : (
                <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {validationErrors.projectId && (
            <p className="mt-1.5 text-xs text-red-600" id={errorId} role="alert">
              {validationErrors.projectId}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400" id={helperId}>
            {t('clarity.projectIdHelp', 'ستجد هذا الـ ID في لوحة Clarity ثم Settings ثم Overview.')}
          </p>
        </div>

        <div>
          <label
            htmlFor="clarityApiToken"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Clarity API Token
          </label>
          <div className="flex overflow-hidden rounded-lg border border-gray-300 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-600 divide-x rtl:divide-x-reverse">
            <span className="inline-flex items-center bg-gray-50 px-3 text-sm text-gray-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-400">
              <KeyIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <input
              type="text"
              id="clarityApiToken"
              value={settings?.clarityApiToken || ''}
              onChange={(e) => onApiTokenChange(e.target.value)}
              className="min-w-0 flex-1 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder-gray-400 dark:bg-slate-900 dark:text-white"
              placeholder={t('clarity.apiTokenPlaceholder', 'JWT API Token')}
              dir="ltr"
              aria-describedby={validationErrors.apiToken ? errorTokenId : helperTokenId}
              aria-invalid={Boolean(validationErrors.apiToken)}
              maxLength={500}
            />
          </div>
          {validationErrors.apiToken && (
            <p className="mt-1.5 text-xs text-red-600" id={errorTokenId} role="alert">
              {validationErrors.apiToken}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400" id={helperTokenId}>
            {t(
              'clarity.apiTokenHelp',
              'من Clarity → Settings → Data Export → Generate new API token. مطلوب لعرض التحليلات في لوحة التحكم.'
            )}
          </p>
        </div>

        <div
          className={`flex items-start gap-3 rounded-lg border p-4 ${
            isConnected
              ? 'border-green-100 bg-green-50 dark:border-green-800/30 dark:bg-green-900/20'
              : 'border-yellow-100 bg-yellow-50 dark:border-yellow-800/30 dark:bg-yellow-900/20'
          }`}
        >
          {isConnected ? (
            <>
              <CheckCircleIcon
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {t('clarity.active', 'Clarity نشط على متجرك')}
                </p>
                <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">
                  {t(
                    'clarity.activeDesc',
                    'يتم الآن تسجيل جلسات الزوار وخرائط الحرارة. قد تظهر البيانات خلال 24 إلى 48 ساعة.'
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <InformationCircleIcon
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  {t('clarity.inactive', 'Clarity غير مفعّل بعد')}
                </p>
                <p className="mt-0.5 text-xs text-yellow-600 dark:text-yellow-400">
                  {t('clarity.inactiveDesc', 'أدخل Project ID أعلاه واحفظ للتفعيل.')}
                </p>
              </div>
            </>
          )}
        </div>

        {isConnected && hasSaved ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={clarityDashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800/40 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
            >
              <ChartBarIcon className="h-4 w-4" aria-hidden="true" />
              {t('clarity.openDashboard', 'فتح لوحة Clarity')}
              <ExternalLinkIcon />
            </a>
            <a
              href={`https://clarity.microsoft.com/projects/view/${clarityProjectId}/heatmaps`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-800/40 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/40"
            >
              <FireIcon className="h-4 w-4" aria-hidden="true" />
              {t('clarity.heatmaps', 'خرائط الحرارة')}
              <ExternalLinkIcon />
            </a>
            <a
              href={`https://clarity.microsoft.com/projects/view/${clarityProjectId}/recordings`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-800/40 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/40"
            >
              <PlayCircleIcon className="h-4 w-4" aria-hidden="true" />
              {t('clarity.recordings', 'تسجيلات الزوار')}
              <ExternalLinkIcon />
            </a>
            <a
              href={`https://clarity.microsoft.com/projects/view/${clarityProjectId}/funnels`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-800/40 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/40"
            >
              <FunnelIcon className="h-4 w-4" aria-hidden="true" />
              {t('clarity.funnels', 'تحليل المبيعات')}
              <ExternalLinkIcon />
            </a>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
        <a
          href="https://clarity.microsoft.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          {t('clarity.freeService', 'الخدمة مجانية تمامًا من Microsoft')}
          <ExternalLinkIcon />
        </a>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <button
              type="button"
              onClick={onDisconnect}
              disabled={saving}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-800/40 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <XCircleIcon className="h-4 w-4" aria-hidden="true" />
              {t('clarity.disconnect', 'قطع الاتصال')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span
                  className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
                {t('clarity.saving', 'جاري الحفظ...')}
              </>
            ) : (
              <>
                <CheckCircleIconSolid className="h-4 w-4" aria-hidden="true" />
                {t('clarity.save', 'حفظ الإعدادات')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { ClarityLogo } from './ClarityLogo';

interface ClarityHeaderProps {
  isConnected: boolean;
}

export const ClarityHeader: React.FC<ClarityHeaderProps> = ({ isConnected }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <ClarityLogo />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Microsoft Clarity
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('clarity.subtitle', 'افهم زبائنك من خلال خرائط الحرارة وتسجيلات الجلسات مجانًا.')}
          </p>
        </div>
      </div>

      <div
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
          isConnected
            ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-400'
            : 'border-gray-200 bg-gray-100 text-gray-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-400'
        }`}
      >
        {isConnected ? (
          <>
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            {t('clarity.connected', 'متصل والتتبع نشط')}
          </>
        ) : (
          <>
            <XCircleIcon className="h-4 w-4" aria-hidden="true" />
            {t('clarity.disconnected', 'غير متصل')}
          </>
        )}
      </div>
    </div>
  );
};

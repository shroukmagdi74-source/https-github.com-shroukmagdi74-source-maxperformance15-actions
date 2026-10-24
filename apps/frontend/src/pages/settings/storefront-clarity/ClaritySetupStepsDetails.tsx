import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowTopRightOnSquareIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { SETUP_STEPS, USEFUL_LINKS } from './constants';

interface ClaritySetupStepsDetailsProps {
  hasSaved: boolean;
}

export const ClaritySetupStepsDetails: React.FC<ClaritySetupStepsDetailsProps> = ({ hasSaved }) => {
  const { t } = useTranslation();

  return (
    <details
      className="group rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
      open={!hasSaved}
    >
      <summary className="flex cursor-pointer items-center gap-2 p-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
        <InformationCircleIcon className="h-5 w-5 text-indigo-500" aria-hidden="true" />
        {t('clarity.setupSteps', 'خطوات الربط')}
      </summary>
      <div className="space-y-3 border-t border-gray-100 px-4 pb-4 pt-3 dark:border-slate-700">
        {SETUP_STEPS.map((step) => (
          <div
            key={step.step}
            className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div
              className={`${step.color} flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white`}
            >
              {step.step}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {t(step.titleKey, step.title)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {t(step.descKey, step.desc)}
              </p>
              {step.link ? (
                <a
                  href={step.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  {t(step.linkTextKey!, step.linkText!)}
                  <ArrowTopRightOnSquareIcon className="h-3 w-3 rtl:scale-x-[-1]" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('clarity.usefulLinks', 'روابط مفيدة')}
          </p>
          <div className="space-y-2">
            {USEFUL_LINKS.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 flex-shrink-0 rtl:scale-x-[-1]" aria-hidden="true" />
                {t(link.labelKey, link.label)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
};

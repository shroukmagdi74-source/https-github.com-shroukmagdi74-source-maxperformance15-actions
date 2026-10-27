import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, X as XMarkIcon } from 'lucide-react';
import {
  RadiologyExamType,
  RadiologyExamAddition,
  MODAL_INPUT_CLS,
} from '../../shared';
import { ScheduleForm } from '../types';

interface ExamSelectionSectionProps {
  modal: ScheduleForm;
  onModalChange: (form: ScheduleForm) => void;
  examSearch: string;
  onExamSearchChange: (val: string) => void;
  examOpen: boolean;
  setExamOpen: (val: boolean) => void;
  examFiltered: RadiologyExamType[];
  examTypes: RadiologyExamType[];
  onToggleExam: (id: string) => void;
  coverage: Record<
    string,
    { covered: boolean; entityPrice?: number | null; basePrice?: number }
  >;
  entityPrice: number | null;
  additions: RadiologyExamAddition[];
  insuranceCompanies: { id: string; name: string }[];
  labelCls: string;
}

export const ExamSelectionSection: React.FC<ExamSelectionSectionProps> = ({
  modal,
  examSearch,
  onExamSearchChange,
  examOpen,
  setExamOpen,
  examFiltered,
  examTypes,
  onToggleExam,
  coverage,
  entityPrice,
  additions,
  insuranceCompanies,
  labelCls,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="sm:col-span-2 relative">
        <label className={labelCls}>
          {t('radiology.schedule.examTypes')} ({modal.examTypeIds.length})
        </label>
        <div className="relative">
          <input
            className={`${MODAL_INPUT_CLS} pl-8`}
            value={examSearch}
            onChange={e => {
              onExamSearchChange(e.target.value);
              setExamOpen(true);
            }}
            onFocus={() => setExamOpen(true)}
            onBlur={() => setExamOpen(false)}
            placeholder={t('radiology.schedule.searchExam')}
          />
          <ChevronDown className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
          {examOpen ? (
            <div
              className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl"
              onMouseDown={e => e.preventDefault()}
            >
              {examFiltered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t('radiology.schedule.noExams')}
                </div>
              ) : (
                examFiltered.slice(0, 60).map(et => {
                  const selected = modal.examTypeIds.includes(et.id);
                  return (
                    <button
                      key={et.id}
                      type="button"
                      onClick={() => onToggleExam(et.id)}
                      className={`block w-full text-right px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between gap-2 ${
                        selected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="font-medium">{et.name}</span>
                        {et.category ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {' '}
                            ({et.category})
                          </span>
                        ) : null}
                      </span>
                      {selected ? (
                        <span className="text-xs text-blue-600 dark:text-blue-400 shrink-0">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          ) : null}
        </div>

        {modal.examTypeIds.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {modal.examTypeIds.map(id => {
              const et = examTypes.find(t => t.id === id);
              const cov = coverage[id];
              return (
                <span
                  key={id}
                  className={`flex items-center gap-1.5 text-xs border dark:border-gray-600 rounded-full px-2.5 py-1 ${
                    cov && !cov.covered
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  <span className="font-medium">{et?.name || '—'}</span>
                  {cov && !cov.covered ? (
                    <span className="text-[10px] font-semibold">
                      {t('radiology.schedule.notCovered')}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onToggleExam(id)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Remove exam"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls}>{t('radiology.schedule.priceLabel')}</label>
        <div className="rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300 tabular-nums">
            {(() => {
              const exams = modal.examTypeIds
                .map(id => examTypes.find(t => t.id === id))
                .filter(Boolean);
              const base = exams.reduce((s, et) => {
                const cov = coverage[et?.id || ''];
                const price =
                  entityPrice !== null && modal.examTypeIds[0] === et?.id
                    ? entityPrice
                    : cov && cov.entityPrice != null
                      ? cov.entityPrice
                      : et
                        ? Number(et.price) || 0
                        : 0;
                return s + price;
              }, 0);
              const add = additions
                .filter(a => modal.additionIds.includes(a.id))
                .reduce((s, a) => s + a.price, 0);
              return `${Number(base + add).toFixed(0)} ${t('radiology.currency')}${
                entityPrice !== null
                  ? ` (${t('radiology.schedule.tariffSuffix', {
                      name:
                        insuranceCompanies.find(c => c.id === modal.insuranceCompanyId)?.name ||
                        t('radiology.schedule.insuranceOptional'),
                    })})`
                  : ''
              }`;
            })()}
          </span>
        </div>
      </div>
    </>
  );
};

export default ExamSelectionSection;

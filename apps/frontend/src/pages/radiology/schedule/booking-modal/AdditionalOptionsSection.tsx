import React from 'react';
import { useTranslation } from 'react-i18next';
import { RadiologyExamAddition, MODAL_INPUT_CLS } from '../../shared';
import { ScheduleForm } from '../types';

interface AdditionalOptionsSectionProps {
  modal: ScheduleForm;
  onModalChange: (form: ScheduleForm) => void;
  additions: RadiologyExamAddition[];
  patientFlags: { value: string; label: string }[];
  labelCls: string;
}

export const AdditionalOptionsSection: React.FC<AdditionalOptionsSectionProps> = ({
  modal,
  onModalChange,
  additions,
  patientFlags,
  labelCls,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {additions.length > 0 ? (
        <div className="sm:col-span-2">
          <label className={labelCls}>{t('radiology.schedule.examAdditions')}</label>
          <div className="flex flex-wrap gap-2">
            {additions.map(a => (
              <label
                key={a.id}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 border dark:border-gray-600 rounded-lg px-3 py-1.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={modal.additionIds.includes(a.id)}
                  onChange={() =>
                    onModalChange({
                      ...modal,
                      additionIds: modal.additionIds.includes(a.id)
                        ? modal.additionIds.filter(x => x !== a.id)
                        : [...modal.additionIds, a.id],
                    })
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                {a.name} ({Number(a.price).toFixed(0)} {t('radiology.currency')})
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div className="sm:col-span-2 flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={modal.emergency}
            onChange={e => onModalChange({ ...modal, emergency: e.target.checked })}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          {t('radiology.schedule.emergencyCase')}
        </label>
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls}>{t('radiology.schedule.medicalRiskFlags')}</label>
        <div className="flex flex-wrap gap-2">
          {patientFlags.map(f => (
            <label
              key={f.value}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 border dark:border-gray-600 rounded-lg px-3 py-1.5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={modal.patientFlags.includes(f.value)}
                onChange={() =>
                  onModalChange({
                    ...modal,
                    patientFlags: modal.patientFlags.includes(f.value)
                      ? modal.patientFlags.filter(x => x !== f.value)
                      : [...modal.patientFlags, f.value],
                  })
                }
                className="rounded border-gray-300 dark:border-gray-600"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls}>{t('radiology.schedule.notes')}</label>
        <input
          className={MODAL_INPUT_CLS}
          value={modal.notes}
          onChange={e => onModalChange({ ...modal, notes: e.target.value })}
        />
      </div>
    </>
  );
};

export default AdditionalOptionsSection;

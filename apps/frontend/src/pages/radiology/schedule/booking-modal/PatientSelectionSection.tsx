import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { MODAL_INPUT_CLS } from '../../shared';
import { ScheduleForm } from '../types';
import type { PatientSearchResult, NewPatientFormState } from './types';
import { InlineNewPatientForm } from './InlineNewPatientForm';

interface PatientSelectionSectionProps {
  modal: ScheduleForm;
  onModalChange: (form: ScheduleForm) => void;
  patientSearch: string;
  onPatientSearchChange: (val: string) => void;
  patientResults: PatientSearchResult[];
  onPickPatient: (patient: any) => void;
  newPatientOpen: boolean;
  onOpenNewPatient: () => void;
  onCloseNewPatient: () => void;
  newPatient: NewPatientFormState;
  onNewPatientChange: (p: any) => void;
  savingNewPatient: boolean;
  onSaveNewPatient: () => void;
  onOpenCardScanner: () => void;
  labelCls: string;
}

export const PatientSelectionSection: React.FC<PatientSelectionSectionProps> = ({
  modal,
  onModalChange,
  patientSearch,
  onPatientSearchChange,
  patientResults,
  onPickPatient,
  newPatientOpen,
  onOpenNewPatient,
  onCloseNewPatient,
  newPatient,
  onNewPatientChange,
  savingNewPatient,
  onSaveNewPatient,
  onOpenCardScanner,
  labelCls,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="sm:col-span-2 relative">
        <div className="flex items-center justify-between">
          <label className={labelCls}>{t('radiology.schedule.patientRequired')}</label>
          <button
            type="button"
            onClick={onOpenNewPatient}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mb-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {t('radiology.schedule.addNewPatient')}
          </button>
        </div>
        <input
          className={MODAL_INPUT_CLS}
          value={patientSearch || modal.patientName}
          onChange={e => {
            const v = e.target.value;
            onPatientSearchChange(v);
            onModalChange({
              ...modal,
              patientId: '',
              patientName: v,
              patientPhone: v ? modal.patientPhone : '',
            });
          }}
          placeholder={t('radiology.schedule.searchPatient')}
        />
        {patientSearch.trim() && (
          <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl">
            {patientResults.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t('radiology.schedule.noResults')}
              </div>
            ) : (
              patientResults.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPickPatient(p)}
                  className="block w-full text-right px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span className="font-medium">
                    {p.firstName} {p.lastName || ''}
                  </span>
                  {p.phone ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400"> — {p.phone}</span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        )}

        {newPatientOpen ? (
          <InlineNewPatientForm
            newPatient={newPatient}
            onNewPatientChange={onNewPatientChange}
            savingNewPatient={savingNewPatient}
            onSaveNewPatient={onSaveNewPatient}
            onCloseNewPatient={onCloseNewPatient}
            onOpenCardScanner={onOpenCardScanner}
            labelCls={labelCls}
          />
        ) : null}
      </div>

      <div>
        <label className={labelCls}>{t('radiology.schedule.phone')}</label>
        <input
          className={MODAL_INPUT_CLS}
          dir="ltr"
          value={modal.patientPhone}
          onChange={e => onModalChange({ ...modal, patientPhone: e.target.value })}
        />
      </div>

      <div>
        <label className={labelCls}>{t('radiology.schedule.age')}</label>
        <input
          className={MODAL_INPUT_CLS}
          dir="ltr"
          value={modal.patientAge}
          onChange={e => onModalChange({ ...modal, patientAge: e.target.value })}
          placeholder={t('radiology.schedule.agePlaceholder')}
        />
      </div>
    </>
  );
};

export default PatientSelectionSection;

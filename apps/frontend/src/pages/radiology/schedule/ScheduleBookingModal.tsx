import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, X as XMarkIcon, Zap } from 'lucide-react';
import { MODAL_CONTENT_CLS } from '../shared';
import type { ScheduleBookingModalProps } from './booking-modal/types';
import {
  PatientSelectionSection,
  ExamSelectionSection,
  PayerSelectionSection,
  DeviceAndTimingSection,
  AdditionalOptionsSection,
} from './booking-modal';

export const ScheduleBookingModal: React.FC<ScheduleBookingModalProps> = ({
  modal,
  saving,
  onClose,
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
  referralSources,
  externalPartners,
  marketingReps,
  devices,
  items,
  initialPayment,
  onInitialPaymentChange,
  physicianSearch,
  onPhysicianSearchChange,
  physicianResults,
  onPickPhysician,
  patientFlags,
  onSave,
  onReceiveAndCreate,
}) => {
  const { t } = useTranslation();

  if (!modal) return null;

  const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1';

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
    >
      <div
        className={`${MODAL_CONTENT_CLS} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {modal.id
              ? t('radiology.schedule.editBooking')
              : modal.status === 'CHECKED_IN'
                ? t('radiology.schedule.walkInModal')
                : t('radiology.schedule.newBookingModal')}
          </h3>
          <button
            onClick={() => !saving && onClose()}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg dark:text-gray-300"
            aria-label={t('radiology.cancel') as string}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PatientSelectionSection
            modal={modal}
            onModalChange={onModalChange}
            patientSearch={patientSearch}
            onPatientSearchChange={onPatientSearchChange}
            patientResults={patientResults}
            onPickPatient={onPickPatient}
            newPatientOpen={newPatientOpen}
            onOpenNewPatient={onOpenNewPatient}
            onCloseNewPatient={onCloseNewPatient}
            newPatient={newPatient}
            onNewPatientChange={onNewPatientChange}
            savingNewPatient={savingNewPatient}
            onSaveNewPatient={onSaveNewPatient}
            onOpenCardScanner={onOpenCardScanner}
            labelCls={labelCls}
          />

          <ExamSelectionSection
            modal={modal}
            onModalChange={onModalChange}
            examSearch={examSearch}
            onExamSearchChange={onExamSearchChange}
            examOpen={examOpen}
            setExamOpen={setExamOpen}
            examFiltered={examFiltered}
            examTypes={examTypes}
            onToggleExam={onToggleExam}
            coverage={coverage}
            entityPrice={entityPrice}
            additions={additions}
            insuranceCompanies={insuranceCompanies}
            labelCls={labelCls}
          />

          <PayerSelectionSection
            modal={modal}
            onModalChange={onModalChange}
            insuranceCompanies={insuranceCompanies}
            referralSources={referralSources}
            externalPartners={externalPartners}
            marketingReps={marketingReps}
            labelCls={labelCls}
          />

          <DeviceAndTimingSection
            modal={modal}
            onModalChange={onModalChange}
            devices={devices}
            items={items}
            coverage={coverage}
            initialPayment={initialPayment}
            onInitialPaymentChange={onInitialPaymentChange}
            physicianSearch={physicianSearch}
            onPhysicianSearchChange={onPhysicianSearchChange}
            physicianResults={physicianResults}
            onPickPhysician={onPickPhysician}
            marketingReps={marketingReps}
            labelCls={labelCls}
          />

          <AdditionalOptionsSection
            modal={modal}
            onModalChange={onModalChange}
            additions={additions}
            patientFlags={patientFlags}
            labelCls={labelCls}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded-lg disabled:opacity-50"
          >
            {t('radiology.cancel')}
          </button>
          {!modal.id && modal.status === 'CHECKED_IN' ? (
            <>
              <button
                onClick={onReceiveAndCreate}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {t('radiology.receptionFlow.receiveAndCreate')}
              </button>
              <button
                onClick={() => onSave(true)}
                disabled={saving}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {t('radiology.schedule.saveAndConvert')}
              </button>
            </>
          ) : (
            <button
              onClick={() => onSave(false)}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('radiology.save')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleBookingModal;

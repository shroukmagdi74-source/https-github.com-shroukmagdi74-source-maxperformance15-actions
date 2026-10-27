import React from 'react';
import { useTranslation } from 'react-i18next';
import { MODAL_INPUT_CLS } from '../../shared';
import { ScheduleForm } from '../types';

interface PayerSelectionSectionProps {
  modal: ScheduleForm;
  onModalChange: (form: ScheduleForm) => void;
  insuranceCompanies: { id: string; name: string }[];
  referralSources: { id: string; name: string }[];
  externalPartners: { id: string; name: string }[];
  marketingReps: { id: string; name: string }[];
  labelCls: string;
}

export const PayerSelectionSection: React.FC<PayerSelectionSectionProps> = ({
  modal,
  onModalChange,
  insuranceCompanies,
  referralSources,
  externalPartners,
  marketingReps,
  labelCls,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <label className={labelCls}>{t('radiology.schedule.payer')}</label>
        <select
          className={MODAL_INPUT_CLS}
          value={modal.payerType}
          onChange={e => {
            const pt = e.target.value;
            onModalChange({
              ...modal,
              payerType: pt,
              insuranceCompanyId: pt === 'INSURANCE' ? modal.insuranceCompanyId : '',
              referralSourceId: pt === 'REFERRAL' ? modal.referralSourceId : '',
              externalPartnerId: pt === 'PARTNER' ? modal.externalPartnerId : '',
            });
          }}
        >
          <option value="CUSTOMER">{t('radiology.schedule.payerCustomer')}</option>
          <option value="INSURANCE">{t('radiology.schedule.payerInsurance')}</option>
          <option value="REFERRAL">{t('radiology.schedule.payerReferral')}</option>
          <option value="PARTNER">{t('radiology.schedule.payerPartner')}</option>
        </select>
      </div>

      {modal.payerType === 'INSURANCE' ? (
        <div>
          <label className={labelCls}>{t('radiology.schedule.insuranceCompany')}</label>
          <select
            className={MODAL_INPUT_CLS}
            value={modal.insuranceCompanyId}
            onChange={e =>
              onModalChange({
                ...modal,
                insuranceCompanyId: e.target.value,
              })
            }
          >
            <option value="">{t('radiology.schedule.insuranceCompanyPlaceholder')}</option>
            {insuranceCompanies.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      ) : modal.payerType === 'REFERRAL' ? (
        <div>
          <label className={labelCls}>{t('radiology.schedule.referralSource')}</label>
          <select
            className={MODAL_INPUT_CLS}
            value={modal.referralSourceId}
            onChange={e => {
              const sid = e.target.value;
              const src = referralSources.find(s => s.id === sid) as
                | { id: string; name: string; marketingRepId?: string | null }
                | undefined;
              const hasPhysicianRep = modal.referringPhysicianId && modal.marketingRepId;
              const suggestedRep = hasPhysicianRep
                ? modal.marketingRepId
                : src?.marketingRepId || '';
              const repName = hasPhysicianRep
                ? modal.marketingRepName
                : src?.marketingRepId
                  ? marketingReps.find(r => r.id === src.marketingRepId)?.name || ''
                  : '';
              onModalChange({
                ...modal,
                referralSourceId: sid,
                marketingRepId: suggestedRep,
                marketingRepName: repName,
              });
            }}
          >
            <option value="">{t('radiology.schedule.referralSourcePlaceholder')}</option>
            {referralSources.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      ) : modal.payerType === 'PARTNER' ? (
        <div className="sm:col-span-2">
          <label className={labelCls}>{t('radiology.schedule.externalPartner')}</label>
          <select
            className={MODAL_INPUT_CLS}
            value={modal.externalPartnerId}
            onChange={e =>
              onModalChange({
                ...modal,
                externalPartnerId: e.target.value,
              })
            }
          >
            <option value="">{t('radiology.schedule.externalPartnerPlaceholder')}</option>
            {externalPartners.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <label className={labelCls}>{t('radiology.schedule.paymentDestination')}</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="paymentDestination"
                  checked={modal.paymentDestination !== 'PARTNER'}
                  onChange={() => onModalChange({ ...modal, paymentDestination: 'ME' })}
                  className="accent-blue-600"
                />
                {t('radiology.schedule.destMe')}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="paymentDestination"
                  checked={modal.paymentDestination === 'PARTNER'}
                  onChange={() => onModalChange({ ...modal, paymentDestination: 'PARTNER' })}
                  className="accent-blue-600"
                />
                {t('radiology.schedule.destPartner')}
              </label>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default PayerSelectionSection;

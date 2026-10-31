import React from 'react';
import { Car, FileText } from 'lucide-react';
import QuantitySelector from '../../components/QuantitySelector';
import { EGYPT_GOVERNORATES } from '../../../constants/egyptGovernorates';
import type { PdpQuickOrderController } from './usePdpQuickOrderController';

export const QuickOrderFields: React.FC<{
  ctrl: PdpQuickOrderController;
}> = ({ ctrl }) => {
  return (
    <>
      {ctrl.showQuantityBlock ? (
        <div className={ctrl.quantitySurfaceClassName}>
          <div>
            <p className="text-sm font-semibold text-foreground">{ctrl.quantityLabel}</p>
          </div>
          <QuantitySelector value={ctrl.quantity} onChange={ctrl.setQuantity} />
        </div>
      ) : null}

      <div
        className={
          ctrl.isCompactMergedQuickOrder
            ? 'space-y-3'
            : ctrl.isMenShoesQuickOrder
              ? 'space-y-3'
              : 'space-y-4'
        }
      >
        {ctrl.effectiveFullNameField.enabled || ctrl.effectivePhoneField.enabled ? (
          <div className={ctrl.contactFieldsGridClassName}>
            {ctrl.effectiveFullNameField.enabled ? (
              <label className={ctrl.fieldStackClassName}>
                <span className={ctrl.fieldLabelClassName}>{ctrl.fullNameLabel}</span>
                <input
                  type="text"
                  name="customerName"
                  value={ctrl.formData.customerName || ''}
                  onChange={ctrl.handleFieldChange}
                  className={ctrl.resolvedInputClassName}
                  autoComplete="name"
                  placeholder={
                    ctrl.isMenShoesQuickOrder || ctrl.isKhemetLuxeQuickOrder
                      ? ctrl.prefersArabicCopy
                        ? 'الاسم'
                        : 'Name'
                      : ctrl.prefersArabicCopy
                        ? 'مثال: محمد أحمد'
                        : 'John Doe'
                  }
                />
              </label>
            ) : null}

            {ctrl.effectivePhoneField.enabled ? (
              <label className={ctrl.fieldStackClassName}>
                <span className={ctrl.fieldLabelClassName}>{ctrl.phoneLabel}</span>
                <input
                  type="tel"
                  name="phone"
                  value={ctrl.formData.phone || ''}
                  onChange={ctrl.handleFieldChange}
                  className={ctrl.resolvedInputClassName}
                  autoComplete="tel"
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {ctrl.customAttributes && ctrl.customAttributes.length > 0 ? (
          <div className="space-y-3">
            {ctrl.customAttributes.map((attr: any) => {
              const isCarAttr =
                attr.label?.includes('سيار') ||
                attr.key?.toLowerCase().includes('car') ||
                attr.key === 'car_model' ||
                ctrl.isRedlineAutoQuickOrder;

              if (isCarAttr) {
                return (
                  <div
                    key={attr.key}
                    className="rounded-xl border border-red-200/90 bg-red-50/40 p-3.5 dark:border-red-900/40 dark:bg-red-950/20 space-y-2 shadow-xs transition-colors focus-within:border-red-500 focus-within:bg-red-50/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                        <Car className="h-4 w-4 text-red-600 shrink-0" />
                        <span>
                          {attr.label ||
                            (ctrl.prefersArabicCopy
                              ? 'نوع وموديل وسنة صنع السيارة'
                              : 'Car Model & Year')}
                        </span>
                        {attr.required && (
                          <span className="text-red-500 font-bold">*</span>
                        )}
                      </span>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700 dark:bg-red-900/50 dark:text-red-300">
                        {ctrl.prefersArabicCopy ? 'تفصيل بالمللي' : 'Custom fit'}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={ctrl.customAttributeValues[attr.key] || ''}
                      onChange={(e) =>
                        ctrl.handleCustomAttributeChange(attr.key, e.target.value)
                      }
                      className={`${ctrl.resolvedInputClassName} bg-white dark:bg-slate-900 font-medium`}
                      placeholder={
                        attr.placeholder ||
                        (ctrl.prefersArabicCopy
                          ? 'مثال: هيونداي توسان 2022، كيا سبورتاج 2020، إلنترا CN7'
                          : 'e.g. Hyundai Tucson 2022, Kia Sportage 2020')
                      }
                    />
                  </div>
                );
              }

              return (
                <label key={attr.key} className={ctrl.fieldStackClassName}>
                  <span className={ctrl.fieldLabelClassName}>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      {attr.label}
                      {attr.required && (
                        <span className="text-red-500 font-bold">*</span>
                      )}
                    </span>
                  </span>
                  <input
                    type="text"
                    value={ctrl.customAttributeValues[attr.key] || ''}
                    onChange={(e) =>
                      ctrl.handleCustomAttributeChange(attr.key, e.target.value)
                    }
                    className={ctrl.resolvedInputClassName}
                    placeholder={
                      attr.placeholder ||
                      (ctrl.prefersArabicCopy
                        ? 'اكتب هنا...'
                        : 'Enter details...')
                    }
                  />
                </label>
              );
            })}
          </div>
        ) : null}

        {ctrl.effectiveGovernorateField.enabled ? (
          <label className={ctrl.fieldStackClassName}>
            <span className={ctrl.fieldLabelClassName}>{ctrl.governorateLabel}</span>
            <div className="relative">
              <select
                name="governorate"
                value={ctrl.normalizedGovValue}
                onChange={ctrl.handleFieldChange}
                className={`${ctrl.resolvedInputClassName} appearance-none pe-10`}
                autoComplete="address-level1"
              >
                <option value="">
                  {ctrl.prefersArabicCopy ? 'اختر المحافظة' : 'Select governorate'}
                </option>
                {EGYPT_GOVERNORATES.map((governorate) => (
                  <option key={governorate.id} value={governorate.nameEn}>
                    {governorate.nameAr}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                ▼
              </span>
            </div>
          </label>
        ) : null}

        {ctrl.effectiveAddressField.enabled ? (
          <label className={ctrl.fieldStackClassName}>
            <span className={ctrl.fieldLabelClassName}>{ctrl.addressLabel}</span>
            <textarea
              name="address"
              value={ctrl.formData.address || ''}
              onChange={ctrl.handleFieldChange}
              rows={
                ctrl.isCompactMergedQuickOrder
                  ? 2
                  : ctrl.isMenShoesQuickOrder || ctrl.isWomenFashionQuickOrder
                    ? 3
                    : 5
              }
              className={`${ctrl.resolvedInputClassName} ${
                ctrl.isCompactMergedQuickOrder
                  ? 'min-h-[64px]'
                  : ctrl.isMenShoesQuickOrder || ctrl.isWomenFashionQuickOrder
                    ? 'min-h-[96px]'
                    : 'min-h-[140px]'
              } resize-y`}
              autoComplete="street-address"
              placeholder={
                ctrl.prefersArabicCopy
                  ? 'الحي، الشارع، رقم العمارة، أقرب علامة مميزة'
                  : 'District, street, building number, nearest landmark'
              }
            />
          </label>
        ) : null}

        {ctrl.effectiveAlternatePhoneField.enabled ? (
          <label className={ctrl.fieldStackClassName}>
            <span className={ctrl.fieldLabelClassName}>{ctrl.alternatePhoneLabel}</span>
            <input
              type="tel"
              value={ctrl.alternatePhone}
              onChange={(event) => ctrl.setAlternatePhone(event.target.value)}
              className={ctrl.resolvedInputClassName}
              autoComplete="tel"
              placeholder="01xxxxxxxxx"
              dir="ltr"
            />
          </label>
        ) : null}
      </div>
    </>
  );
};

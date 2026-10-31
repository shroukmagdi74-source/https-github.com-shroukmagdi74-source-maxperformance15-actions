import React from 'react';
import { fieldIds } from './checkoutFormHelpers';
import type { useCheckoutStore } from '../../store/useCheckoutStore';

export interface CheckoutNotesSectionProps {
  stepWrapperClassName: string;
  stepHeadingClassName: string;
  introTextClassName: string;
  notesTextareaClassName: string;
  notesTitle: string;
  notesOptionalLabel: string;
  notesDescription?: string;
  notesPlaceholder: string;
  notes?: string;
  isButcherCheckout: boolean;
  renderStepNumber: (num: number, color: string) => React.ReactNode;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const CheckoutNotesSection: React.FC<CheckoutNotesSectionProps> = ({
  stepWrapperClassName,
  stepHeadingClassName,
  introTextClassName,
  notesTextareaClassName,
  notesTitle,
  notesOptionalLabel,
  notesDescription,
  notesPlaceholder,
  notes,
  isButcherCheckout,
  renderStepNumber,
  handleChange,
}) => {
  return (
    <div className={stepWrapperClassName}>
      <h2 className={stepHeadingClassName}>
        {renderStepNumber(isButcherCheckout ? 4 : 3, 'bg-yellow-400')}
        {notesTitle}
        <span className="ms-2 text-xs font-normal text-muted-foreground opacity-60">
          {notesOptionalLabel}
        </span>
      </h2>
      <p className={introTextClassName}>{notesDescription}</p>
      <label htmlFor={fieldIds.notes} className="sr-only">
        {notesTitle}
      </label>
      <textarea
        id={fieldIds.notes}
        name="notes"
        value={notes || ''}
        onChange={handleChange}
        placeholder={notesPlaceholder}
        rows={3}
        autoComplete="off"
        className={notesTextareaClassName}
      />
    </div>
  );
};

import React from 'react';
import {
  usePdpQuickOrderController,
  QuickOrderHeaderAndOffer,
  QuickOrderFields,
  QuickOrderSummary,
  QuickOrderPaymentMethods,
  QuickOrderActions,
  type PdpQuickOrderFormProps,
  type PublicOrderResponse,
} from './pdp-quick-order';

export type { PdpQuickOrderFormProps, PublicOrderResponse };

export const PdpQuickOrderForm: React.FC<PdpQuickOrderFormProps> = (props) => {
  const ctrl = usePdpQuickOrderController(props);

  return (
    <div className={ctrl.shellClassName}>
      <div
        className={`mx-auto max-w-3xl ${
          ctrl.isMenShoesQuickOrder || ctrl.isCompactMergedQuickOrder
            ? ctrl.isCompactMergedQuickOrder
              ? 'space-y-3'
              : 'space-y-4'
            : 'space-y-5'
        }`}
      >
        <QuickOrderHeaderAndOffer ctrl={ctrl} />

        {!ctrl.shouldCollapseFormUntilSelectionReady ? (
          <>
            <QuickOrderFields ctrl={ctrl} />
            <QuickOrderSummary ctrl={ctrl} />
            <QuickOrderPaymentMethods ctrl={ctrl} />
            <QuickOrderActions ctrl={ctrl} />
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PdpQuickOrderForm;

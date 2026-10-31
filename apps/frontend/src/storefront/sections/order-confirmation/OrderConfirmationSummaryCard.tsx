import React from 'react';
import OrderStepTimeline from '../../components/OrderStepTimeline';
import type { PcHubStatusExperience, TimelineStep } from './types';

interface OrderConfirmationSummaryCardProps {
  summaryPanelClassName: string;
  accentOverlineClassName: string;
  orderNumberPrefix: string;
  visibleOrderNumber: string;
  statusPillClassName: string;
  statusPulseClassName: string;
  statusDotClassName: string;
  isPcHub: boolean;
  statusLabel: string;
  isOfferAccepted: boolean;
  showTimeline: boolean;
  pcHubStatusExperience: PcHubStatusExperience | null;
  timelineLabels?: Record<TimelineStep, string>;
}

export const OrderConfirmationSummaryCard: React.FC<OrderConfirmationSummaryCardProps> = ({
  summaryPanelClassName,
  accentOverlineClassName,
  orderNumberPrefix,
  visibleOrderNumber,
  statusPillClassName,
  statusPulseClassName,
  statusDotClassName,
  isPcHub,
  statusLabel,
  isOfferAccepted,
  showTimeline,
  pcHubStatusExperience,
  timelineLabels,
}) => {
  return (
    <div className={summaryPanelClassName}>
      <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-border/40 pb-8 md:flex-row">
        <div className="text-start">
          <p className={`mb-1 text-xs font-black uppercase tracking-[0.2em] ${accentOverlineClassName}`}>
            {orderNumberPrefix}
          </p>
          <p className="font-mono text-3xl font-black text-foreground tabular-nums">#{visibleOrderNumber}</p>
        </div>
        <div className={statusPillClassName}>
          <span className="relative flex h-2 w-2">
            <span className={statusPulseClassName} />
            <span className={statusDotClassName} />
          </span>
          <span className={`text-xs font-bold ${isPcHub ? 'text-current' : 'text-foreground'}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {isOfferAccepted ? (
        <div className="rounded-2xl border border-emerald-300/80 bg-emerald-500/10 p-4 sm:p-5 text-emerald-950 dark:text-emerald-100 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold">
            ✓
          </div>
          <div className="space-y-0.5">
            <h3 className="font-black text-sm sm:text-base text-emerald-900 dark:text-emerald-200">
              🎉 رائع! تمت إضافة العرض الخاص بنجاح إلى شحنتك
            </h3>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
              تم تحديث بيانات طلبك وسيتم تجهيز وشحن العرض الإضافي داخل نفس الطرد.
            </p>
          </div>
        </div>
      ) : null}

      {showTimeline ? (
        <OrderStepTimeline
          currentStep={pcHubStatusExperience?.timelineStep || 'placed'}
          labels={timelineLabels}
        />
      ) : null}

      {isPcHub && pcHubStatusExperience ? (
        <div className={pcHubStatusExperience.spotlightCardClassName}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <span className={pcHubStatusExperience.spotlightBadgeClassName}>
                {pcHubStatusExperience.spotlightEyebrow}
              </span>
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight text-foreground">
                  {pcHubStatusExperience.spotlightTitle}
                </h3>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  {pcHubStatusExperience.spotlightDescription}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-[20rem] lg:justify-end">
              {pcHubStatusExperience.chips.map((chip) => (
                <span key={chip} className={pcHubStatusExperience.chipClassName}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OrderConfirmationSummaryCard;

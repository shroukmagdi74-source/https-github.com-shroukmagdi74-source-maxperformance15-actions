import React from 'react';
import { formatStorefrontCurrency } from '../../utils/currency';
import type { PdpQuickOrderController } from './usePdpQuickOrderController';

export const QuickOrderActions: React.FC<{
  ctrl: PdpQuickOrderController;
}> = ({ ctrl }) => {
  return (
    <>
      {ctrl.isOutOfStock ? (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {ctrl.prefersArabicCopy
            ? '⚠️ نفدت كمية هذا المنتج حاليًا وغير متاح للطلب الآن.'
            : '⚠️ This product is currently out of stock.'}
        </div>
      ) : null}

      {ctrl.shouldRenderActionArea ? (
        <div
          className={`${
            ctrl.isCompactMergedQuickOrder ? 'pt-1' : 'pt-2'
          } ${
            ctrl.isKhemetMergedBuyboxQuickOrder
              ? 'grid grid-cols-2 gap-2'
              : ctrl.isPrimaryQuantityOfferDecision
                ? 'grid gap-3'
                : 'grid gap-3 sm:grid-cols-2'
          }`}
        >
          {ctrl.showAddToCartButton ? (
            <button
              type="button"
              onClick={ctrl.handleAddToCart}
              disabled={ctrl.isOutOfStock || ctrl.isSubmitting}
              className={`${ctrl.addToCartButtonClassName} ${
                ctrl.isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {ctrl.addToCartLabel}
            </button>
          ) : null}

          {ctrl.shouldShowInlineSubmitButton ? (
            <button
              type="button"
              onClick={() => {
                void ctrl.handleSubmit();
              }}
              disabled={ctrl.isSubmitting || ctrl.minimumOrder.blocked || ctrl.isOutOfStock}
              className={ctrl.submitButtonClassName}
            >
              {ctrl.isSubmitting
                ? ctrl.paymentMethod === 'card'
                  ? ctrl.prefersArabicCopy
                    ? 'جارٍ التحويل لبوابة الدفع...'
                    : 'Redirecting to payment gateway...'
                  : ctrl.prefersArabicCopy
                    ? 'جارٍ إرسال الطلب...'
                    : 'Submitting order...'
                : ctrl.minimumOrderSubmitLabel}
            </button>
          ) : null}
        </div>
      ) : null}

      {ctrl.isKhemetMergedBuyboxQuickOrder && ctrl.shouldRenderActionArea ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-medium text-[#6f5a54]">
          <span className="inline-flex items-center gap-1.5">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            {ctrl.prefersArabicCopy ? 'الدفع عند الاستلام متاح' : 'Cash on delivery available'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {ctrl.prefersArabicCopy ? 'تأكيد قبل الشحن' : 'Confirm before shipping'}
          </span>
        </div>
      ) : null}

      {ctrl.shouldShowMobileStickySubmitBar ? (
        <div className="sm:hidden">
          <div className="h-20" aria-hidden="true" />
          <div
            className={`fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-3 shadow-[0_-18px_40px_-28px_rgba(0,0,0,0.2)] backdrop-blur ${
              ctrl.isRedlineAutoQuickOrder
                ? 'border-slate-200 bg-white/95 supports-[backdrop-filter]:bg-white/88 dark:border-slate-800 dark:bg-slate-950/95'
                : ctrl.isSoleaMergedBuyboxQuickOrder
                  ? 'border-[#ead8cf] bg-[#fffdfb]/95 supports-[backdrop-filter]:bg-[#fffdfb]/88'
                  : 'border-[#ead8cf] bg-white/95 supports-[backdrop-filter]:bg-white/88'
            }`}
          >
            <div className="mx-auto flex max-w-md items-center gap-3 pb-[calc(env(safe-area-inset-bottom)+0.85rem)]">
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[11px] font-semibold ${
                    ctrl.isRedlineAutoQuickOrder
                      ? 'text-slate-500 dark:text-slate-400'
                      : ctrl.isSoleaMergedBuyboxQuickOrder
                        ? 'text-[#8d6a66]'
                        : 'text-[#8d6a66]'
                  }`}
                >
                  {ctrl.totalLabel}
                </p>
                <p
                  className={`truncate text-sm font-black ${
                    ctrl.isRedlineAutoQuickOrder
                      ? 'text-red-600 dark:text-red-400 tabular-nums'
                      : ctrl.isSoleaMergedBuyboxQuickOrder
                        ? 'text-[#2f232d]'
                        : 'text-[#3f2432]'
                  }`}
                >
                  {formatStorefrontCurrency(ctrl.total, ctrl.currency)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void ctrl.handleSubmit();
                }}
                disabled={ctrl.isSubmitting || ctrl.minimumOrder.blocked || ctrl.isOutOfStock}
                className={`${ctrl.submitButtonClassName} min-h-[3.15rem] min-w-[9.75rem] px-5`}
              >
                {ctrl.isSubmitting
                  ? ctrl.paymentMethod === 'card'
                    ? ctrl.prefersArabicCopy
                      ? 'جارٍ التحويل...'
                      : 'Redirecting...'
                    : ctrl.prefersArabicCopy
                      ? 'جارٍ الإرسال...'
                      : 'Submitting...'
                  : ctrl.minimumOrderSubmitLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

import React from 'react';
import { formatStorefrontCurrency } from '../../utils/currency';
import type { PdpQuickOrderController } from './usePdpQuickOrderController';

export const QuickOrderPaymentMethods: React.FC<{
  ctrl: PdpQuickOrderController;
}> = ({ ctrl }) => {
  if (!ctrl.walletEnabled && !ctrl.isCardActive) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
          {ctrl.prefersArabicCopy ? 'طريقة الدفع' : 'Payment method'}
        </span>
        <div className="flex flex-wrap gap-2">
          {ctrl.isCodActive ? (
            <button
              type="button"
              onClick={() => ctrl.setPaymentMethod('cod')}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                ctrl.paymentMethod === 'cod'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-emerald-300 bg-white text-emerald-800 dark:border-emerald-700 dark:bg-gray-900 dark:text-emerald-200'
              }`}
            >
              {ctrl.prefersArabicCopy ? 'الدفع عند الاستلام' : 'Cash on delivery'}
            </button>
          ) : null}
          {ctrl.walletEnabled ? (
            <button
              type="button"
              onClick={() => ctrl.setPaymentMethod('wallet')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                ctrl.paymentMethod === 'wallet'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-emerald-300 bg-white text-emerald-800 dark:border-emerald-700 dark:bg-gray-900 dark:text-emerald-200'
              }`}
            >
              <span>{ctrl.prefersArabicCopy ? 'الدفع بالمحفظة' : 'Wallet payment'}</span>
              {ctrl.walletDiscountEnabled &&
              ctrl.walletDiscountPercent > 0 &&
              ctrl.walletPaymentSettings?.showDiscountBadge !== false ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    ctrl.paymentMethod === 'wallet'
                      ? 'bg-white text-emerald-800'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                  }`}
                >
                  <span>🏷️</span>
                  <span>خصم {ctrl.walletDiscountPercent}%</span>
                </span>
              ) : null}
            </button>
          ) : null}
          {ctrl.isCardActive ? (
            <button
              type="button"
              onClick={() => ctrl.setPaymentMethod('card')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                ctrl.paymentMethod === 'card'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-emerald-300 bg-white text-emerald-800 dark:border-emerald-700 dark:bg-gray-900 dark:text-emerald-200'
              }`}
            >
              <span>💳 {ctrl.prefersArabicCopy ? 'بطاقة بنكية / فيزا' : 'Card'}</span>
              {ctrl.walletDiscountEnabled &&
              ctrl.walletDiscountPercent > 0 &&
              ctrl.walletPaymentSettings?.showDiscountBadge !== false ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    ctrl.paymentMethod === 'card'
                      ? 'bg-white text-emerald-800'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                  }`}
                >
                  <span>🏷️</span>
                  <span>خصم {ctrl.walletDiscountPercent}%</span>
                </span>
              ) : null}
            </button>
          ) : null}
        </div>
      </div>

      {ctrl.walletDiscountEnabled &&
      ctrl.walletDiscountPercent > 0 &&
      ctrl.paymentMethod === 'cod' ? (
        <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          💡{' '}
          {ctrl.prefersArabicCopy
            ? ctrl.isCardActive && !ctrl.walletEnabled
              ? `وفّر ${ctrl.walletDiscountPercent}% فوراً عند اختيار الدفع بالبطاقة البنكية / فيزا (الدفع عند الاستلام متاح بالسعر الأصلي بدون خصم)`
              : `وفّر ${ctrl.walletDiscountPercent}% فوراً عند اختيار الدفع الإلكتروني المسبق (الدفع عند الاستلام متاح بالسعر الأصلي بدون خصم)`
            : `Save ${ctrl.walletDiscountPercent}% instantly by choosing card payment (Cash on delivery is regular price without discount)`}
        </p>
      ) : null}

      {ctrl.paymentMethod === 'card' ? (
        <div className="space-y-2 rounded-xl border border-emerald-300/80 bg-white/80 p-3.5 shadow-xs dark:border-emerald-800/60 dark:bg-emerald-950/40">
          {ctrl.walletDiscount > 0 ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-100/90 px-3 py-1.5 text-xs font-bold text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100">
              <span className="flex items-center gap-1.5">
                <span>🎉</span>
                <span>
                  {ctrl.prefersArabicCopy
                    ? `تم تطبيق خصم الفيزا (${ctrl.walletDiscountPercent}%) بنجاح!`
                    : `Card discount (${ctrl.walletDiscountPercent}%) applied!`}
                </span>
              </span>
              <span className="text-emerald-700 dark:text-emerald-300">
                {ctrl.prefersArabicCopy
                  ? `وفّرت ${formatStorefrontCurrency(ctrl.walletDiscount, ctrl.currency)}`
                  : `Saved ${formatStorefrontCurrency(ctrl.walletDiscount, ctrl.currency)}`}
              </span>
            </div>
          ) : null}
          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
            🔒{' '}
            {ctrl.prefersArabicCopy
              ? 'دفع إلكتروني آمن بالبطاقة (فيزا / ماستركارد / ميزة)'
              : 'Secure Card Payment (Visa / Mastercard / Meeza)'}
          </p>
          <p className="text-[11.5px] leading-relaxed text-emerald-800 dark:text-emerald-200">
            {ctrl.prefersArabicCopy
              ? 'أكمل بيانات التوصيل بالأعلى أولاً، ثم اضغط على زر «متابعة للدفع بالبطاقة» بالأسفل، وسيتم تحويلك فوراً وبأمان إلى صفحة البنك المعتمدة لإدخال بيانات الكارت وتأكيد العملية.'
              : "Fill in your delivery details above first, then click 'Proceed to Card Payment' below to securely complete your payment on the verified bank gateway."}
          </p>
          <div className="flex items-center gap-2 pt-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {ctrl.prefersArabicCopy
                ? 'تشفير وحماية مصرفية كاملة 256-bit SSL'
                : '256-bit SSL Bank-grade Encryption'}
            </span>
          </div>
        </div>
      ) : null}

      {ctrl.paymentMethod === 'wallet' && ctrl.walletPaymentSettings ? (
        <div className="space-y-3 border-t border-emerald-200 pt-3 dark:border-emerald-800/60">
          <div className="text-sm text-emerald-900 dark:text-emerald-100">
            <p className="font-bold">
              {ctrl.prefersArabicCopy
                ? 'حوّل المبلغ على رقم المحفظة ثم ارفع إيصال التحويل'
                : 'Transfer the amount to the wallet number, then upload the receipt'}
            </p>
            <p className="mt-1 text-emerald-800 dark:text-emerald-200">
              {ctrl.prefersArabicCopy ? 'رقم المحفظة' : 'Wallet number'}:{' '}
              <span className="font-black" dir="ltr">
                {ctrl.walletPaymentSettings.walletNumber}
              </span>
              {ctrl.walletPaymentSettings.recipientName ? (
                <>
                  {' '}
                  · {ctrl.prefersArabicCopy ? 'المستلم' : 'Recipient'}:{' '}
                  <span className="font-bold">
                    {ctrl.walletPaymentSettings.recipientName}
                  </span>
                </>
              ) : null}
            </p>
            {ctrl.walletPaymentSettings.instructions ? (
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                {ctrl.walletPaymentSettings.instructions}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-emerald-900 dark:text-emerald-100">
              {ctrl.prefersArabicCopy ? 'صورة إيصال التحويل' : 'Transfer receipt image'}{' '}
              <span className="text-red-600">*</span>
            </label>
            <input
              ref={ctrl.walletFileInputRef}
              type="file"
              accept="image/*"
              disabled={ctrl.walletProofUploading}
              onChange={(e) => void ctrl.handleWalletProofFile(e.target.files?.[0])}
              className="block w-full text-xs text-emerald-900 file:mr-2 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-700 disabled:opacity-50 dark:text-emerald-100"
            />
            {ctrl.walletProofUploading ? (
              <p className="mt-1 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                {ctrl.prefersArabicCopy ? 'جارٍ رفع الإيصال...' : 'Uploading receipt...'}
              </p>
            ) : ctrl.walletProofImageUrl ? (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {ctrl.prefersArabicCopy ? 'تم رفع الإيصال بنجاح' : 'Receipt uploaded'}
                <button
                  type="button"
                  onClick={() => ctrl.walletFileInputRef.current?.click()}
                  className="text-emerald-800 underline dark:text-emerald-200"
                >
                  {ctrl.prefersArabicCopy ? 'استبدال' : 'Replace'}
                </button>
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-emerald-900 dark:text-emerald-100">
              {ctrl.prefersArabicCopy
                ? 'رقم العملية / مرجع التحويل (اختياري)'
                : 'Transfer reference (optional)'}
            </label>
            <input
              type="text"
              value={ctrl.walletTransferRef}
              onChange={(e) => ctrl.setWalletTransferRef(e.target.value)}
              placeholder={ctrl.prefersArabicCopy ? 'مثال: 123456789' : 'e.g. 123456789'}
              className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-emerald-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

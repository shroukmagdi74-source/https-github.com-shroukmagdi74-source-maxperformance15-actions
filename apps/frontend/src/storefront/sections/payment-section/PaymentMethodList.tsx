import React from 'react';
import { formatStorefrontCurrency } from '../../utils/currency';
import type { PaymentMethodOption } from './types';

interface PaymentMethodListProps {
  walletDiscountEnabled: boolean;
  walletDiscountPercent: number;
  showWalletDiscountBadge: boolean;
  paymentMethod: string;
  walletEnabled: boolean;
  walletDiscount: number;
  currency: string;
  methodStackClassName: string;
  methodOptions: PaymentMethodOption[];
  setPaymentMethod: (id: string) => void;
  methodCardClassName: (active: boolean) => string;
  isWomenFashionPayment: boolean;
  hasEnhancedPaymentTone: boolean;
  isKhemetLuxe: boolean;
  isBoutiquePayment: boolean;
  isMarketPayment: boolean;
  hasNaturePaymentTone: boolean;
  walletPaymentSettings: any;
  walletDiscountActive: boolean;
  walletFileInputRef: React.RefObject<HTMLInputElement | null>;
  walletProofUploading: boolean;
  handleWalletProofFile: (file?: File | null) => Promise<void>;
  walletProofImageUrl: string;
  walletTransferRef: string;
  setWalletTransferRef: (val: string) => void;
  tierProgress: any;
  useCashback: boolean;
  setUseCashback: (val: boolean) => void;
  usePoints: boolean;
  setUsePoints: (val: boolean) => void;
}

export const PaymentMethodList: React.FC<PaymentMethodListProps> = ({
  walletDiscountEnabled,
  walletDiscountPercent,
  showWalletDiscountBadge,
  paymentMethod,
  walletEnabled,
  walletDiscount,
  currency,
  methodStackClassName,
  methodOptions,
  setPaymentMethod,
  methodCardClassName,
  isWomenFashionPayment,
  hasEnhancedPaymentTone,
  isKhemetLuxe,
  isBoutiquePayment,
  isMarketPayment,
  hasNaturePaymentTone,
  walletPaymentSettings,
  walletDiscountActive,
  walletFileInputRef,
  walletProofUploading,
  handleWalletProofFile,
  walletProofImageUrl,
  walletTransferRef,
  setWalletTransferRef,
  tierProgress,
  useCashback,
  setUseCashback,
  usePoints,
  setUsePoints,
}) => {
  return (
    <>
      {walletDiscountEnabled && walletDiscountPercent > 0 && showWalletDiscountBadge ? (
        paymentMethod === 'card' || (paymentMethod === 'wallet' && walletEnabled) ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-100/70 p-3 text-xs font-semibold text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            <span className="text-base shrink-0">🎉</span>
            <span>
              تم تطبيق خصم الدفع الإلكتروني (<span className="tabular-nums">{walletDiscountPercent}%</span>) بنجاح! وفّرت{' '}
              <span className="tabular-nums">{formatStorefrontCurrency(walletDiscount, currency)}</span>.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200">
            <span className="text-base shrink-0">🎁</span>
            <span className="leading-relaxed">
              <strong>عرض خاص:</strong> اختر الدفع بالبطاقة أو المحفظة الإلكترونية واحصل على{' '}
              <strong>خصم <span className="tabular-nums">{walletDiscountPercent}%</span></strong> فوراً على إجمالي طلبك!
            </span>
          </div>
        )
      ) : null}

      <div className={methodStackClassName}>
        {methodOptions.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => setPaymentMethod(method.id)}
            className={`${methodCardClassName(paymentMethod === method.id)}${
              isWomenFashionPayment ? ' rounded-[1.35rem] p-3.5' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{method.icon}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{method.label}</p>
                  {hasEnhancedPaymentTone && !isKhemetLuxe ? (
                    <span
                      className={`rounded-full border bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] ${
                        isBoutiquePayment
                          ? 'border-[#ead8cf] text-[#b06456]'
                          : isMarketPayment
                            ? 'border-[#f0d4b0] text-[#a36a34]'
                            : hasNaturePaymentTone
                              ? 'border-[#dbe3d4] text-[#4a6843]'
                              : 'border-[#ead8b1] text-[#8d6a2c]'
                      }`}
                    >
                      {method.id === 'cod'
                        ? isBoutiquePayment
                          ? 'الأهدأ للتسليم'
                          : isMarketPayment
                            ? 'واضح وسهل'
                            : hasNaturePaymentTone
                              ? 'هادئ ومرن'
                          : 'الأكثر استخدامًا'
                        : method.id === 'card'
                          ? isBoutiquePayment
                            ? 'أسرع إتمام'
                            : isMarketPayment
                              ? 'إنهاء أسرع'
                              : hasNaturePaymentTone
                                ? 'خطوة أنعم'
                            : 'أسرع تجهيز'
                          : isBoutiquePayment
                            ? 'جاهز من الموبايل'
                            : isMarketPayment
                              ? 'سريع من الموبايل'
                              : hasNaturePaymentTone
                                ? 'سهل من الموبايل'
                            : 'مرن من الموبايل'}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">{method.desc}</p>
                {walletDiscountEnabled &&
                walletDiscountPercent > 0 &&
                showWalletDiscountBadge &&
                (method.id === 'card' || (method.id === 'wallet' && walletEnabled)) ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    🎁 خصم <span className="tabular-nums">{walletDiscountPercent}%</span>{' '}
                    {method.id === 'wallet' ? 'عند الدفع بالمحفظة' : 'عند الدفع بالبطاقة'}
                  </p>
                ) : null}
              </div>
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  paymentMethod === method.id ? 'border-primary' : 'border-border'
                }`}
              >
                {paymentMethod === method.id ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                ) : null}
              </div>
            </div>
          </button>
        ))}
      </div>

      {paymentMethod === 'wallet' && walletEnabled ? (
        <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-lg">💳</span>
            <div className="text-emerald-900 dark:text-emerald-100">
              <p className="font-bold">حوّل المبلغ على رقم المحفظة ثم ارفع إيصال التحويل</p>
              <p className="mt-1 text-emerald-800 dark:text-emerald-200">
                رقم المحفظة:{' '}
                <span className="font-black tabular-nums" dir="ltr">
                  {walletPaymentSettings?.walletNumber}
                </span>
                {walletPaymentSettings?.recipientName ? (
                  <> · المستلم: <span className="font-bold">{walletPaymentSettings.recipientName}</span></>
                ) : null}
              </p>
              {walletPaymentSettings?.instructions ? (
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  {walletPaymentSettings.instructions}
                </p>
              ) : null}
              {walletDiscountActive && showWalletDiscountBadge ? (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  🎁 هتاخد خصم <span className="tabular-nums">{walletDiscountPercent}%</span> على طلبك بالدفع بالمحفظة
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-emerald-900 dark:text-emerald-100">
              صورة إيصال التحويل <span className="text-red-600">*</span>
            </label>
            <input
              ref={walletFileInputRef}
              type="file"
              accept="image/*"
              disabled={walletProofUploading}
              onChange={(e) => void handleWalletProofFile(e.target.files?.[0])}
              className="block w-full text-xs text-emerald-900 file:mr-2 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-700 disabled:opacity-50 dark:text-emerald-100"
            />
            {walletProofUploading ? (
              <p className="mt-1 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                جارٍ رفع الإيصال...
              </p>
            ) : walletProofImageUrl ? (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                تم رفع الإيصال بنجاح
                <button
                  type="button"
                  onClick={() => walletFileInputRef.current?.click()}
                  className="text-emerald-800 underline dark:text-emerald-200"
                >
                  استبدال
                </button>
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-emerald-900 dark:text-emerald-100">
              رقم العملية / مرجع التحويل (اختياري)
            </label>
            <input
              type="text"
              value={walletTransferRef}
              onChange={(e) => setWalletTransferRef(e.target.value)}
              placeholder="مثال: 123456789"
              className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-emerald-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
      ) : null}

      {paymentMethod === 'card' ? (
        <div
          className={`space-y-3 rounded-2xl border p-4 text-xs transition-all ${
            isKhemetLuxe
              ? 'border-[#d9c8ad] bg-[#fcf8f2] text-[#5c4a32]'
              : isWomenFashionPayment
                ? 'border-[#ead8cf] bg-[#fffaf8] text-[#6d4a46]'
                : hasNaturePaymentTone
                  ? 'border-[#dbe3d4] bg-[#f8fbf7] text-[#3d5538]'
                  : 'border-border/80 bg-muted/40 text-foreground'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-bold text-sm text-foreground">
                الدفع الآمن بالبطاقة البنكية (Visa / Mastercard / Meeza)
              </p>
              <p className="leading-relaxed opacity-90">
                عند الضغط على تأكيد الطلب، سيتم تحويلك مباشرة لصفحة الدفع الآمنة والمشفرة لإدخال بيانات بطاقتك وإتمام العملية بأمان وسرعة.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-[11px] font-medium opacity-80">
            <span className="inline-flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              دفع مشفر 256-bit
            </span>
            <span>•</span>
            <span>معتمد من البنك المركزي المصري</span>
            <span>•</span>
            <span>حماية كاملة للبيانات</span>
          </div>
        </div>
      ) : null}

      {tierProgress?.activeVoucher ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
          <span className="text-xl">🎁</span>
          <div className="text-sm text-emerald-800 dark:text-emerald-200">
            <p className="font-bold">عندك خصم <span className="tabular-nums">{tierProgress.activeVoucher.percent}%</span> جاهز على طلبك</p>
            <p className="text-emerald-700 dark:text-emerald-300">
              بيتخصم تلقائياً ✓ · صالح حتى {new Date(tierProgress.activeVoucher.expiresAt).toLocaleDateString('ar-EG')}
            </p>
          </div>
        </div>
      ) : Number(tierProgress?.walletBalance) > 0 ? (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm cursor-pointer">
          <span className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <input
              type="checkbox"
              checked={useCashback}
              onChange={(e) => setUseCashback(e.target.checked)}
              className="h-4 w-4 accent-emerald-600"
            />
            استخدم كاش باكي في الدفع
          </span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
            {formatStorefrontCurrency(Number(tierProgress.walletBalance), currency)}
          </span>
        </label>
      ) : null}

      {tierProgress?.method === 'POINTS' && Number(tierProgress.currentMetric) > 0 ? (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm cursor-pointer">
          <span className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <input
              type="checkbox"
              checked={usePoints}
              onChange={(e) => setUsePoints(e.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            استخدم نقاطي في خصم الطلب
          </span>
          <span className="font-bold text-amber-700 dark:text-amber-300 tabular-nums">
            {tierProgress.currentMetric} نقطة
          </span>
        </label>
      ) : null}
    </>
  );
};

export default PaymentMethodList;

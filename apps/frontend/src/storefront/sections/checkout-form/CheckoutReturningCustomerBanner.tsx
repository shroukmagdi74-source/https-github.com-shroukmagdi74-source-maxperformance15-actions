import React from 'react';
import { Link } from 'react-router-dom';

export interface CheckoutReturningCustomerBannerProps {
  loginStripClassName: string;
  isBiteRush: boolean;
  isKhemetLuxe: boolean;
  returningCustomerText: string;
  returningCustomerHint: string;
  loginPath: string;
  loginLinkClassName: string;
  loginLinkText: string;
}

export const CheckoutReturningCustomerBanner: React.FC<CheckoutReturningCustomerBannerProps> = ({
  loginStripClassName,
  isBiteRush,
  isKhemetLuxe,
  returningCustomerText,
  returningCustomerHint,
  loginPath,
  loginLinkClassName,
  loginLinkText,
}) => {
  return (
    <div className={loginStripClassName}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {isBiteRush ? (
            <span className="inline-flex rounded-full bg-[#111111] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              بيانات الطلب
            </span>
          ) : null}
          <p className={isKhemetLuxe ? 'text-sm font-semibold text-[#111111]' : 'text-sm font-black text-foreground'}>
            {returningCustomerText}
          </p>
          <p className={isKhemetLuxe ? 'text-[13px] leading-6 text-[#8a7a63]' : 'text-sm leading-6 text-muted-foreground'}>
            {returningCustomerHint}
          </p>
        </div>
        <Link to={loginPath} className={loginLinkClassName}>
          {loginLinkText}
        </Link>
      </div>
    </div>
  );
};

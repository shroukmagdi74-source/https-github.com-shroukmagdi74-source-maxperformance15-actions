import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontFooterController } from './useStorefrontFooterController';

export const MensGroomingFooter: React.FC<{ controller: StorefrontFooterController }> = ({
  controller,
}) => {
  const {
    theme,
    footerCopyrightText,
    showPaymentBadges,
    legalLinks,
    shouldForceDocumentNavigation,
    socialIcons,
  } = controller;

  const mgSocialIcons: Record<string, { href: string; label: string; d: string }> = {
    facebook: {
      href: socialIcons.facebook,
      label: 'Facebook',
      d: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-6.93H7.9V12H10V9.8c0-2.07 1.23-3.22 3.12-3.22.9 0 1.85.16 1.85.16v2.03h-1.04c-1.03 0-1.35.64-1.35 1.29V12h2.3l-.37 2.87h-1.93v6.93c4.56-.93 8-4.96 8-9.8Z',
    },
    instagram: {
      href: socialIcons.instagram,
      label: 'Instagram',
      d: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07Zm0 4.5a5.34 5.34 0 1 0 0 10.68 5.34 5.34 0 0 0 0-10.68Zm0 8.8a3.46 3.46 0 1 1 0-6.92 3.46 3.46 0 0 1 0 6.92Zm6.8-9.2a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z',
    },
    twitter: {
      href: socialIcons.twitter || socialIcons.x,
      label: 'Twitter',
      d: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z',
    },
    youtube: {
      href: socialIcons.youtube,
      label: 'YouTube',
      d: 'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z',
    },
  };

  const mgSocialEntries = Object.entries(mgSocialIcons).filter(([, v]) => Boolean(v.href));

  return (
    <footer dir={theme.direction} className="border-t border-[#e8e8e8] bg-white">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-3 px-4 py-6 md:flex-row md:justify-between md:px-6">
        <p className="text-sm text-[#666]">{footerCopyrightText}</p>
        <nav className="flex flex-wrap items-center justify-center gap-5">
          {showPaymentBadges ? (
            <div data-testid="storefront-payment-badges" className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex h-6 min-w-[38px] items-center justify-center rounded bg-slate-100 border border-slate-200 px-1.5 text-[8.5px] font-black tracking-tight text-slate-800">
                VISA
              </span>
              <span className="inline-flex h-6 min-w-[38px] items-center justify-center rounded bg-slate-100 border border-slate-200 px-1.5 text-[8.5px] font-black tracking-tight text-slate-800">
                Mastercard
              </span>
              <span className="inline-flex h-6 min-w-[38px] items-center justify-center rounded bg-slate-100 border border-slate-200 px-1.5 text-[8.5px] font-black tracking-tight text-slate-800">
                ميزة
              </span>
              <span className="inline-flex h-6 min-w-[38px] items-center justify-center rounded bg-slate-100 border border-slate-200 px-1.5 text-[8.5px] font-black tracking-tight text-slate-800">
                InstaPay
              </span>
            </div>
          ) : null}
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              reloadDocument={shouldForceDocumentNavigation}
              className="text-sm text-[#19212B] hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {mgSocialEntries.length ? (
          <div className="flex items-center gap-3">
            {mgSocialEntries.map(([key, v]) => (
              <a
                key={key}
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={v.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f1f1] text-[#19212B] transition-colors hover:bg-[#19212B] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d={v.d} />
                </svg>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </footer>
  );
};

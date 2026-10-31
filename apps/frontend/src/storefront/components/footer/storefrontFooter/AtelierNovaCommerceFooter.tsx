import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontFooterController } from './useStorefrontFooterController';
import { renderStorefrontSocialBrandIcon } from './FooterSocialIcons';

export const AtelierNovaCommerceFooter: React.FC<{ controller: StorefrontFooterController }> = ({
  controller,
}) => {
  const {
    theme,
    displayStoreName,
    footerContactRows,
    legalLinks,
    shouldForceDocumentNavigation,
    socialIcons,
    footerCopyrightText,
  } = controller;

  return (
    <footer
      dir={theme.direction}
      className="border-t border-[#ead5cd] bg-[#f8eee9] text-[#2c2426]"
    >
      <div className="container px-4 py-6 md:px-6 md:py-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2.5">
            <span className="font-heading text-xl font-semibold tracking-tight text-[#2c2426] md:text-2xl">
              {displayStoreName}
            </span>
            <p className="max-w-xl text-sm leading-7 text-[#6f5960]">
              {theme.direction === 'rtl'
                ? 'مسار الشراء هنا يظل هادئًا: مراجعة أوضح، متابعة حتى الاستلام، وروابط الخدمة الأساسية قريبة عند الحاجة.'
                : 'The purchase flow stays quiet here: clearer review, follow-up through delivery, and the key service links close at hand.'}
            </p>
            {footerContactRows.length ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5c4b4f]">
                {footerContactRows.slice(0, 2).map((row) =>
                  row.href ? (
                    <a
                      key={`${row.label}-${row.value}`}
                      href={row.href}
                      className="transition-colors hover:text-[#2c2426]"
                    >
                      {row.label}: {row.value}
                    </a>
                  ) : (
                    <p key={`${row.label}-${row.value}`}>
                      {row.label}: {row.value}
                    </p>
                  ),
                )}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#6f5960]">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  reloadDocument={shouldForceDocumentNavigation}
                  className="transition-colors hover:text-[#2c2426]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {Object.entries(socialIcons).map(([social, url]) =>
                url ? (
                  <a
                    key={social}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8cbc1] bg-[#fff8f5] text-[#7a5d63] transition-colors hover:border-[#c78672] hover:text-[#2c2426]"
                    aria-label={
                      theme.direction === 'rtl'
                        ? `تابعنا على ${social}`
                        : `Follow us on ${social}`
                    }
                  >
                    <span className="inline-flex items-center justify-center" aria-hidden="true">
                      {renderStorefrontSocialBrandIcon(social) ?? (
                        <span className="text-xs capitalize">{social[0]?.toUpperCase()}</span>
                      )}
                    </span>
                  </a>
                ) : null,
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-[#e8cbc1] pt-4 text-sm text-[#7a5d63]">
          <p>{footerCopyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

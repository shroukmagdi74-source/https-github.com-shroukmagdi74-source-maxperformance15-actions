import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontFooterController } from './useStorefrontFooterController';
import { renderStorefrontSocialBrandIcon } from './FooterSocialIcons';

export const ButcherAtelierFooter: React.FC<{ controller: StorefrontFooterController }> = ({
  controller,
}) => {
  const {
    theme,
    displayStoreName,
    footerDescriptionText,
    footerContactRows,
    isMinimal,
    footerLinksData,
    legalLinks,
    socialIcons,
    footerCopyrightText,
    shouldForceDocumentNavigation,
  } = controller;

  return (
    <footer dir={theme.direction} className="border-t border-[#37312c] bg-[#080706] text-[#f4ead8]">
      <div className="container px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 border-y border-[#37312c] py-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.85fr)]">
          <div className="space-y-5">
            <span className="inline-flex border border-[#8b6b3e] bg-[#15110f] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#d7b674]">
              Premium butcher shop
            </span>
            <h2 className="font-heading text-[2.2rem] font-black leading-tight text-[#fff7e8] md:text-[3rem]">
              {displayStoreName}
            </h2>
            <p className="max-w-xl text-sm leading-7 text-[#b7ab9c]">
              {footerDescriptionText}
            </p>
            {footerContactRows.length ? (
              <div className="flex flex-wrap gap-2">
                {footerContactRows.map((row) =>
                  row.href ? (
                    <a
                      key={`${row.label}-${row.value}`}
                      href={row.href}
                      className="border border-[#37312c] bg-[#15110f] px-3 py-2 text-sm font-bold text-[#d6cbbb] transition-colors hover:border-[#8b6b3e] hover:text-[#fff7e8]"
                    >
                      {row.label}: {row.value}
                    </a>
                  ) : (
                    <span
                      key={`${row.label}-${row.value}`}
                      className="border border-[#37312c] bg-[#15110f] px-3 py-2 text-sm font-bold text-[#d6cbbb]"
                    >
                      {row.label}: {row.value}
                    </span>
                  ),
                )}
              </div>
            ) : null}
          </div>

          {!isMinimal &&
            footerLinksData.map((group) => (
              <div key={group.title} className="border-s border-[#37312c] ps-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d7b674]">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        reloadDocument={shouldForceDocumentNavigation}
                        className="text-sm font-bold text-[#b7ab9c] transition-colors hover:text-[#fff7e8]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <div className="flex flex-col gap-4 border-b border-[#37312c] py-5 text-sm text-[#8f8579] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                reloadDocument={shouldForceDocumentNavigation}
                className="transition-colors hover:text-[#f4ead8]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(socialIcons).map(([social, url]) =>
              url ? (
                <a
                  key={social}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#37312c] text-xs font-black uppercase text-[#d7b674] transition-colors hover:border-[#8b6b3e] hover:text-[#fff7e8]"
                  aria-label={
                    theme.direction === 'rtl'
                      ? `تابعنا على ${social}`
                      : `Follow us on ${social}`
                  }
                >
                  {renderStorefrontSocialBrandIcon(social) ?? social[0]?.toUpperCase()}
                </a>
              ) : null,
            )}
          </div>
        </div>

        <p className="pt-5 text-sm text-[#8f8579]">
          {footerCopyrightText}
        </p>
      </div>
    </footer>
  );
};

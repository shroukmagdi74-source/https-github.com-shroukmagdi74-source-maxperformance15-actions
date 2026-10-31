import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontFooterController } from './useStorefrontFooterController';
import { renderStorefrontSocialBrandIcon, renderVelaFooterIcon } from './FooterSocialIcons';

export const PcHubFooter: React.FC<{ controller: StorefrontFooterController }> = ({
  controller,
}) => {
  const {
    theme,
    displayStoreName,
    socialIcons,
    footerLinksData,
    legalLinks,
    shouldForceDocumentNavigation,
  } = controller;

  return (
    <footer
      dir={theme.direction}
      className="border-t border-[#d8dee8] bg-[#1f2937] text-white"
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex w-full items-center justify-center border-b border-white/10 bg-[#334155] px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-[#3b4758] hover:text-white"
      >
        {theme.direction === 'rtl' ? 'العودة للأعلى' : 'Back to top'}
      </button>

      <div className="container px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[0.8rem] bg-[#facc15] text-[#111827]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="8" rx="2" />
                  <path d="M7 4h10" />
                </svg>
              </span>
              <span className="font-heading text-xl font-semibold tracking-tight text-white">
                {displayStoreName}
              </span>
            </div>
            <p className="max-w-xs text-sm leading-7 text-white/68">
              {theme.footer?.description}
            </p>
            <div className="flex items-center gap-3">
              {Object.entries(socialIcons).map(([social, url]) =>
                url ? (
                  <a
                    key={social}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/70 transition-colors hover:border-[#facc15] hover:bg-[#facc15] hover:text-[#111827]"
                    aria-label={
                      theme.direction === 'rtl'
                        ? `تابعنا على ${social}`
                        : `Follow us on ${social}`
                    }
                  >
                    {renderVelaFooterIcon(social) ?? (
                      <span className="inline-flex items-center justify-center" aria-hidden="true">
                        {renderStorefrontSocialBrandIcon(social) ?? (
                          <span className="text-xs capitalize">{social[0]?.toUpperCase()}</span>
                        )}
                      </span>
                    )}
                  </a>
                ) : null,
              )}
            </div>
          </div>

          {footerLinksData.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-sm font-semibold text-white">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      reloadDocument={shouldForceDocumentNavigation}
                      className="text-sm text-white/62 transition-colors hover:text-[#facc15]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#111827]">
        <div className="container flex flex-col gap-4 px-4 py-5 text-sm text-white/58 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-wrap items-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                reloadDocument={shouldForceDocumentNavigation}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p>{theme.footer?.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

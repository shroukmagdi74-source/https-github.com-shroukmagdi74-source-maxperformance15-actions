import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontFooterController } from './useStorefrontFooterController';

export const LegacyDefaultFooter: React.FC<{ controller: StorefrontFooterController }> = ({
  controller,
}) => {
  const {
    theme,
    isFastlyTheme,
    footerCopyrightText,
    legalLinks,
    shouldForceDocumentNavigation,
    footerContactRows,
  } = controller;

  if (isFastlyTheme) {
    return (
      <footer dir={theme.direction} className="border-t border-[#111111]/10 bg-white text-[#111111]">
        <div className="container px-4 py-6 text-center md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-[#111111]">
            <span>{footerCopyrightText}</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      dir={theme.direction}
      className="border-t border-[#111111]/10 bg-white text-[#111111]"
    >
      <div className="container px-4 py-8 text-center md:px-6 md:py-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#111111]">
            {legalLinks.map((link) => (
              <Link
                key={`legacy-footer-${link.to}`}
                to={link.to}
                reloadDocument={shouldForceDocumentNavigation}
                className="transition-colors hover:text-[#555555]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {footerContactRows.length ? (
            <div className="flex flex-col items-center gap-1.5 text-sm text-[#5f5f5f]">
              {footerContactRows.map((row) =>
                row.href ? (
                  <a
                    key={`${row.label}-${row.value}`}
                    href={row.href}
                    className="transition-colors hover:text-[#111111]"
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

          <p className="text-sm text-[#5f5f5f]">
            {footerCopyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
};

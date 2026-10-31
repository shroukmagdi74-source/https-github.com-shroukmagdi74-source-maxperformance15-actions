import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontFooterController } from './useStorefrontFooterController';
import { renderVelaFooterIcon, resolveVelaFooterHref } from './FooterSocialIcons';

export const VelaFashionFooter: React.FC<{ controller: StorefrontFooterController }> = ({
  controller,
}) => {
  const {
    theme,
    location,
    isHomePath,
    isMinimal,
    footerLinksData,
    shouldForceDocumentNavigation,
    socialIcons,
  } = controller;

  const isVelaInnerPage = !isHomePath;
  const velaFooterShellClassName = isVelaInnerPage
    ? 'mt-10 border-t border-[#e8cfd3] bg-[#f6dadd] text-[#111111]'
    : 'mt-10 border-t border-[#ece7e3] bg-white text-[#111111]';
  const velaCardClassName = isVelaInnerPage
    ? 'flex items-start gap-3 rounded-[1.2rem] border border-[#ecd9dd] bg-white/92 px-4 py-4'
    : 'flex items-start gap-3 rounded-[1.2rem] border border-[#efebe8] bg-white px-4 py-4';
  const velaIconClassName = isVelaInnerPage
    ? 'mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#ead7db] text-[#151515]'
    : 'mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#ece7e3] text-[#151515]';
  const velaDividerClassName = isVelaInnerPage
    ? 'border-[#ead3d8]'
    : 'border-[#ece7e3]';

  const velaFooterContactRows = [
    {
      key: 'address',
      label: 'Address',
      value: theme.footer?.addressText,
      href: undefined as string | undefined,
    },
    {
      key: 'phone',
      label: 'Phone',
      value: theme.footer?.phoneText,
      href: theme.footer?.phoneText ? `tel:${theme.footer.phoneText}` : undefined,
    },
    {
      key: 'email',
      label: 'Email',
      value: theme.footer?.emailText,
      href: theme.footer?.emailText ? `mailto:${theme.footer.emailText}` : undefined,
    },
  ].filter(
    (
      row,
    ): row is {
      key: 'address' | 'phone' | 'email';
      label: string;
      value: string;
      href?: string;
    } => Boolean(row.value),
  );

  const velaSocialOrder = [
    'facebook',
    'instagram',
    'youtube',
    'linkedin',
    'twitter',
    'tiktok',
    'snapchat',
    'whatsapp',
  ] as const;

  const velaSocialEntries = velaSocialOrder
    .map((key) => [key, socialIcons[key]] as const)
    .filter((entry): entry is readonly [(typeof velaSocialOrder)[number], string] => Boolean(entry[1]));

  return (
    <footer dir={theme.direction} className={velaFooterShellClassName}>
      <div className="container px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.85fr)]">
          <div className="space-y-3">
            {velaFooterContactRows.map((row) => {
              const content = (
                <div className={velaCardClassName}>
                  <span className={velaIconClassName}>
                    {renderVelaFooterIcon(row.key)}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-[#111111]">
                      {row.label}
                      <span className="text-[#777777]"> : </span>
                      <span className="font-normal text-[#5c5c5c]">{row.value}</span>
                    </p>
                  </div>
                </div>
              );

              return row.href ? (
                <a
                  key={row.key}
                  href={row.href}
                  className="block transition-colors hover:text-[#111111]"
                >
                  {content}
                </a>
              ) : (
                <div key={row.key}>{content}</div>
              );
            })}
          </div>

          {!isMinimal &&
            footerLinksData.map((group) => (
              <div key={group.title}>
                <h3 className="text-lg font-semibold text-[#111111]">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        reloadDocument={shouldForceDocumentNavigation}
                        className="text-sm text-[#5c5c5c] transition-colors hover:text-[#111111]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {!isMinimal && velaSocialEntries.length ? (
          <div className={`mt-8 flex flex-wrap items-center justify-center gap-3 border-t pt-6 ${velaDividerClassName}`}>
            {velaSocialEntries.map(([social, url]) => (
              <a
                key={social}
                href={resolveVelaFooterHref(url, location.pathname, location.search)}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-[#111111] transition-colors hover:border-[#111111] ${
                  isVelaInnerPage ? 'border-[#ead3d8] bg-white/88' : 'border-[#ece7e3]'
                }`}
                aria-label={`Follow us on ${social}`}
              >
                {renderVelaFooterIcon(social)}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </footer>
  );
};

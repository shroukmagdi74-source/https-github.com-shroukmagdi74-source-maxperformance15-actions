import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontHeaderController } from '../storefrontHeaderTypes';
import { StorefrontHomeLink } from '../storefrontHeaderHelpers';

export interface MensGroomingHeaderProps {
  controller?: StorefrontHeaderController;
  ctrl?: StorefrontHeaderController;
}

export const MensGroomingHeader: React.FC<MensGroomingHeaderProps> = ({ controller, ctrl = controller }) => {
  if (!ctrl) return null;
  const {
    brandHomeLinkProps,
    displayStoreName,
    navLinks,
    shouldForceDocumentNavigation,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = ctrl;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#19212B] text-white shadow-[0_2px_8px_rgba(0,0,0,.2)]">
      <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between px-4 md:px-6">
        <StorefrontHomeLink {...brandHomeLinkProps} className="flex items-center gap-2 text-[19px] font-bold tracking-[-0.5px] text-white">
          {displayStoreName}
        </StorefrontHomeLink>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              reloadDocument={shouldForceDocumentNavigation}
              className="text-[14px] font-medium text-white/85 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-9 w-9 items-center justify-center text-white md:hidden"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </div>
      {mobileMenuOpen ? (
        <div className="border-t border-white/10 bg-[#19212B] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                reloadDocument={shouldForceDocumentNavigation}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
};

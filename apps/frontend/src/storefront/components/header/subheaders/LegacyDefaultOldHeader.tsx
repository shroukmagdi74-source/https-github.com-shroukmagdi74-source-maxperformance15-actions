import React from "react";
import { Link } from "react-router-dom";
import { buildStorefrontPath } from "../../../utils/paths";
import { StorefrontHomeLink } from "../storefrontHeaderHelpers";
import { StorefrontSearchOverlay } from "./StorefrontSearchOverlay";
import type { StorefrontHeaderController } from "../storefrontHeaderTypes";

interface LegacyDefaultOldHeaderProps {
  controller: StorefrontHeaderController;
}

export const LegacyDefaultOldHeader: React.FC<LegacyDefaultOldHeaderProps> = ({ controller }) => {
  const {
    theme,
    location,
    isFastlyTheme,
    mobileMenuOpen,
    setMobileMenuOpen,
    brandHomeLinkProps,
    displayLogoUrl,
    displayStoreName,
    showSearch,
    setSearchOpen,
    showCart,
    setIsOpen,
    totalItems,
    navLinks,
    isActive,
    legacyMenuLinks,
    searchOpen,
    query,
    setQuery,
    closeSearchOverlay,
    results,
    isLoading,
    moreResultsPath,
  } = controller;

  return (
    <>
      <header
        dir={theme.direction}
        className="sticky top-0 z-50 w-full border-b border-[#111111]/8 bg-white shadow-[0_14px_36px_-34px_rgba(17,17,17,0.4)]"
      >
        {theme.header?.announcementText ? (
          <div className="bg-black px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.2em] text-white">
            <div className="container flex flex-wrap items-center justify-center gap-2 md:px-6">
              <span>{theme.header.announcementText}</span>
              {theme.header.announcementLinkText &&
              theme.header.announcementLinkTo ? (
                <Link
                  to={buildStorefrontPath(
                    location.pathname,
                    theme.header.announcementLinkTo,
                    location.search,
                  )}
                  className="text-white/78 underline underline-offset-4 transition-colors hover:text-white"
                >
                  {theme.header.announcementLinkText}
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="container px-4 md:px-6">
          {isFastlyTheme ? (
            <div className="flex items-center justify-between gap-3 py-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-colors hover:text-[#555555]"
                aria-label={
                  theme.direction === 'rtl'
                    ? mobileMenuOpen
                      ? 'إغلاق القائمة'
                      : 'فتح القائمة'
                    : mobileMenuOpen
                      ? 'Close menu'
                      : 'Open menu'
                }
              >
                {mobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                )}
              </button>

              <StorefrontHomeLink
                {...brandHomeLinkProps}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center"
              >
                {displayLogoUrl ? (
                  <img
                    src={displayLogoUrl}
                    alt={displayStoreName}
                    className="h-10 w-auto object-contain sm:h-11"
                  />
                ) : (
                  <span className="font-heading text-xl font-bold text-[#111111]">
                    {displayStoreName}
                  </span>
                )}
              </StorefrontHomeLink>

              <div className="flex items-center justify-end gap-1">
                <span
                  aria-hidden="true"
                  className="inline-flex h-10 w-10 items-center justify-center text-[#111111]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 21-1.45-1.32C5.4 15.02 2 11.93 2 8.13 2 5.04 4.42 2.62 7.5 2.62c1.74 0 3.41.81 4.5 2.09 1.09-1.28 2.76-2.09 4.5-2.09 3.08 0 5.5 2.42 5.5 5.51 0 3.8-3.4 6.89-8.55 11.56L12 21Z" />
                  </svg>
                </span>
                {showSearch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-colors hover:text-[#555555]"
                    aria-label={theme.direction === 'rtl' ? 'فتح البحث' : 'Open search'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </button>
                ) : null}
                {showCart ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsOpen(true);
                    }}
                    className="relative inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-colors hover:text-[#555555]"
                    aria-label={
                      theme.direction === 'rtl'
                        ? `سلة التسوق (${totalItems} منتجات)`
                        : `Shopping cart (${totalItems} items)`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    {totalItems > 0 ? (
                      <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-black px-1 text-[10px] font-black text-white">
                        {totalItems}
                      </span>
                    ) : null}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 py-4 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-colors hover:text-[#555555]"
                aria-label={
                  theme.direction === "rtl"
                    ? mobileMenuOpen
                      ? "إغلاق القائمة"
                      : "فتح القائمة"
                    : mobileMenuOpen
                      ? "Close menu"
                      : "Open menu"
                }
              >
                {mobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                )}
              </button>

              <StorefrontHomeLink
                {...brandHomeLinkProps}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center"
              >
                {displayLogoUrl ? (
                  <img
                    src={displayLogoUrl}
                    alt={displayStoreName}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="font-heading text-base font-black uppercase tracking-[0.08em] text-[#111111] sm:text-lg">
                    {displayStoreName}
                  </span>
                )}
              </StorefrontHomeLink>

              <div className="flex items-center justify-end gap-2">
                {showSearch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-colors hover:text-[#555555]"
                    aria-label={
                      theme.direction === "rtl" ? "فتح البحث" : "Open search"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </button>
                ) : null}
                {showCart ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsOpen(true);
                    }}
                    className="relative inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-colors hover:text-[#555555]"
                    aria-label={
                      theme.direction === "rtl"
                        ? `سلة التسوق (${totalItems} منتجات)`
                        : `Shopping cart (${totalItems} items)`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    {totalItems > 0 ? (
                      <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-black px-1 text-[10px] font-black text-white">
                        {totalItems}
                      </span>
                    ) : null}
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {!isFastlyTheme ? (
            <div className="hidden items-center justify-between gap-6 py-4 lg:flex">
              <StorefrontHomeLink
                {...brandHomeLinkProps}
                className="shrink-0"
              >
                {displayLogoUrl ? (
                  <img
                    src={displayLogoUrl}
                    alt={displayStoreName}
                    className="h-11 w-auto object-contain"
                  />
                ) : (
                  <span className="font-heading text-xl font-semibold tracking-tight text-[#111111]">
                    {displayStoreName}
                  </span>
                )}
              </StorefrontHomeLink>

              <nav className="flex min-w-0 flex-1 items-center justify-center gap-5 text-[12px] font-medium normal-case text-[#111111] xl:gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={`legacy-desktop-${link.to}`}
                    to={link.to}
                    className={`normal-case transition-colors hover:text-[#555555] ${isActive(link.to) ? "text-[#111111]" : "text-[#111111]"}`}
                  >
                    {link.label}
                  </Link>
                ))}
                {showSearch ? (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="normal-case transition-colors hover:text-[#555555]"
                  >
                    Search
                  </button>
                ) : null}
              </nav>

              {showCart ? (
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="inline-flex shrink-0 items-center gap-2 text-[12px] font-medium normal-case text-[#111111] transition-colors hover:text-[#555555]"
                  aria-label={
                    theme.direction === "rtl"
                      ? `سلة التسوق (${totalItems} منتجات)`
                      : `Shopping cart (${totalItems} items)`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  <span className="flex items-center gap-1">
                    <span className="font-bold">{totalItems}</span>
                    <span>
                      {theme.direction === "rtl"
                        ? "منتجات في السلة"
                        : "items in cart"}
                    </span>
                  </span>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {mobileMenuOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[90] bg-black/25"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={
                theme.direction === "rtl" ? "إغلاق القائمة" : "Close menu"
              }
            />
            <div
              className={`fixed inset-y-0 ${theme.direction === "rtl" ? "right-0 border-l" : "left-0 border-r"} z-[95] w-full max-w-sm overflow-y-auto border-[#111111]/10 bg-white shadow-[0_32px_90px_-48px_rgba(17,17,17,0.5)]`}
            >
              <div className="flex items-center justify-between border-b border-[#111111]/8 px-5 py-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7a7a7a]">
                    {theme.direction === "rtl" ? "التصفح" : "Browse"}
                  </p>
                  <p className="font-heading text-lg font-semibold tracking-tight text-[#111111]">
                    {displayStoreName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-colors hover:text-[#555555]"
                  aria-label={
                    theme.direction === "rtl" ? "إغلاق القائمة" : "Close menu"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-5 py-5">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={`legacy-menu-${link.to}`}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block border-b border-[#111111]/6 py-3 text-sm font-medium normal-case transition-colors ${
                        isActive(link.to)
                          ? "text-[#111111]"
                          : "text-[#666666] hover:text-[#111111]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {showCart ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsOpen(true);
                      }}
                      className="flex w-full items-center justify-between border-b border-[#111111]/6 py-3 text-sm font-medium normal-case text-[#666666] transition-colors hover:text-[#111111]"
                    >
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                        {theme.direction === "rtl" ? "سلة التسوق" : "Shopping Cart"}
                      </span>
                      {totalItems > 0 ? (
                        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-black text-white">
                          {totalItems}
                        </span>
                      ) : null}
                    </button>
                  ) : null}
                </div>

                {legacyMenuLinks.length > navLinks.length ? (
                  <div className="mt-6 space-y-1 border-t border-[#111111]/8 pt-5">
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#7a7a7a]">
                      {theme.direction === "rtl" ? "السياسات" : "Policies"}
                    </p>
                    {legacyMenuLinks.slice(navLinks.length).map((link) => (
                      <Link
                        key={`legacy-policy-${link.to}`}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-sm font-medium text-[#555555] transition-colors hover:text-[#111111]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </header>

      <StorefrontSearchOverlay
        searchOpen={searchOpen}
        themeDirection={theme.direction}
        query={query}
        setQuery={setQuery}
        closeSearchOverlay={closeSearchOverlay}
        results={results}
        isLoading={isLoading}
        moreResultsPath={moreResultsPath}
      />
    </>
  );
};

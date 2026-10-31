import React from "react";
import { Link } from "react-router-dom";
import { StorefrontSearchResults as SearchResults } from "../../StorefrontSearchResults";
import { StorefrontHomeLink } from "../storefrontHeaderHelpers";
import type { StorefrontHeaderController } from "../storefrontHeaderTypes";

interface VelaFashionHeaderProps {
  controller: StorefrontHeaderController;
}

export const VelaFashionHeader: React.FC<VelaFashionHeaderProps> = ({ controller }) => {
  const {
    theme,
    mobileMenuOpen,
    setMobileMenuOpen,
    showSearch,
    isVelaInnerPath,
    setSearchOpen,
    searchOpen,
    brandHomeLinkProps,
    displayLogoUrl,
    displayStoreName,
    showCart,
    setIsOpen,
    totalItems,
    navLinks,
    isActive,
    query,
    setQuery,
    closeSearchOverlay,
    results,
    isLoading,
    moreResultsPath,
  } = controller;

  return (
    <header
      dir={theme.direction}
      className="sticky top-0 z-50 w-full border-b border-[#ebe4dd] bg-white/98 shadow-[0_16px_40px_-36px_rgba(18,18,18,0.18)] backdrop-blur"
    >
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-4 md:py-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#171717] transition-colors hover:bg-[#f5f1ed] md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </button>

            {showSearch && !isVelaInnerPath ? (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setMobileMenuOpen(false);
                }}
                className="hidden text-sm font-medium text-[#171717] transition-colors hover:text-[#0abb45] md:inline-flex"
              >
                Search
              </button>
            ) : null}
          </div>

          <StorefrontHomeLink
            {...brandHomeLinkProps}
            className="flex justify-center"
            onClick={() => {
              setMobileMenuOpen(false);
              setSearchOpen(false);
            }}
          >
            {displayLogoUrl ? (
              <img
                src={displayLogoUrl}
                alt={displayStoreName}
                className="h-8 w-auto object-contain md:h-10"
              />
            ) : (
              <span className="font-heading text-lg font-semibold lowercase tracking-[-0.04em] text-[#171717] md:text-xl">
                {displayStoreName}
              </span>
            )}
          </StorefrontHomeLink>

          <div className="flex items-center justify-end gap-1.5">
            {showSearch ? (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setMobileMenuOpen(false);
                }}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[#171717] transition-colors hover:bg-[#f5f1ed] ${
                  isVelaInnerPath ? "md:inline-flex" : "md:hidden"
                }`}
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            ) : null}

            {showCart ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#171717] transition-colors hover:bg-[#f5f1ed]"
                aria-label="items in cart, view bag"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                {totalItems > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>

        <div className="hidden border-t border-[#f1ece7] md:block">
          <nav className="flex items-center justify-center gap-5 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-heading text-[14px] font-semibold normal-case tracking-normal transition-colors ${
                  isActive(link.to)
                    ? 'text-[#171717]'
                    : 'text-[#4f4f4f] hover:text-[#171717]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-[#f1ece7] bg-white md:hidden">
          <div className="container grid gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={`${link.to}-mobile`}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-[0.9rem] px-3 py-3 text-sm font-medium text-[#171717] transition-colors hover:bg-[#f7f3ef]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {searchOpen ? (
        <div className="border-t border-[#f1ece7] bg-white">
          <div className="container px-4 py-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="flex items-center gap-3 rounded-full border border-[#e7dfd7] bg-[#fcfaf8] px-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7b7b7b]">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products"
                  className="w-full bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#9a9a9a]"
                />
                <button
                  type="button"
                  onClick={closeSearchOverlay}
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b7b7b] transition-colors hover:text-[#171717]"
                >
                  Close
                </button>
              </div>

              {query.length > 2 ? (
                <div className="rounded-[1.1rem] border border-[#ece4dd] bg-white p-4 shadow-[0_20px_46px_-38px_rgba(18,18,18,0.2)]">
                  <SearchResults
                    results={results}
                    isLoading={isLoading}
                    close={closeSearchOverlay}
                  />
                  <Link
                    to={moreResultsPath}
                    onClick={closeSearchOverlay}
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-[#e6ddd5] px-4 py-2 text-sm font-medium text-[#171717] transition-colors hover:border-[#171717]"
                  >
                    More results
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-[#6c6c6c]">
                  Type at least 3 characters to start searching.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

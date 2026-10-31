import React from "react";
import { Link } from "react-router-dom";
import { StorefrontSearchResults as SearchResults } from "../../StorefrontSearchResults";
import { StorefrontHomeLink } from "../storefrontHeaderHelpers";
import type { StorefrontHeaderController } from "../storefrontHeaderTypes";

interface ButcherAtelierHeaderProps {
  controller: StorefrontHeaderController;
}

export const ButcherAtelierHeader: React.FC<ButcherAtelierHeaderProps> = ({ controller }) => {
  const {
    theme,
    headerRailLabel,
    utilityHeaderRail,
    mobileMenuOpen,
    setMobileMenuOpen,
    brandHomeLinkProps,
    displayStoreName,
    headerTagline,
    navLinks,
    shouldForceDocumentNavigation,
    isActive,
    headerActions,
    showSearch,
    setSearchOpen,
    showCart,
    setIsOpen,
    totalItems,
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
        className="sticky top-0 z-50 w-full border-b border-[#37312c] bg-[#080706]/96 text-[#f4ead8] shadow-[0_24px_70px_-54px_rgba(0,0,0,0.86)] backdrop-blur-xl"
      >
        <div className="hidden border-b border-[#37312c] bg-[#0b0908] md:block">
          <div className="container flex h-9 items-center justify-between gap-5 overflow-hidden px-4 md:px-6">
            <span className="shrink-0 border border-[#8b6b3e] bg-[#15110f] px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#d7b674]">
              {headerRailLabel || "BLACK LABEL"}
            </span>
            <div className="flex flex-1 items-center justify-end gap-3 overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-[0.24em] text-[#b7ab9c]">
              {utilityHeaderRail.map((item, index) => (
                <React.Fragment key={item}>
                  {index > 0 ? <span className="text-[#4a4138]">/</span> : null}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="container flex h-20 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              className="md:hidden -ms-2 inline-flex h-11 w-11 items-center justify-center border border-[#37312c] text-[#d7b674] transition-colors hover:border-[#8b6b3e] hover:text-[#fff7e8]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              className="group flex items-center gap-3"
            >
              <span className="grid h-11 w-11 place-items-center border border-[#8b6b3e] bg-[#15110f] text-[10px] font-black uppercase tracking-[0.22em] text-[#d7b674] transition-colors group-hover:bg-[#5f1118]">
                PB
              </span>
              <span className="flex flex-col text-start leading-none">
                <span className="font-heading text-[1.18rem] font-black text-[#fff7e8] sm:text-[1.35rem]">
                  {displayStoreName}
                </span>
                <span className="mt-1 text-[10px] font-black uppercase tracking-[0.32em] text-[#d7b674]">
                  {headerTagline || "Premium butcher shop"}
                </span>
              </span>
            </StorefrontHomeLink>

            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  reloadDocument={shouldForceDocumentNavigation}
                  className={`px-3 py-2 text-sm font-bold transition-colors ${
                    isActive(link.to)
                      ? "border border-[#8b6b3e] bg-[#15110f] text-[#d7b674]"
                      : "text-[#b7ab9c] hover:bg-[#15110f] hover:text-[#fff7e8]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {headerActions.length > 0 ? (
              <div className="hidden items-center gap-2 md:flex">
                {headerActions.map((action) => (
                  <Link
                    key={`${action.label}-${action.href}`}
                    to={action.href}
                    reloadDocument={shouldForceDocumentNavigation}
                    className={
                      action.style === "primary"
                        ? "inline-flex min-h-[2.75rem] items-center justify-center border border-[#8f1d2b] bg-[#7a131d] px-5 text-sm font-black text-[#fff4dc] transition-colors hover:bg-[#9a1d2a]"
                        : action.style === "outline"
                          ? "inline-flex min-h-[2.75rem] items-center justify-center border border-[#4a4138] bg-[#15110f] px-5 text-sm font-bold text-[#d6cbbb] transition-colors hover:border-[#8b6b3e] hover:text-[#fff7e8]"
                          : "inline-flex min-h-[2.75rem] items-center justify-center px-3 text-sm font-bold text-[#d6cbbb] transition-colors hover:text-[#d7b674]"
                    }
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
            {showSearch ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center border border-[#37312c] text-[#d7b674] transition-colors hover:border-[#8b6b3e] hover:text-[#fff7e8]"
                aria-label={theme.direction === "rtl" ? "بحث" : "Search products"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            ) : null}
            {showCart ? (
              <button
                onClick={() => setIsOpen(true)}
                className="relative inline-flex h-11 w-11 items-center justify-center border border-[#37312c] text-[#d7b674] transition-colors hover:border-[#8b6b3e] hover:text-[#fff7e8]"
                aria-label={
                  theme.direction === "rtl"
                    ? `سلة التسوق (${totalItems} منتجات)`
                    : `Shopping cart (${totalItems} items)`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                {totalItems > 0 ? (
                  <span className="absolute -end-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center bg-[#7a131d] px-1 text-[10px] font-black text-[#fff4dc]">
                    {totalItems}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-[#37312c] bg-[#0b0908] px-4 py-4 md:hidden">
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  reloadDocument={shouldForceDocumentNavigation}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block border px-3 py-3 text-sm font-bold ${
                    isActive(link.to)
                      ? "border-[#8b6b3e] bg-[#15110f] text-[#d7b674]"
                      : "border-transparent text-[#b7ab9c] hover:border-[#37312c] hover:text-[#fff7e8]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {headerActions.map((action) => (
                <Link
                  key={`mobile-${action.label}-${action.href}`}
                  to={action.href}
                  reloadDocument={shouldForceDocumentNavigation}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 block border border-[#8f1d2b] bg-[#7a131d] px-4 py-3 text-center text-sm font-black text-[#fff4dc]"
                >
                  {action.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </header>

      {searchOpen ? (
        <div className="fixed inset-0 z-[100] bg-[#080706]/88 px-4 pt-20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="mx-auto max-w-2xl border border-[#37312c] bg-[#0b0908] p-3 shadow-[0_36px_100px_-58px_rgba(0,0,0,0.92)]" dir={theme.direction}>
            <div className="relative">
              <svg
                className={`absolute ${theme.direction === "rtl" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-[#8b6b3e]`}
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder={theme.direction === "rtl" ? "ابحث عن قطعية أو وزن..." : "Search cuts or weights..."}
                className={`h-14 w-full border border-[#4a4138] bg-[#15110f] text-base font-bold text-[#fff7e8] outline-none transition-colors placeholder:text-[#81756b] focus:border-[#b99154] ${
                  theme.direction === "rtl" ? "pe-12 ps-12" : "ps-12 pe-12"
                }`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Escape" && closeSearchOverlay()}
              />
              <button
                onClick={closeSearchOverlay}
                className={`absolute ${theme.direction === "rtl" ? "left-3" : "right-3"} top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[#b7ab9c] transition-colors hover:text-[#fff7e8]`}
                aria-label={theme.direction === "rtl" ? "إغلاق البحث" : "Close search"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {query.length > 2 ? (
              <div className="mt-3 border border-[#37312c] bg-[#080706] p-3">
                <p className="mb-3 text-start text-sm font-semibold text-[#d7b674]">
                  {theme.direction === "rtl"
                    ? `نتائج البحث عن "${query}"`
                    : `Results for "${query}"`}
                </p>
                <SearchResults
                  results={results}
                  isLoading={isLoading}
                  close={closeSearchOverlay}
                />
                <Link
                  to={moreResultsPath}
                  onClick={closeSearchOverlay}
                  className="mt-3 inline-flex items-center justify-center border border-[#8b6b3e] px-4 py-2 text-sm font-bold text-[#d7b674] transition-colors hover:bg-[#15110f]"
                >
                  {theme.direction === "rtl" ? "عرض كل النتائج" : "View all results"}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};

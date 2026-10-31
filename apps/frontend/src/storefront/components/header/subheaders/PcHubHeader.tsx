import React from "react";
import { Link } from "react-router-dom";
import { StorefrontHomeLink } from "../storefrontHeaderHelpers";
import { StorefrontSearchOverlay } from "./StorefrontSearchOverlay";
import type { StorefrontHeaderController } from "../storefrontHeaderTypes";

interface PcHubHeaderProps {
  controller: StorefrontHeaderController;
}

export const PcHubHeader: React.FC<PcHubHeaderProps> = ({ controller }) => {
  const {
    theme,
    handlePcHubSearchSubmit,
    query,
    setQuery,
    brandHomeLinkProps,
    displayStoreName,
    showCart,
    setIsOpen,
    totalItems,
    mobileMenuOpen,
    setMobileMenuOpen,
    showSearch,
    setSearchOpen,
    navLinks,
    isActive,
    searchOpen,
    closeSearchOverlay,
    results,
    isLoading,
    moreResultsPath,
  } = controller;

  return (
    <>
      <header
        dir={theme.direction}
        className="sticky top-0 z-50 w-full border-b border-[#e8edf3] bg-white/95 shadow-[0_16px_40px_-36px_rgba(15,23,42,0.32)] backdrop-blur"
      >
        <div className="container px-4 md:px-6">
          <div className="hidden items-center gap-6 py-4 md:grid md:grid-cols-[auto_minmax(18rem,1fr)_auto]">
            <StorefrontHomeLink
              {...brandHomeLinkProps}
              className="flex items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[0.8rem] bg-[#facc15] text-[#111827] shadow-[0_12px_24px_-18px_rgba(250,204,21,0.75)]">
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
                  <path d="M12 19v2" />
                  <path d="M9 21h6" />
                </svg>
              </span>
              <span className="font-heading text-2xl font-semibold tracking-tight text-[#111827]">
                {displayStoreName}
              </span>
            </StorefrontHomeLink>

            <form
              onSubmit={handlePcHubSearchSubmit}
              className="flex items-center overflow-hidden rounded-full border border-[#e5e7eb] bg-[#f8fafc] shadow-[0_10px_24px_-22px_rgba(15,23,42,0.18)]"
            >
              <button
                type="button"
                className="px-5 py-3 text-sm font-medium text-[#6b7280] transition-colors hover:text-[#111827]"
              >
                {theme.direction === "rtl" ? "كل الأقسام" : "All Depts"}
              </button>
              <div className="h-5 w-px bg-[#e5e7eb]" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  theme.direction === "rtl"
                    ? "ابحث عن لابتوب، شاشة، أو إكسسوار..."
                    : "Search electronics, gadgets, and more..."
                }
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af]"
              />
              <button
                type="submit"
                className="flex h-12 w-14 items-center justify-center bg-[#facc15] text-[#111827] transition-colors hover:bg-[#f5c000]"
                aria-label={theme.direction === "rtl" ? "بحث" : "Search"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
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
            </form>

            <div className="flex items-center gap-6 text-[#111827]">
              <div className="hidden cursor-default flex-col text-start lg:flex">
                <span className="text-[11px] font-light text-[#9ca3af]">
                  {theme.direction === "rtl"
                    ? "مرحبًا، سجّل دخولك"
                    : "Hello, Sign in"}
                </span>
                <span className="text-sm font-medium">
                  {theme.direction === "rtl"
                    ? "الحساب والقوائم"
                    : "Account & Lists"}
                </span>
              </div>
              <div className="hidden cursor-default flex-col text-start lg:flex">
                <span className="text-[11px] font-light text-[#9ca3af]">
                  {theme.direction === "rtl" ? "الاسترجاع" : "Returns"}
                </span>
                <span className="text-sm font-medium">
                  {theme.direction === "rtl" ? "والطلبات" : "& Orders"}
                </span>
              </div>
              {showCart ? (
                <button
                  onClick={() => setIsOpen(true)}
                  className="relative flex items-center gap-2 text-[#111827] transition-colors hover:text-[#f59e0b]"
                  aria-label={
                    theme.direction === "rtl"
                      ? `سلة التسوق (${totalItems} منتجات)`
                      : `Shopping cart (${totalItems} items)`
                  }
                >
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    {totalItems > 0 ? (
                      <span className="absolute -end-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#facc15] text-[11px] font-semibold text-[#111827]">
                        {totalItems}
                      </span>
                    ) : null}
                  </div>
                  <span className="pt-2 text-sm font-medium">
                    {theme.direction === "rtl" ? "السلة" : "Cart"}
                  </span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 md:hidden">
            <div className="flex items-center gap-3">
              <button
                className="rounded-full p-2 text-[#111827] transition-colors hover:bg-[#f3f4f6]"
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
                className="flex items-center gap-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[0.75rem] bg-[#facc15] text-[#111827]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
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
                <span className="font-heading text-lg font-semibold text-[#111827]">
                  {displayStoreName}
                </span>
              </StorefrontHomeLink>
            </div>
            <div className="flex items-center gap-1">
              {showSearch ? (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="rounded-full p-2 text-[#111827] transition-colors hover:bg-[#f3f4f6]"
                  aria-label={theme.direction === "rtl" ? "بحث" : "Search"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
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
                </button>
              ) : null}
              {showCart ? (
                <button
                  onClick={() => setIsOpen(true)}
                  className="relative rounded-full p-2 text-[#111827] transition-colors hover:bg-[#f3f4f6]"
                  aria-label={
                    theme.direction === "rtl"
                      ? `سلة التسوق (${totalItems} منتجات)`
                      : `Shopping cart (${totalItems} items)`
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  {totalItems > 0 ? (
                    <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#facc15] text-[10px] font-semibold text-[#111827]">
                      {totalItems}
                    </span>
                  ) : null}
                </button>
              ) : null}
            </div>
          </div>
          <div className="pb-3 md:hidden">
            <form
              onSubmit={handlePcHubSearchSubmit}
              className="flex items-center overflow-hidden rounded-full border border-[#e5e7eb] bg-[#f8fafc] shadow-[0_10px_24px_-22px_rgba(15,23,42,0.18)]"
            >
              <button
                type="button"
                className="px-3.5 py-2.5 text-[12px] font-medium text-[#6b7280] transition-colors hover:text-[#111827]"
              >
                {theme.direction === "rtl" ? "الكل" : "All"}
              </button>
              <div className="h-4 w-px bg-[#e5e7eb]" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  theme.direction === "rtl"
                    ? "ابحث عن لابتوب، شاشة، أو إكسسوار..."
                    : "Search electronics, gadgets, and more..."
                }
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af]"
              />
              <button
                type="submit"
                className="flex h-10 w-11 items-center justify-center rounded-full bg-[#facc15] text-[#111827] transition-colors hover:bg-[#f5c000]"
                aria-label={theme.direction === "rtl" ? "بحث" : "Search"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
            </form>
          </div>
        </div>

        <div className="border-t border-[#edf1f4] bg-white">
          <div className="container px-4 md:px-6">
            <div className="hidden items-center gap-5 overflow-x-auto py-3 text-sm md:flex">
              <span className="inline-flex items-center gap-2 font-medium text-[#111827]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
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
                {theme.direction === "rtl" ? "الكل" : "All"}
              </span>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`whitespace-nowrap transition-colors ${
                    isActive(link.to)
                      ? "font-medium text-[#111827]"
                      : "font-light text-[#6b7280] hover:text-[#111827]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {mobileMenuOpen ? (
              <div className="space-y-1 border-t border-[#edf1f4] bg-white py-3 md:hidden">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-2xl px-3 py-2.5 text-sm transition-colors ${
                      isActive(link.to)
                        ? "bg-[#111827] text-white"
                        : "text-[#374151] hover:bg-[#f3f4f6]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
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

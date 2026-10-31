import React from "react";
import { Link } from "react-router-dom";
import { StorefrontHomeLink } from "../storefrontHeaderHelpers";
import { StorefrontSearchOverlay } from "./StorefrontSearchOverlay";
import type { StorefrontHeaderController } from "../storefrontHeaderTypes";

interface DigitalCommandHeaderProps {
  controller: StorefrontHeaderController;
}

export const DigitalCommandHeader: React.FC<DigitalCommandHeaderProps> = ({ controller }) => {
  const {
    theme,
    digitalCommandRail,
    brandHomeLinkProps,
    displayStoreName,
    showSearch,
    handlePcHubSearchSubmit,
    query,
    setQuery,
    showCart,
    setIsOpen,
    totalItems,
    mobileMenuOpen,
    setMobileMenuOpen,
    setSearchOpen,
    showDigitalCommandMobileSearch,
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
        className="sticky top-0 z-50 w-full border-b border-[#dfe6ef] bg-[rgba(255,255,255,0.96)] shadow-[0_18px_48px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl"
      >
        <div className="border-b border-[#edf1f6] bg-[linear-gradient(180deg,#fbfcfe_0%,#f7f9fc_100%)]">
          <div className="container hidden h-10 items-center justify-between gap-4 overflow-hidden px-4 md:flex md:px-6">
            <span className="inline-flex items-center gap-2 border border-[#dce3ec] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#516170]">
              <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
              Digital Desk
            </span>
            <div className="flex flex-1 items-center justify-end gap-3 overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-[0.22em] text-[#607184]">
              {digitalCommandRail.map((item, index) => (
                <React.Fragment key={item}>
                  {index > 0 ? <span className="opacity-30">/</span> : null}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="container px-4 md:px-6">
          <div className="hidden items-center gap-6 py-4 md:grid md:grid-cols-[auto_minmax(18rem,1fr)_auto]">
            <StorefrontHomeLink
              {...brandHomeLinkProps}
              className="flex items-center gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[#dce3ec] bg-[linear-gradient(180deg,#161c26_0%,#253246_100%)] text-[11px] font-black uppercase tracking-[0.22em] text-[#f8fafc] shadow-[0_18px_40px_-28px_rgba(15,23,42,0.34)]">
                SD
              </span>
              <span className="flex flex-col text-start leading-none">
                <span className="font-heading text-[1.22rem] font-black tracking-[0.04em] text-[#161c26]">
                  {displayStoreName}
                </span>
                <span className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#8a97a7]">
                  أجهزة وملحقات
                </span>
              </span>
            </StorefrontHomeLink>

            {showSearch ? (
              <form
                onSubmit={handlePcHubSearchSubmit}
                className="flex items-center overflow-hidden rounded-full border border-[#dce3ec] bg-[#f8fafc] shadow-[0_12px_28px_-24px_rgba(15,23,42,0.14)]"
              >
                <button
                  type="button"
                  className="px-5 py-3 text-sm font-bold text-[#516170] transition-colors hover:text-[#161c26]"
                >
                  {theme.direction === "rtl" ? "كل الأقسام" : "All sections"}
                </button>
                <div className="h-5 w-px bg-[#dce3ec]" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={
                    theme.direction === "rtl"
                      ? "ابحث عن Laptop أو Keyboard أو Hub..."
                      : "Search laptop, keyboard, or hub..."
                  }
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#161c26] outline-none placeholder:text-[#8a97a7]"
                />
                <button
                  type="submit"
                  className="flex h-12 w-14 items-center justify-center bg-[#161c26] text-white transition-colors hover:bg-[#0f141c]"
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
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <div className="hidden rounded-[1rem] border border-[#dce3ec] bg-white px-4 py-2.5 text-start shadow-[0_16px_30px_-26px_rgba(15,23,42,0.12)] lg:block">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a97a7]">
                  {theme.direction === "rtl" ? "الدعم" : "Support"}
                </p>
                <p className="mt-1 text-sm font-black text-[#161c26]">
                  {theme.direction === "rtl"
                    ? "رد أسرع قبل الشراء"
                    : "Fast pre-purchase help"}
                </p>
              </div>
              {showCart ? (
                <button
                  onClick={() => setIsOpen(true)}
                  className="relative inline-flex items-center gap-2 rounded-full border border-[#dce3ec] bg-white px-4 py-2.5 text-sm font-black text-[#161c26] shadow-[0_16px_30px_-26px_rgba(15,23,42,0.12)] transition-colors hover:border-[#f59e0b] hover:text-[#b45309]"
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
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  <span>{theme.direction === "rtl" ? "السلة" : "Cart"}</span>
                  {totalItems > 0 ? (
                    <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#161c26] px-1.5 text-[10px] font-black text-white">
                      {totalItems}
                    </span>
                  ) : null}
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 md:hidden">
            <div className="flex items-center gap-3">
              <button
                className="rounded-full p-2 text-[#161c26] transition-colors hover:bg-[#f3f6fa]"
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
                <span className="grid h-9 w-9 place-items-center rounded-[0.9rem] bg-[#161c26] text-[10px] font-black uppercase tracking-[0.18em] text-white">
                  SD
                </span>
                <span className="font-heading text-lg font-black text-[#161c26]">
                  {displayStoreName}
                </span>
              </StorefrontHomeLink>
            </div>
            <div className="flex items-center gap-1">
              {showSearch ? (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="rounded-full p-2 text-[#161c26] transition-colors hover:bg-[#f3f6fa]"
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
                  className="relative rounded-full p-2 text-[#161c26] transition-colors hover:bg-[#f3f6fa]"
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
                    <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#161c26] text-[10px] font-black text-white">
                      {totalItems}
                    </span>
                  ) : null}
                </button>
              ) : null}
            </div>
          </div>

          {showDigitalCommandMobileSearch ? (
            <div className="pb-3 md:hidden">
              <form
                onSubmit={handlePcHubSearchSubmit}
                className="flex items-center overflow-hidden rounded-full border border-[#dce3ec] bg-[#f8fafc] shadow-[0_10px_24px_-22px_rgba(15,23,42,0.14)]"
              >
                <button
                  type="button"
                  className="px-3.5 py-2.5 text-[12px] font-bold text-[#607184] transition-colors hover:text-[#161c26]"
                >
                  {theme.direction === "rtl" ? "الكل" : "All"}
                </button>
                <div className="h-4 w-px bg-[#dce3ec]" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={
                    theme.direction === "rtl"
                      ? "ابحث عن Laptop أو Mouse أو Hub..."
                      : "Search laptop, mouse, or hub..."
                  }
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[#161c26] outline-none placeholder:text-[#8a97a7]"
                />
                <button
                  type="submit"
                  className="flex h-10 w-11 items-center justify-center rounded-full bg-[#161c26] text-white transition-colors hover:bg-[#0f141c]"
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
          ) : null}
        </div>

        <div className="border-t border-[#edf1f6] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
          <div className="container px-4 md:px-6">
            <div className="hidden items-center gap-5 overflow-x-auto py-3 text-sm md:flex">
              <span className="inline-flex items-center gap-2 font-black text-[#161c26]">
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
                {theme.direction === "rtl"
                  ? "تسوق حسب الفئة"
                  : "Shop by category"}
              </span>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`whitespace-nowrap rounded-full px-4 py-2 transition-colors ${
                    isActive(link.to)
                      ? "border border-[#dce3ec] bg-white font-black text-[#161c26] shadow-[0_14px_30px_-24px_rgba(15,23,42,0.12)]"
                      : "font-bold text-[#607184] hover:bg-white hover:text-[#161c26]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {mobileMenuOpen ? (
              <div className="space-y-1 border-t border-[#edf1f6] bg-white py-3 md:hidden">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-2xl px-3 py-2.5 text-sm transition-colors ${
                      isActive(link.to)
                        ? "bg-[#161c26] text-white"
                        : "text-[#374151] hover:bg-[#f3f6fa]"
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

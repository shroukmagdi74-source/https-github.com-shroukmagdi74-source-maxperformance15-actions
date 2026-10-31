import React from "react";
import { Link } from "react-router-dom";
import { buildStorefrontPath } from "../../../utils/paths";
import { StorefrontSearchResults as SearchResults } from "../../StorefrontSearchResults";
import { StorefrontHomeLink } from "../storefrontHeaderHelpers";
import type { StorefrontHeaderController } from "../storefrontHeaderTypes";

interface RedlineAutoHeaderProps {
  controller: StorefrontHeaderController;
}

export const RedlineAutoHeader: React.FC<RedlineAutoHeaderProps> = ({ controller }) => {
  const {
    theme,
    brandHomeLinkProps,
    displayLogoUrl,
    displayStoreName,
    navLinks,
    isActive,
    shouldForceDocumentNavigation,
    location,
    showSearch,
    setSearchOpen,
    searchOpen,
    showCart,
    setIsOpen,
    totalItems,
    mobileMenuOpen,
    setMobileMenuOpen,
    query,
    setQuery,
    closeSearchOverlay,
    results,
    isLoading,
    moreResultsPath,
  } = controller;

  const announcementText =
    theme.header?.announcementText ||
    (theme.direction === "rtl"
      ? "عزل حراري 98% تفصيل فابريقة بالمللي • معاينة وتجربة على باب سيارتك قبل الدفع • ضمان 14 يوم استبدال"
      : "98% Thermal Insulation • Factory Custom Fit • Inspect & Try Before Payment • 14-Day Warranty");

  return (
    <>
      <header
        dir={theme.direction}
        className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0d10]/95 text-white shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all"
      >
        {/* Top Automotive Telemetry & Announcement Rail */}
        <div className="border-b border-white/[0.08] bg-[#06080a] py-2 px-4 text-[11px] font-medium text-white/80 select-none">
          <div className="container mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto [scrollbar-width:none]">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-600/15 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                عزل حراري 98%
              </span>
              <span className="shrink-0 text-white/90 font-semibold">
                {announcementText}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3 text-[11px]">
              <a
                href="https://wa.me/201500073277"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-white/75 hover:text-red-400 transition-colors"
              >
                <span className="font-bold">واتساب المبيعات:</span>
                <span dir="ltr" className="font-mono text-white/90">015 0007 3277</span>
              </a>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px] sm:text-[11px]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                ضمان 14 يوم
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="container flex h-16 sm:h-20 items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
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

            {/* Brand Logo & Emblem */}
            <StorefrontHomeLink {...brandHomeLinkProps} className="flex items-center gap-3 shrink-0">
              {displayLogoUrl ? (
                <img
                  src={displayLogoUrl}
                  alt={displayStoreName}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-red-500/40 bg-gradient-to-br from-[#1c0808] via-[#0d0f12] to-[#1a1e24] shadow-[0_0_20px_rgba(225,29,72,0.35)]">
                    <span className="font-heading text-sm sm:text-base font-black italic tracking-tighter text-white">RL</span>
                    <span className="absolute -bottom-0.5 inset-x-2 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
                  </div>
                  <div className="flex flex-col text-start leading-none">
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading text-lg sm:text-xl font-black italic tracking-wide text-white">
                        {displayStoreName || "RED LINE"}
                      </span>
                      <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black italic tracking-wider text-white shadow-sm">
                        AUTO
                      </span>
                    </div>
                    <span className="mt-1 text-[10px] font-bold tracking-wider text-white/50">
                      ستائر سيارات فابريقة
                    </span>
                  </div>
                </>
              )}
            </StorefrontHomeLink>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    reloadDocument={shouldForceDocumentNavigation}
                    className={`rounded-full px-3.5 py-1.5 text-xs lg:text-sm font-semibold transition-all ${
                      active
                        ? "bg-red-600/20 text-white border border-red-500/40 shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                        : "text-white/75 hover:text-white hover:bg-white/[0.07]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions & Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://wa.me/201500073277"
              target="_blank"
              rel="noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 transition-colors"
            >
              <span>واتساب</span>
            </a>

            <Link
              to={buildStorefrontPath(location.pathname, "/shop", location.search)}
              reloadDocument={shouldForceDocumentNavigation}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-4 sm:px-5 py-2 text-xs sm:text-sm font-black text-white shadow-[0_0_24px_rgba(225,29,72,0.5)] hover:from-red-500 hover:to-rose-500 hover:scale-[1.02] active:scale-[0.97] transition-all"
            >
              اطلب ستارتك
            </Link>

            {showSearch ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded-full p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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
                className="relative rounded-full p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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
                  <span className="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
                    {totalItems}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0a0d10]/98 px-4 py-5 backdrop-blur-2xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold text-white/60">أقسام وموديلات الستائر</span>
              <span className="rounded-full bg-red-600/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400">
                معاينة وتجربة قبل الدفع
              </span>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  reloadDocument={shouldForceDocumentNavigation}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                    isActive(link.to)
                      ? "bg-red-600/20 text-white border border-red-500/30 font-bold"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  <svg className="w-4 h-4 rtl:rotate-180 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
              <Link
                to={buildStorefrontPath(location.pathname, "/shop", location.search)}
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-sm font-black text-white shadow-[0_0_24px_rgba(225,29,72,0.4)]"
              >
                اطلب ستارة سيارتك الآن
              </Link>
              <a
                href="https://wa.me/201500073277"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/90 hover:bg-white/10"
              >
                واتساب المبيعات: 01500073277
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      {searchOpen ? (
        <div className="fixed inset-0 z-[100] bg-[#0a0d10]/88 px-4 pt-20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="mx-auto max-w-2xl border border-white/15 bg-[#0f1318] p-3 rounded-2xl shadow-[0_36px_100px_-58px_rgba(0,0,0,0.95)]" dir={theme.direction}>
            <div className="relative">
              <svg
                className={`absolute ${theme.direction === "rtl" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-red-500`}
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
                placeholder={
                  theme.direction === "rtl"
                    ? "ابحث عن موديل سيارتك أو باقة الستائر..."
                    : "Search your car model or curtain set..."
                }
                className={`h-14 w-full rounded-xl border border-white/15 bg-[#141920] text-base text-white outline-none transition-colors placeholder:text-white/40 focus:border-red-500 ${
                  theme.direction === "rtl" ? "pe-12 ps-12" : "ps-12 pe-12"
                }`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) =>
                  event.key === "Escape" && closeSearchOverlay()
                }
              />
              <button
                type="button"
                onClick={closeSearchOverlay}
                className={`absolute ${theme.direction === "rtl" ? "left-3" : "right-3"} top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white`}
                aria-label={theme.direction === "rtl" ? "إغلاق البحث" : "Close search"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {query.length > 2 ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-[#141920] p-3">
                <p className="mb-3 text-start text-sm font-semibold text-white/70">
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
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-500"
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

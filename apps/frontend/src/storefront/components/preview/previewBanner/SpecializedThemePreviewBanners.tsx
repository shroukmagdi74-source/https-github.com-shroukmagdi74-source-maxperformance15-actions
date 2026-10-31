import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontPreviewBannerController } from './useStorefrontPreviewBannerController';

export const DentalLabPreviewBanner: React.FC<{ controller: StorefrontPreviewBannerController }> = ({
  controller,
}) => {
  const { marketplaceThemesUrl, storefrontSettingsUrl } = controller;

  return (
    <aside aria-label="شريط معاينة القالب" className="w-full border-b border-cyan-500/20 bg-[#060913] text-slate-300 py-2 px-3 sm:px-6 relative z-[75]">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="font-semibold text-white">معاينة: معمل أسنان رقمي CAD/CAM 2026</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">— استعراض حي قبل التطبيق</span>
        </div>
        <div className="flex items-center gap-2 ms-auto">
          <Link
            to={marketplaceThemesUrl}
            className="inline-flex items-center justify-center rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 text-xs shadow-sm transition-colors"
          >
            العودة للقوالب
          </Link>
          <Link
            to={storefrontSettingsUrl}
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium px-3 py-1.5 text-xs transition-colors"
          >
            تخصيص
          </Link>
        </div>
      </div>
    </aside>
  );
};

export const RedlineAutoPreviewBanner: React.FC<{ controller: StorefrontPreviewBannerController }> = ({
  controller,
}) => {
  const { marketplaceThemesUrl } = controller;

  return (
    <div className="pointer-events-none fixed bottom-20 md:bottom-4 start-4 z-[76]">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-[#0a0d10]/95 p-1.5 pe-4 shadow-[0_20px_45px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <Link
          to={marketplaceThemesUrl}
          aria-label="العودة إلى القوالب"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white transition-transform hover:-translate-y-0.5 hover:bg-red-500 shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rtl:rotate-180"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex flex-col text-start">
          <span className="text-[11px] font-bold text-white">معاينة Red Line Auto</span>
          <span className="text-[9px] text-white/50">اضغط للعودة إلى القوالب</span>
        </div>
      </div>
    </div>
  );
};

export const MobileViewportPreviewDock: React.FC<{ controller: StorefrontPreviewBannerController }> = ({
  controller,
}) => {
  const { isBiteRush, isCafeDemo, isPharmacy, marketplaceThemesUrl, storefrontSettingsUrl } = controller;

  const mobileDockClassName = isBiteRush
    ? 'border-[#f8c08c]/55 bg-[#111111]/92'
    : isCafeDemo
      ? 'border-[#d9c1ab]/70 bg-[rgba(36,25,18,0.92)]'
      : isPharmacy
        ? 'border-[#99f6e4]/70 bg-[rgba(247,255,253,0.94)]'
        : 'border-border/70 bg-background/94';
  const mobileBackClassName = isBiteRush
    ? 'bg-[#f97316] text-white shadow-[0_16px_34px_-18px_rgba(249,115,22,0.95)] hover:bg-[#ea580c]'
    : isCafeDemo
      ? 'bg-[#d6a77a] text-[#2c1d14] shadow-[0_16px_34px_-18px_rgba(214,167,122,0.7)] hover:bg-[#c99666]'
      : isPharmacy
        ? 'bg-[#0f766e] text-white shadow-[0_16px_34px_-18px_rgba(15,118,110,0.5)] hover:bg-[#0b5f59]'
        : 'bg-primary text-primary-foreground shadow-[0_16px_34px_-18px_rgba(17,17,17,0.22)] hover:opacity-95';
  const mobileCustomizeClassName = isBiteRush
    ? 'border-white/12 bg-white/8 text-[#ffd7bb] hover:bg-white/12'
    : isCafeDemo
      ? 'border-[#d9c1ab]/45 bg-white/8 text-[#f4dfcc] hover:bg-white/12'
      : isPharmacy
        ? 'border-[#99f6e4] bg-white text-[#0f766e] hover:bg-[#ecfdf9]'
        : 'border-border bg-background text-foreground hover:border-primary/40 hover:text-primary';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[76] flex justify-end px-3">
      <div
        className={`pointer-events-auto inline-flex items-center gap-1 rounded-full border p-1.5 shadow-[0_26px_80px_-34px_rgba(17,17,17,0.32)] backdrop-blur-xl ${mobileDockClassName}`}
      >
        <Link
          to={marketplaceThemesUrl}
          aria-label="العودة إلى القوالب"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5 ${mobileBackClassName}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rtl:rotate-180"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <Link
          to={storefrontSettingsUrl}
          aria-label="تخصيص سريع"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-transform hover:-translate-y-0.5 ${mobileCustomizeClassName}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v4" />
            <path d="M12 17v4" />
            <path d="M3 12h4" />
            <path d="M17 12h4" />
            <path d="m5.64 5.64 2.83 2.83" />
            <path d="m15.53 15.53 2.83 2.83" />
            <path d="m5.64 18.36 2.83-2.83" />
            <path d="m15.53 8.47 2.83-2.83" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export const ElessiPackPreviewDock: React.FC<{ controller: StorefrontPreviewBannerController }> = ({
  controller,
}) => {
  const { marketplaceThemesUrl, storefrontSettingsUrl } = controller;

  return (
    <div className="pointer-events-none fixed bottom-4 start-4 z-[76]">
      <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/92 p-1 shadow-[0_18px_48px_-34px_rgba(17,17,17,0.26)] backdrop-blur-xl">
        <Link
          to={marketplaceThemesUrl}
          aria-label="العودة إلى القوالب"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:-translate-y-0.5 hover:opacity-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rtl:rotate-180"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <Link
          to={storefrontSettingsUrl}
          aria-label="تخصيص سريع"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-transform hover:-translate-y-0.5 hover:border-primary/45 hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v4" />
            <path d="M12 17v4" />
            <path d="M3 12h4" />
            <path d="M17 12h4" />
            <path d="m5.64 5.64 2.83 2.83" />
            <path d="m15.53 15.53 2.83 2.83" />
            <path d="m5.64 18.36 2.83-2.83" />
            <path d="m15.53 8.47 2.83-2.83" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export const AdminOriginPreviewDock: React.FC<{ controller: StorefrontPreviewBannerController }> = ({
  controller,
}) => {
  const { isSoleaFemme, marketplaceThemesUrl } = controller;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[76] flex justify-end px-3 md:px-6">
      <Link
        to={marketplaceThemesUrl}
        className={`pointer-events-auto inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold shadow-[0_24px_60px_-30px_rgba(17,17,17,0.45)] transition-transform hover:-translate-y-0.5 ${
          isSoleaFemme
            ? 'bg-primary text-primary-foreground'
            : 'bg-amber-600 text-white hover:bg-amber-700'
        }`}
      >
        العودة إلى متجر القوالب
      </Link>
    </div>
  );
};

export const BiteRushPreviewDock: React.FC<{ controller: StorefrontPreviewBannerController }> = ({
  controller,
}) => {
  const { isBiteRush, isCafeDemo, marketplaceThemesUrl, storefrontSettingsUrl } = controller;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[76] flex justify-end px-3 md:px-6">
      <div
        className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full border p-1.5 shadow-[0_26px_80px_-34px_rgba(17,17,17,0.72)] backdrop-blur-xl ${
          isBiteRush
            ? 'border-[#f8c08c]/55 bg-[#111111]/92'
            : isCafeDemo
              ? 'border-[#d9c1ab]/75 bg-[rgba(36,25,18,0.92)]'
              : 'border-[#99f6e4]/70 bg-[rgba(247,255,253,0.94)]'
        }`}
      >
        <span
          className={`hidden items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] sm:inline-flex ${
            isBiteRush
              ? 'bg-white/8 text-[#ffd7bb]'
              : isCafeDemo
                ? 'bg-white/8 text-[#f4dfcc]'
                : 'bg-[#14b8a6]/10 text-[#0f766e]'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isBiteRush ? 'bg-[#f97316]' : isCafeDemo ? 'bg-[#d6a77a]' : 'bg-[#14b8a6]'}`}
          />
          وضع المعاينة
        </span>
        <Link
          to={marketplaceThemesUrl}
          aria-label="العودة إلى القوالب"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-0.5 md:h-auto md:w-auto md:gap-2 md:px-4 md:py-2.5 ${
            isBiteRush
              ? 'bg-[#f97316] shadow-[0_16px_34px_-18px_rgba(249,115,22,0.95)] hover:bg-[#ea580c]'
              : isCafeDemo
                ? 'bg-[#d6a77a] text-[#2c1d14] shadow-[0_16px_34px_-18px_rgba(214,167,122,0.7)] hover:bg-[#c99666]'
                : 'bg-[#0f766e] shadow-[0_16px_34px_-18px_rgba(15,118,110,0.5)] hover:bg-[#0b5f59]'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rtl:rotate-180"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="hidden text-sm font-bold md:inline">القوالب</span>
        </Link>
        <Link
          to={storefrontSettingsUrl}
          aria-label="تخصيص سريع"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-transform hover:-translate-y-0.5 md:h-auto md:w-auto md:gap-2 md:px-4 md:py-2.5 ${
            isBiteRush
              ? 'border-white/12 bg-white/8 text-[#ffd7bb] hover:bg-white/12'
              : isCafeDemo
                ? 'border-[#d9c1ab]/45 bg-white/8 text-[#f4dfcc] hover:bg-white/12'
                : 'border-[#99f6e4] bg-white text-[#0f766e] hover:bg-[#ecfdf9]'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v4" />
            <path d="M12 17v4" />
            <path d="M3 12h4" />
            <path d="M17 12h4" />
            <path d="m5.64 5.64 2.83 2.83" />
            <path d="m15.53 15.53 2.83 2.83" />
            <path d="m5.64 18.36 2.83-2.83" />
            <path d="m15.53 8.47 2.83-2.83" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
          <span className="hidden text-sm font-bold md:inline">تخصيص</span>
        </Link>
      </div>
    </div>
  );
};

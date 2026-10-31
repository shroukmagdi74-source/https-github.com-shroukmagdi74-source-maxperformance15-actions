import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontPreviewBannerController } from './useStorefrontPreviewBannerController';

export interface PillThemeDockConfig {
  badgeText: string;
  badgeBg: string;
  badgeTextColor: string;
  dotBg: string;
  dockBorder: string;
  dockBg?: string;
  dockShadow: string;
  backBtnBg: string;
  backBtnHover?: string;
  backBtnShadow: string;
  customizeBtnBorder: string;
  customizeBtnBg: string;
  customizeBtnTextColor: string;
  customizeBtnShadow?: string;
  customizeBtnHoverBorder?: string;
  customizeBtnHoverText?: string;
}

export const PillThemePreviewDock: React.FC<{
  config: PillThemeDockConfig;
  marketplaceThemesUrl: string;
  storefrontSettingsUrl: string;
  centerOnMobile?: boolean;
}> = ({ config, marketplaceThemesUrl, storefrontSettingsUrl, centerOnMobile }) => {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-20 z-[76] flex px-3 md:top-24 md:justify-end md:px-6 ${
        centerOnMobile ? 'justify-center' : 'justify-end'
      }`}
    >
      <div
        className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full border p-1.5 backdrop-blur-xl ${
          config.dockBorder
        } ${config.dockBg || 'bg-white/92'} ${config.dockShadow}`}
      >
        <span
          className={`hidden items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] sm:inline-flex ${config.badgeBg} ${config.badgeTextColor}`}
        >
          <span className={`h-2 w-2 rounded-full ${config.dotBg}`} />
          {config.badgeText}
        </span>
        <Link
          to={marketplaceThemesUrl}
          aria-label="العودة إلى القوالب"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-0.5 md:h-auto md:w-auto md:gap-2 md:px-4 md:py-2.5 ${
            config.backBtnBg
          } ${config.backBtnShadow} ${config.backBtnHover || ''}`}
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
            config.customizeBtnBorder
          } ${config.customizeBtnBg} ${config.customizeBtnTextColor} ${
            config.customizeBtnShadow || ''
          } ${config.customizeBtnHoverBorder || ''} ${config.customizeBtnHoverText || ''}`}
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

export const renderThemePillDock = (
  controller: StorefrontPreviewBannerController,
): React.ReactElement | null => {
  const {
    isWomenFashion,
    isSoleaFemme,
    isAtelierNova,
    isRoseBoutique,
    isCarryLane,
    isHarvestFold,
    isSignalDeck,
    isPedalLab,
    isGlowRoutine,
    isGemAtelier,
    isTailSupply,
    isChronoGallery,
    isGarageFit,
    isSproutRoom,
    isPcHub,
    marketplaceThemesUrl,
    storefrontSettingsUrl,
  } = controller;

  let config: PillThemeDockConfig | null = null;
  let centerOnMobile = false;

  if (isWomenFashion) {
    config = {
      badgeText: 'معاينة',
      badgeBg: 'bg-[#fff4f0]',
      badgeTextColor: 'text-[#8b3d33]',
      dotBg: 'bg-[#d86b55]',
      dockBorder: 'border-[#ead9d8]',
      dockShadow: 'shadow-[0_24px_70px_-36px_rgba(107,33,49,0.22)]',
      backBtnBg: 'bg-[#3f2f35]',
      backBtnHover: 'hover:bg-[#2e2227]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(63,47,53,0.45)]',
      customizeBtnBorder: 'border-[#ead9d8]',
      customizeBtnBg: 'bg-[#fff7f5]',
      customizeBtnTextColor: 'text-[#8b3d33]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(216,107,85,0.18)]',
      customizeBtnHoverBorder: 'hover:border-[#d86b55]',
      customizeBtnHoverText: 'hover:bg-white',
    };
  } else if (isSoleaFemme) {
    config = {
      badgeText: 'Solea Preview',
      badgeBg: 'bg-[#2f232d]',
      badgeTextColor: 'text-white',
      dotBg: 'bg-[#d8b28a]',
      dockBorder: 'border-[#ead8cf]',
      dockBg: 'bg-[rgba(255,252,248,0.94)]',
      dockShadow: 'shadow-[0_24px_70px_-36px_rgba(47,35,45,0.22)]',
      backBtnBg: 'bg-[#2f232d]',
      backBtnHover: 'hover:bg-[#241a22]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(47,35,45,0.44)]',
      customizeBtnBorder: 'border-[#ead8cf]',
      customizeBtnBg: 'bg-white',
      customizeBtnTextColor: 'text-[#6f5448]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(111,84,72,0.14)]',
      customizeBtnHoverBorder: 'hover:border-[#d8b28a]',
      customizeBtnHoverText: 'hover:text-[#2f232d]',
    };
  } else if (isAtelierNova) {
    centerOnMobile = true;
    config = {
      badgeText: 'معاينة',
      badgeBg: 'bg-[#faf4ef]',
      badgeTextColor: 'text-[#7b6257]',
      dotBg: 'bg-[#b78f79]',
      dockBorder: 'border-[#ddd2ca]',
      dockShadow: 'shadow-[0_24px_70px_-36px_rgba(44,36,38,0.16)]',
      backBtnBg: 'bg-[#2c2426]',
      backBtnHover: 'hover:bg-[#1f191b]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(44,36,38,0.38)]',
      customizeBtnBorder: 'border-[#ddd2ca]',
      customizeBtnBg: 'bg-[#fffaf7]',
      customizeBtnTextColor: 'text-[#7b6257]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(123,98,87,0.14)]',
      customizeBtnHoverBorder: 'hover:border-[#b78f79]',
      customizeBtnHoverText: 'hover:bg-white',
    };
  } else if (isRoseBoutique) {
    centerOnMobile = true;
    config = {
      badgeText: 'معاينة',
      badgeBg: 'bg-[#fff5f4]',
      badgeTextColor: 'text-[#8d5568]',
      dotBg: 'bg-[#d9a2b1]',
      dockBorder: 'border-[#ead8d2]',
      dockShadow: 'shadow-[0_24px_70px_-36px_rgba(91,42,58,0.18)]',
      backBtnBg: 'bg-[#5c263b]',
      backBtnHover: 'hover:bg-[#4a1d30]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(92,38,59,0.38)]',
      customizeBtnBorder: 'border-[#ead8d2]',
      customizeBtnBg: 'bg-[#fffaf8]',
      customizeBtnTextColor: 'text-[#8d5568]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(160,97,120,0.14)]',
      customizeBtnHoverBorder: 'hover:border-[#d9a2b1]',
      customizeBtnHoverText: 'hover:bg-white',
    };
  } else if (isCarryLane) {
    config = {
      badgeText: 'Carry Preview',
      badgeBg: 'bg-[#fbf3ea]',
      badgeTextColor: 'text-[#8a5b40]',
      dotBg: 'bg-[#c77b48]',
      dockBorder: 'border-[#e7dacd]',
      dockBg: 'bg-[rgba(255,255,255,0.94)]',
      dockShadow: 'shadow-[0_22px_64px_-34px_rgba(61,41,29,0.22)]',
      backBtnBg: 'bg-[#2a211d]',
      backBtnHover: 'hover:bg-[#1d1714]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(42,33,29,0.54)]',
      customizeBtnBorder: 'border-[#e7dacd]',
      customizeBtnBg: 'bg-white',
      customizeBtnTextColor: 'text-[#7a5340]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(122,83,64,0.16)]',
      customizeBtnHoverBorder: 'hover:border-[#c77b48]',
      customizeBtnHoverText: 'hover:text-[#a25f39]',
    };
  } else if (isHarvestFold) {
    config = {
      badgeText: 'Harvest Preview',
      badgeBg: 'bg-[#fff8ef]',
      badgeTextColor: 'text-[#8a6546]',
      dotBg: 'bg-[#d39c4d]',
      dockBorder: 'border-[#eadfcd]',
      dockBg: 'bg-[rgba(255,255,255,0.94)]',
      dockShadow: 'shadow-[0_22px_64px_-34px_rgba(45,59,39,0.22)]',
      backBtnBg: 'bg-[#2d3b27]',
      backBtnHover: 'hover:bg-[#202a1c]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(45,59,39,0.52)]',
      customizeBtnBorder: 'border-[#eadfcd]',
      customizeBtnBg: 'bg-white',
      customizeBtnTextColor: 'text-[#6c5b49]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(108,91,73,0.16)]',
      customizeBtnHoverBorder: 'hover:border-[#d39c4d]',
      customizeBtnHoverText: 'hover:text-[#8c5d1e]',
    };
  } else if (isSignalDeck) {
    config = {
      badgeText: 'معاينة',
      badgeBg: 'bg-[#f7f9fc]',
      badgeTextColor: 'text-[#516170]',
      dotBg: 'bg-[#f59e0b]',
      dockBorder: 'border-[#dce3ec]',
      dockBg: 'bg-[rgba(255,255,255,0.94)]',
      dockShadow: 'shadow-[0_22px_64px_-34px_rgba(15,23,42,0.2)]',
      backBtnBg: 'bg-[#161c26]',
      backBtnHover: 'hover:bg-[#0d1219]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(22,28,38,0.5)]',
      customizeBtnBorder: 'border-[#dce3ec]',
      customizeBtnBg: 'bg-white',
      customizeBtnTextColor: 'text-[#516170]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(81,97,112,0.14)]',
      customizeBtnHoverBorder: 'hover:border-[#f59e0b]',
      customizeBtnHoverText: 'hover:text-[#b45309]',
    };
  } else if (isPedalLab) {
    config = {
      badgeText: 'Ride Preview',
      badgeBg: 'bg-[#f5f7fa]',
      badgeTextColor: 'text-[#516170]',
      dotBg: 'bg-[#d97706]',
      dockBorder: 'border-[#d9dee4]',
      dockBg: 'bg-[rgba(255,255,255,0.94)]',
      dockShadow: 'shadow-[0_22px_64px_-34px_rgba(18,34,48,0.22)]',
      backBtnBg: 'bg-[#1d2a33]',
      backBtnHover: 'hover:bg-[#121d24]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(29,42,51,0.52)]',
      customizeBtnBorder: 'border-[#d9dee4]',
      customizeBtnBg: 'bg-white',
      customizeBtnTextColor: 'text-[#516170]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(81,97,112,0.14)]',
      customizeBtnHoverBorder: 'hover:border-[#d97706]',
      customizeBtnHoverText: 'hover:text-[#b45309]',
    };
  } else if (isGlowRoutine) {
    config = {
      badgeText: 'Glow Preview',
      badgeBg: 'bg-[#fff6f1]',
      badgeTextColor: 'text-[#9a6354]',
      dotBg: 'bg-[#eb8b73]',
      dockBorder: 'border-[#ead7d1]',
      dockBg: 'bg-[rgba(255,255,255,0.94)]',
      dockShadow: 'shadow-[0_22px_64px_-34px_rgba(91,57,40,0.18)]',
      backBtnBg: 'bg-[#2f2422]',
      backBtnHover: 'hover:bg-[#241b1a]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(47,36,34,0.44)]',
      customizeBtnBorder: 'border-[#ead7d1]',
      customizeBtnBg: 'bg-white',
      customizeBtnTextColor: 'text-[#9a6354]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(154,99,84,0.14)]',
      customizeBtnHoverBorder: 'hover:border-[#d78b74]',
      customizeBtnHoverText: 'hover:text-[#8e5548]',
    };
  } else if (isGemAtelier) {
    config = {
      badgeText: 'Gem Preview',
      badgeBg: 'bg-[#fff6f1]',
      badgeTextColor: 'text-[#8f5c44]',
      dotBg: 'bg-[#d8a56a]',
      dockBorder: 'border-[#e7d7cf]',
      dockBg: 'bg-[rgba(255,255,255,0.94)]',
      dockShadow: 'shadow-[0_22px_64px_-34px_rgba(56,36,38,0.18)]',
      backBtnBg: 'bg-[#2d211e]',
      backBtnHover: 'hover:bg-[#211816]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(45,33,30,0.44)]',
      customizeBtnBorder: 'border-[#e7d7cf]',
      customizeBtnBg: 'bg-white',
      customizeBtnTextColor: 'text-[#8f5c44]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(143,92,68,0.14)]',
      customizeBtnHoverBorder: 'hover:border-[#d8a56a]',
      customizeBtnHoverText: 'hover:text-[#7b4f3d]',
    };
  } else if (isTailSupply) {
    config = {
      badgeText: 'Tail Preview',
      badgeBg: 'bg-[#f4faf4]',
      badgeTextColor: 'text-[#35624a]',
      dotBg: 'bg-[#f59e0b]',
      dockBorder: 'border-[#d9e3d7]',
      dockBg: 'bg-[rgba(255,255,255,0.94)]',
      dockShadow: 'shadow-[0_22px_64px_-34px_rgba(34,62,49,0.2)]',
      backBtnBg: 'bg-[#234233]',
      backBtnHover: 'hover:bg-[#183126]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(35,66,51,0.44)]',
      customizeBtnBorder: 'border-[#d9e3d7]',
      customizeBtnBg: 'bg-white',
      customizeBtnTextColor: 'text-[#35624a]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(53,98,74,0.14)]',
      customizeBtnHoverBorder: 'hover:border-[#f59e0b]',
      customizeBtnHoverText: 'hover:text-[#9a5f05]',
    };
  } else if (isChronoGallery) {
    config = {
      badgeText: 'Chrono Preview',
      badgeBg: 'bg-[#f7f8fa]',
      badgeTextColor: 'text-[#5f6974]',
      dotBg: 'bg-[#c59d52]',
      dockBorder: 'border-[#d8ddd7]',
      dockBg: 'bg-[rgba(255,255,255,0.94)]',
      dockShadow: 'shadow-[0_22px_64px_-34px_rgba(28,38,48,0.2)]',
      backBtnBg: 'bg-[#1f2731]',
      backBtnHover: 'hover:bg-[#151b22]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(31,39,49,0.44)]',
      customizeBtnBorder: 'border-[#d8ddd7]',
      customizeBtnBg: 'bg-white',
      customizeBtnTextColor: 'text-[#5f6974]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(95,105,116,0.14)]',
      customizeBtnHoverBorder: 'hover:border-[#c59d52]',
      customizeBtnHoverText: 'hover:text-[#8e6b1f]',
    };
  } else if (isGarageFit) {
    config = {
      badgeText: 'Garage Preview',
      badgeBg: 'bg-[#261d1a]',
      badgeTextColor: 'text-[#f6b26b]',
      dotBg: 'bg-[#f97316]',
      dockBorder: 'border-[#3b2a24]',
      dockBg: 'bg-[rgba(20,19,18,0.92)]',
      dockShadow: 'shadow-[0_22px_64px_-34px_rgba(12,12,12,0.48)]',
      backBtnBg: 'bg-[#f97316]',
      backBtnHover: 'hover:bg-[#ea580c]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(249,115,22,0.48)]',
      customizeBtnBorder: 'border-[#4b3329]',
      customizeBtnBg: 'bg-[#181614]',
      customizeBtnTextColor: 'text-[#f5d6b4]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(20,19,18,0.42)]',
      customizeBtnHoverBorder: 'hover:border-[#f97316]',
      customizeBtnHoverText: 'hover:text-[#ffb76c]',
    };
  } else if (isSproutRoom) {
    config = {
      badgeText: 'Plant Preview',
      badgeBg: 'bg-[#f6fbf1]',
      badgeTextColor: 'text-[#5b7d24]',
      dotBg: 'bg-[#83b735]',
      dockBorder: 'border-[#dfe7d5]',
      dockBg: 'bg-[rgba(255,255,255,0.94)]',
      dockShadow: 'shadow-[0_22px_64px_-34px_rgba(42,62,35,0.28)]',
      backBtnBg: 'bg-[#83b735]',
      backBtnHover: 'hover:bg-[#73a32b]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(131,183,53,0.7)]',
      customizeBtnBorder: 'border-[#dfe7d5]',
      customizeBtnBg: 'bg-white',
      customizeBtnTextColor: 'text-[#48603d]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(72,96,61,0.18)]',
      customizeBtnHoverBorder: 'hover:border-[#83b735]',
      customizeBtnHoverText: 'hover:text-[#6b9a29]',
    };
  } else if (isPcHub) {
    centerOnMobile = true;
    config = {
      badgeText: 'Preview',
      badgeBg: 'bg-[#111827]',
      badgeTextColor: 'text-white',
      dotBg: 'bg-[#facc15]',
      dockBorder: 'border-[#d7dde7]',
      dockShadow: 'shadow-[0_24px_70px_-34px_rgba(15,23,42,0.35)]',
      backBtnBg: 'bg-[#111827]',
      backBtnHover: 'hover:bg-[#1f2937]',
      backBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(17,24,39,0.72)]',
      customizeBtnBorder: 'border-[#f5d76c]',
      customizeBtnBg: 'bg-[#facc15]',
      customizeBtnTextColor: 'text-[#111827]',
      customizeBtnShadow: 'shadow-[0_16px_34px_-18px_rgba(250,204,21,0.62)]',
      customizeBtnHoverBorder: 'hover:bg-[#f5c400]',
    };
  }

  if (!config) {
    return null;
  }

  return (
    <PillThemePreviewDock
      config={config}
      marketplaceThemesUrl={marketplaceThemesUrl}
      storefrontSettingsUrl={storefrontSettingsUrl}
      centerOnMobile={centerOnMobile}
    />
  );
};

export const MenShoesPreviewBanner: React.FC<{ controller: StorefrontPreviewBannerController }> = ({
  controller,
}) => {
  const { theme, marketplaceThemesUrl, storefrontSettingsUrl } = controller;

  return (
    <div className="border-b border-[#eadccf] bg-[linear-gradient(180deg,#f9f1ea_0%,#fffdfa_100%)] backdrop-blur">
      <div className="container px-4 py-3 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#eadccf] bg-white px-3 py-1 text-[11px] font-black text-[#8d5d2f] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#f57a1d]" />
              معاينة سريعة
            </div>
            <p className="text-sm font-bold text-[#3b2414]">
              أنت تشاهد قالب {theme.name} قبل التطبيق.
            </p>
            <p className="text-xs leading-6 text-[#8c5f34]">
              هذه نسخة مراجعة فقط. ارجع للقوالب أو التخصيص عند الحاجة.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Link
              to={marketplaceThemesUrl}
              className="inline-flex items-center justify-center rounded-full bg-[#1f262b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#12181c]"
            >
              القوالب
            </Link>
            <Link
              to={storefrontSettingsUrl}
              className="inline-flex items-center justify-center rounded-full border border-[#ded0c2] bg-white px-4 py-2.5 text-sm font-bold text-[#4f4034] hover:border-[#f57a1d] hover:text-[#f57a1d]"
            >
              تخصيص
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DefaultStorefrontPreviewBanner: React.FC<{ controller: StorefrontPreviewBannerController }> = ({
  controller,
}) => {
  const { theme, isSoleaFemme, marketplaceThemesUrl, storefrontSettingsUrl } = controller;

  return (
    <div
      className={`border-b backdrop-blur ${
        isSoleaFemme
          ? 'border-primary/10 bg-[linear-gradient(90deg,hsl(var(--secondary)/0.95),hsl(var(--background)/0.98),hsl(var(--secondary)/0.95))]'
          : 'border-amber-200 bg-amber-50/95 dark:border-amber-900 dark:bg-amber-950/40'
      }`}
    >
      <div className="container px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-right">
            <div
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                isSoleaFemme
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
              }`}
            >
              معاينة مؤقتة
            </div>
            <p
              className={`text-sm font-semibold ${
                isSoleaFemme
                  ? 'text-foreground'
                  : 'text-amber-950 dark:text-amber-50'
              }`}
            >
              أنت تشاهد الآن قالب {theme.name} قبل تطبيقه على متجرك.
            </p>
            <p
              className={`text-xs leading-6 ${
                isSoleaFemme
                  ? 'text-muted-foreground'
                  : 'text-amber-800 dark:text-amber-200'
              }`}
            >
              هذه المعاينة لا تغيّر القالب الحالي. ارجع إلى متجر القوالب عندما
              تريد الشراء أو التطبيق.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={marketplaceThemesUrl}
              className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
            >
              العودة إلى متجر القوالب
            </Link>
            <Link
              to={storefrontSettingsUrl}
              className="inline-flex items-center justify-center rounded-2xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-900/40"
            >
              تخصيص القالب من الإدارة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import type { Location } from "react-router-dom";
import type { UseSearchResult } from "../../hooks/useSearch";
import type { StorefrontGlobalHeaderConfig } from "../../studio/StudioHeaderFooterPanel";
import type { StorefrontTheme } from "../../types/theme.types";

export interface StorefrontHeaderProps {
  isMinimal?: boolean;
  search: UseSearchResult;
  globalHeader?: StorefrontGlobalHeaderConfig;
}

export interface StorefrontHomeLinkProps {
  to?: string;
  forceDocumentNavigation?: boolean;
  pathname?: string;
  search?: string;
  className?: string;
  reloadDocument?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export interface StorefrontHeaderController {
  theme: StorefrontTheme;
  settings: any;
  isMinimal: boolean;
  search: UseSearchResult;
  effectiveGlobalHeader?: StorefrontGlobalHeaderConfig;
  location: Location;

  // Search & Navigation
  query: string;
  setQuery: (q: string) => void;
  results: any[];
  isLoading: boolean;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  closeSearchOverlay: () => void;
  moreResultsPath: string;
  showSearch: boolean;
  handlePcHubSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Cart
  totalItems: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  showCart: boolean;

  // Branding & links
  brandHomeLinkProps: StorefrontHomeLinkProps;
  displayStoreName: string;
  displayLogoUrl?: string | null;
  navLinks: Array<{ to: string; label: string; active?: boolean }>;
  shouldForceDocumentNavigation: boolean;
  isCheckoutPath: boolean;
  isActive: (path: string) => boolean;

  // Theme variant flags
  isGracefulTheme: boolean;
  isMensGroomingPro: boolean;
  isRedlineAutoHeader: boolean;
  isKhemetLuxe: boolean;
  isKhemetUnifiedHeaderPath: boolean;
  isButcherAtelierHeader: boolean;
  isLegacyDefaultOldHeader: boolean;
  isPcHub: boolean;
  isDigitalCommandHeader: boolean;
  isVelaFashionHeader: boolean;
  isFastlyTheme: boolean;
  isSoleaFemme: boolean;
  isIntruderNft: boolean;
  isBiteRush: boolean;
  isCutlineClub: boolean;
  isClosetOs: boolean;
  isAtelierNova: boolean;
  isElegantLuxe: boolean;
  isEditorialSoftHeader: boolean;
  isUtilityFrameHeader: boolean;
  isRetailDirectHeader: boolean;
  isFashionRetailHeader: boolean;
  isFloatingDarkHeader: boolean;
  isKhemetFloatingDarkHeader: boolean;
  isVelaInnerPath: boolean;
  showDigitalCommandMobileSearch: boolean;

  // Khemet specifics
  isKhemetInnerNavActive: (href: string) => boolean;
  hideUtilityBar: boolean;
  showKhemetFreeShippingSignal: boolean;
  khemetFreeShippingThresholdText: string;
  khemetUtilityShopPath: string;

  // Header rails & labels
  headerRailLabel: string | null;
  headerTagline: string | null;
  utilityHeaderRail: string[];
  cutlineClubRailItems: string[];
  closetOsRailItems: string[];
  editorialHeaderRail: string[];
  retailDirectRail: string[];
  digitalCommandRail: string[];

  // Action links
  headerActions: Array<{
    label: string;
    to: string;
    href: string;
    style?: string;
  }>;
  legacyMenuLinks: Array<{
    label: string;
    to: string;
  }>;

  // Elements
  isSticky: boolean;
  announcementBarElement: React.ReactNode;
}

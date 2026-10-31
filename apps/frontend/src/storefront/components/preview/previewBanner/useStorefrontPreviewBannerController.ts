import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStorefrontTheme } from '../../../engine/ThemeProvider';
import {
  buildStorefrontPreviewAdminPath,
  resolveStorefrontPreviewAdminOrigin,
} from '../../../utils/paths';
import { isRuntimePharmacyThemeId } from '../../header/StorefrontHeader';
import type { StorefrontPreviewBannerProps } from './previewBannerTypes';

export const useStorefrontPreviewBannerController = ({
  previewThemeId,
}: StorefrontPreviewBannerProps) => {
  const { theme } = useStorefrontTheme();
  const location = useLocation();

  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  const isSoleaFemme = theme.id === 'solea-femme';
  const isBiteRush = theme.id === 'restaurant-demo';
  const isCafeDemo = theme.id === 'cafe-demo';
  const isMenShoes = theme.id === 'men-shoes-eg';
  const isWomenFashion = theme.id === 'women-fashion-eg';
  const isVelaFashion = theme.id === 'vela-fashion-eg';
  const isPcHub = theme.id === 'pc-hub-eg';
  const isAtelierNova = theme.id === 'atelier-nova';
  const isRoseBoutique = theme.id === 'rose-boutique-eg';
  const isCarryLane = theme.id === 'elessi-carry-lane';
  const isHarvestFold = theme.id === 'elessi-harvest-fold';
  const isSproutRoom = theme.id === 'elessi-sprout-room';
  const isSignalDeck = theme.id === 'elessi-signal-deck';
  const isPedalLab = theme.id === 'elessi-pedal-lab';
  const isGlowRoutine = theme.id === 'elessi-glow-routine';
  const isGemAtelier = theme.id === 'elessi-gem-atelier';
  const isTailSupply = theme.id === 'elessi-tail-supply';
  const isChronoGallery = theme.id === 'elessi-chrono-gallery';
  const isGarageFit = theme.id === 'elessi-garage-fit';
  const isElessiPackTheme = theme.id?.startsWith('elessi-') === true;
  const isPharmacy = isRuntimePharmacyThemeId(theme.id);
  const isDentalLab = theme.id === 'dental-lab-elite';

  const hasExplicitAdminOrigin = Boolean(
    resolveStorefrontPreviewAdminOrigin(location.search),
  );

  const marketplaceThemesUrl = buildStorefrontPreviewAdminPath(
    `/marketplace/themes?theme=${encodeURIComponent(previewThemeId)}`,
    location.search,
  );

  const storefrontSettingsUrl = buildStorefrontPreviewAdminPath(
    `/settings/storefront?theme=${encodeURIComponent(previewThemeId)}`,
    location.search,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    theme,
    location,
    isMobileViewport,
    isSoleaFemme,
    isBiteRush,
    isCafeDemo,
    isMenShoes,
    isWomenFashion,
    isVelaFashion,
    isPcHub,
    isAtelierNova,
    isRoseBoutique,
    isCarryLane,
    isHarvestFold,
    isSproutRoom,
    isSignalDeck,
    isPedalLab,
    isGlowRoutine,
    isGemAtelier,
    isTailSupply,
    isChronoGallery,
    isGarageFit,
    isElessiPackTheme,
    isPharmacy,
    isDentalLab,
    hasExplicitAdminOrigin,
    marketplaceThemesUrl,
    storefrontSettingsUrl,
  };
};

export type StorefrontPreviewBannerController = ReturnType<typeof useStorefrontPreviewBannerController>;

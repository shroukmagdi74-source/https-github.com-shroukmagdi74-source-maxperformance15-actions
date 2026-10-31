import React from 'react';
import type { StorefrontPreviewBannerProps } from './previewBanner/previewBannerTypes';
import {
  useStorefrontPreviewBannerController,
  MarketplacePreviewCartBootstrap,
  StorefrontProductPreviewBanner,
  DentalLabPreviewBanner,
  RedlineAutoPreviewBanner,
  MobileViewportPreviewDock,
  ElessiPackPreviewDock,
  AdminOriginPreviewDock,
  BiteRushPreviewDock,
  MenShoesPreviewBanner,
  DefaultStorefrontPreviewBanner,
  renderThemePillDock,
} from './previewBanner';

export const StorefrontPreviewBanner: React.FC<StorefrontPreviewBannerProps> = (props) => {
  const controller = useStorefrontPreviewBannerController(props);
  const {
    theme,
    isVelaFashion,
    isDentalLab,
    isMobileViewport,
    isElessiPackTheme,
    hasExplicitAdminOrigin,
    isBiteRush,
    isPharmacy,
    isCafeDemo,
    isMenShoes,
  } = controller;

  if (isVelaFashion || theme.id === 'fastly-eg') {
    return null;
  }

  if (isDentalLab) {
    return <DentalLabPreviewBanner controller={controller} />;
  }

  if (theme.id === 'redline-auto') {
    return <RedlineAutoPreviewBanner controller={controller} />;
  }

  if (isMobileViewport) {
    return <MobileViewportPreviewDock controller={controller} />;
  }

  if (isElessiPackTheme) {
    return <ElessiPackPreviewDock controller={controller} />;
  }

  if (hasExplicitAdminOrigin && !isBiteRush && !isPharmacy && !isCafeDemo) {
    return <AdminOriginPreviewDock controller={controller} />;
  }

  if (isBiteRush || isPharmacy || isCafeDemo) {
    return <BiteRushPreviewDock controller={controller} />;
  }

  if (isMenShoes) {
    return <MenShoesPreviewBanner controller={controller} />;
  }

  const themePillDock = renderThemePillDock(controller);
  if (themePillDock) {
    return themePillDock;
  }

  return <DefaultStorefrontPreviewBanner controller={controller} />;
};

export { StorefrontProductPreviewBanner, MarketplacePreviewCartBootstrap };
export default StorefrontPreviewBanner;

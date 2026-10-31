import React from 'react';
import GracefulFooter from '../GracefulFooter';
import AutomotiveFooter from './AutomotiveFooter';
import type { StorefrontFooterProps } from './storefrontFooter/footerTypes';
import { useStorefrontFooterController } from './storefrontFooter/useStorefrontFooterController';
import { MensGroomingFooter } from './storefrontFooter/MensGroomingFooter';
import { ButcherAtelierFooter } from './storefrontFooter/ButcherAtelierFooter';
import { LegacyDefaultFooter } from './storefrontFooter/LegacyDefaultFooter';
import { AtelierNovaCommerceFooter } from './storefrontFooter/AtelierNovaCommerceFooter';
import { VelaFashionFooter } from './storefrontFooter/VelaFashionFooter';
import { PcHubFooter } from './storefrontFooter/PcHubFooter';
import { StandardStorefrontFooter } from './storefrontFooter/StandardStorefrontFooter';

const StorefrontFooter: React.FC<StorefrontFooterProps> = (props) => {
  const controller = useStorefrontFooterController(props);
  const {
    theme,
    isMinimal,
    isAutomotiveChassis,
    isMensGroomingPro,
    isButcherAtelierFooter,
    isLegacyDefaultOldFooter,
    isFashionRetailFooter,
    isAtelierNovaCommercePath,
    isVelaFashionFooter,
    isPcHub,
    displayStoreName,
    footerDescriptionText,
    footerCopyrightText,
    footerContactRows,
    socialIcons,
    footerLinksData,
    legalLinks,
    shouldForceDocumentNavigation,
  } = controller;

  // Soft Graceful — dedicated Texture-style dark footer
  if (theme.id === 'soft-graceful') {
    return <GracefulFooter />;
  }

  if (isAutomotiveChassis && !isMinimal) {
    return (
      <AutomotiveFooter
        displayStoreName={displayStoreName}
        descriptionText={footerDescriptionText}
        copyrightText={footerCopyrightText}
        contactRows={footerContactRows}
        socialIcons={socialIcons}
        linksData={footerLinksData}
        legalLinks={legalLinks}
        shouldForceDocumentNavigation={shouldForceDocumentNavigation}
        direction={theme.direction}
      />
    );
  }

  if (isMensGroomingPro && !isMinimal) {
    return <MensGroomingFooter controller={controller} />;
  }

  if (isButcherAtelierFooter) {
    return <ButcherAtelierFooter controller={controller} />;
  }

  if (isLegacyDefaultOldFooter && !isMinimal) {
    return <LegacyDefaultFooter controller={controller} />;
  }

  if (isFashionRetailFooter && isAtelierNovaCommercePath) {
    return <AtelierNovaCommerceFooter controller={controller} />;
  }

  if (isVelaFashionFooter) {
    return <VelaFashionFooter controller={controller} />;
  }

  if (isPcHub && !isMinimal) {
    return <PcHubFooter controller={controller} />;
  }

  return <StandardStorefrontFooter controller={controller} />;
};

export default StorefrontFooter;

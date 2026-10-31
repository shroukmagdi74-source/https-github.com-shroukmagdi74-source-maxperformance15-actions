import React from 'react';
import { StorefrontThemeProvider } from './engine/ThemeProvider';
import { StudioVariablesStyle } from './studio/StudioVariablesStyle';
import { StorefrontHead } from './engine/StorefrontHead';
import ProductImageLandingPage from './pages/ProductImageLandingPage';
import FunnelCodSalesPage from './pages/FunnelCodSalesPage';
import StorefrontSkeleton from './components/StorefrontSkeleton';
import { shouldStorefrontForceDocumentNavigation } from './utils/navigationGuards';
import {
  resolveStorefrontPageLayout,
  StorefrontSectionFrame,
} from './layout/StorefrontSectionFrame';
import {
  type StorefrontShellProps,
  useStorefrontShellController,
  StorefrontLayout,
  StorefrontErrorState,
} from './shell';

import './styles/conversion-animations.css';
import './styles/storefront-layout.css';

export const shouldStorefrontHeaderForceDocumentNavigation =
  shouldStorefrontForceDocumentNavigation;
export { shouldStorefrontForceDocumentNavigation };
export { resolveStorefrontPageLayout, StorefrontSectionFrame };

export const StorefrontShell: React.FC<StorefrontShellProps> = (props) => {
  const {
    activePageKey,
    isStandaloneProductLanding,
    isStandaloneFunnel,
    settings,
    isLoading,
    error,
    previewThemeId,
    initialTheme,
    storefrontVariables,
  } = useStorefrontShellController(props);

  if (isStandaloneProductLanding) {
    return <ProductImageLandingPage />;
  }

  if (isStandaloneFunnel) {
    return <FunnelCodSalesPage />;
  }

  if (isLoading) {
    return <StorefrontSkeleton />;
  }

  if (error || !settings) {
    return <StorefrontErrorState />;
  }

  return (
    <StorefrontThemeProvider
      initialTheme={initialTheme}
      blockUntilResolved
      activePageKey={activePageKey}
    >
      <StudioVariablesStyle variables={storefrontVariables} />
      <StorefrontHead settings={settings} activePageKey={activePageKey} />
      <StorefrontLayout
        previewThemeId={previewThemeId}
        activePageKey={activePageKey}
      />
    </StorefrontThemeProvider>
  );
};

export default StorefrontShell;

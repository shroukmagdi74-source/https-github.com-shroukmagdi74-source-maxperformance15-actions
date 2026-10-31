export interface StorefrontPreviewBannerProps {
  previewThemeId: string;
}

export interface StorefrontProductPreviewBannerProps {
  previewProductId?: string | null;
}

export interface MarketplacePreviewCartBootstrapProps {
  previewThemeId?: string | null;
}

export interface PreviewBannerActionUrls {
  marketplaceThemesUrl: string;
  storefrontSettingsUrl: string;
}

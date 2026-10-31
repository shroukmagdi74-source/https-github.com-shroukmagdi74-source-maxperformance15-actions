import type { StorefrontGlobalFooterConfig } from '../../../studio/StudioHeaderFooterPanel';

export interface StorefrontFooterProps {
  isMinimal?: boolean;
  globalFooter?: StorefrontGlobalFooterConfig;
}

export interface FooterContactRow {
  label: string;
  value: string;
  href?: string;
  key?: string;
}

export interface FooterLinkItem {
  label: string;
  to: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLinkItem[];
}

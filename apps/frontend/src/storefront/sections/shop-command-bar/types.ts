import { getDefaultRegisteredVariantId, hasRegisteredVariant } from '../../variants';

export interface ShopCommandBarProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: {
    title?: string;
    subtitle?: string;
    simpleToolbar?: boolean;
    searchPlaceholder?: string;
    allCategoriesLabel?: string;
    resultsLabel?: string;
    clearButtonText?: string;
    stickyLabel?: string;
    chipLimit?: number;
    hideHeader?: boolean;
    hideDesktopCategoryChips?: boolean;
    hideSearch?: boolean;
    [key: string]: unknown;
  };
}

export type ShopCommandBarVariant =
  | 'default-discovery'
  | 'marketplace-dense'
  | 'minimal-toolbar'
  | 'menu-quick-order'
  | 'boutique-discovery'
  | 'fit-finder'
  | 'soft-sort-bar'
  | 'fragrance-console'
  | 'spec-console'
  | 'elessi-bag-toolbar'
  | 'elessi-filter-deck'
  | 'elessi-category-ribbon'
  | 'elessi-spec-toolbar'
  | 'elessi-gift-toolbar'
  | 'elessi-organic-toolbar'
  | 'elessi-plant-toolbar'
  | 'elessi-digital-toolbar'
  | 'elessi-bike-toolbar'
  | 'butcher-cut-console'
  | 'decision-deck'
  | 'occasion-planner'
  | 'graceful-bar';

export const SHOP_COMMAND_BAR_FAMILY = 'ShopCommandBar';
export const SHOP_COMMAND_BAR_DEFAULT =
  (getDefaultRegisteredVariantId(SHOP_COMMAND_BAR_FAMILY) as ShopCommandBarVariant | undefined) ||
  'default-discovery';

export const normalizeShopCommandBarVariant = (rawVariant: unknown): ShopCommandBarVariant => {
  const value = String(rawVariant || '').trim().toLowerCase();
  if (
    (
      value === 'default-discovery' ||
      value === 'marketplace-dense' ||
      value === 'minimal-toolbar' ||
      value === 'menu-quick-order' ||
      value === 'boutique-discovery' ||
      value === 'fit-finder' ||
      value === 'soft-sort-bar' ||
      value === 'fragrance-console' ||
      value === 'spec-console' ||
      value === 'elessi-bag-toolbar' ||
      value === 'elessi-filter-deck' ||
      value === 'elessi-category-ribbon' ||
      value === 'elessi-spec-toolbar' ||
      value === 'elessi-gift-toolbar' ||
      value === 'elessi-organic-toolbar' ||
      value === 'elessi-plant-toolbar' ||
      value === 'elessi-digital-toolbar' ||
      value === 'elessi-bike-toolbar' ||
      value === 'butcher-cut-console' ||
      value === 'decision-deck' ||
      value === 'graceful-bar' ||
      value === 'occasion-planner'
    ) &&
    hasRegisteredVariant(SHOP_COMMAND_BAR_FAMILY, value)
  ) {
    return value as ShopCommandBarVariant;
  }
  return SHOP_COMMAND_BAR_DEFAULT;
};

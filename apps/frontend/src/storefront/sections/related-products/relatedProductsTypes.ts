import type { Product } from '../hooks/useProducts';
import type { useRelatedProductsController } from './useRelatedProductsController';

export interface RelatedProductsProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    limit?: number | string;
    mobileLimit?: number | string;
    contentAlign?: string;
    [key: string]: unknown;
  };
}

export type StorefrontProductPayload = Product & {
  images?: unknown;
  mainImage?: unknown;
};

export type RelatedProductsVariant =
  | 'standard'
  | 'compact'
  | 'editorial'
  | 'glass'
  | 'list'
  | 'luxury'
  | 'minimal'
  | 'playful'
  | 'overlay'
  | 'elessi-merch-rail'
  | 'elessi-complete-set'
  | 'elessi-discovery-strip'
  | 'elessi-organic-related'
  | 'elessi-digital-related'
  | 'elessi-plant-related'
  | 'elessi-bike-related'
  | 'closet-pairings'
  | 'scent-circle'
  | 'command-alternatives'
  | 'fastly-offer-wall';

export type RelatedProductsController = ReturnType<typeof useRelatedProductsController>;

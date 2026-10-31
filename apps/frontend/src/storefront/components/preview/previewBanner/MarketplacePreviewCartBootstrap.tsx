import React, { useEffect } from 'react';
import {
  useCartStore,
  DEFAULT_STOREFRONT_CART_STORAGE_NAME,
  getStorefrontPreviewCartStorageName,
} from '../../../store/useCartStore';
import type { MarketplacePreviewCartBootstrapProps } from './previewBannerTypes';

type PreviewCartSignatureItem = {
  id: string;
  productId: string;
  variantId?: string | null;
  imageUrl?: string | null;
  price: number;
  basePrice?: number | null;
  quantity: number;
  attributes?: Record<string, unknown> | null;
};

const serializeMarketplacePreviewCartItems = (
  items: PreviewCartSignatureItem[],
) =>
  items
    .map((item) =>
      [
        item.id,
        item.productId,
        item.variantId || '',
        item.imageUrl || '',
        item.price,
        item.basePrice ?? item.price,
        item.quantity,
        JSON.stringify(item.attributes || {}),
      ].join('::'),
    )
    .join('||');

export const MarketplacePreviewCartBootstrap: React.FC<MarketplacePreviewCartBootstrapProps> = ({
  previewThemeId,
}) => {
  const marketplacePreviewThemeId = previewThemeId || '';

  useEffect(() => {
    const persistApi = useCartStore.persist;
    if (!persistApi) {
      return;
    }

    const targetStorageName = marketplacePreviewThemeId
      ? getStorefrontPreviewCartStorageName(marketplacePreviewThemeId)
      : DEFAULT_STOREFRONT_CART_STORAGE_NAME;

    if (persistApi.getOptions().name === targetStorageName) {
      return;
    }

    useCartStore.setState({ items: [], isOpen: false });
    persistApi.setOptions({ name: targetStorageName });
    void persistApi.rehydrate();
  }, [marketplacePreviewThemeId]);

  useEffect(() => {
    if (!marketplacePreviewThemeId) {
      return;
    }

    let cancelled = false;

    void import('../../../preview/marketplacePreviewCart').then(
      ({ getMarketplacePreviewCartItems }) => {
        if (cancelled) {
          return;
        }

        const previewItems =
          getMarketplacePreviewCartItems(marketplacePreviewThemeId);
        if (previewItems.length === 0) {
          return;
        }

        const seedSignature =
          serializeMarketplacePreviewCartItems(previewItems);
        const currentItems = useCartStore.getState().items;
        const currentSignature = serializeMarketplacePreviewCartItems(currentItems);

        // PREVIEW-1 — the preview cart is per-theme isolated storage, so the
        // sample cart has to exist on every preview route (home → drawer,
        // cart, checkout, thank-you). Reconcile the stored cart with the current seed.
        if (currentSignature !== seedSignature) {
          useCartStore.setState({ items: previewItems, isOpen: false });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [marketplacePreviewThemeId]);

  return null;
};

export default MarketplacePreviewCartBootstrap;

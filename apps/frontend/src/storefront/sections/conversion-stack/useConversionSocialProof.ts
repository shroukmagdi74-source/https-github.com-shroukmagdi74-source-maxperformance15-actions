import { useEffect, useMemo, useState } from 'react';
import {
  asRecord,
  clamp,
  hashProductSeed,
  parseMaybeNumber,
} from './types';

interface SocialProofInput {
  product: Record<string, unknown> | null | undefined;
  metadata: Record<string, unknown>;
  thresholds: Record<string, unknown>;
  fakeVisitorCounterEnabled: boolean;
}

export const useConversionSocialProof = ({
  product,
  metadata,
  thresholds,
  fakeVisitorCounterEnabled,
}: SocialProofInput) => {
  const lowStockLimit = Number(thresholds['lowStockLimit'] || 5);
  const purchaseFomoCartWindowHours = Math.max(
    1,
    Number(thresholds['purchaseFomoCartWindowHours'] || 24),
  );
  const purchaseFomoRecentPurchaseWindowHours = Math.max(
    1,
    Number(thresholds['purchaseFomoRecentPurchaseWindowHours'] || 48),
  );
  const purchaseFomoWaitlistFallbackLimit = Math.max(
    1,
    Number(thresholds['purchaseFomoWaitlistFallbackLimit'] || 18),
  );
  const fakeVisitorMin = Math.max(1, Number(thresholds['fakeVisitorMin'] || 6));
  const fakeVisitorMax = Math.max(
    fakeVisitorMin + 1,
    Number(thresholds['fakeVisitorMax'] || 22),
  );

  const productSocialProofRef = product?.['socialProof'];
  const socialProof = useMemo(() => {
    const topLevel = asRecord(productSocialProofRef);
    const metaProof = asRecord(metadata['socialProof']);

    return {
      ...topLevel,
      soldCount: topLevel['soldCount'] || metaProof['soldCount'] || 0,
      activeCartCount: topLevel['activeCartCount'] || metaProof['activeCartCount'] || 0,
      recentOrderCount: topLevel['recentOrderCount'] || metaProof['recentOrderCount'] || 0,
      orderCount: topLevel['orderCount'] || metaProof['orderCount'] || 0,
      backInStockRequests: topLevel['backInStockRequests'] || metaProof['backInStockRequests'] || 0,
      recentPurchases: topLevel['recentPurchases'] || metaProof['recentPurchases'] || 0,
      recentOrderUnits: topLevel['recentOrderUnits'] || metaProof['recentOrderUnits'] || 0,
      activeCartUnits: topLevel['activeCartUnits'] || metaProof['activeCartUnits'] || 0,
    };
  }, [productSocialProofRef, metadata]);

  const stockCount = parseMaybeNumber(product?.['stock']);
  const fakeStockEnabled = Boolean(product?.['showFakeStock']);
  const fakeStockCount = useMemo(() => {
    if (!product?.['id']) {
      return null;
    }

    const seed = hashProductSeed(String(product['id']));
    return Math.max(3, Math.min(lowStockLimit + 2, 3 + (seed % Math.max(lowStockLimit, 3))));
  }, [lowStockLimit, product]);

  const productSeed = product?.['id'] ? hashProductSeed(String(product['id'])) : 0;
  const soldCount =
    parseMaybeNumber(product?.['soldCount']) ??
    parseMaybeNumber(socialProof['soldCount']) ??
    0;
  const orderCount =
    parseMaybeNumber(product?.['orderCount']) ??
    parseMaybeNumber(socialProof['orderCount']) ??
    0;
  const recentPurchases =
    parseMaybeNumber(socialProof['recentPurchases']) ??
    (soldCount > 0
      ? Math.max(1, Math.min(soldCount, Math.max(orderCount, 2 + (productSeed % 6))))
      : 0);
  const recentOrderCount =
    parseMaybeNumber(product?.['recentOrderCount']) ??
    parseMaybeNumber(socialProof['recentOrderCount']) ??
    recentPurchases;
  const backInStockRequests =
    parseMaybeNumber(product?.['backInStockRequests']) ??
    parseMaybeNumber(socialProof['backInStockRequests']) ??
    0;
  const activeCartCount =
    parseMaybeNumber(product?.['activeCartCount']) ??
    parseMaybeNumber(socialProof['activeCartCount']) ??
    0;

  const viewerFloor =
    soldCount > 0
      ? clamp(Math.ceil(soldCount * 0.12), fakeVisitorMin, Math.max(fakeVisitorMin, fakeVisitorMax - 1))
      : clamp(
          fakeVisitorMin + (productSeed % Math.max(2, fakeVisitorMax - fakeVisitorMin)),
          fakeVisitorMin,
          Math.max(fakeVisitorMin, fakeVisitorMax - 1),
        );
  const viewerCeiling = Math.max(
    viewerFloor + 1,
    clamp(viewerFloor + 5 + (productSeed % 4), viewerFloor + 1, fakeVisitorMax),
  );

  const [viewerCount, setViewerCount] = useState(viewerFloor);

  useEffect(() => {
    setViewerCount(viewerFloor);
  }, [viewerFloor]);

  useEffect(() => {
    if (!product?.['id'] || !fakeVisitorCounterEnabled) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setViewerCount((current) => {
        const delta = (Date.now() + productSeed) % 2 === 0 ? 1 : -1;
        return clamp(current + delta, viewerFloor, viewerCeiling);
      });
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [
    fakeVisitorCounterEnabled,
    product,
    productSeed,
    viewerCeiling,
    viewerFloor,
  ]);

  const lowStockDisplayCount = fakeStockEnabled ? fakeStockCount : stockCount;

  const purchaseFomoSource =
    activeCartCount > 0
      ? 'active_carts'
      : recentOrderCount > 0
        ? 'recent_orders'
        : backInStockRequests > 0
          ? 'waitlist'
          : null;

  const purchaseFomoCount =
    purchaseFomoSource === 'active_carts'
      ? activeCartCount
      : purchaseFomoSource === 'recent_orders'
        ? recentOrderCount
        : purchaseFomoSource === 'waitlist'
          ? Math.min(backInStockRequests, purchaseFomoWaitlistFallbackLimit)
          : 0;

  return {
    lowStockLimit,
    stockCount,
    fakeStockEnabled,
    fakeStockCount,
    lowStockDisplayCount,
    productSeed,
    soldCount,
    orderCount,
    recentPurchases,
    recentOrderCount,
    backInStockRequests,
    activeCartCount,
    viewerFloor,
    viewerCeiling,
    viewerCount,
    purchaseFomoSource,
    purchaseFomoCount,
    purchaseFomoRecentPurchaseWindowHours,
    purchaseFomoCartWindowHours,
    socialProof,
  };
};

import { useEffect, useMemo, useRef, useState } from 'react';
import { storefrontApi } from '../../../../utils/storefrontApi';
import { trackConversionSuiteUsage } from '../../../utils/conversionSuiteTracking';

export const useQuickOrderShipping = ({
  companyId,
  resolvedGovernorate,
  effectiveGovernorateEnabled,
  productId,
  effectiveShippingQuantity,
  resolvedSubtotal,
  quickOrderFingerprint,
  storefrontSettings,
}: {
  companyId: string;
  resolvedGovernorate: string;
  effectiveGovernorateEnabled: boolean;
  productId: string;
  effectiveShippingQuantity: number;
  resolvedSubtotal: number;
  quickOrderFingerprint: string;
  storefrontSettings: any;
}) => {
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethodLabel, setShippingMethodLabel] = useState('');
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [resolvedShippingQuoteKey, setResolvedShippingQuoteKey] = useState('');

  const shippingCacheRef = useRef<Map<string, { price: number; label: string }>>(new Map());
  const trackedShippingQuoteRef = useRef<string>('');

  const shippingQuoteItems = useMemo(
    () => [
      {
        productId,
        quantity: effectiveShippingQuantity,
      },
    ],
    [effectiveShippingQuantity, productId],
  );

  const currentShippingCacheKey =
    companyId && resolvedGovernorate
      ? `${companyId}:${resolvedGovernorate.trim().toLowerCase()}:${productId}:${effectiveShippingQuantity}`
      : '';

  useEffect(() => {
    let cancelled = false;

    if (!effectiveGovernorateEnabled || !resolvedGovernorate || !companyId || !currentShippingCacheKey) {
      setShippingCost(0);
      setShippingMethodLabel('');
      setIsShippingLoading(false);
      setResolvedShippingQuoteKey('');
      return undefined;
    }

    const cacheKey = currentShippingCacheKey;
    const cached = shippingCacheRef.current.get(cacheKey);
    if (cached) {
      setShippingCost(cached.price);
      setShippingMethodLabel(cached.label);
      setIsShippingLoading(false);
      setResolvedShippingQuoteKey(cacheKey);
      return undefined;
    }

    const loadShipping = async () => {
      try {
        setIsShippingLoading(true);
        const response = await storefrontApi.calculateShipping(
          resolvedGovernorate,
          companyId,
          shippingQuoteItems,
        );

        if (!cancelled) {
          const resolvedCost = Number(response?.data?.price) || 0;
          const primaryMethod = Array.isArray(response?.data?.methods)
            ? response.data.methods[0]
            : null;
          const resolvedLabel = String(
            primaryMethod?.title ||
              primaryMethod?.label ||
              primaryMethod?.name ||
              '',
          ).trim();

          shippingCacheRef.current.set(cacheKey, {
            price: resolvedCost,
            label: resolvedLabel,
          });

          setShippingCost(resolvedCost);
          setShippingMethodLabel(resolvedLabel);
          setResolvedShippingQuoteKey(cacheKey);
        }
      } catch {
        if (!cancelled) {
          setShippingCost(0);
          setShippingMethodLabel('');
          setResolvedShippingQuoteKey('');
        }
      } finally {
        if (!cancelled) {
          setIsShippingLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void loadShipping();
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    companyId,
    currentShippingCacheKey,
    effectiveGovernorateEnabled,
    resolvedGovernorate,
    shippingQuoteItems,
  ]);

  useEffect(() => {
    if (
      !effectiveGovernorateEnabled ||
      isShippingLoading ||
      !resolvedGovernorate ||
      !currentShippingCacheKey ||
      resolvedShippingQuoteKey !== currentShippingCacheKey ||
      !quickOrderFingerprint
    ) {
      return;
    }

    const quoteTrackingKey = `${productId}:${resolvedGovernorate}:${shippingCost}:${resolvedSubtotal}:${quickOrderFingerprint}`;
    if (trackedShippingQuoteRef.current === quoteTrackingKey) {
      return;
    }
    trackedShippingQuoteRef.current = quoteTrackingKey;

    void trackConversionSuiteUsage(storefrontSettings, {
      feature: 'pdp_quick_order_shipping_quote',
      dedupeKey: `pdp-quick-order-shipping:${productId}:${resolvedGovernorate}:${quickOrderFingerprint}`,
      metadata: {
        productId,
        governorate: resolvedGovernorate,
        shippingCost,
        subtotal: resolvedSubtotal,
      },
    });
  }, [
    currentShippingCacheKey,
    effectiveGovernorateEnabled,
    isShippingLoading,
    productId,
    quickOrderFingerprint,
    resolvedGovernorate,
    resolvedShippingQuoteKey,
    resolvedSubtotal,
    shippingCost,
    storefrontSettings,
  ]);

  const cleanShippingMethodTitle = useMemo(() => {
    if (!shippingMethodLabel) return '';
    const trimmed = shippingMethodLabel.trim();
    if (trimmed.includes('،') || trimmed.includes(',') || trimmed.length > 30) {
      return '';
    }
    return trimmed;
  }, [shippingMethodLabel]);

  return {
    shippingCost,
    setShippingCost,
    shippingMethodLabel,
    isShippingLoading,
    cleanShippingMethodTitle,
  };
};

import { useEffect, useMemo, useState } from 'react';
import type { Product, ProductVariant } from '../../hooks/useProducts';
import {
  getProductImageCandidates,
  getPrimaryProductImage,
} from '../../utils/productImages';
import {
  buildDefaultVariantSelection,
  getProductVariants,
  hasVariants,
  resolveVariantFromAttributes,
} from './types';

interface UseSelectionsParams {
  recommendations: Product[];
}

export const useBoughtTogetherSelections = ({
  recommendations,
}: UseSelectionsParams) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedAttributesByProduct, setSelectedAttributesByProduct] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    const nextSelected = new Set(
      recommendations
        .filter((item) => !hasVariants(item))
        .slice(0, Math.min(2, recommendations.length))
        .map((item) => item.id),
    );
    setSelectedIds(nextSelected);
  }, [recommendations]);

  useEffect(() => {
    setSelectedAttributesByProduct((current) => {
      const next: Record<string, Record<string, string>> = {};
      let changed = false;

      recommendations.forEach((item) => {
        if (!hasVariants(item)) {
          return;
        }

        const existingSelection = current[item.id];
        const nextSelection =
          existingSelection && Object.keys(existingSelection).length > 0
            ? existingSelection
            : buildDefaultVariantSelection(item);

        next[item.id] = nextSelection;

        if (
          !existingSelection ||
          JSON.stringify(existingSelection) !== JSON.stringify(nextSelection)
        ) {
          changed = true;
        }
      });

      if (Object.keys(current).length !== Object.keys(next).length) {
        changed = true;
      }

      return changed ? next : current;
    });
  }, [recommendations]);

  const selectedRecommendations = useMemo(
    () => recommendations.filter((item) => selectedIds.has(item.id)),
    [recommendations, selectedIds],
  );

  const selectedRecommendationVariants = useMemo(
    () =>
      recommendations.reduce<Record<string, ProductVariant | null>>((acc, item) => {
        if (!hasVariants(item)) {
          return acc;
        }

        acc[item.id] = resolveVariantFromAttributes(
          getProductVariants(item),
          selectedAttributesByProduct[item.id] || {},
        );
        return acc;
      }, {}),
    [recommendations, selectedAttributesByProduct],
  );

  const handleToggleSelection = (item: Product) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  };

  const getSelectedRecommendationVariant = (item: Product) =>
    selectedRecommendationVariants[item.id] || null;

  const getRecommendationPrice = (item: Product) => {
    const selectedVariant = getSelectedRecommendationVariant(item);
    return typeof selectedVariant?.price === 'number' && Number.isFinite(selectedVariant.price)
      ? selectedVariant.price
      : Number(item.price) || 0;
  };

  const getRecommendationAttributes = (item: Product) =>
    selectedAttributesByProduct[item.id] || buildDefaultVariantSelection(item);

  const getRecommendationImage = (item: Product) => {
    const selectedVariant = getSelectedRecommendationVariant(item);
    return (
      getProductImageCandidates(selectedVariant as Partial<Product> | null | undefined)[0] ||
      getPrimaryProductImage(item)
    );
  };

  const getRecommendationImageCandidates = (item: Product) => {
    const selectedVariant = getSelectedRecommendationVariant(item);
    const variantCandidates = getProductImageCandidates(
      selectedVariant as Partial<Product> | null | undefined,
    );

    return variantCandidates.length > 0
      ? variantCandidates
      : getProductImageCandidates(item);
  };

  const updateRecommendationAttributes = (
    itemId: string,
    nextAttributes: Record<string, string>,
  ) => {
    setSelectedAttributesByProduct((current) => ({
      ...current,
      [itemId]: nextAttributes,
    }));
  };

  return {
    selectedIds,
    selectedRecommendations,
    selectedRecommendationVariants,
    handleToggleSelection,
    getSelectedRecommendationVariant,
    getRecommendationPrice,
    getRecommendationAttributes,
    getRecommendationImage,
    getRecommendationImageCandidates,
    updateRecommendationAttributes,
  };
};

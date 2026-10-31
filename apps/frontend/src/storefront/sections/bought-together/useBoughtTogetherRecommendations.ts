import { useEffect, useState } from 'react';
import { storefrontFetch } from '../../../utils/storefrontApi';
import type { Product } from '../../hooks/useProducts';
import { getThemePreviewProductRecommendations } from '../../preview/themePreviewData';

interface UseRecommendationsParams {
  boughtTogetherEnabled: boolean;
  productId: string | undefined;
  previewDataset: unknown;
  isMarketplacePreview: boolean;
  limit: number;
}

export const useBoughtTogetherRecommendations = ({
  boughtTogetherEnabled,
  productId,
  previewDataset,
  isMarketplacePreview,
  limit,
}: UseRecommendationsParams) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!boughtTogetherEnabled || !productId) {
      setRecommendations([]);
      return;
    }

    if (previewDataset) {
      setLoading(false);
      setRecommendations(
        getThemePreviewProductRecommendations(
          previewDataset as any,
          productId,
          'bundle',
          limit,
        ),
      );
      return;
    }

    let cancelled = false;

    const loadRecommendations = async () => {
      try {
        setLoading(true);

        if (isMarketplacePreview) {
          const { getMarketplacePreviewRecommendations } = await import(
            '../../preview/marketplaceSampleData'
          );
          const marketplacePreviewRecommendations =
            getMarketplacePreviewRecommendations(productId, 'boughtTogether');

          if (marketplacePreviewRecommendations) {
            if (!cancelled) {
              setRecommendations(
                marketplacePreviewRecommendations.slice(0, limit),
              );
              setLoading(false);
            }
            return;
          }
        }

        const response = await storefrontFetch(
          `/products/${encodeURIComponent(productId)}/frequently-bought-together`,
          {
            query: { limit },
          },
        );

        if (cancelled) {
          return;
        }

        const nextRecommendations = Array.isArray(response?.data) ? response.data : [];
        setRecommendations(nextRecommendations);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load bought-together recommendations:', error);
          setRecommendations([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [
    boughtTogetherEnabled,
    isMarketplacePreview,
    limit,
    previewDataset,
    productId,
  ]);

  return {
    recommendations,
    loading,
  };
};

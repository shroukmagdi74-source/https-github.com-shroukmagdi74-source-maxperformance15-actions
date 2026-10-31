import { toast } from 'sonner';
import type { Product, ProductVariant } from '../../hooks/useProducts';
import { useCartStore } from '../../store/useCartStore';
import { trackStorefrontAppUsage } from '../../utils/appUsageTracking';
import { getProductVolumeDiscounts } from '../../utils/volumeDiscounts';
import { getPrimaryProductImage } from '../../utils/productImages';
import {
  getProductVariants,
  getVariantAttributeLabels,
  hasVariants,
} from './types';

interface CartActionsParams {
  product: Product | null | undefined;
  hasCurrentPdpSelection: boolean;
  currentPdpSelection: any;
  currentProductSelectionReady: boolean;
  selectedRecommendations: Product[];
  prefersArabicCopy: boolean;
  getSelectedRecommendationVariant: (item: Product) => ProductVariant | null;
  getRecommendationPrice: (item: Product) => number;
  getRecommendationAttributes: (item: Product) => Record<string, string>;
  getRecommendationImage: (item: Product) => string | undefined;
}

export const useBoughtTogetherCartActions = ({
  product,
  hasCurrentPdpSelection,
  currentPdpSelection,
  currentProductSelectionReady,
  selectedRecommendations,
  prefersArabicCopy,
  getSelectedRecommendationVariant,
  getRecommendationPrice,
  getRecommendationAttributes,
  getRecommendationImage,
}: CartActionsParams) => {
  const addItem = useCartStore((state) => state.addItem);
  const setIsOpen = useCartStore((state) => state.setIsOpen);

  const buildRecommendationCartItem = (item: Product) => {
    const selectedVariant = getSelectedRecommendationVariant(item);
    const recommendationPrice = getRecommendationPrice(item);
    const recommendationAttributes = hasVariants(item)
      ? getRecommendationAttributes(item)
      : {};
    const selectedVariantDiscounts =
      selectedVariant ? getProductVolumeDiscounts(selectedVariant) : [];

    return {
      productId: item.id,
      variantId: selectedVariant?.id ?? null,
      name: item.name,
      price: recommendationPrice,
      basePrice: recommendationPrice,
      comparePrice: typeof item.comparePrice === 'number' ? item.comparePrice : undefined,
      quantity: 1,
      imageUrl: getRecommendationImage(item),
      attributes: recommendationAttributes,
      volumeDiscounts:
        selectedVariantDiscounts.length > 0
          ? selectedVariantDiscounts
          : getProductVolumeDiscounts(item),
    };
  };

  const buildCurrentProductCartItem = () => {
    if (!product) {
      return null;
    }

    if (hasCurrentPdpSelection) {
      const liveSelection = currentPdpSelection;
      return {
        productId: product.id,
        variantId: liveSelection?.variantId ?? null,
        name: product.name,
        price: Number(liveSelection?.unitPrice) || Number(product.price) || 0,
        basePrice:
          Number(liveSelection?.basePrice) ||
          Number(liveSelection?.unitPrice) ||
          Number(product.price) ||
          0,
        comparePrice: typeof product.comparePrice === 'number' ? product.comparePrice : undefined,
        quantity: 1,
        imageUrl: liveSelection?.imageUrl || getPrimaryProductImage(product),
        attributes: liveSelection?.attributes || {},
        volumeDiscounts:
          Array.isArray(liveSelection?.volumeDiscounts) &&
          liveSelection.volumeDiscounts.length > 0
            ? liveSelection.volumeDiscounts
            : getProductVolumeDiscounts(product),
      };
    }

    return {
      productId: product.id,
      variantId: null,
      name: product.name,
      price: Number(product.price) || 0,
      basePrice: Number(product.price) || 0,
      quantity: 1,
      imageUrl: getPrimaryProductImage(product),
      attributes: {},
      volumeDiscounts: getProductVolumeDiscounts(product),
    };
  };

  const handleQuickAdd = (item: Product) => {
    if (hasVariants(item) && !getSelectedRecommendationVariant(item)) {
      const attributeLabels = getVariantAttributeLabels(item, prefersArabicCopy);
      toast.error(
        prefersArabicCopy
          ? `${attributeLabels.firstSelectionError} لـ ${item.name}.`
          : `${attributeLabels.firstSelectionError} for ${item.name}.`,
      );
      return;
    }

    void trackStorefrontAppUsage({
      slug: 'conversion-suite',
      feature: 'bought_together_quick_add',
      metadata: {
        productId: item.id,
        sourceProductId: product?.id,
        variantId: getSelectedRecommendationVariant(item)?.id || null,
      },
    });

    addItem(buildRecommendationCartItem(item));
    setIsOpen(true);
  };

  const handleAddBundle = () => {
    if (!product || selectedRecommendations.length === 0) {
      return;
    }

    if (!currentProductSelectionReady) {
      toast.error(
        prefersArabicCopy
          ? 'اختَر نسخة المنتج الأساسي أولًا قبل إضافة الباقة.'
          : 'Select the main product variant before adding the bundle.',
      );
      return;
    }

    const incompleteRecommendation = selectedRecommendations.find(
      (item) => hasVariants(item) && !getSelectedRecommendationVariant(item),
    );
    if (incompleteRecommendation) {
      const attributeLabels = getVariantAttributeLabels(
        incompleteRecommendation,
        prefersArabicCopy,
      );
      toast.error(
        prefersArabicCopy
          ? `${attributeLabels.completionErrorPrefix} ${incompleteRecommendation.name} أولًا.`
          : `${attributeLabels.completionErrorPrefix} ${incompleteRecommendation.name} first.`,
      );
      return;
    }

    void trackStorefrontAppUsage({
      slug: 'conversion-suite',
      feature: 'bought_together_bundle_add',
      quantity: selectedRecommendations.length,
      metadata: {
        productId: product.id,
        selectedAddOns: selectedRecommendations.length,
        selectedVariantAddOns: selectedRecommendations.filter((item) => hasVariants(item)).length,
      },
    });

    const currentProductCartItem = buildCurrentProductCartItem();
    if (!currentProductCartItem) {
      return;
    }

    addItem(currentProductCartItem, { openCart: false });

    selectedRecommendations.forEach((item, index) => {
      addItem(buildRecommendationCartItem(item), {
        openCart: index === selectedRecommendations.length - 1,
      });
    });
  };

  return {
    handleQuickAdd,
    handleAddBundle,
    buildRecommendationCartItem,
    buildCurrentProductCartItem,
  };
};

import { useState } from "react";
import { tToast } from "../../../../utils/i18n-toast";
import { extractVariantDisplayDetails } from "../../../../pages/admin/ManualOrder/utils/variantAttributes";
import { CartItem, Product, ProductVariant } from "./types";

export const useQuickOrderCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  const handleAddToCart = (
    product: Product,
    variant?: ProductVariant,
    attributes?: Record<string, string>,
  ) => {
    const itemId = variant ? `${product.id}-${variant.id}` : product.id;

    const existing = cartItems.find((item) => {
      if (variant) {
        return item.productId === product.id && item.variantId === variant.id;
      }
      return item.productId === product.id && !item.variantId;
    });

    if (existing) {
      setCartItems((prev) =>
        prev.map((item) => {
          const currentItemId = item.variantId
            ? `${item.productId}-${item.variantId}`
            : item.productId;
          return currentItemId === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        }),
      );
      tToast.success("QuickOrderModal.msg_7c93");
    } else {
      const productPrice =
        typeof product.price === "string"
          ? parseFloat(product.price)
          : product.price || 0;
      const price = variant ? parseFloat(String(variant.price)) : productPrice;
      const image = variant && variant.image ? variant.image : product.image;
      const stock = variant ? variant.stock : product.stock;
      const sku = variant ? variant.sku : product.sku;

      const variantDetails = extractVariantDisplayDetails(variant);
      const color =
        attributes?.["اللون"] ||
        attributes?.["color"] ||
        attributes?.["Color"] ||
        attributes?.["لون"] ||
        variantDetails.color ||
        undefined;
      const size =
        attributes?.["المقاس"] ||
        attributes?.["size"] ||
        attributes?.["Size"] ||
        attributes?.["مقاس"] ||
        variantDetails.size ||
        undefined;

      const variantName =
        variantDetails.summary ||
        [color, size].filter(Boolean).join(" / ") ||
        variant?.name ||
        "";

      setCartItems((prev) => [
        ...prev,
        {
          productId: product.id,
          variantId: variant?.id,
          name: product.name,
          variantName,
          price,
          originalPrice: price,
          quantity: 1,
          image,
          stock,
          sku,
          color,
          size,
          attributes:
            attributes && Object.keys(attributes).length > 0
              ? attributes
              : undefined,
        },
      ]);
      tToast.success("QuickOrderModal.msg_e784");
    }

    setShowVariantModal(false);
    setSelectedProduct(null);
  };

  const handleProductClick = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
      setSelectedAttributes({});
      setShowVariantModal(true);
    } else {
      handleAddToCart(product);
    }
  };

  const updateQuantity = (
    productId: string,
    variantId: string | undefined,
    delta: number,
  ) => {
    setCartItems((prev) =>
      prev.map((item) => {
        const isMatch = variantId
          ? item.productId === productId && item.variantId === variantId
          : item.productId === productId && !item.variantId;

        if (isMatch) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const updateItemPrice = (
    productId: string,
    variantId: string | undefined,
    newPrice: number,
  ) => {
    setCartItems((prev) =>
      prev.map((item) => {
        const isMatch = variantId
          ? item.productId === productId && item.variantId === variantId
          : item.productId === productId && !item.variantId;

        return isMatch ? { ...item, price: newPrice } : item;
      }),
    );
  };

  const restoreItemPrice = (
    productId: string,
    variantId: string | undefined,
  ) => {
    setCartItems((prev) =>
      prev.map((item) => {
        const isMatch = variantId
          ? item.productId === productId && item.variantId === variantId
          : item.productId === productId && !item.variantId;

        return isMatch ? { ...item, price: item.originalPrice } : item;
      }),
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCartItems((prev) =>
      prev.filter((item) => {
        const isMatch = variantId
          ? item.productId === productId && item.variantId === variantId
          : item.productId === productId && !item.variantId;
        return !isMatch;
      }),
    );
    tToast.success("QuickOrderModal.success_delete_b9f1");
  };

  return {
    cartItems,
    setCartItems,
    showMobileCart,
    setShowMobileCart,
    selectedProduct,
    setSelectedProduct,
    showVariantModal,
    setShowVariantModal,
    selectedAttributes,
    setSelectedAttributes,
    handleAddToCart,
    handleProductClick,
    updateQuantity,
    updateItemPrice,
    restoreItemPrice,
    removeFromCart,
  };
};

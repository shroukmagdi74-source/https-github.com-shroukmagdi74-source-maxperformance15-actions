import { useCallback, useEffect, useMemo, useState } from "react";
import { CafeProduct, CartItem, STORE_PRODUCTS } from "./types";

export const useCafeThemeDemoController = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutView, setIsCheckoutView] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState<CafeProduct | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [milkOption, setMilkOption] = useState("Regular");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Great+Vibes&family=Inter:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.head.removeChild(link);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);

  const handleAddToCart = useCallback(
    (product: CafeProduct, options?: string) => {
      setCart((prev) => {
        const existing = prev.find(
          (item) => item.id === product.id && item.options === options,
        );
        if (existing) {
          return prev.map((item) =>
            item.id === product.id && item.options === options
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            img: product.img,
            quantity: 1,
            options,
          },
        ];
      });
      setQuickViewProduct(null);
      showToast(`Added ${product.title} to cart`);
    },
    [showToast],
  );

  const handleProceedToCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutView(true);
    window.scrollTo(0, 0);
  }, []);

  const filteredProducts = useMemo(() => {
    return activeCategory === "All"
      ? STORE_PRODUCTS
      : STORE_PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const cartSubTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  const cartTotalItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const taxAmount = cartSubTotal * 0.14;
  const shippingFee = cartTotalItems > 0 ? 5.0 : 0;
  const grandTotal = cartSubTotal + taxAmount + shippingFee;

  return {
    cart,
    setCart,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isCartOpen,
    setIsCartOpen,
    isCheckoutView,
    setIsCheckoutView,
    isSuccessModalOpen,
    setSuccessModalOpen,
    activeCategory,
    setActiveCategory,
    quickViewProduct,
    setQuickViewProduct,
    toastMessage,
    milkOption,
    setMilkOption,
    isScrolled,
    showToast,
    handleAddToCart,
    handleProceedToCheckout,
    filteredProducts,
    cartSubTotal,
    cartTotalItems,
    taxAmount,
    shippingFee,
    grandTotal,
  };
};

export type CafeThemeDemoController = ReturnType<
  typeof useCafeThemeDemoController
>;

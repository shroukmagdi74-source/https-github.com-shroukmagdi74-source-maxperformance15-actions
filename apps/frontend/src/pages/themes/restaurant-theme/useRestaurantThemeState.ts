import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useProducts } from '../../../storefront/hooks/useProducts';
import {
  categoryName,
  DemoCartItem,
  DemoProduct,
  emptyForm,
  fallbackProducts,
  OrderSummary,
  RestaurantCheckoutForm,
  scrollToSection,
  toDemoProduct,
} from './types';

export function useRestaurantThemeState() {
  const { products, isLoading } = useProducts({ limit: 20 });

  const [activeCat, setActiveCat] = useState('الكل');
  const [cartItems, setCartItems] = useState<DemoCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState<RestaurantCheckoutForm>(emptyForm);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  const catalogProducts = useMemo(
    () => (products.length > 0 ? products.map(toDemoProduct) : fallbackProducts),
    [products],
  );

  const categories = useMemo(() => {
    const set = new Set<string>(['الكل']);
    catalogProducts.forEach((product) => set.add(categoryName(product.category?.name)));
    return Array.from(set);
  }, [catalogProducts]);

  const filteredProducts = useMemo(() => {
    if (activeCat === 'الكل') return catalogProducts;
    return catalogProducts.filter((product) => categoryName(product.category?.name) === activeCat);
  }, [activeCat, catalogProducts]);

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const deliveryFee = totalItems === 0 || subtotal >= 450 ? 0 : 35;
  const total = subtotal + deliveryFee;

  const featuredDeal =
    catalogProducts.find((product) => categoryName(product.category?.name) === 'الكومبوهات') ||
    catalogProducts[0];

  useEffect(() => {
    if (activeCat !== 'الكل' && !categories.includes(activeCat)) {
      setActiveCat('الكل');
    }
  }, [activeCat, categories]);

  useEffect(() => {
    const shouldLock = isCartOpen || showCheckout;
    if (!shouldLock) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCartOpen, showCheckout]);

  const addToCart = (product: DemoProduct) => {
    setCartItems((current) => {
      const existingIndex = current.findIndex((item) => item.id === `${product.id}-default`);
      if (existingIndex === -1) {
        return [
          {
            id: `${product.id}-default`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: product.images?.[0] || '',
          },
          ...current,
        ];
      }

      return current.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item,
      );
    });
    setIsCartOpen(true);
  };

  const removeCartItem = (id: string) => {
    setCartItems((current) => current.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id: string, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      removeCartItem(id);
      return;
    }

    setCartItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, nextQuantity) } : item,
      ),
    );
  };

  const jumpToDeal = () => {
    if (featuredDeal) {
      setActiveCat(categoryName(featuredDeal.category?.name));
    }
    scrollToSection('menu');
  };

  const startCheckout = () => {
    if (!cartItems.length) return;
    setIsCartOpen(false);
    setShowCheckout(true);
  };

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartItems.length) return;
    setOrderSummary({
      orderId: `BR-${String(Date.now()).slice(-6)}`,
      customerName: form.name.trim() || 'ضيف BiteRush',
      total,
      eta: form.eta,
      itemCount: totalItems,
    });
    setCartItems([]);
    setForm(emptyForm);
    setShowCheckout(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    products,
    isLoading,
    activeCat,
    setActiveCat,
    cartItems,
    isCartOpen,
    setIsCartOpen,
    showCheckout,
    setShowCheckout,
    form,
    setForm,
    orderSummary,
    catalogProducts,
    categories,
    filteredProducts,
    totalItems,
    subtotal,
    deliveryFee,
    total,
    featuredDeal,
    addToCart,
    removeCartItem,
    updateCartQuantity,
    jumpToDeal,
    startCheckout,
    placeOrder,
  };
}

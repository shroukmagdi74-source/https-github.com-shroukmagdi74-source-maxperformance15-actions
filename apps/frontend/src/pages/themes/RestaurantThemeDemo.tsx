import React from 'react';
import {
  RestaurantCategoryBar,
  RestaurantCartDrawer,
  RestaurantCheckoutModal,
  RestaurantDealsSection,
  RestaurantDeliveryZones,
  RestaurantFloatingCartBar,
  RestaurantHeroSection,
  RestaurantMenuGrid,
  RestaurantNav,
  RestaurantOrderConfirmedBanner,
  useRestaurantThemeState,
} from './restaurant-theme';

export default function RestaurantThemeDemo() {
  const {
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
    addToCart,
    removeCartItem,
    updateCartQuantity,
    jumpToDeal,
    startCheckout,
    placeOrder,
  } = useRestaurantThemeState();

  return (
    <div
      lang="ar"
      dir="rtl"
      className="min-h-screen bg-[#FFFDFB] font-sans text-[#1D1D1F] selection:bg-orange-500 selection:text-white"
    >
      <RestaurantNav
        totalItems={totalItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {orderSummary && (
        <RestaurantOrderConfirmedBanner orderSummary={orderSummary} />
      )}

      <main>
        <RestaurantHeroSection onJumpToDeal={jumpToDeal} />

        <RestaurantDealsSection onSelectCategory={setActiveCat} />

        <RestaurantCategoryBar
          categories={categories}
          activeCat={activeCat}
          onSelectCategory={setActiveCat}
          hasProducts={products.length > 0}
        />

        <RestaurantMenuGrid
          isLoading={isLoading}
          hasCatalogProducts={catalogProducts.length > 0}
          filteredProducts={filteredProducts}
          onAddToCart={addToCart}
        />

        <RestaurantDeliveryZones />
      </main>

      {!isCartOpen && !showCheckout && (
        <RestaurantFloatingCartBar
          totalItems={totalItems}
          total={total}
          onOpenCart={() => setIsCartOpen(true)}
          onStartCheckout={startCheckout}
        />
      )}

      <RestaurantCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
        onRemoveItem={removeCartItem}
        onUpdateQuantity={updateCartQuantity}
        onStartCheckout={startCheckout}
      />

      <RestaurantCheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        form={form}
        setForm={setForm}
        onSubmit={placeOrder}
        cartItems={cartItems}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
      />
    </div>
  );
}

export * from './restaurant-theme/types';

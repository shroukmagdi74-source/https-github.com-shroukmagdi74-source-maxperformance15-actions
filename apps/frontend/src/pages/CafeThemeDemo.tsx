import React from "react";
import {
  CafeAboutSection,
  CafeCartDrawer,
  CafeCheckoutView,
  CafeFooter,
  CafeHeroSection,
  CafeMenuSection,
  CafeMobileMenuDrawer,
  CafeNavbar,
  CafeQuickViewModal,
  CafeToast,
  useCafeThemeDemoController,
} from "./cafe-theme-demo/index";

export default function CafeThemeDemo() {
  const controller = useCafeThemeDemoController();

  if (controller.isCheckoutView) {
    return (
      <CafeCheckoutView
        cart={controller.cart}
        subTotal={controller.cartSubTotal}
        shippingFee={controller.shippingFee}
        taxAmount={controller.taxAmount}
        grandTotal={controller.grandTotal}
        isSuccessModalOpen={controller.isSuccessModalOpen}
        onReturnToStore={() => controller.setIsCheckoutView(false)}
        onPlaceOrder={() => controller.setSuccessModalOpen(true)}
        onSuccessModalClose={() => {
          controller.setSuccessModalOpen(false);
          controller.setCart([]);
          controller.setIsCheckoutView(false);
        }}
      />
    );
  }

  return (
    <div className="bg-[#FCFBF8] text-gray-800 min-h-screen selection:bg-[#947771] selection:text-white font-sans">
      <CafeNavbar
        isScrolled={controller.isScrolled}
        cartTotalItems={controller.cartTotalItems}
        onOpenCart={() => controller.setIsCartOpen(true)}
        onOpenMobileMenu={() => controller.setIsMobileMenuOpen(true)}
      />

      <CafeHeroSection />

      <CafeMenuSection
        activeCategory={controller.activeCategory}
        onSelectCategory={controller.setActiveCategory}
        products={controller.filteredProducts}
        onProductClick={controller.setQuickViewProduct}
      />

      <CafeAboutSection />

      <CafeFooter />

      <CafeQuickViewModal
        product={controller.quickViewProduct}
        milkOption={controller.milkOption}
        onMilkOptionChange={controller.setMilkOption}
        onAddToCart={controller.handleAddToCart}
        onClose={() => controller.setQuickViewProduct(null)}
      />

      <CafeCartDrawer
        isOpen={controller.isCartOpen}
        cart={controller.cart}
        subTotal={controller.cartSubTotal}
        onClose={() => controller.setIsCartOpen(false)}
        onUpdateQuantity={(id, options, delta) => {
          controller.setCart((prev) =>
            prev
              .map((item) =>
                item.id === id && item.options === options
                  ? { ...item, quantity: item.quantity + delta }
                  : item,
              )
              .filter((item) => item.quantity > 0),
          );
        }}
        onRemoveItem={(id, options) => {
          controller.setCart((prev) =>
            prev.filter((p) => !(p.id === id && p.options === options)),
          );
        }}
        onProceedToCheckout={controller.handleProceedToCheckout}
      />

      <CafeMobileMenuDrawer
        isOpen={controller.isMobileMenuOpen}
        onClose={() => controller.setIsMobileMenuOpen(false)}
      />

      <CafeToast message={controller.toastMessage} />
    </div>
  );
}

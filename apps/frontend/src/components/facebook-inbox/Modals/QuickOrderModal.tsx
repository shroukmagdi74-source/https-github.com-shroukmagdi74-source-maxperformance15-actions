import React from "react";
import {
  QuickOrderModalProps,
  overlayStyle,
  useQuickOrderModal,
  QuickOrderHeader,
  QuickOrderProductCatalog,
  QuickOrderCustomerHistoryDrawer,
  QuickOrderCartSidebar,
  QuickOrderCheckoutStep,
  QuickOrderSuccessView,
  QuickOrderFooter,
  VariantSelectionModal,
} from "./quick-order-modal";

export * from "./quick-order-modal/types";

const QuickOrderModal: React.FC<QuickOrderModalProps> = (props) => {
  const { isOpen, onClose, conversation, customerName: initialCustomerName } = props;
  const state = useQuickOrderModal(props);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 quick-order-modal"
      style={overlayStyle}
    >
      <div className="business-modal-surface flex h-[95vh] sm:h-auto sm:max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl sm:rounded-2xl">
        {/* Header & Tabs */}
        <QuickOrderHeader
          initialCustomerName={initialCustomerName}
          convCustomerName={state.convCustomerName}
          convPageName={state.convPageName}
          createdOrder={Boolean(state.createdOrder)}
          step={state.step}
          setStep={state.setStep}
          cartCount={state.cartItems.length}
          showMobileCart={state.showMobileCart}
          setShowMobileCart={state.setShowMobileCart}
          onClose={onClose}
        />

        {/* Content Body */}
        <div className="relative flex flex-1 overflow-hidden">
          {state.createdOrder ? (
            <QuickOrderSuccessView
              createdOrder={state.createdOrder}
              customerName={state.customerName}
              phone={state.phone}
              grandTotal={state.grandTotal}
              isScheduledOrder={state.isScheduledOrder}
              scheduledDeliveryDate={state.scheduledDeliveryDate}
              scheduledDeliveryTime={state.scheduledDeliveryTime}
              onClose={onClose}
              onReset={() => {
                state.setCreatedOrder(null);
                state.setCartItems([]);
              }}
            />
          ) : state.step === "products" ? (
            <>
              {/* Products Catalog */}
              <QuickOrderProductCatalog
                searchQuery={state.searchQuery}
                setSearchQuery={state.setSearchQuery}
                previousOrders={state.previousOrders}
                customerProfile={state.customerProfile}
                phone={state.phone}
                showHistoryDrawer={state.showHistoryDrawer}
                setShowHistoryDrawer={state.setShowHistoryDrawer}
                viewMode={state.viewMode}
                setViewMode={state.setViewMode}
                productListRef={state.productListRef}
                handleProductListScroll={state.handleProductListScroll}
                loadingProducts={state.loadingProducts}
                products={state.products}
                handleProductClick={state.handleProductClick}
                loadingMoreProducts={state.loadingMoreProducts}
                hasMoreProducts={state.hasMoreProducts}
                loadMoreProducts={state.loadMoreProducts}
              />

              {/* Customer Previous Orders Drawer / Overlay */}
              <QuickOrderCustomerHistoryDrawer
                showHistoryDrawer={state.showHistoryDrawer}
                setShowHistoryDrawer={state.setShowHistoryDrawer}
                customerName={state.customerName}
                phone={state.phone}
                city={state.city}
                area={state.area}
                address={state.address}
                notes={state.notes}
                customerProfile={state.customerProfile}
                previousOrders={state.previousOrders}
                loadingCustomerOrders={state.loadingCustomerOrders}
              />

              {/* Desktop & Mobile Cart Sidebar */}
              <QuickOrderCartSidebar
                cartItems={state.cartItems}
                subtotal={state.subtotal}
                showMobileCart={state.showMobileCart}
                setShowMobileCart={state.setShowMobileCart}
                onProceedToCheckout={() => state.setStep("checkout")}
                updateQuantity={state.updateQuantity}
                updateItemPrice={state.updateItemPrice}
                restoreItemPrice={state.restoreItemPrice}
                removeFromCart={state.removeFromCart}
              />
            </>
          ) : (
            /* Checkout Step */
            <QuickOrderCheckoutStep
              phone={state.phone}
              setPhone={state.setPhone}
              customerName={state.customerName}
              setCustomerName={state.setCustomerName}
              loadingCustomerOrders={state.loadingCustomerOrders}
              customerProfile={state.customerProfile}
              previousOrders={state.previousOrders}
              checkingBlock={state.checkingBlock}
              customerBlock={state.customerBlock}
              allowBlockedCustomerOverride={state.allowBlockedCustomerOverride}
              setAllowBlockedCustomerOverride={state.setAllowBlockedCustomerOverride}
              canOverrideBlockedCustomer={state.canOverrideBlockedCustomer}
              city={state.city}
              setCity={state.setCity}
              area={state.area}
              setArea={state.setArea}
              address={state.address}
              setAddress={state.setAddress}
              shippingInfo={state.shippingInfo}
              loadingShipping={state.loadingShipping}
              isScheduledOrder={state.isScheduledOrder}
              setIsScheduledOrder={state.setIsScheduledOrder}
              scheduledDeliveryDate={state.scheduledDeliveryDate}
              setScheduledDeliveryDate={state.setScheduledDeliveryDate}
              scheduledDeliveryTime={state.scheduledDeliveryTime}
              setScheduledDeliveryTime={state.setScheduledDeliveryTime}
              scheduledNotes={state.scheduledNotes}
              setScheduledNotes={state.setScheduledNotes}
              notes={state.notes}
              setNotes={state.setNotes}
              cartItems={state.cartItems}
              subtotal={state.subtotal}
              totalDiscount={state.totalDiscount}
              shippingCost={state.shippingCost}
              grandTotal={state.grandTotal}
              appliedCoupon={state.appliedCoupon}
              couponCode={state.couponCode}
              setCouponCode={state.setCouponCode}
              loadingCoupon={state.loadingCoupon}
              handleApplyCoupon={state.handleApplyCoupon}
              handleRemoveCoupon={state.handleRemoveCoupon}
              manualDiscount={state.manualDiscount}
              setManualDiscount={state.setManualDiscount}
              paymentMethod={state.paymentMethod}
              setPaymentMethod={state.setPaymentMethod}
              status={state.status}
              setStatus={state.setStatus}
              requestType={state.requestType}
              setRequestType={state.setRequestType}
              returnAmount={state.returnAmount}
              setReturnAmount={state.setReturnAmount}
              isExchangeOrReturn={state.isExchangeOrReturn}
              phoneDigitsCount={state.phoneDigitsCount}
              previousOrderMissing={state.previousOrderMissing}
              exchangeReturnPolicy={state.exchangeReturnPolicy}
              eligiblePreviousOrders={state.eligiblePreviousOrders}
              selectedPreviousOrder={state.selectedPreviousOrder}
              setSelectedPreviousOrder={state.setSelectedPreviousOrder}
              selectedOrderObj={state.selectedOrderObj}
            />
          )}
        </div>

        {/* Footer */}
        <QuickOrderFooter
          createdOrder={Boolean(state.createdOrder)}
          step={state.step}
          setStep={state.setStep}
          onClose={onClose}
          cartCount={state.cartItems.length}
          grandTotal={state.grandTotal}
          setShowMobileCart={state.setShowMobileCart}
          handleCreateOrder={state.handleCreateOrder}
          loading={state.loading}
          phone={state.phone}
          customerName={state.customerName}
          blockPreventsOrder={state.blockPreventsOrder}
          previousOrderPreventsOrder={state.previousOrderPreventsOrder}
          isScheduledOrder={state.isScheduledOrder}
          scheduledDeliveryDate={state.scheduledDeliveryDate}
          city={state.city}
          loadingShipping={state.loadingShipping}
        />

        {/* Variant Selection Modal */}
        {state.showVariantModal && state.selectedProduct && (
          <VariantSelectionModal
            product={state.selectedProduct}
            selectedAttributes={state.selectedAttributes}
            onAttributeSelect={(attrName, value) => {
              state.setSelectedAttributes((prev) => ({
                ...prev,
                [attrName]: value,
              }));
            }}
            onVariantSelect={(variant) => {
              state.handleAddToCart(
                state.selectedProduct!,
                variant,
                state.selectedAttributes,
              );
              state.setSelectedAttributes({});
            }}
            onClose={() => {
              state.setShowVariantModal(false);
              state.setSelectedProduct(null);
              state.setSelectedAttributes({});
            }}
          />
        )}
      </div>
    </div>
  );
};

export default QuickOrderModal;

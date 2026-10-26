import React from "react";
import {
  usePosController,
  PosTopControlBar,
  PosCategoriesRibbon,
  PosProductsGrid,
  PosCartPanel,
  PosPaymentModal,
  PosReceiptModal,
  PosParkTableModal,
  PosShiftReportModal,
} from "./pos-page";
import ItemModifierModal from "./ItemModifierModal";

const PosPage: React.FC = () => {
  const {
    t,
    locale,
    loading,
    filtered,
    cart,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isFullscreen,
    setIsFullscreen,
    categories,
    processing,
    showReceipt,
    setShowReceipt,
    showShiftReport,
    setShowShiftReport,
    showPayment,
    setShowPayment,
    lastOrder,
    shiftData,
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    splitCash,
    setSplitCash,
    splitCard,
    setSplitCard,
    searchRef,
    modifierGroups,
    selectedProductForModifier,
    setSelectedProductForModifier,
    showModifierModal,
    setShowModifierModal,
    discountType,
    setDiscountType,
    discountPercent,
    setDiscountPercent,
    rawSubtotal,
    discountAmount,
    tax,
    total,
    change,
    tabs,
    addToCart,
    handleModifierConfirm,
    updateQty,
    removeItem,
    clearCart,
    checkout,
    resetShift,
    handlePrintReceipt,
    handlePrintKitchenTicket,
  } = usePosController();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans select-none">
      {/* Products & Navigation Catalog Column */}
      <div className="flex-1 flex flex-col min-w-0 border-l border-border/80">
        <PosTopControlBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchRef={searchRef}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          t={t}
        />

        <PosCategoriesRibbon
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <PosProductsGrid
          products={filtered}
          loading={loading}
          onAddToCart={addToCart}
          t={t}
        />
      </div>

      {/* Cart & Order Summary Panel */}
      <PosCartPanel
        cart={cart}
        activeTabName={tabs.activeTabName}
        activeTabId={tabs.activeTabId}
        openTabs={tabs.openTabs}
        kotSuccessNotice={tabs.kotSuccessNotice}
        kotFiring={tabs.kotFiring}
        discountType={discountType}
        discountPercent={discountPercent}
        rawSubtotal={rawSubtotal}
        discountAmount={discountAmount}
        tax={tax}
        total={total}
        onOpenParkModal={() => tabs.setShowParkModal(true)}
        onClearCart={clearCart}
        onUnlinkTab={tabs.unlinkCurrentTab}
        onRestoreTab={tabs.restoreTab}
        onDeleteTab={tabs.deleteTab}
        onUpdateQty={updateQty}
        onRemoveItem={removeItem}
        onSetDiscount={(type, pct) => {
          setDiscountType(type);
          setDiscountPercent(pct);
        }}
        onOpenShiftReport={() => setShowShiftReport(true)}
        onFireKitchenTicket={tabs.fireKitchenTicket}
        onOpenPayment={() => {
          setShowPayment(true);
          setCashReceived(Math.ceil(total));
        }}
        t={t}
      />

      {/* Payment Processing Modal */}
      <PosPaymentModal
        show={showPayment}
        onClose={() => setShowPayment(false)}
        total={total}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        splitCash={splitCash}
        setSplitCash={setSplitCash}
        splitCard={splitCard}
        setSplitCard={setSplitCard}
        change={change}
        processing={processing}
        onCheckout={checkout}
        t={t}
      />

      {/* Order Completed / Receipt Modal */}
      <PosReceiptModal
        show={showReceipt}
        lastOrder={lastOrder}
        onPrintReceipt={handlePrintReceipt}
        onPrintKitchenTicket={handlePrintKitchenTicket}
        onClose={() => setShowReceipt(false)}
        t={t}
      />

      {/* Cafe Table / Park Order Modal */}
      <PosParkTableModal
        show={tabs.showParkModal}
        onClose={() => tabs.setShowParkModal(false)}
        parkTableName={tabs.parkTableName}
        setParkTableName={tabs.setParkTableName}
        onParkCart={tabs.parkCurrentCart}
      />

      {/* End-of-Shift Report Modal */}
      <PosShiftReportModal
        show={showShiftReport}
        onClose={() => setShowShiftReport(false)}
        shiftData={shiftData}
        onResetShift={resetShift}
        locale={locale}
        t={t}
      />

      {/* Item Modifiers Modal */}
      {showModifierModal && selectedProductForModifier && (
        <ItemModifierModal
          product={selectedProductForModifier}
          modifierGroups={modifierGroups}
          onClose={() => {
            setShowModifierModal(false);
            setSelectedProductForModifier(null);
          }}
          onConfirm={handleModifierConfirm}
        />
      )}
    </div>
  );
};

export default PosPage;

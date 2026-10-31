import React from "react";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface QuickOrderHeaderProps {
  initialCustomerName?: string;
  convCustomerName?: string;
  convPageName?: string;
  createdOrder: boolean;
  step: "products" | "checkout";
  setStep: (step: "products" | "checkout") => void;
  cartCount: number;
  showMobileCart: boolean;
  setShowMobileCart: (show: boolean) => void;
  onClose: () => void;
}

export const QuickOrderHeader: React.FC<QuickOrderHeaderProps> = ({
  initialCustomerName,
  convCustomerName,
  convPageName,
  createdOrder,
  step,
  setStep,
  cartCount,
  showMobileCart,
  setShowMobileCart,
  onClose,
}) => {
  return (
    <>
      {/* Header */}
      <div className="business-workflow-header flex items-center justify-between p-3.5 sm:p-4">
        <div className="flex items-center gap-3">
          <ShoppingCartIcon className="w-6 h-6 flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="business-workflow-title truncate">طلب سريع</h2>
            <p className="business-workflow-subtitle truncate">
              {initialCustomerName || convCustomerName} - {convPageName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="business-icon-button flex-shrink-0"
          style={{
            background: "rgba(255, 255, 255, 0.14)",
            borderColor: "rgba(255, 255, 255, 0.18)",
            color: "white",
          }}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Steps Indicator */}
      {!createdOrder && (
        <div className="business-workflow-tabs">
          <button
            type="button"
            onClick={() => {
              setStep("products");
              setShowMobileCart(false);
            }}
            className="business-workflow-tab flex-1 sm:flex-initial"
            data-active={step === "products" && !showMobileCart}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="business-workflow-badge">1</span>
              المنتجات
              {cartCount > 0 && (
                <span className="business-gallery-count font-mono tabular-nums">
                  {cartCount}
                </span>
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (cartCount > 0) {
                setStep("checkout");
                setShowMobileCart(false);
              }
            }}
            disabled={cartCount === 0}
            className="business-workflow-tab flex-1 sm:flex-initial"
            data-active={step === "checkout"}
            data-disabled={cartCount === 0}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="business-workflow-badge">2</span>
              الدفع والتوصيل
            </span>
          </button>
        </div>
      )}
    </>
  );
};

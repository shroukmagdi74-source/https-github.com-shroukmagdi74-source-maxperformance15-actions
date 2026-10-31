import React from "react";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export interface ModalHeaderProps {
  orderNumber?: string;
  isIncompleteCart?: boolean;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  orderNumber,
  isIncompleteCart,
  onClose,
}) => {
  const { t } = useTranslation();

  const formattedOrderNumber =
    String(orderNumber || "").startsWith("cart_") || isIncompleteCart
      ? `INC-${String(orderNumber || "").replace(/^cart_/, "").slice(0, 8).toUpperCase()}`
      : orderNumber;

  return (
    <div className="flex items-center justify-between pb-2">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShoppingBagIcon className="h-4 w-4" />
        </span>
        <div>
          <h3
            id="modal-title"
            className="text-base font-black text-foreground leading-tight"
          >
            {t("orders.orderDetails")}
          </h3>
          <p
            className="text-[11px] font-medium font-mono tabular-nums text-muted-foreground leading-tight"
            dir="ltr"
          >
            #{formattedOrderNumber}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={String(t("orders.close"))}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ModalHeader;

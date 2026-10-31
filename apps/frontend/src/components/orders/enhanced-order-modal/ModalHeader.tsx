import React from "react";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export interface ModalHeaderProps {
  orderNumber?: string;
  isIncompleteCart?: boolean;
  order?: any;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  orderNumber,
  isIncompleteCart,
  order,
  onClose,
}) => {
  const { t } = useTranslation();

  const formattedOrderNumber =
    String(orderNumber || "").startsWith("cart_") || isIncompleteCart
      ? `INC-${String(orderNumber || "").replace(/^cart_/, "").slice(0, 8).toUpperCase()}`
      : orderNumber;

  const isAffiliateDirect =
    order?.orderSource === "AFFILIATE_DIRECT" ||
    (typeof orderNumber === "string" && orderNumber.includes("-AFF-")) ||
    (typeof order?.orderNumber === "string" && order.orderNumber.includes("-AFF-"));
  const affiliateCompanyName =
    order?.affiliate?.user?.company?.name ||
    order?.affiliate?.company?.name ||
    null;

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
          <div className="flex items-center gap-1.5 flex-wrap">
            <p
              className="text-[11px] font-medium font-mono tabular-nums text-muted-foreground leading-tight"
              dir="ltr"
            >
              #{formattedOrderNumber}
            </p>
            {isAffiliateDirect && (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20"
                title={affiliateCompanyName ? `أوردر من شركة مرتبطة: ${affiliateCompanyName}` : "أوردر من شركة مرتبطة"}
              >
                <span>{affiliateCompanyName ? `مرتبط — ${affiliateCompanyName}` : "مرتبط"}</span>
              </span>
            )}
          </div>
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

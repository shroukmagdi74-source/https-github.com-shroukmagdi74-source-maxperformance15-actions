import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBagIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export interface ModalStickyFooterProps {
  orderNumber?: string;
  isPrinting: boolean;
  onPrintInvoice: () => void;
  onClose: () => void;
}

export const ModalStickyFooter: React.FC<ModalStickyFooterProps> = ({
  orderNumber,
  isPrinting,
  onPrintInvoice,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-border/60 bg-background/95 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          to={`/orders/${encodeURIComponent(String(orderNumber || ""))}`}
          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] sm:min-h-[38px] sm:rounded-lg"
        >
          <ShoppingBagIcon className="h-4 w-4" />
          {t("orders.viewFullDetails")}
        </Link>
        <button
          type="button"
          onClick={onPrintInvoice}
          disabled={isPrinting}
          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:scale-[0.98] disabled:opacity-50 sm:min-h-[38px] sm:rounded-lg"
        >
          <PrinterIcon className="h-4 w-4 text-muted-foreground" />
          {isPrinting ? t("orders.printing") : t("orders.printInvoice")}
        </button>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex min-h-[40px] w-full items-center justify-center rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98] sm:min-h-[38px] sm:w-auto sm:rounded-lg"
      >
        {t("orders.close")}
      </button>
    </div>
  );
};

export default ModalStickyFooter;

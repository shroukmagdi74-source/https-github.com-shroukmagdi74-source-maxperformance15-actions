import React from "react";
import {
  UserCircleIcon,
  ClipboardDocumentListIcon,
  CalculatorIcon,
  StarIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { toStandardDigits } from "../../../utils/validation";
import { isPostPurchaseOfferItem } from "../../../utils/postPurchaseOfferBadge";
import OrderPartnerOperationsCard from "../OrderPartnerOperationsCard";
import { NormalizedOrderItem } from "./types";

export interface OrderDetailsTabProps {
  order: any;
  displayItems: NormalizedOrderItem[];
  getCustomerDisplayName: () => string;
  getLocationDisplayName: (val: any) => string | null;
  formatPrice: (price: number) => string;
  merchantOrderContext: any;
}

export const OrderDetailsTab: React.FC<OrderDetailsTabProps> = ({
  order,
  displayItems,
  getCustomerDisplayName,
  getLocationDisplayName,
  formatPrice,
  merchantOrderContext,
}) => {
  const { t } = useTranslation();

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-muted-foreground";
    if (confidence >= 0.8) return "text-success";
    if (confidence >= 0.6) return "text-warning";
    return "text-destructive";
  };

  const getConfidenceIcon = (confidence?: number) => {
    if (!confidence) return <InformationCircleIcon className="h-4 w-4" />;
    if (confidence >= 0.8) return <StarIcon className="h-4 w-4" />;
    return <ExclamationTriangleIcon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/60 bg-card/40 divide-y divide-border/60 overflow-hidden backdrop-blur-sm">
        {/* Customer Info */}
        <div className="p-3">
          <div className="flex items-center gap-1.5 pb-2 text-xs font-semibold text-foreground">
            <UserCircleIcon className="h-4 w-4 text-primary" />
            <span>{t("orders.customerInfo")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block leading-none mb-0.5">
                {t("orders.name")}
              </span>
              <span className="text-sm text-foreground font-semibold leading-tight">
                {getCustomerDisplayName()}
              </span>
            </div>
            {order.customerPhone && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block leading-none mb-0.5">
                  {t("orders.phone")}
                </span>
                <span
                  className="text-sm text-foreground font-semibold leading-tight font-mono tabular-nums inline-block"
                  dir="ltr"
                >
                  {toStandardDigits(order.customerPhone)}
                </span>
              </div>
            )}
            {(order.governorate || order.shippingAddress?.governorate) && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block leading-none mb-0.5">
                  {t("orders.governorate")}
                </span>
                <span className="text-sm text-foreground font-semibold leading-tight">
                  {getLocationDisplayName(
                    order.governorate || order.shippingAddress?.governorate,
                  )}
                </span>
              </div>
            )}
            {(order.city || order.shippingAddress?.city) && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block leading-none mb-0.5">
                  {t("orders.city")}
                </span>
                <span className="text-sm text-foreground font-semibold leading-tight">
                  {getLocationDisplayName(
                    order.city || order.shippingAddress?.city,
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="p-3">
          <div className="flex items-center gap-1.5 pb-2 text-xs font-semibold text-foreground">
            <ClipboardDocumentListIcon className="h-4 w-4 text-primary" />
            <span>{t("orders.products")}</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {!displayItems || displayItems.length === 0 ? (
              <div className="py-3 text-center text-xs text-muted-foreground">
                {t("orders.noProducts")}
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {displayItems.map((item, index) => (
                  <div
                    key={index}
                    className="py-2 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <p className="font-medium text-foreground text-sm leading-tight">
                            {item.productName ||
                              item.name ||
                              t("orders.productNotSpecified")}
                          </p>
                          {isPostPurchaseOfferItem(item) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-xs">
                              <span>🎁 عرض بعد الشراء</span>
                              {item.originalPrice &&
                                Number(item.originalPrice) >
                                  Number(item.price) && (
                                  <span className="font-normal text-[10px] opacity-80 tabular-nums">
                                    (سعر العرض {item.price} بدلاً من{" "}
                                    {item.originalPrice})
                                  </span>
                                )}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("orders.quantity")}:{" "}
                          <span className="tabular-nums">{item.quantity}</span>
                        </p>
                        {(item.productColor ||
                          item.productSize ||
                          item.metadata?.color ||
                          item.metadata?.size) && (
                          <div className="text-[11px] mt-1 flex items-center gap-2 flex-nowrap overflow-x-auto max-w-full">
                            {(item.productColor || item.metadata?.color) && (
                              <span className="whitespace-nowrap shrink-0 px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800">
                                {item.productColor || item.metadata?.color}
                              </span>
                            )}
                            {(item.productSize || item.metadata?.size) && (
                              <span className="whitespace-nowrap shrink-0 px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium border border-purple-200 dark:border-purple-800">
                                {item.productSize || item.metadata?.size}
                              </span>
                            )}
                          </div>
                        )}
                        {(item.confidence || item.metadata?.confidence) && (
                          <div
                            className={`flex items-center mt-1.5 ${getConfidenceColor(
                              item.confidence || item.metadata?.confidence,
                            )}`}
                          >
                            {getConfidenceIcon(
                              item.confidence || item.metadata?.confidence,
                            )}
                            <span className="text-xs ml-1 font-medium tabular-nums">
                              {t("orders.confidence")}:{" "}
                              {(
                                (item.confidence ||
                                  item.metadata?.confidence) * 100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        <p className="font-semibold text-foreground text-sm font-mono tabular-nums">
                          {formatPrice(
                            item.total || item.price * item.quantity,
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono tabular-nums">
                          {formatPrice(item.price)} / {t("orders.unit")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-3 bg-primary/5">
          <div className="flex items-center gap-1.5 pb-2 text-xs font-semibold text-foreground">
            <CalculatorIcon className="h-4 w-4 text-primary" />
            <span>{t("orders.orderSummary")}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-foreground">
              <span>{t("orders.subtotal")}:</span>
              <span className="font-medium font-mono tabular-nums">
                {formatPrice(order.subtotal || 0)}
              </span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-foreground">
                <span>{t("orders.tax")}:</span>
                <span className="font-medium font-mono tabular-nums">
                  {formatPrice(order.tax)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-foreground">
              <span>{t("orders.shipping")}:</span>
              <span className="font-medium font-mono tabular-nums">
                {formatPrice(order.shipping || 0)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/60 text-sm font-bold text-foreground">
              <span>{t("orders.total")}:</span>
              <span className="text-primary font-mono tabular-nums text-base">
                {formatPrice(order.total || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <OrderPartnerOperationsCard
        affiliate={order?.affiliate || null}
        compact
        merchantOrder={merchantOrderContext}
      />
    </div>
  );
};

export default OrderDetailsTab;

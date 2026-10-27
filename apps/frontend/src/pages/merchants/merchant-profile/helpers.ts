import { MerchantOperationsTotals, MerchantRecord } from "./types";

export const formatPieces = (value: string | number | undefined | null): string =>
  Number(value || 0).toLocaleString("ar-EG", {
    maximumFractionDigits: 0,
  });

export const formatMoney = (
  value: string | number | undefined | null,
  currency = "EGP",
): string =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const createEmptyOperationsTotals = (): MerchantOperationsTotals => ({
  assignedOrdersCount: 0,
  assignedPieces: 0,
  preparationOrdersCount: 0,
  preparationPieces: 0,
  inShippingOrdersCount: 0,
  inShippingPieces: 0,
  deliveredOrdersCount: 0,
  deliveredPieces: 0,
  notDeliveredOrdersCount: 0,
  notDeliveredPieces: 0,
  payablePieces: 0,
  pendingPayablePieces: 0,
  expectedReceivableAmount: 0,
  inShippingAmount: 0,
  deliveredPayableAmount: 0,
  notDeliveredAmount: 0,
  shippingCostAmount: 0,
  confirmedCommissionAmount: 0,
  pendingCommissionAmount: 0,
  paidAmount: 0,
});

export const getMerchantOperationsTotals = (
  merchant: MerchantRecord,
): MerchantOperationsTotals => ({
  ...createEmptyOperationsTotals(),
  ...(merchant.operationsSummary?.summary || {}),
});

export const operationStatusLabels: Record<string, string> = {
  PREPARATION: "قيد التجهيز",
  IN_SHIPPING: "في الشحن",
  DELIVERED: "تم التسليم",
  NOT_DELIVERED: "مرتجع أو لم يسلم",
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return fallback;
};

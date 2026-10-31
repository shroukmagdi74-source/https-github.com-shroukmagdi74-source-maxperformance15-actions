import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../hooks/useCurrency";
import { useAuth } from "../../../hooks/useAuthSimple";
import { apiClient } from "../../../services/apiClient";
import {
  cancellationService,
  CancellationReason,
} from "../../../services/cancellationService";
import type { OrderDetailsType } from "../../../pages/orders/types";
import {
  EnhancedOrderModalProps,
  ModalTabKey,
  NormalizedOrderItem,
  isCancellationStatus,
} from "./types";

export function useEnhancedOrderModalController({
  order,
  isOpen,
  onClose,
  onOrderUpdate,
  canManagePaymentStatus = true,
}: EnhancedOrderModalProps) {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ModalTabKey>("details");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCancellationStatus, setPendingCancellationStatus] = useState<
    string | null
  >(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationReasonOptions, setCancellationReasonOptions] = useState<
    CancellationReason[]
  >([]);
  const [cancellationReasonOptionsLoading, setCancellationReasonOptionsLoading] =
    useState(false);
  const [cancellationAdditionalNotes, setCancellationAdditionalNotes] =
    useState("");
  const [isOverride, setIsOverride] = useState(false);
  const [governments, setGovernments] = useState<any[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const normalizeItems = (rawItems: any): NormalizedOrderItem[] => {
    if (!rawItems) return [];
    let items = rawItems;
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(items)) return [];

    return items.map((item: any) => {
      const price = parseFloat(item.price ?? item.unitPrice ?? 0);
      const quantity = parseInt(item.quantity ?? 1);
      const safePrice = Number.isFinite(price) ? price : 0;
      const safeQuantity =
        Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
      return {
        ...item,
        productName:
          item.productName ||
          item.name ||
          item.product?.name ||
          "منتج غير محدد",
        name:
          item.name ||
          item.productName ||
          item.product?.name ||
          "منتج غير محدد",
        price: safePrice,
        quantity: safeQuantity,
        total: Number.isFinite(parseFloat(item.total))
          ? parseFloat(item.total)
          : safePrice * safeQuantity,
        productColor:
          item.productColor ||
          item.color ||
          item.metadata?.color ||
          item.metadata?.productColor,
        productSize:
          item.productSize ||
          item.size ||
          item.metadata?.size ||
          item.metadata?.productSize,
      };
    });
  };

  const resolvedItems =
    normalizeItems(order?.items) ||
    (Array.isArray(order?.items) ? order.items : []);
  const fallbackItems = normalizeItems(order?.orderItems);
  const displayItems =
    resolvedItems && resolvedItems.length > 0 ? resolvedItems : fallbackItems;

  const isGuestOrder = Boolean(order?.metadata?.isGuestOrder);
  const normalizedPaymentStatus = (
    order?.paymentStatus ||
    (isGuestOrder ? "unavailable" : "pending")
  ).toLowerCase();
  const merchantOrderContext =
    order?.metadata?.merchantOrder || order?.merchantOrder || null;
  const isMerchantScopedOrder = Boolean(
    order?.metadata?.merchantScope || merchantOrderContext,
  );
  const canManageOrderStatus = !isMerchantScopedOrder;

  // Handle escape key & overflow lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset modal state on close/order change
  useEffect(() => {
    if (!isOpen) {
      setPendingCancellationStatus(null);
      setCancellationReason("");
      setCancellationAdditionalNotes("");
      setError(null);
      setActiveTab("details");
    }
  }, [isOpen, order?.orderNumber]);

  // Load cancellation reasons when cancellation is selected
  useEffect(() => {
    if (!isOpen || !pendingCancellationStatus) {
      return;
    }

    let isMounted = true;
    setCancellationReasonOptionsLoading(true);

    void cancellationService
      .getReasons()
      .then((res) => {
        if (isMounted) {
          setCancellationReasonOptions(res.data);
        }
      })
      .catch((loadError) => {
        console.error("Failed to load cancellation reason presets:", loadError);
        if (isMounted) {
          setCancellationReasonOptions([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setCancellationReasonOptionsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, pendingCancellationStatus]);

  // Fetch governments on open
  useEffect(() => {
    const fetchGovernments = async () => {
      try {
        const response = await apiClient.get("/turbo/governments");
        if (response.data.success && response.data.data?.governments) {
          setGovernments(response.data.data.governments);
        }
      } catch (err) {
        console.error("Failed to fetch governments in modal:", err);
      }
    };
    if (isOpen) {
      fetchGovernments();
    }
  }, [isOpen]);

  const handleUpdateStatus = async (newStatus: string, notes = "") => {
    const normalizedStatus = String(newStatus || "").trim().toUpperCase();
    const trimmedNotes = String(notes || "").trim();

    if (isCancellationStatus(normalizedStatus) && !trimmedNotes) {
      setError(t("orders.cancellationReasonRequired"));
      return false;
    }

    try {
      setIsUpdating(true);
      setError(null);
      const response = await apiClient.post(
        `/orders-new/simple/${order.orderNumber}/status`,
        {
          status: normalizedStatus,
          notes: trimmedNotes,
          isOverride,
        },
      );

      if (response.data.success) {
        const updatedOrder = {
          ...order,
          status: normalizedStatus.toLowerCase(),
          notes: trimmedNotes || order.notes,
        };
        if (response.data.data?.workflowStatus !== "pending" && onOrderUpdate) {
          onOrderUpdate(updatedOrder);
        }
        return true;
      } else {
        setError(response.data.message || t("orders.statusUpdateFailed"));
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("orders.updateError"));
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusSelect = (newStatus: string) => {
    if (!canManageOrderStatus) {
      setError(t("orders.merchantFulfillmentReadOnly"));
      return;
    }

    const normalizedStatus = String(newStatus || "").trim().toUpperCase();
    if (!normalizedStatus) return;

    if (isCancellationStatus(normalizedStatus)) {
      setPendingCancellationStatus(normalizedStatus);
      setCancellationReason("");
      setError(null);
      return;
    }

    setPendingCancellationStatus(null);
    setCancellationReason("");
    void handleUpdateStatus(normalizedStatus);
  };

  const handleUpdatePaymentStatus = async (newStatus: string) => {
    if (isGuestOrder || !canManagePaymentStatus) {
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      const response = await apiClient.post(
        `/orders-new/simple/${order.orderNumber}/payment-status`,
        {
          paymentStatus: newStatus,
        },
      );

      if (response.data.success) {
        const updatedOrder = {
          ...order,
          paymentStatus: newStatus.toLowerCase(),
        };
        if (onOrderUpdate) {
          onOrderUpdate(updatedOrder);
        }
      } else {
        setError(
          response.data.message || t("orders.paymentStatusUpdateFailed"),
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("orders.paymentUpdateError"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      setIsPrinting(true);
      setError(null);
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setError(t("orders.invoiceError") || "Error generating invoice");
        return;
      }
      const response = await apiClient.post("/order-invoices/bulk-generate", {
        orderIds: [order.orderNumber],
      });

      if (response.data.success && response.data.data.invoices?.length > 0) {
        const invoice = response.data.data.invoices[0];
        printWindow.location.href = `/orders/invoices/print-multiple?ids=${invoice.id}`;
      } else if (
        response.data.success &&
        response.data.data.guestOrders?.length > 0
      ) {
        const { storeGuestPrintPayload } = await import(
          "../../../pages/orders/PrintMultipleInvoices"
        );
        const guestKey = storeGuestPrintPayload({
          company: {
            companyName: user?.company?.name || "",
            companyPhone: user?.company?.phone || null,
            companyLogo: user?.company?.logo || null,
          },
          orders: response.data.data.guestOrders.map(
            (entry: { order: OrderDetailsType }) =>
              entry.order as unknown as Parameters<
                typeof storeGuestPrintPayload
              >[0]["orders"][number],
          ),
        });
        printWindow.location.href = `/orders/invoices/print-multiple?guestKey=${encodeURIComponent(
          guestKey,
        )}`;
      } else {
        printWindow.close();
        setError(
          t("orders.invoiceGenerationFailed") || "Failed to generate invoice",
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("orders.invoiceError") ||
          "Error generating invoice",
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const getCustomerDisplayName = () => {
    const isPlaceholderName = (name?: string | null) => {
      if (!name) return true;
      const trimmed = name.trim();
      return (
        trimmed.length <= 1 ||
        /^\d+$/.test(trimmed) ||
        trimmed === "New Customer" ||
        trimmed === "Customer Not Specified" ||
        trimmed === "Customer" ||
        trimmed === "عميل غير محدد" ||
        trimmed === "غير محدد"
      );
    };

    if (order.customerName && !isPlaceholderName(order.customerName)) {
      return order.customerName.trim();
    }

    if (order.customer) {
      const fullName =
        `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim();
      if (!isPlaceholderName(fullName)) {
        return fullName;
      }
    }

    if (order.customerName && order.customerName.match(/^\d+/)) {
      return `${t("orders.facebookCustomer")} (${order.customerName.substring(0, 8)}...)`;
    }

    return t("orders.notSpecifiedCustomer");
  };

  const getLocationDisplayName = (val: any) => {
    if (!val) return null;
    const numId = parseInt(String(val));
    if (!isNaN(numId) && governments.length > 0) {
      const found = governments.find((g) => g.id === numId);
      if (found) return found.name;
    }
    return String(val).replace(/^\d+:/, "").trim();
  };

  return {
    formatPrice,
    t,
    user,
    activeTab,
    setActiveTab,
    isUpdating,
    isPrinting,
    error,
    setError,
    pendingCancellationStatus,
    setPendingCancellationStatus,
    cancellationReason,
    setCancellationReason,
    cancellationReasonOptions,
    cancellationReasonOptionsLoading,
    cancellationAdditionalNotes,
    setCancellationAdditionalNotes,
    isOverride,
    setIsOverride,
    modalRef,
    displayItems,
    isGuestOrder,
    normalizedPaymentStatus,
    merchantOrderContext,
    canManageOrderStatus,
    handleStatusSelect,
    handleUpdateStatus,
    handleUpdatePaymentStatus,
    handlePrintInvoice,
    getCustomerDisplayName,
    getLocationDisplayName,
  };
}

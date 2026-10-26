import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { companyAwareApi } from "../../../services/companyAwareApi";
import type { ModifierGroupItem, ModifierOptionItem } from "../ItemModifierModal";
import {
  Product,
  CartItem,
  Customer,
  ShiftData,
  LastOrder,
  safeJsonParse,
} from "./types";
import { usePosTabs } from "./usePosTabs";
import { usePosShortcuts } from "./usePosShortcuts";
import { usePosProducts } from "./usePosProducts";
import { printReceipt, printKitchenTicket } from "./posPrintService";
import { submitPosOrder } from "./posOrderService";

export function usePosController() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";

  // Products and Category Filtering
  const {
    products,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filtered,
  } = usePosProducts({ t });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showShiftReport, setShowShiftReport] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  const [shiftData, setShiftData] = useState<ShiftData>(() => {
    const saved = localStorage.getItem("pos_shift_data");
    if (saved) {
      const parsed = safeJsonParse<ShiftData | null>(saved, null);
      if (parsed) return { ...parsed, startTime: new Date(parsed.startTime) };
    }
    return {
      startTime: new Date(),
      totalSales: 0,
      totalOrders: 0,
      totalItems: 0,
      cashPayments: 0,
      orders: [],
    };
  });

  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "SPLIT">("CASH");
  const [cashReceived, setCashReceived] = useState(0);
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitCard, setSplitCard] = useState<number>(0);
  const searchRef = useRef<HTMLInputElement>(null);

  // Modifiers state
  const [modifierGroups, setModifierGroups] = useState<ModifierGroupItem[]>([]);
  const [selectedProductForModifier, setSelectedProductForModifier] = useState<Product | null>(null);
  const [showModifierModal, setShowModifierModal] = useState(false);

  // Discount state
  const [discountType, setDiscountType] = useState<"NONE" | "PERCENT" | "VIP_COMP">("NONE");
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Calculations
  const rawSubtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const discountAmount = useMemo(() => {
    if (discountType === "VIP_COMP") return rawSubtotal;
    if (discountType === "PERCENT" && discountPercent > 0) {
      return Math.round((rawSubtotal * discountPercent) / 100);
    }
    return 0;
  }, [rawSubtotal, discountType, discountPercent]);

  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const tax = subtotal * 0.14;
  const total = subtotal + tax;
  const change = paymentMethod === "CASH" ? cashReceived - total : 0;

  // Tabs Hook
  const tabs = usePosTabs({
    cart,
    setCart,
    customer,
    setCustomer,
    subtotal,
    tax,
    total,
    setDiscountType,
    setDiscountPercent,
    locale,
  });

  const fetchModifiers = useCallback(async () => {
    try {
      const res = await companyAwareApi.get<any>("/cafe/modifiers");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setModifierGroups(res.data.data);
      }
    } catch {
      // non-cafe tenant or offline
    }
  }, []);

  useEffect(() => {
    tabs.fetchCloudTabs();
    fetchModifiers();
  }, [tabs.fetchCloudTabs, fetchModifiers]);

  const addToCartDirect = useCallback((p: Product) => {
    setCart((prev) => {
      const ex = prev.find(
        (i) =>
          i.id === p.id &&
          (!i.selectedModifiers || i.selectedModifiers.length === 0),
      );
      if (ex) {
        if (p.trackInventory !== false && ex.qty >= p.stock) return prev;
        return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...p, qty: 1 }];
    });
  }, []);

  const addToCart = useCallback(
    (p: Product) => {
      if (p.trackInventory !== false && p.stock <= 0)
        return alert(t("posPage.notAvailable"));
      if (modifierGroups.length > 0) {
        setSelectedProductForModifier(p);
        setShowModifierModal(true);
      } else {
        addToCartDirect(p);
      }
    },
    [modifierGroups.length, t, addToCartDirect],
  );

  const handleModifierConfirm = (
    product: any,
    selectedModifiers: ModifierOptionItem[],
    notes: string,
    finalUnitPrice: number,
  ) => {
    const uniqueCartId = `${product.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCartItem: CartItem = {
      ...product,
      id: uniqueCartId,
      cartItemId: uniqueCartId,
      price: finalUnitPrice,
      selectedModifiers,
      itemNotes: notes,
      qty: 1,
    };
    setCart((prev) => [...prev, newCartItem]);
  };

  const updateQty = (id: string, d: number) =>
    setCart((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const maxQty = i.trackInventory === false ? 9999 : i.stock;
        return { ...i, qty: Math.max(1, Math.min(maxQty, i.qty + d)) };
      }),
    );

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const clearCart = () => {
    if (cart.length > 0 && !window.confirm(t("posPage.clearCartConfirm"))) return;
    setCart([]);
    setCustomer(null);
    tabs.setActiveTabId(null);
    tabs.setActiveTabName(null);
    setDiscountType("NONE");
    setDiscountPercent(0);
  };

  // Keyboard and Barcode shortcuts
  usePosShortcuts({
    products,
    onAddToCart: addToCart,
    onSearchQuery: setSearchQuery,
    searchRef,
    cartLength: cart.length,
    total,
    onOpenPayment: () => {
      setShowPayment(true);
      setCashReceived(Math.ceil(total));
    },
    onCloseModals: () => {
      setShowPayment(false);
      setShowReceipt(false);
    },
    t,
  });

  const checkout = async () => {
    if (!cart.length) return;
    if (paymentMethod === "CASH" && cashReceived < total) return;
    if (paymentMethod === "SPLIT" && splitCash + splitCard < Math.floor(total))
      return;

    setProcessing(true);
    try {
      const result = await submitPosOrder({
        cart,
        customer,
        paymentMethod,
        discountAmount,
        discountType,
        splitCash,
        splitCard,
        activeTabId: tabs.activeTabId,
        subtotal,
        tax,
        total,
        cashReceived,
      });

      if (result.success && result.orderNumber) {
        setLastOrder({
          orderNumber: result.orderNumber,
          items: [...cart],
          subtotal,
          tax,
          total,
          discount: discountAmount,
          discountType,
          customer,
          date: new Date(),
          paymentMethod,
          cashReceived: paymentMethod === "CASH" ? cashReceived : undefined,
          change: paymentMethod === "CASH" && change > 0 ? change : 0,
          splitDetails:
            paymentMethod === "SPLIT"
              ? { cash: splitCash, card: splitCard }
              : undefined,
        });

        const newShiftData = {
          ...shiftData,
          totalSales: shiftData.totalSales + total,
          totalOrders: shiftData.totalOrders + 1,
          totalItems: shiftData.totalItems + cart.reduce((a, i) => a + i.qty, 0),
          cashPayments:
            shiftData.cashPayments +
            (paymentMethod === "CASH"
              ? total
              : paymentMethod === "SPLIT"
              ? splitCash
              : 0),
          orders: [
            ...shiftData.orders,
            { orderNumber: result.orderNumber, total, paymentMethod },
          ],
        };
        setShiftData(newShiftData);
        localStorage.setItem("pos_shift_data", JSON.stringify(newShiftData));

        if (tabs.activeTabId) {
          const updatedTabs = tabs.openTabs.filter(
            (t) => t.id !== tabs.activeTabId,
          );
          tabs.setOpenTabs(updatedTabs);
          localStorage.setItem("pos_open_tabs", JSON.stringify(updatedTabs));
          tabs.setActiveTabId(null);
          tabs.setActiveTabName(null);
        }

        setShowPayment(false);
        setShowReceipt(true);
        setCart([]);
        setCustomer(null);
        setCashReceived(0);
        setDiscountType("NONE");
        setDiscountPercent(0);
      } else {
        alert(result.message);
      }
    } catch {
      alert(t("posPage.connectionError"));
    } finally {
      setProcessing(false);
    }
  };

  const resetShift = () => {
    const newShift: ShiftData = {
      startTime: new Date(),
      totalSales: 0,
      totalOrders: 0,
      totalItems: 0,
      cashPayments: 0,
      orders: [],
    };
    setShiftData(newShift);
    localStorage.setItem("pos_shift_data", JSON.stringify(newShift));
    setShowShiftReport(false);
  };

  const handlePrintReceipt = () => printReceipt(lastOrder, locale, t);
  const handlePrintKitchenTicket = () => printKitchenTicket(lastOrder, locale);

  return {
    t,
    i18n,
    locale,
    products,
    loading,
    cart,
    setCart,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    customer,
    setCustomer,
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
    subtotal,
    tax,
    total,
    change,
    filtered,
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
  };
}

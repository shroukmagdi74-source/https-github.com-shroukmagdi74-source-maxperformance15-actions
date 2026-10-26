import { useState, useCallback } from "react";
import { companyAwareApi } from "../../../services/companyAwareApi";
import { OpenTab, CartItem, Customer, safeJsonParse } from "./types";
import { fireKitchenTicketWindow } from "./posPrintService";

interface UsePosTabsProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  customer: Customer | null;
  setCustomer: (cust: Customer | null) => void;
  subtotal: number;
  tax: number;
  total: number;
  setDiscountType: (type: "NONE" | "PERCENT" | "VIP_COMP") => void;
  setDiscountPercent: (percent: number) => void;
  locale: string;
}

export function usePosTabs({
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
}: UsePosTabsProps) {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>(() => {
    const saved = localStorage.getItem("pos_open_tabs");
    return saved ? safeJsonParse<OpenTab[]>(saved, []) : [];
  });
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeTabName, setActiveTabName] = useState<string | null>(null);
  const [showParkModal, setShowParkModal] = useState(false);
  const [parkTableName, setParkTableName] = useState("");

  const [kotFiring, setKotFiring] = useState(false);
  const [kotSuccessNotice, setKotSuccessNotice] = useState<string | null>(null);

  const fetchCloudTabs = useCallback(async () => {
    try {
      const res = await companyAwareApi.get<any>("/cafe/tables");
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped: OpenTab[] = res.data.data.map((t: any) => ({
          id: t.id,
          name: t.tableName,
          items: Array.isArray(t.items) ? t.items : [],
          customer: t.customerName
            ? { id: "guest", name: t.customerName, phone: t.customerPhone || "" }
            : null,
          createdAt: t.createdAt,
          subtotal: t.subtotal,
          total: t.total,
          kotPrintedAt: t.kotPrintedAt,
        }));
        setOpenTabs(mapped);
        localStorage.setItem("pos_open_tabs", JSON.stringify(mapped));
      }
    } catch {
      // offline fallback
    }
  }, []);

  const handleParkCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    const tabName =
      parkTableName.trim() || activeTabName || `طاولة ${openTabs.length + 1}`;

    try {
      await companyAwareApi.post("/cafe/tables", {
        tabId: activeTabId || undefined,
        tableName: tabName,
        items: cart,
        subtotal,
        tax,
        total,
        customerName: customer?.name,
        customerPhone: customer?.phone,
      });
      await fetchCloudTabs();
    } catch {
      const newTab: OpenTab = {
        id: activeTabId || "tab_" + Date.now(),
        name: tabName,
        items: [...cart],
        customer: customer,
        createdAt: new Date().toISOString(),
        subtotal,
        total,
      };
      const updated = activeTabId
        ? openTabs.map((t) => (t.id === activeTabId ? newTab : t))
        : [...openTabs, newTab];
      setOpenTabs(updated);
      localStorage.setItem("pos_open_tabs", JSON.stringify(updated));
    }

    setCart([]);
    setCustomer(null);
    setActiveTabId(null);
    setActiveTabName(null);
    setShowParkModal(false);
    setParkTableName("");
    setDiscountType("NONE");
    setDiscountPercent(0);
  };

  const handleRestoreTab = (tab: OpenTab) => {
    if (
      cart.length > 0 &&
      !window.confirm("هناك طلب حالي في السلة. هل تريد استبداله بهذه الطاولة؟")
    ) {
      return;
    }
    setCart(tab.items);
    setCustomer(tab.customer);
    setActiveTabId(tab.id);
    setActiveTabName(tab.name);
  };

  const handleDeleteTab = async (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("هل تريد إلغاء هذه الطاولة المعلقة وحذفها؟")) return;
    try {
      await companyAwareApi.delete(`/cafe/tables/${tabId}`);
    } catch {
      // offline
    }
    const updated = openTabs.filter((t) => t.id !== tabId);
    setOpenTabs(updated);
    localStorage.setItem("pos_open_tabs", JSON.stringify(updated));
    if (activeTabId === tabId) {
      setActiveTabId(null);
      setActiveTabName(null);
    }
  };

  const handleUnlinkTab = () => {
    setActiveTabId(null);
    setActiveTabName(null);
  };

  const fireKitchenTicket = async () => {
    if (!cart.length) return;
    setKotFiring(true);
    try {
      if (activeTabId) {
        await companyAwareApi.post(`/cafe/tables/${activeTabId}/fire-kot`, {});
      }
      fireKitchenTicketWindow(cart, activeTabName, locale);

      setKotSuccessNotice("تم إرسال تذكرة التحضير للبار بنجاح");
      setTimeout(() => setKotSuccessNotice(null), 3500);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إرسال تذكرة البار");
    } finally {
      setKotFiring(false);
    }
  };

  return {
    openTabs,
    setOpenTabs,
    activeTabId,
    setActiveTabId,
    activeTabName,
    setActiveTabName,
    showParkModal,
    setShowParkModal,
    parkTableName,
    setParkTableName,
    kotFiring,
    kotSuccessNotice,
    fetchCloudTabs,
    handleParkCart,
    handleRestoreTab,
    handleDeleteTab,
    handleUnlinkTab,
    fireKitchenTicket,
  };
}

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiClient } from "../../../services/apiClient";
import { toast } from "sonner";
import {
  ProcurementCatalogItem,
  fetchProcurementCatalog,
} from "../components";
import {
  Supplier,
  OrderItem,
  PurchaseOrderFormData,
  PurchaseOrderTotals,
} from "./types";

export function usePurchaseOrderController() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogItems, setCatalogItems] = useState<ProcurementCatalogItem[]>([]);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);

  // Searchable combobox for supplier
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  // Optional columns toggle (Tax & Discount per line)
  const [showAdvancedItemColumns, setShowAdvancedItemColumns] = useState(false);

  // Quick Supplier Modal
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = useState(false);
  const [quickSupplierName, setQuickSupplierName] = useState("");
  const [quickSupplierPhone, setQuickSupplierPhone] = useState("");
  const [quickSupplierContact, setQuickSupplierContact] = useState("");
  const [submittingQuickSupplier, setSubmittingQuickSupplier] = useState(false);

  // Refs for keyboard navigation
  const itemInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    supplierId: "",
    orderDate: new Date().toISOString().split("T")[0] ?? "",
    expectedDelivery: "",
    paymentTerms: "",
    notes: "",
    shippingCost: 0,
    discountAmount: 0,
  });

  const [items, setItems] = useState<OrderItem[]>([
    {
      productId: null,
      variantId: null,
      productName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      discountRate: 0,
      totalPrice: 0,
    },
  ]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [suppliersRes, catalogList] = await Promise.all([
        apiClient
          .get("/procurement/suppliers", { params: { limit: 200 } })
          .catch(() => ({ data: { suppliers: [] } })),
        fetchProcurementCatalog(""),
      ]);

      const loadedSuppliers: Supplier[] =
        suppliersRes?.data?.suppliers || suppliersRes?.data?.data || [];
      setSuppliers(loadedSuppliers);
      setCatalogItems(catalogList);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error(t("procurement.purchaseOrderForm.fetchError", "فشل في تحميل البيانات الأولية"));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/procurement/purchase-orders/${id}`);
      const order = response.data?.order || response.data;

      setFormData({
        supplierId: order.supplierId || "",
        orderDate: order.orderDate
          ? (new Date(order.orderDate).toISOString().split("T")[0] ?? "")
          : "",
        expectedDelivery: order.expectedDelivery
          ? (new Date(order.expectedDelivery).toISOString().split("T")[0] ?? "")
          : "",
        paymentTerms: order.paymentTerms || "",
        notes: order.notes || "",
        shippingCost: Number(order.shippingCost || 0),
        discountAmount: Number(order.discountAmount || 0),
      });

      if (Array.isArray(order.items) && order.items.length > 0) {
        setItems(
          order.items.map((item: any) => ({
            id: item.id,
            productId: item.productId ?? null,
            variantId: item.variantId ?? null,
            productName: item.productName || "",
            description: item.description || "",
            quantity: Number(item.quantity || 1),
            unitPrice: Number(item.unitPrice || 0),
            taxRate: Number(item.taxRate || 0),
            discountRate: Number(item.discountRate || 0),
            totalPrice: Number(item.totalPrice || 0),
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error(
        t("procurement.purchaseOrderForm.fetchOrderError", "فشل في تحميل بيانات أمر الشراء"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    if (isEdit) {
      fetchOrder();
    }
  }, [id]);

  // Click outside to close supplier combobox
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setSupplierSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSupplier = useMemo(() => {
    return suppliers.find((s) => s.id === formData.supplierId);
  }, [suppliers, formData.supplierId]);

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearchQuery.trim()) return suppliers;
    const q = supplierSearchQuery.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.mobile && s.mobile.includes(q)) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(q)),
    );
  }, [suppliers, supplierSearchQuery]);

  const updateItemDetails = (index: number, updates: Partial<OrderItem>) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const currentItem = newItems[index];
      if (!currentItem) return prevItems;
      const item: OrderItem = { ...currentItem, ...updates };

      const rawQty = "quantity" in updates ? updates.quantity : item.quantity;
      const rawPrice = "unitPrice" in updates ? updates.unitPrice : item.unitPrice;
      const rawTax = "taxRate" in updates ? updates.taxRate : item.taxRate;
      const rawDisc = "discountRate" in updates ? updates.discountRate : item.discountRate;

      const quantity = Math.max(0, parseFloat(String(rawQty ?? 0)) || 0);
      const unitPrice = Math.max(0, parseFloat(String(rawPrice ?? 0)) || 0);
      const taxRate = Math.max(0, Math.min(100, parseFloat(String(rawTax ?? 0)) || 0));
      const discountRate = Math.max(0, Math.min(100, parseFloat(String(rawDisc ?? 0)) || 0));

      const subtotal = quantity * unitPrice;
      const discount = subtotal * (discountRate / 100);
      const tax = (subtotal - discount) * (taxRate / 100);

      item.totalPrice = Math.max(0, subtotal - discount + tax);
      newItems[index] = item;
      return newItems;
    });
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    updateItemDetails(index, { [field]: value });
  };

  // Keyboard rapid-entry: hitting Enter on price adds a new line and focuses its name field
  const handlePriceKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
      setTimeout(() => {
        itemInputRefs.current[index + 1]?.focus();
      }, 50);
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: null,
        variantId: null,
        productName: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        discountRate: 0,
        totalPrice: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      setItems([
        {
          productId: null,
          variantId: null,
          productName: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 0,
          discountRate: 0,
          totalPrice: 0,
        },
      ]);
    } else {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddCatalogItems = (
    selectedList: Array<{
      productId: string | null;
      variantId?: string | null;
      productName: string;
      unitPrice?: number;
      quantity?: number;
      sku?: string;
      description?: string;
    }>,
  ) => {
    setItems((prev) => {
      const isEmptySingleItem =
        prev.length === 1 &&
        !prev[0].productName.trim() &&
        prev[0].unitPrice === 0;

      const newRows: OrderItem[] = selectedList.map((sel) => {
        const qty = sel.quantity && sel.quantity > 0 ? sel.quantity : 1;
        const price = Number(sel.unitPrice || 0);
        return {
          productId: sel.productId || null,
          variantId: sel.variantId || null,
          productName: sel.productName,
          description: sel.description || (sel.sku ? `SKU: ${sel.sku}` : ""),
          quantity: qty,
          unitPrice: price,
          taxRate: 0,
          discountRate: 0,
          totalPrice: qty * price,
        };
      });

      return isEmptySingleItem ? newRows : [...prev, ...newRows];
    });
  };

  const calculateTotals = (): PurchaseOrderTotals => {
    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0,
    );
    const totalTax = items.reduce((sum, item) => {
      const itemSubtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      const itemDiscount = itemSubtotal * ((Number(item.discountRate) || 0) / 100);
      return sum + (itemSubtotal - itemDiscount) * ((Number(item.taxRate) || 0) / 100);
    }, 0);
    const itemDiscounts = items.reduce(
      (sum, item) =>
        sum +
        (Number(item.quantity) || 0) *
          (Number(item.unitPrice) || 0) *
          ((Number(item.discountRate) || 0) / 100),
      0,
    );

    const grandTotal = Math.max(
      0,
      subtotal -
        itemDiscounts +
        totalTax +
        Number(formData.shippingCost || 0) -
        Number(formData.discountAmount || 0),
    );

    return { subtotal, totalTax, itemDiscounts, grandTotal };
  };

  const handleCreateQuickSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSupplierName.trim()) return;

    try {
      setSubmittingQuickSupplier(true);
      const res = await apiClient.post("/procurement/suppliers", {
        name: quickSupplierName.trim(),
        phone: quickSupplierPhone.trim() || undefined,
        contactPerson: quickSupplierContact.trim() || undefined,
      });

      const newSupplier = res.data?.supplier || res.data?.data || res.data;
      if (newSupplier?.id) {
        setSuppliers((prev) => [newSupplier, ...prev]);
        setFormData((prev) => ({ ...prev, supplierId: newSupplier.id }));
        toast.success("تمت إضافة المورد بنجاح");
        setIsQuickSupplierOpen(false);
        setQuickSupplierName("");
        setQuickSupplierPhone("");
        setQuickSupplierContact("");
      }
    } catch (err: any) {
      console.error("Error creating supplier:", err);
      toast.error(err.response?.data?.message || "تعذر إضافة المورد الجديد");
    } finally {
      setSubmittingQuickSupplier(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) {
      toast.error(t("procurement.purchaseOrderForm.supplierRequired", "يرجى اختيار المورد"));
      return;
    }

    const invalidItems = items.filter(
      (item) => !item.productName.trim() || Number(item.quantity) <= 0 || Number(item.unitPrice) < 0,
    );
    if (invalidItems.length > 0) {
      toast.error(
        t(
          "procurement.purchaseOrderForm.itemsValidation",
          "يرجى التأكد من اختيار الصنف وإدخال كمية وسعر صحيحين لكل البنود",
        ),
      );
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        shippingCost: Number(formData.shippingCost || 0),
        discountAmount: Number(formData.discountAmount || 0),
        items: items.map((it) => ({
          productId: it.productId || null,
          variantId: it.variantId || null,
          productName: it.productName.trim(),
          description: it.description || "",
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          taxRate: Number(it.taxRate || 0) || 0,
          discountRate: Number(it.discountRate || 0) || 0,
          totalPrice: Number(it.totalPrice) || 0,
          notes: it.notes || "",
        })),
      };

      if (isEdit) {
        await apiClient.put(`/procurement/purchase-orders/${id}`, payload);
        toast.success(t("procurement.purchaseOrderForm.updateSuccess", "تم تحديث أمر الشراء بنجاح"));
      } else {
        await apiClient.post("/procurement/purchase-orders", payload);
        toast.success(t("procurement.purchaseOrderForm.createSuccess", "تم إنشاء أمر الشراء بنجاح"));
      }
      navigate("/procurement/purchase-orders");
    } catch (error: any) {
      console.error("Error saving order:", error);
      toast.error(
        error.response?.data?.message ||
          t("procurement.purchaseOrderForm.saveError", "حدث خطأ أثناء حفظ أمر الشراء"),
      );
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  return {
    navigate,
    id,
    isEdit,
    t,
    loading,
    saving,
    suppliers,
    catalogItems,
    catalogModalOpen,
    setCatalogModalOpen,
    supplierSearchOpen,
    setSupplierSearchOpen,
    supplierSearchQuery,
    setSupplierSearchQuery,
    supplierDropdownRef,
    showAdvancedItemColumns,
    setShowAdvancedItemColumns,
    isQuickSupplierOpen,
    setIsQuickSupplierOpen,
    quickSupplierName,
    setQuickSupplierName,
    quickSupplierPhone,
    setQuickSupplierPhone,
    quickSupplierContact,
    setQuickSupplierContact,
    submittingQuickSupplier,
    itemInputRefs,
    formData,
    setFormData,
    items,
    selectedSupplier,
    filteredSuppliers,
    totals,
    updateItem,
    updateItemDetails,
    handlePriceKeyDown,
    addItem,
    removeItem,
    handleAddCatalogItems,
    handleCreateQuickSupplier,
    handleSubmit,
  };
}

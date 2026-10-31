import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import {
  ProcurementCatalogItem,
  fetchProcurementCatalog,
} from "../components";
import {
  Supplier,
  PurchaseOrderSummary,
  InvoiceItem,
  TreasuryAccount,
  PurchaseInvoiceFormData,
  InvoiceTotals,
} from "./types";

export const usePurchaseInvoiceController = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const poQueryId = searchParams.get("purchaseOrderId") || searchParams.get("poId");
  const isEdit = Boolean(id);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogItems, setCatalogItems] = useState<ProcurementCatalogItem[]>([]);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [supplierOrders, setSupplierOrders] = useState<PurchaseOrderSummary[]>([]);

  // Supplier Search Combobox State
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  // Advanced columns toggle
  const [showAdvancedItemColumns, setShowAdvancedItemColumns] = useState(false);

  // Immediate Payment State
  const [paymentOption, setPaymentOption] = useState<"UNPAID" | "FULL" | "PARTIAL">("UNPAID");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [customPaidAmount, setCustomPaidAmount] = useState<number>(0);
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccount[]>([]);
  const [treasuryAccountId, setTreasuryAccountId] = useState<string>("");

  // Quick Add Product Modal State
  const [quickProductModalOpen, setQuickProductModalOpen] = useState(false);
  const [quickProductTargetIndex, setQuickProductTargetIndex] = useState<number>(-1);
  const [quickProductInitialName, setQuickProductInitialName] = useState("");

  // Quick Supplier Modal
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = useState(false);
  const [quickSupplierName, setQuickSupplierName] = useState("");
  const [quickSupplierPhone, setQuickSupplierPhone] = useState("");
  const [quickSupplierContact, setQuickSupplierContact] = useState("");
  const [submittingQuickSupplier, setSubmittingQuickSupplier] = useState(false);

  // Refs for keyboard navigation
  const itemInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState<PurchaseInvoiceFormData>({
    supplierId: "",
    purchaseOrderId: "",
    referenceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0] ?? "",
    dueDate: "",
    notes: "",
    shippingCost: 0,
    discountAmount: 0,
  });

  const [items, setItems] = useState<InvoiceItem[]>([
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
      notes: "",
    },
  ]);

  const updateItemDetails = (index: number, updates: Partial<InvoiceItem>) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const currentItem = newItems[index];
      if (!currentItem) return prevItems;
      const item: InvoiceItem = { ...currentItem, ...updates };

      const quantity =
        parseFloat("quantity" in updates ? (updates.quantity as any) : item.quantity) || 0;
      const unitPrice =
        parseFloat("unitPrice" in updates ? (updates.unitPrice as any) : item.unitPrice) || 0;
      const taxRate =
        parseFloat("taxRate" in updates ? (updates.taxRate as any) : item.taxRate) || 0;
      const discountRate =
        parseFloat("discountRate" in updates ? (updates.discountRate as any) : item.discountRate) ||
        0;

      const subtotal = quantity * unitPrice;
      const discount = subtotal * (discountRate / 100);
      const tax = (subtotal - discount) * (taxRate / 100);

      item.totalPrice = subtotal - discount + tax;
      newItems[index] = item;
      return newItems;
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    updateItemDetails(index, { [field]: value });
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
        notes: "",
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
          notes: "",
        },
      ]);
    } else {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
      setTimeout(() => {
        itemInputRefs.current[index + 1]?.focus();
      }, 50);
    }
  };

  const handleOpenQuickAddProduct = (index: number, initialName: string) => {
    setQuickProductTargetIndex(index);
    setQuickProductInitialName(initialName);
    setQuickProductModalOpen(true);
  };

  const handleProductCreatedSuccess = async (createdProduct: any) => {
    try {
      const freshCatalog = await fetchProcurementCatalog("");
      setCatalogItems(freshCatalog);

      const displayName = createdProduct?.name || quickProductInitialName || "منتج جديد";
      const costPrice = Number(createdProduct?.cost || createdProduct?.price || 0);

      if (quickProductTargetIndex >= 0 && quickProductTargetIndex < items.length) {
        updateItemDetails(quickProductTargetIndex, {
          productId: createdProduct.id,
          variantId: null,
          productName: displayName,
          unitPrice: costPrice,
          description:
            createdProduct.category?.name || (createdProduct.sku ? `SKU: ${createdProduct.sku}` : ""),
        });
      } else {
        setItems((prev) => {
          const isEmptySingleItem =
            prev.length === 1 && !prev[0].productName.trim() && prev[0].unitPrice === 0;

          const newRow: InvoiceItem = {
            productId: createdProduct.id,
            variantId: null,
            productName: displayName,
            description:
              createdProduct.category?.name || (createdProduct.sku ? `SKU: ${createdProduct.sku}` : ""),
            quantity: 1,
            unitPrice: costPrice,
            taxRate: 0,
            discountRate: 0,
            totalPrice: costPrice,
            notes: "",
          };

          return isEmptySingleItem ? [newRow] : [...prev, newRow];
        });
      }

      toast.success(`تم إنشاء المنتج "${displayName}" واختياره في الفاتورة بنجاح`);
    } catch (err) {
      console.error("Error refreshing catalog after product creation:", err);
    } finally {
      setQuickProductModalOpen(false);
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
        prev.length === 1 && !prev[0].productName.trim() && prev[0].unitPrice === 0;

      const newRows: InvoiceItem[] = selectedList.map((sel) => {
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
          notes: sel.variantId ? `[variantId:${sel.variantId}]` : "",
        };
      });

      return isEmptySingleItem ? newRows : [...prev, ...newRows];
    });
  };

  const calculateTotals = (): InvoiceTotals => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalTax = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discountRate / 100);
      return sum + (itemSubtotal - itemDiscount) * (item.taxRate / 100);
    }, 0);
    const itemDiscounts = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.discountRate / 100),
      0,
    );

    const grandTotal = Math.max(
      0,
      subtotal -
        itemDiscounts +
        totalTax +
        Number(formData.shippingCost) -
        Number(formData.discountAmount),
    );

    const effectivePaid =
      paymentOption === "FULL"
        ? grandTotal
        : paymentOption === "PARTIAL"
        ? Math.min(customPaidAmount, grandTotal)
        : 0;

    const remainingAmount = Math.max(0, grandTotal - effectivePaid);

    return { subtotal, totalTax, itemDiscounts, grandTotal, effectivePaid, remainingAmount };
  };

  const fetchTreasuries = async () => {
    try {
      const res = await apiClient.get("/treasury/accounts");
      const data = res?.data as any;
      const list: TreasuryAccount[] = Array.isArray(data?.accounts)
        ? data.accounts
        : Array.isArray(data)
        ? data
        : [];
      setTreasuryAccounts(list);
      if (list.length > 0) {
        const firstId = list[0]?.id;
        if (firstId) {
          setTreasuryAccountId((prev) => prev || firstId);
        }
      }
    } catch (err) {
      console.warn("Could not load treasury accounts:", err);
    }
  };

  useEffect(() => {
    if (paymentOption !== "UNPAID") {
      fetchTreasuries();
    }
  }, [paymentOption]);

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
      toast.error(
        t("procurement.purchaseInvoiceForm.fetchError", "فشل في تحميل البيانات الأولية"),
      );
    } finally {
      setLoading(false);
    }
  };

  const loadInitialPurchaseOrder = async (poId: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/procurement/purchase-orders/${poId}`);
      const po = res.data?.order || res.data;
      if (po) {
        setFormData((prev) => ({
          ...prev,
          supplierId: po.supplierId || prev.supplierId,
          purchaseOrderId: po.id,
          shippingCost: Number(po.shippingCost || 0),
          discountAmount: Number(po.discountAmount || 0),
          notes: po.notes ? `أمر شراء: ${po.orderNumber} - ${po.notes}` : `أمر شراء: ${po.orderNumber}`,
        }));

        if (po.supplierId) {
          fetchSupplierPurchaseOrders(po.supplierId);
        }

        const poItems = po.purchaseOrderItems || po.items;
        if (Array.isArray(poItems) && poItems.length > 0) {
          setItems(
            poItems.map((item: any) => {
              const quantity = Number(item.quantity || 1);
              const unitPrice = Number(item.unitPrice || 0);
              const taxRate = Number(item.taxRate || 0);
              const discountRate = Number(item.discountRate || 0);
              const subtotal = quantity * unitPrice;
              const discount = subtotal * (discountRate / 100);
              const tax = (subtotal - discount) * (taxRate / 100);
              const totalPrice = subtotal - discount + tax;
              const variantMatch = item.notes?.match(/\[variantId:([^\]]+)\]/);
              const variantId = variantMatch ? variantMatch[1] : item.variantId || null;

              return {
                productId: item.productId || null,
                variantId,
                productName: item.productName || "",
                description: item.description || "",
                quantity,
                unitPrice,
                taxRate,
                discountRate,
                totalPrice,
                notes: item.notes || "",
              };
            }),
          );
          toast.success(`تم استيراد ${poItems.length} أصناف من أمر الشراء ${po.orderNumber}`);
        }
      }
    } catch (err) {
      console.error("Error loading purchase order into invoice form:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierPurchaseOrders = async (supplierId: string) => {
    try {
      const res = await apiClient.get("/procurement/purchase-orders", {
        params: { supplierId, limit: 50 },
      });
      const orders = res?.data?.orders || [];
      setSupplierOrders(orders);
    } catch (err) {
      console.warn("Could not load supplier purchase orders:", err);
    }
  };

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/procurement/purchase-invoices/${id}`);
      const invoice = response.data?.invoice || response.data;

      setFormData({
        supplierId: invoice.supplierId || "",
        purchaseOrderId: invoice.purchaseOrderId || "",
        referenceNumber: invoice.notes?.match(/مرجع: (.*)/)?.[1] || "",
        invoiceDate: invoice.invoiceDate
          ? (new Date(invoice.invoiceDate).toISOString().split("T")[0] ?? "")
          : "",
        dueDate: invoice.dueDate
          ? (new Date(invoice.dueDate).toISOString().split("T")[0] ?? "")
          : "",
        notes: invoice.notes || "",
        shippingCost: Number(invoice.shippingCost || 0),
        discountAmount: Number(invoice.discountAmount || 0),
      });

      if (invoice.paidAmount > 0) {
        if (invoice.remainingAmount <= 0) {
          setPaymentOption("FULL");
        } else {
          setPaymentOption("PARTIAL");
          setCustomPaidAmount(Number(invoice.paidAmount));
        }
      }

      if (Array.isArray(invoice.items) && invoice.items.length > 0) {
        setItems(
          invoice.items.map((item: any) => {
            const variantMatch = item.notes?.match(/\[variantId:([^\]]+)\]/);
            const variantId = variantMatch ? variantMatch[1] : item.variantId || null;
            return {
              id: item.id,
              productId: item.productId ?? null,
              variantId,
              productName: item.productName || "",
              description: item.description || "",
              quantity: Number(item.quantity || 1),
              unitPrice: Number(item.unitPrice || 0),
              taxRate: Number(item.taxRate || 0),
              discountRate: Number(item.discountRate || 0),
              totalPrice: Number(item.totalPrice || 0),
              notes: item.notes || "",
            };
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error(
        t("procurement.purchaseInvoiceForm.fetchInvoiceError", "فشل في تحميل بيانات الفاتورة"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    if (isEdit) {
      fetchInvoice();
    } else if (poQueryId) {
      loadInitialPurchaseOrder(poQueryId);
    }
  }, [id, poQueryId]);

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

  useEffect(() => {
    if (!formData.supplierId) {
      setSupplierOrders([]);
      return;
    }
    fetchSupplierPurchaseOrders(formData.supplierId);
  }, [formData.supplierId]);

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

  const handleSelectPurchaseOrder = async (poId: string) => {
    setFormData((prev) => ({ ...prev, purchaseOrderId: poId }));
    if (!poId) return;

    try {
      const res = await apiClient.get(`/procurement/purchase-orders/${poId}`);
      const po = res.data?.order || res.data;
      if (po?.items && po.items.length > 0) {
        setItems(
          po.items.map((item: any) => {
            const quantity = Number(item.quantity || 1);
            const unitPrice = Number(item.unitPrice || 0);
            const taxRate = Number(item.taxRate || 0);
            const discountRate = Number(item.discountRate || 0);
            const subtotal = quantity * unitPrice;
            const discount = subtotal * (discountRate / 100);
            const tax = (subtotal - discount) * (taxRate / 100);
            const totalPrice = subtotal - discount + tax;
            const variantMatch = item.notes?.match(/\[variantId:([^\]]+)\]/);
            const variantId = variantMatch ? variantMatch[1] : item.variantId || null;

            return {
              productId: item.productId || null,
              variantId,
              productName: item.productName || "",
              description: item.description || "",
              quantity,
              unitPrice,
              taxRate,
              discountRate,
              totalPrice,
              notes: item.notes || "",
            };
          }),
        );
        toast.success(`تم استيراد ${po.items.length} أصناف من أمر الشراء ${po.orderNumber}`);
      }
    } catch (err) {
      console.error("Error importing items from PO:", err);
      toast.error("تعذر استيراد بنود أمر الشراء");
    }
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
      toast.error(
        t("procurement.purchaseInvoiceForm.supplierRequired", "يرجى اختيار المورد"),
      );
      return;
    }

    const invalidItems = items.filter(
      (item) => !item.productName.trim() || item.quantity <= 0 || item.unitPrice < 0,
    );
    if (invalidItems.length > 0) {
      toast.error(
        t(
          "procurement.purchaseInvoiceForm.itemsValidation",
          "يرجى التأكد من كتابة اسم الصنف وإدخال كمية وسعر صحيحين لكل البنود",
        ),
      );
      return;
    }

    const unlinkedItems = items.filter((item) => !item.productId);
    if (unlinkedItems.length > 0) {
      const firstUnlinked = unlinkedItems[0];
      toast.error(
        `الصنف "${firstUnlinked.productName || "المحدد"}" غير مسجل في قائمة المنتجات بالمخزن. يرجى اختياره من القائمة أو إضافته كمنتج جديد أولاً ليتمكن النظام من تحديث المخزون.`,
        { duration: 6000 },
      );
      return;
    }

    const totals = calculateTotals();

    try {
      setSaving(true);
      const combinedNotes = [
        formData.referenceNumber ? `مرجع: ${formData.referenceNumber}` : "",
        formData.notes,
      ]
        .filter(Boolean)
        .join(" | ");

      const payload = {
        supplierId: formData.supplierId,
        purchaseOrderId: formData.purchaseOrderId || undefined,
        invoiceDate: formData.invoiceDate || new Date().toISOString().split("T")[0],
        dueDate: formData.dueDate || undefined,
        shippingCost: Number(formData.shippingCost || 0),
        discountAmount: Number(formData.discountAmount || 0),
        paidAmount: totals.effectivePaid,
        paymentMethod: totals.effectivePaid > 0 ? paymentMethod : undefined,
        treasuryAccountId: totals.effectivePaid > 0 ? treasuryAccountId || undefined : undefined,
        notes: combinedNotes,
        items: items.map((it) => {
          let itemNotes = it.notes || "";
          if (it.variantId && !itemNotes.includes(`[variantId:${it.variantId}]`)) {
            itemNotes = itemNotes
              ? `${itemNotes} [variantId:${it.variantId}]`
              : `[variantId:${it.variantId}]`;
          }
          return {
            productId: it.productId || null,
            productName: it.productName.trim(),
            description: it.description || "",
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
            taxRate: Number(it.taxRate || 0),
            discountRate: Number(it.discountRate || 0),
            totalPrice: Number(it.totalPrice),
            notes: itemNotes,
          };
        }),
      };

      if (isEdit) {
        await apiClient.put(`/procurement/purchase-invoices/${id}`, payload);
        toast.success(
          t("procurement.purchaseInvoiceForm.updateSuccess", "تم تحديث الفاتورة بنجاح"),
        );
      } else {
        await apiClient.post("/procurement/purchase-invoices", payload);
        toast.success(
          totals.effectivePaid >= totals.grandTotal
            ? "تم إنشاء الفاتورة وسدادها بالكامل بنجاح"
            : "تم إنشاء فاتورة المشتريات بنجاح",
        );
      }
      navigate("/procurement/purchase-invoices");
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      toast.error(
        error.response?.data?.message ||
          t("procurement.purchaseInvoiceForm.saveError", "حدث خطأ أثناء حفظ الفاتورة"),
      );
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  return {
    navigate,
    isEdit,
    t,
    loading,
    saving,
    suppliers,
    catalogItems,
    catalogModalOpen,
    setCatalogModalOpen,
    supplierOrders,
    supplierSearchOpen,
    setSupplierSearchOpen,
    supplierSearchQuery,
    setSupplierSearchQuery,
    supplierDropdownRef,
    showAdvancedItemColumns,
    setShowAdvancedItemColumns,
    paymentOption,
    setPaymentOption,
    paymentMethod,
    setPaymentMethod,
    customPaidAmount,
    setCustomPaidAmount,
    treasuryAccounts,
    treasuryAccountId,
    setTreasuryAccountId,
    quickProductModalOpen,
    setQuickProductModalOpen,
    quickProductInitialName,
    handleOpenQuickAddProduct,
    handleProductCreatedSuccess,
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
    setItems,
    selectedSupplier,
    filteredSuppliers,
    totals,
    updateItem,
    updateItemDetails,
    addItem,
    removeItem,
    handlePriceKeyDown,
    handleAddCatalogItems,
    handleSelectPurchaseOrder,
    handleCreateQuickSupplier,
    handleSubmit,
  };
};

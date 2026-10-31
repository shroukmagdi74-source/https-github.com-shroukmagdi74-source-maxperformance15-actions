import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { apiClient } from "../../../services/apiClient";
import { formatCurrency } from "../../../utils/currency";
import { toast } from "sonner";
import {
  Supplier,
  PurchaseInvoiceSummary,
  ExistingPayment,
  SupplierPaymentFormData,
} from "./types";

export function useSupplierPaymentController() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryInvoiceId = searchParams.get("invoiceId");

  const isPathEdit = location.pathname.endsWith("/edit");
  const [isEditing, setIsEditing] = useState(isPathEdit);
  const isView = Boolean(id && id !== "new" && !isEditing);

  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierInvoices, setSupplierInvoices] = useState<PurchaseInvoiceSummary[]>([]);
  const [existingPayment, setExistingPayment] = useState<ExistingPayment | null>(null);

  // Supplier Combobox state
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  // Quick Supplier Modal
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = useState(false);
  const [quickSupplierName, setQuickSupplierName] = useState("");
  const [quickSupplierPhone, setQuickSupplierPhone] = useState("");
  const [submittingQuickSupplier, setSubmittingQuickSupplier] = useState(false);

  // Form State
  const [formData, setFormData] = useState<SupplierPaymentFormData>({
    supplierId: "",
    purchaseInvoiceId: queryInvoiceId || "",
    paymentDate: new Date().toISOString().split("T")[0] ?? "",
    amount: "",
    paymentMethod: "CASH",
    referenceNumber: "",
    bankName: "",
    checkNumber: "",
    checkDate: "",
    notes: "",
  });

  // Click outside listener for supplier combobox
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

  const fetchExistingPayment = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/procurement/supplier-payments/${id}`);
      const payment = res.data?.payment || res.data;
      setExistingPayment(payment);
      if (payment) {
        setFormData({
          supplierId: payment.supplier?.id || payment.supplierId || "",
          purchaseInvoiceId: payment.purchaseInvoice?.id || payment.purchaseInvoiceId || "",
          paymentDate: payment.paymentDate
            ? new Date(payment.paymentDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          amount: String(payment.amount ?? ""),
          paymentMethod: payment.paymentMethod || "CASH",
          referenceNumber: payment.referenceNumber || "",
          bankName: payment.bankName || "",
          checkNumber: payment.checkNumber || "",
          checkDate: payment.checkDate
            ? new Date(payment.checkDate).toISOString().split("T")[0]
            : "",
          notes: payment.notes || "",
        });
      }
    } catch (error: any) {
      console.error("Error loading payment:", error);
      toast.error(error.response?.data?.message || "تعذر تحميل بيانات الدفعة");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierInvoices = async (supplierId: string) => {
    try {
      const res = await apiClient.get("/procurement/purchase-invoices", {
        params: { supplierId, limit: 50 },
      });
      const allInvoices: any[] = res.data?.invoices || [];
      // Filter unpaid or partially paid
      const openInvoices: PurchaseInvoiceSummary[] = allInvoices
        .filter((inv) => Number(inv.remainingAmount || 0) > 0)
        .map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          totalAmount: Number(inv.totalAmount || 0),
          paidAmount: Number(inv.paidAmount || 0),
          remainingAmount: Number(inv.remainingAmount || 0),
          status: inv.status,
        }));

      setSupplierInvoices(openInvoices);
    } catch (err) {
      console.warn("Could not load supplier open invoices:", err);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const suppliersRes = await apiClient
        .get("/procurement/suppliers", { params: { limit: 200 } })
        .catch(() => ({ data: { suppliers: [] } }));

      const loadedSuppliers: Supplier[] =
        suppliersRes?.data?.suppliers || suppliersRes?.data?.data || [];
      setSuppliers(loadedSuppliers);

      // If linked to an invoice from query params, fetch that invoice
      if (queryInvoiceId) {
        try {
          const invRes = await apiClient.get(`/procurement/purchase-invoices/${queryInvoiceId}`);
          const inv = invRes.data?.invoice || invRes.data;
          if (inv) {
            setFormData((prev) => ({
              ...prev,
              supplierId: inv.supplierId || "",
              purchaseInvoiceId: inv.id,
              amount: String(inv.remainingAmount || ""),
              referenceNumber: inv.invoiceNumber ? `سداد فاتورة ${inv.invoiceNumber}` : "",
            }));
          }
        } catch (err) {
          console.warn("Could not pre-populate invoice:", err);
        }
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("فشل في تحميل بيانات الموردين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== "new") {
      fetchExistingPayment();
      fetchInitialData();
    } else {
      fetchInitialData();
    }
  }, [id, queryInvoiceId]);

  useEffect(() => {
    if (isPathEdit) {
      setIsEditing(true);
    }
  }, [isPathEdit]);

  // When supplier changes, fetch their open invoices
  useEffect(() => {
    if (formData.supplierId && !isView) {
      fetchSupplierInvoices(formData.supplierId);
    } else {
      setSupplierInvoices([]);
    }
  }, [formData.supplierId]);

  const selectedSupplier = useMemo(() => {
    return suppliers.find((s) => s.id === formData.supplierId);
  }, [suppliers, formData.supplierId]);

  const selectedInvoice = useMemo(() => {
    return supplierInvoices.find((inv) => inv.id === formData.purchaseInvoiceId);
  }, [supplierInvoices, formData.purchaseInvoiceId]);

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

  const currentPaymentAmount = parseFloat(formData.amount) || 0;
  const supplierBalance = Number(selectedSupplier?.currentBalance || 0);
  const balanceAfterPayment = supplierBalance - currentPaymentAmount;

  const handleCreateQuickSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSupplierName.trim()) return;

    try {
      setSubmittingQuickSupplier(true);
      const res = await apiClient.post("/procurement/suppliers", {
        name: quickSupplierName.trim(),
        phone: quickSupplierPhone.trim() || undefined,
      });

      const newSupplier = res.data?.supplier || res.data?.data || res.data;
      if (newSupplier?.id) {
        setSuppliers((prev) => [newSupplier, ...prev]);
        setFormData((prev) => ({ ...prev, supplierId: newSupplier.id }));
        toast.success("تمت إضافة المورد بنجاح");
        setIsQuickSupplierOpen(false);
        setQuickSupplierName("");
        setQuickSupplierPhone("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "تعذر إضافة المورد الجديد");
    } finally {
      setSubmittingQuickSupplier(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) {
      toast.error("يرجى اختيار المورد");
      return;
    }

    if (currentPaymentAmount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح أكبر من الصفر");
      return;
    }

    if (selectedInvoice && currentPaymentAmount > selectedInvoice.remainingAmount) {
      toast.error(
        `المبلغ المدخل (${formatCurrency(currentPaymentAmount)}) أكبر من المتبقي على الفاتورة (${formatCurrency(selectedInvoice.remainingAmount)})`,
      );
      return;
    }

    try {
      setSaving(true);
      const payload = {
        supplierId: formData.supplierId,
        purchaseInvoiceId: formData.purchaseInvoiceId || undefined,
        paymentDate: formData.paymentDate,
        amount: currentPaymentAmount,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber || undefined,
        bankName: formData.bankName || undefined,
        checkNumber: formData.checkNumber || undefined,
        checkDate: formData.checkDate || undefined,
        notes: formData.notes || undefined,
      };

      if (isEditing && id) {
        await apiClient.put(`/procurement/supplier-payments/${id}`, payload);
        toast.success("تم تحديث سند الصرف بنجاح وتحديث الحسابات");
        setIsEditing(false);
        await fetchExistingPayment();
      } else {
        const res = await apiClient.post("/procurement/supplier-payments", payload);
        const created = res.data?.payment || res.data;
        toast.success("تم تسجيل سند الصرف بنجاح وتحديث حساب المورد");
        if (created?.id) {
          navigate(`/procurement/supplier-payments/${created.id}`);
        } else {
          navigate("/procurement/supplier-payments");
        }
      }
    } catch (error: any) {
      console.error("Error saving payment:", error);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء حفظ الدفعة");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!existingPayment?.id) return;
    try {
      setDeleting(true);
      await apiClient.delete(`/procurement/supplier-payments/${existingPayment.id}`);
      toast.success("تم حذف سند الصرف بنجاح وتحديث حساب المورد");
      navigate("/procurement/supplier-payments");
    } catch (err: any) {
      console.error("Error deleting payment:", err);
      toast.error(err.response?.data?.message || "تعذر حذف سند الصرف");
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  return {
    navigate,
    id,
    isEditing,
    setIsEditing,
    isView,
    loading,
    saving,
    deleting,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    suppliers,
    supplierInvoices,
    existingPayment,
    supplierSearchOpen,
    setSupplierSearchOpen,
    supplierSearchQuery,
    setSupplierSearchQuery,
    supplierDropdownRef,
    isQuickSupplierOpen,
    setIsQuickSupplierOpen,
    quickSupplierName,
    setQuickSupplierName,
    quickSupplierPhone,
    setQuickSupplierPhone,
    submittingQuickSupplier,
    formData,
    setFormData,
    selectedSupplier,
    selectedInvoice,
    filteredSuppliers,
    currentPaymentAmount,
    supplierBalance,
    balanceAfterPayment,
    handleCreateQuickSupplier,
    handleSubmit,
    handleDeletePayment,
  };
}

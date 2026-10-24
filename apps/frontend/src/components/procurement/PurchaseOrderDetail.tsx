import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  PackageCheck,
  XCircle,
  Pencil,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { apiClient } from "../../services/apiClient";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import CompanyContext from "../../contexts/CompanyContext";
import { ReceiveItemsDialog } from "./ReceiveItemsDialog";
import { formatCurrency } from "../../utils/currency";
import { formatShortDate } from "../../utils/dateFormat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ProcurementPrintRenderer,
  TemplateSelectorDropdown,
  ProcurementTemplateId,
  DEFAULT_PROCUREMENT_TEMPLATE,
  PROCUREMENT_TEMPLATE_STORAGE_KEY,
  NormalizedProcurementData,
} from "./templates";

interface PurchaseOrderItem {
  id: string;
  productId?: string | null;
  productName: string;
  description?: string | null;
  quantity: number | string;
  receivedQuantity: number | string;
  unitPrice: number | string;
  taxRate?: number | string;
  discountRate?: number | string;
  totalPrice: number | string;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
    stock?: number;
  } | null;
}

interface LinkedInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  status: string;
  totalAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
}

interface PurchaseOrderFull {
  id: string;
  orderNumber: string;
  orderDate: string;
  expectedDelivery?: string | null;
  status: string;
  subtotal: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  shippingCost: number | string;
  totalAmount: number | string;
  notes?: string | null;
  paymentTerms?: string | null;
  supplier: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  items?: PurchaseOrderItem[];
  purchaseOrderItems?: PurchaseOrderItem[];
  purchaseInvoices?: LinkedInvoice[];
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  PENDING: "secondary",
  ORDERED: "default",
  PARTIALLY_RECEIVED: "secondary",
  RECEIVED: "default",
  CANCELLED: "destructive",
};

export const PurchaseOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [order, setOrder] = useState<PurchaseOrderFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<ProcurementTemplateId>(() => {
    try {
      const saved = localStorage.getItem(PROCUREMENT_TEMPLATE_STORAGE_KEY) as ProcurementTemplateId;
      if (saved) {
        return saved;
      }
    } catch {}
    return DEFAULT_PROCUREMENT_TEMPLATE;
  });

  const [procurementSettings, setProcurementSettings] = useState<{
    companyLegalName?: string;
    taxNumber?: string;
    crNumber?: string;
    billingAddress?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    slogan?: string;
    signaturePurchasingTitle?: string;
    signatureFinanceTitle?: string;
    signatureWarehouseTitle?: string;
    showCompanyStamp?: boolean;
    showSignatureBlock?: boolean;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<{ success: boolean; data: any }>("/procurement/settings")
      .then((res) => {
        if (isMounted && res.data?.data) {
          setProcurementSettings(res.data.data);
          if (res.data.data.defaultTemplate) {
            setSelectedTemplate((prev) => {
              try {
                const local = localStorage.getItem(PROCUREMENT_TEMPLATE_STORAGE_KEY);
                return (local as ProcurementTemplateId) || res.data.data.defaultTemplate;
              } catch {
                return res.data.data.defaultTemplate;
              }
            });
          }
        }
      })
      .catch((e) => console.warn("Could not fetch procurement settings:", e));
    return () => {
      isMounted = false;
    };
  }, []);

  const statusLabels: Record<string, string> = {
    DRAFT: t("procurement.purchaseOrders.statusDraft", "مسودة"),
    PENDING: t("procurement.purchaseOrders.statusPending", "قيد الانتظار"),
    ORDERED: t("procurement.purchaseOrders.statusOrdered", "تم الطلب"),
    PARTIALLY_RECEIVED: t("procurement.purchaseOrders.statusPartiallyReceived", "مستلم جزئياً"),
    RECEIVED: t("procurement.purchaseOrders.statusReceived", "مستلم بالكامل"),
    CANCELLED: t("procurement.purchaseOrders.statusCancelled", "ملغي"),
  };

  const invoiceStatusLabels: Record<string, string> = {
    PENDING: t("procurement.purchaseInvoices.statusPending", "غير مدفوعة"),
    PAID: t("procurement.purchaseInvoices.statusPaid", "مدفوعة"),
    CANCELLED: t("procurement.purchaseInvoices.statusCancelled", "ملغاة"),
  };

  const invoiceStatusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "secondary",
    PAID: "default",
    CANCELLED: "outline",
  };

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PurchaseOrderFull>(`/procurement/purchase-orders/${id}`);
      setOrder(response.data);
    } catch (err: unknown) {
      console.error("Error fetching purchase order:", err);
      const errResp = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        errResp.response?.data?.message ||
          t("procurement.purchaseOrderDetail.loadError", "فشل تحميل تفاصيل أمر الشراء"),
      );
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await apiClient.post(`/procurement/purchase-orders/${id}/approve`);
      await fetchOrder();
    } catch (err: unknown) {
      console.error("Error approving order:", err);
      const errResp = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errResp.response?.data?.message || t("procurement.purchaseOrderDetail.approveError", "فشل اعتماد الأمر"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveSuccess = () => {
    fetchOrder();
  };

  const handleCancel = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await apiClient.post(`/procurement/purchase-orders/${id}/cancel`);
      setCancelDialogOpen(false);
      await fetchOrder();
    } catch (err: unknown) {
      console.error("Error cancelling order:", err);
      const errResp = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errResp.response?.data?.message || t("procurement.purchaseOrderDetail.cancelError", "فشل إلغاء الأمر"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">{t("common.loading", "جاري التحميل...")}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error || t("procurement.purchaseOrderDetail.loadError", "الأمر غير موجود")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={fetchOrder}>
            إعادة المحاولة
          </Button>
          <Button variant="outline" onClick={() => navigate("/procurement/purchase-orders")}>
            <BackIcon className="size-4 me-2" />
            {t("procurement.purchaseOrderDetail.backToList", "العودة لقائمة الأوامر")}
          </Button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : Array.isArray(order.purchaseOrderItems)
    ? order.purchaseOrderItems
    : [];
  const invoices = Array.isArray(order.purchaseInvoices) && order.purchaseInvoices.length > 0
    ? order.purchaseInvoices
    : Array.isArray((order as any).invoices)
    ? (order as any).invoices
    : [];
  const canApprove = order.status === "DRAFT" || order.status === "PENDING";
  const canReceive = order.status === "ORDERED" || order.status === "PARTIALLY_RECEIVED";
  const canCancel = order.status !== "RECEIVED" && order.status !== "CANCELLED";
  const canCreateInvoice = order.status !== "CANCELLED";

  const companyContext = React.useContext(CompanyContext);
  const buyerName = procurementSettings?.companyLegalName || companyContext?.company?.name || "منصة MaxP للتجارة المتكاملة";
  const buyerAddress = procurementSettings?.billingAddress || (companyContext?.company as any)?.address || "";
  const buyerPhone = procurementSettings?.phone || (companyContext?.company as any)?.phone || "";
  const buyerEmail = procurementSettings?.email || companyContext?.company?.email || "";

  const normalizedData: NormalizedProcurementData = {
    documentType: "PO",
    documentNumber: order.orderNumber,
    documentDate: order.orderDate,
    expectedDelivery: order.expectedDelivery,
    status: order.status,
    statusLabel: statusLabels[order.status] ?? order.status,
    companyName: buyerName,
    buyer: {
      name: buyerName,
      taxNumber: procurementSettings?.taxNumber || "",
      crNumber: procurementSettings?.crNumber || "",
      address: buyerAddress,
      phone: buyerPhone,
      email: buyerEmail,
      logoUrl: procurementSettings?.logoUrl || null,
      slogan: procurementSettings?.slogan || null,
    },
    signatures: {
      purchasingTitle: procurementSettings?.signaturePurchasingTitle,
      financeTitle: procurementSettings?.signatureFinanceTitle,
      warehouseTitle: procurementSettings?.signatureWarehouseTitle,
      showStamp: procurementSettings?.showCompanyStamp ?? true,
      showBlock: procurementSettings?.showSignatureBlock ?? true,
    },
    supplier: {
      id: order.supplier.id,
      name: order.supplier.name,
      phone: order.supplier.phone,
      email: order.supplier.email,
      address: order.supplier.address,
    },
    items: items.map((it) => ({
      id: it.id,
      productName: it.productName || it.product?.name || "صنف بدون اسم",
      description: it.description,
      sku: it.product?.sku,
      quantity: it.quantity,
      receivedQuantity: it.receivedQuantity,
      unitPrice: it.unitPrice,
      taxRate: it.taxRate,
      discountRate: it.discountRate,
      totalPrice: it.totalPrice,
      packagingUnit: (it as { packagingUnit?: string; unit?: string }).packagingUnit || (it as { unit?: string }).unit || null,
    })),
    financialSummary: {
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
    },
    notes: order.notes,
    paymentTerms: order.paymentTerms,
  };

  return (
    <div className="purchase-order-detail-container">
      {/* 1. SCREEN ONLY VIEW: Interactive Dashboard with Actions, Cards, and Tabs */}
      <div className="print:hidden p-3 sm:p-6 max-w-6xl mx-auto space-y-5">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/70 print:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/procurement/purchase-orders")}
              className="gap-1.5"
            >
              <BackIcon className="size-4" />
              {t("procurement.purchaseOrderDetail.backToList", "العودة للأوامر")}
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {order.orderNumber}
            </h1>
            <Badge variant={statusColors[order.status] || "outline"} className="ms-1 font-semibold">
              {statusLabels[order.status] ?? order.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canApprove && (
              <Button
                size="sm"
                variant="default"
                onClick={handleApprove}
                disabled={actionLoading}
                className="gap-1.5"
              >
                <CheckCircle className="size-4" />
                {t("procurement.purchaseOrderDetail.approveBtn", "اعتماد وإرسال")}
              </Button>
            )}

            {canReceive && (
              <Button
                size="sm"
                variant="default"
                onClick={() => setReceiveDialogOpen(true)}
                disabled={actionLoading}
                className="gap-1.5"
              >
                <PackageCheck className="size-4" />
                {t("procurement.purchaseOrderDetail.receiveBtn", "استلام بضاعة")}
              </Button>
            )}

            {order.status === "DRAFT" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/procurement/purchase-orders/${order.id}/edit`)}
                className="gap-1.5"
              >
                <Pencil className="size-4" />
                {t("procurement.purchaseOrderDetail.editBtn", "تعديل")}
              </Button>
            )}

            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={actionLoading}
                className="gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                <XCircle className="size-4" />
                {t("procurement.purchaseOrderDetail.cancelBtn", "إلغاء الأمر")}
              </Button>
            )}

            {canCreateInvoice && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/procurement/purchase-invoices/new?purchaseOrderId=${order.id}`)}
                className="gap-1.5"
              >
                <FileText className="size-4" />
                {t("procurement.purchaseOrderDetail.createInvoiceBtn", "إنشاء فاتورة شراء")}
              </Button>
            )}

            {/* Multi-Template Selector & Print Trigger */}
            <TemplateSelectorDropdown
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
              data={normalizedData}
              isRtl={isRtl}
            />
          </div>
        </div>

        {/* Meta Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Supplier Info */}
          <Card size="sm" className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                {t("procurement.purchaseOrderDetail.supplierInfo", "بيانات المورد")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="font-bold text-base text-foreground">
                {order.supplier.name}
              </div>
              {order.supplier.phone && (
                <div className="text-xs text-muted-foreground font-mono">
                  {order.supplier.phone}
                </div>
              )}
              {order.supplier.email && (
                <div className="text-xs text-muted-foreground">
                  {order.supplier.email}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates Info */}
          <Card size="sm" className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                {t("procurement.purchaseOrderDetail.datesInfo", "التواريخ المهمة")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("procurement.purchaseOrderDetail.orderDate", "تاريخ الطلب")}:
                </span>
                <span className="font-semibold tabular-nums">
                  {formatShortDate(order.orderDate, i18n.language)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("procurement.purchaseOrderDetail.expectedDelivery", "التسليم المتوقع")}:
                </span>
                <span className="font-semibold tabular-nums">
                  {formatShortDate(order.expectedDelivery, i18n.language)}
                </span>
              </div>
              {order.paymentTerms && (
                <div className="flex justify-between pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">
                    {t("procurement.purchaseOrderForm.paymentTermsLabel", "شروط الدفع")}:
                  </span>
                  <span className="font-medium text-foreground">{order.paymentTerms}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Balances */}
          <Card size="sm" className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="size-3.5 text-primary" />
                {t("procurement.purchaseOrderDetail.summaryTitle", "الملخص المالي")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">المجموع:</span>
                <span className="text-lg font-bold font-mono text-foreground tabular-nums">
                  {formatCurrency(order.totalAmount, { locale: i18n.language })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>قبل الضريبة:</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(order.subtotal, { locale: i18n.language })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                <span>الضرائب والشحن:</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(Number(order.taxAmount || 0) + Number(order.shippingCost || 0), { locale: i18n.language })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card size="sm" className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              {t("procurement.purchaseOrderDetail.itemsTitle", "بنود أمر الشراء")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">
                      {t("procurement.purchaseOrderDetail.columnProduct", "الصنف")}
                    </TableHead>
                    <TableHead className="text-center w-24">
                      {t("procurement.purchaseOrderDetail.columnQuantity", "المطلوب")}
                    </TableHead>
                    <TableHead className="text-center w-24">
                      {t("procurement.purchaseOrderDetail.columnReceivedQuantity", "المستلم")}
                    </TableHead>
                    <TableHead className="text-center w-28">
                      {t("procurement.purchaseOrderDetail.columnUnitPrice", "سعر الوحدة")}
                    </TableHead>
                    <TableHead className="text-center w-20">
                      {t("procurement.purchaseOrderDetail.columnTax", "الضريبة")}
                    </TableHead>
                    <TableHead className="text-center w-20">
                      {t("procurement.purchaseOrderDetail.columnDiscount", "الخصم")}
                    </TableHead>
                    <TableHead className="text-end w-28">
                      {t("procurement.purchaseOrderDetail.columnTotal", "الإجمالي")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const reqQty = Number(item.quantity) || 0;
                    const recQty = Number(item.receivedQuantity) || 0;
                    const isFullyReceived = recQty >= reqQty && reqQty > 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div>{item.productName || item.product?.name || "صنف"}</div>
                          {item.product?.sku && (
                            <div className="text-[11px] text-muted-foreground font-mono">{item.product.sku}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-mono font-semibold">{reqQty}</TableCell>
                        <TableCell className="text-center font-mono font-bold">
                          <span className={isFullyReceived ? "text-emerald-600" : recQty > 0 ? "text-amber-600" : "text-muted-foreground"}>
                            {recQty}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-mono tabular-nums">
                          {formatCurrency(item.unitPrice, { locale: i18n.language })}
                        </TableCell>
                        <TableCell className="text-center font-mono text-muted-foreground">
                          {Number(item.taxRate || 0)}%
                        </TableCell>
                        <TableCell className="text-center font-mono text-muted-foreground">
                          {Number(item.discountRate || 0)}%
                        </TableCell>
                        <TableCell className="text-end font-mono font-bold text-foreground tabular-nums">
                          {formatCurrency(item.totalPrice, { locale: i18n.language })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Linked Invoices Section */}
        <Card size="sm" className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="size-4 text-primary" />
                <span>الفواتير المرتبطة بأمر الشراء</span>
              </div>
              <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {invoices.length} فواتير
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-4">
            {invoices.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                لم يتم إصدار فواتير شراء لهذا الأمر بعد. يمكنك النقر على "إنشاء فاتورة شراء" بالأعلى لإصدار فاتورة جديدة.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start">رقم الفاتورة</TableHead>
                      <TableHead className="text-start">تاريخ الفاتورة</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead className="text-center">الإجمالي</TableHead>
                      <TableHead className="text-center">المدفوع</TableHead>
                      <TableHead className="text-center">المتبقي</TableHead>
                      <TableHead className="text-end">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono font-bold text-primary">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatShortDate(inv.invoiceDate, i18n.language)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={invoiceStatusColors[inv.status] || "outline"}>
                            {invoiceStatusLabels[inv.status] || inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold tabular-nums">
                          {formatCurrency(inv.totalAmount, { locale: i18n.language })}
                        </TableCell>
                        <TableCell className="text-center font-mono text-emerald-600 font-semibold tabular-nums">
                          {formatCurrency(inv.paidAmount, { locale: i18n.language })}
                        </TableCell>
                        <TableCell className="text-center font-mono text-destructive font-bold tabular-nums">
                          {formatCurrency(inv.remainingAmount, { locale: i18n.language })}
                        </TableCell>
                        <TableCell className="text-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/procurement/purchase-invoices/${inv.id}`)}
                            className="text-xs h-7 px-2"
                          >
                            عرض الفاتورة
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 2. PRINT ONLY VIEW: Multi-Template Printable Engine (A4 Standard) */}
      <ProcurementPrintRenderer
        templateId={selectedTemplate}
        data={normalizedData}
        isRtl={isRtl}
      />

      {/* Receive Dialog */}
      <ReceiveItemsDialog
        order={order}
        open={receiveDialogOpen}
        onOpenChange={setReceiveDialogOpen}
        onSuccess={handleReceiveSuccess}
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title={t("procurement.purchaseOrderDetail.cancelConfirmTitle", "إلغاء أمر الشراء")}
        description={t(
          "procurement.purchaseOrderDetail.cancelConfirmDesc",
          "هل أنت متأكد من رغبتك في إلغاء أمر الشراء هذا؟ لا يمكن التراجع عن هذا الإجراء.",
        )}
        confirmLabel={t("procurement.purchaseOrderDetail.cancelConfirmBtn", "نعم، إلغاء الأمر")}
        cancelLabel={t("common.cancel", "تراجع")}
        variant="destructive"
        onConfirm={handleCancel}
        loading={actionLoading}
      />
    </div>
  );
};

export default PurchaseOrderDetail;

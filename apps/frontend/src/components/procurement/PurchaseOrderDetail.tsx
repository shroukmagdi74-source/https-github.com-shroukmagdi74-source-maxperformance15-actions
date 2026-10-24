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
  Printer,
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
  totalAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
  status: string;
}

interface PurchaseOrderFull {
  id: string;
  orderNumber: string;
  orderDate: string;
  expectedDelivery?: string | null;
  receivedDate?: string | null;
  status: string;
  paymentTerms?: string | null;
  notes?: string | null;
  subtotal: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  shippingCost: number | string;
  totalAmount: number | string;
  supplier: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  purchaseOrderItems: PurchaseOrderItem[];
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
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
    confirmColor?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  }>({
    open: false,
    title: "",
    content: "",
    onConfirm: () => {},
  });

  const statusLabels: Record<string, string> = {
    DRAFT: t("procurement.purchaseOrders.statusDraft", "مسودة"),
    PENDING: t("procurement.purchaseOrders.statusPending", "في انتظار الموافقة"),
    ORDERED: t("procurement.purchaseOrders.statusOrdered", "معتمد / قيد التوريد"),
    PARTIALLY_RECEIVED: t("procurement.purchaseOrders.statusPartiallyReceived", "استلام جزئي"),
    RECEIVED: t("procurement.purchaseOrders.statusReceived", "تم الاستلام"),
    CANCELLED: t("procurement.purchaseOrders.statusCancelled", "ملغي"),
  };

  const invoiceStatusLabels: Record<string, string> = {
    PENDING: t("procurement.purchaseInvoices.statusPending", "غير مدفوعة"),
    PAID: t("procurement.purchaseInvoices.statusPaid", "مدفوعة"),
    CANCELLED: t("procurement.purchaseInvoices.statusCancelled", "ملغاة"),
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
      setError(errResp.response?.data?.message || t("procurement.purchaseOrderDetail.loadError", "فشل تحميل تفاصيل أمر الشراء"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleApprove = () => {
    if (!order) return;
    setConfirmDialog({
      open: true,
      title: t("procurement.purchaseOrderDetail.confirmApproveTitle", "تأكيد الموافقة على أمر الشراء"),
      content: t("procurement.purchaseOrderDetail.confirmApproveContent", "هل أنت متأكد من رغبتك في اعتماد والموافقة على أمر الشراء هذا؟"),
      confirmColor: "primary",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await apiClient.post(`/procurement/purchase-orders/${order.id}/approve`);
          await fetchOrder();
        } catch (err: any) {
          console.error("Error approving order:", err);
          setError(err?.response?.data?.message || "تعذر اعتماد أمر الشراء");
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleCancel = () => {
    if (!order) return;
    setConfirmDialog({
      open: true,
      title: t("procurement.purchaseOrderDetail.confirmCancelTitle", "تأكيد إلغاء أمر الشراء"),
      content: t("procurement.purchaseOrderDetail.confirmCancelContent", "هل أنت متأكد من رغبتك في إلغاء أمر الشراء؟ لا يمكن التراجع عن هذا الإجراء."),
      confirmColor: "error",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await apiClient.post(`/procurement/purchase-orders/${order.id}/cancel`);
          await fetchOrder();
        } catch (err: any) {
          console.error("Error cancelling order:", err);
          setError(err?.response?.data?.message || "تعذر إلغاء أمر الشراء");
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
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
          <span>{error || t("procurement.purchaseOrderDetail.loadError", "أمر الشراء غير موجود")}</span>
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

  const items = (Array.isArray(order.purchaseOrderItems) && order.purchaseOrderItems.length > 0)
    ? order.purchaseOrderItems
    : Array.isArray((order as any).items)
    ? (order as any).items
    : [];
  const invoices = (Array.isArray(order.purchaseInvoices) && order.purchaseInvoices.length > 0)
    ? order.purchaseInvoices
    : Array.isArray((order as any).invoices)
    ? (order as any).invoices
    : [];
  const canApprove = order.status === "DRAFT" || order.status === "PENDING";
  const canReceive = order.status === "ORDERED" || order.status === "PARTIALLY_RECEIVED";
  const canCancel = order.status !== "RECEIVED" && order.status !== "CANCELLED";
  const canCreateInvoice = order.status !== "CANCELLED";

  const companyContext = React.useContext(CompanyContext);
  const companyName = companyContext?.company?.name || "منصة MaxP للتجارة المتكاملة";

  return (
    <div className="purchase-order-detail-container">
      {/* Print-specific style rules */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          body, html {
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", sans-serif !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, aside, [role="navigation"], .sidebar, .app-sidebar, #app-header, button, .print\\:hidden, [data-sonner-toaster], .fixed {
            display: none !important;
          }
          .purchase-order-detail-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }
          .printable-commercial-sheet {
            display: block !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }
          .no-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        @media screen {
          .printable-commercial-sheet {
            display: none !important;
          }
        }
      `}</style>

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
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle className="size-4" />
              {t("procurement.purchaseOrderDetail.approveBtn", "موافقة على الأمر")}
            </Button>
          )}

          {canReceive && (
            <Button
              size="sm"
              variant="default"
              onClick={() => setReceiveDialogOpen(true)}
              className="gap-1.5"
            >
              <PackageCheck className="size-4" />
              {t("procurement.purchaseOrderDetail.receiveBtn", "استلام الأصناف")}
            </Button>
          )}

          {canApprove && (
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

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="size-4" />
            {t("procurement.purchaseOrderDetail.printBtn", "طباعة")}
          </Button>
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
              {t("procurement.purchaseOrderDetail.orderInfo", "التواريخ والمواعيد")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("procurement.purchaseOrderDetail.orderDate", "تاريخ الأمر")}:</span>
              <span className="font-semibold tabular-nums">{formatShortDate(order.orderDate, i18n.language)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("procurement.purchaseOrderDetail.expectedDelivery", "التسليم المتوقع")}:</span>
              <span className="font-semibold tabular-nums">
                {formatShortDate(order.expectedDelivery, i18n.language)}
              </span>
            </div>
            {order.receivedDate && (
              <div className="flex justify-between text-emerald-600">
                <span>{t("procurement.purchaseOrderDetail.receivedDate", "تاريخ الاستلام")}:</span>
                <span className="font-semibold tabular-nums">{formatShortDate(order.receivedDate, i18n.language)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Highlights */}
        <Card size="sm" className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-primary" />
              {t("procurement.purchaseOrderDetail.summaryTitle", "المبلغ الإجمالي")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold font-mono text-primary tabular-nums">
              {formatCurrency(order.totalAmount, { locale: i18n.language })}
            </div>
            <div className="text-xs text-muted-foreground">
              {items.length} أصناف في هذا الأمر
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card size="sm" className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <FileText className="size-4 text-primary" />
            {t("procurement.purchaseOrderDetail.itemsTitle", "الأصناف المطلوبة")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t("procurement.purchaseOrderDetail.columnProduct", "الصنف")}</TableHead>
                  <TableHead className="text-center w-20">{t("procurement.purchaseOrderDetail.columnOrdered", "المطلوب")}</TableHead>
                  <TableHead className="text-center w-20">{t("procurement.purchaseOrderDetail.columnReceived", "المستلم")}</TableHead>
                  <TableHead className="text-center w-20">{t("procurement.purchaseOrderDetail.columnRemaining", "المتبقي")}</TableHead>
                  <TableHead className="text-center w-28">{t("procurement.purchaseOrderDetail.columnUnitPrice", "سعر الوحدة")}</TableHead>
                  <TableHead className="text-end w-28">{t("procurement.purchaseOrderDetail.columnTotal", "الإجمالي")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const qty = Number(item.quantity) || 0;
                  const rec = Number(item.receivedQuantity) || 0;
                  const rem = Math.max(0, qty - rec);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>{item.productName || item.product?.name || "صنف"}</div>
                        {item.product?.sku && (
                          <div className="text-[11px] text-muted-foreground font-mono">{item.product.sku}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono font-semibold">{qty}</TableCell>
                      <TableCell className="text-center font-mono text-emerald-600 font-semibold">{rec}</TableCell>
                      <TableCell className="text-center font-mono text-muted-foreground">{rem}</TableCell>
                      <TableCell className="text-center font-mono tabular-nums">{formatCurrency(item.unitPrice, { locale: i18n.language })}</TableCell>
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

      {/* Summary & Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notes & Payment Terms */}
        <Card size="sm" className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">
              {t("procurement.purchaseOrderForm.notesLabel", "ملاحظات وشروط الدفع")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="font-semibold block text-muted-foreground mb-1">
                {t("procurement.purchaseOrderForm.paymentTermsLabel", "شروط الدفع والتسليم")}:
              </span>
              <p className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-foreground">
                {order.paymentTerms || "لا توجد شروط خاصة"}
              </p>
            </div>
            <div>
              <span className="font-semibold block text-muted-foreground mb-1">
                {t("procurement.purchaseOrderForm.notesLabel", "ملاحظات إضافية")}:
              </span>
              <p className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-foreground">
                {order.notes || "لا توجد ملاحظات"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card size="sm" className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">
              {t("procurement.purchaseOrderDetail.summaryTitle", "ملخص المبالغ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("procurement.purchaseOrderDetail.subtotal", "المجموع قبل الخصم:")}</span>
              <span className="font-mono font-medium tabular-nums">{formatCurrency(order.subtotal, { locale: i18n.language })}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-destructive">
                <span>{t("procurement.purchaseOrderDetail.additionalDiscount", "خصم إضافي:")}</span>
                <span className="font-mono font-medium tabular-nums">-{formatCurrency(order.discountAmount, { locale: i18n.language })}</span>
              </div>
            )}
            {Number(order.taxAmount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{t("procurement.purchaseOrderDetail.taxAmount", "إجمالي الضرائب:")}</span>
                <span className="font-mono font-medium tabular-nums">+{formatCurrency(order.taxAmount, { locale: i18n.language })}</span>
              </div>
            )}
            {Number(order.shippingCost) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("procurement.purchaseOrderDetail.shippingCost", "مصاريف الشحن:")}</span>
                <span className="font-mono font-medium tabular-nums">+{formatCurrency(order.shippingCost, { locale: i18n.language })}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border font-bold text-base">
              <span>{t("procurement.purchaseOrderDetail.grandTotal", "الإجمالي النهائي:")}</span>
              <span className="font-mono text-primary tabular-nums">{formatCurrency(order.totalAmount, { locale: i18n.language })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linked Invoices Section */}
      <Card size="sm" className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              {t("procurement.purchaseOrderDetail.linkedInvoices", "الفواتير المرتبطة بأمر الشراء")}
            </div>
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {invoices.length} فواتير
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {invoices.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
              <p>{t("procurement.purchaseOrderDetail.noLinkedInvoices", "لا توجد فواتير مرتبطة بهذا الأمر بعد")}</p>
              {canCreateInvoice && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/procurement/purchase-invoices/new?purchaseOrderId=${order.id}`)}
                  className="gap-1.5 mt-1"
                >
                  <FileText className="size-3.5" />
                  {t("procurement.purchaseOrderDetail.createInvoiceBtn", "إنشاء فاتورة شراء من هذا الأمر")}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">رقم الفاتورة</TableHead>
                    <TableHead className="text-start">تاريخ الفاتورة</TableHead>
                    <TableHead className="text-start">تاريخ الاستحقاق</TableHead>
                    <TableHead className="text-center">المبلغ الإجمالي</TableHead>
                    <TableHead className="text-center">المدفوع</TableHead>
                    <TableHead className="text-center">المتبقي</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-end">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono font-semibold">{inv.invoiceNumber}</TableCell>
                      <TableCell className="tabular-nums">{formatShortDate(inv.invoiceDate, i18n.language)}</TableCell>
                      <TableCell className="tabular-nums">{formatShortDate(inv.dueDate, i18n.language)}</TableCell>
                      <TableCell className="text-center font-mono font-medium tabular-nums">{formatCurrency(inv.totalAmount, { locale: i18n.language })}</TableCell>
                      <TableCell className="text-center font-mono text-emerald-600 tabular-nums">{formatCurrency(inv.paidAmount, { locale: i18n.language })}</TableCell>
                      <TableCell className="text-center font-mono text-destructive tabular-nums">{formatCurrency(inv.remainingAmount, { locale: i18n.language })}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={inv.status === "PAID" ? "default" : "secondary"}>
                          {invoiceStatusLabels[inv.status] ?? inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/procurement/purchase-invoices/${inv.id}`)}
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

      {/* 2. PRINT ONLY VIEW: Standalone Official Commercial Purchase Order (A4 Standard) */}
      <div className="hidden print:block printable-commercial-sheet text-slate-900 bg-white" dir={isRtl ? "rtl" : "ltr"}>
        {/* A. Formal Commercial Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex justify-between items-start">
            {/* Company / Buyer info */}
            <div className="space-y-1 text-start">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {companyName}
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                منظومة إدارة المشتريات والتوريدات الرسمية
              </p>
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-0.5">
                <p>تاريخ الطباعة: <span className="font-mono">{formatShortDate(new Date().toISOString(), i18n.language)}</span></p>
              </div>
            </div>

            {/* Document Title & Reference Box */}
            <div className="text-end">
              <div className="inline-block text-end">
                <div className="text-lg font-black text-slate-900">
                  أمر شراء توريد
                </div>
                <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase font-mono">
                  PURCHASE ORDER
                </div>
                <div className="mt-1.5 border border-slate-300 rounded px-2.5 py-1 bg-slate-50 text-xs space-y-0.5 min-w-[210px] text-start">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-600">رقم الأمر:</span>
                    <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-600">تاريخ الأمر:</span>
                    <span className="font-mono tabular-nums">{formatShortDate(order.orderDate, i18n.language)}</span>
                  </div>
                  {order.expectedDelivery && (
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-600">التسليم المتوقع:</span>
                      <span className="font-mono tabular-nums">{formatShortDate(order.expectedDelivery, i18n.language)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-600">حالة الأمر:</span>
                    <span className="font-semibold">{statusLabels[order.status] ?? order.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* B. Parties Information Strip (Compact 2-Column Box) */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          {/* Supplier Data */}
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 text-start">
            <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
              <span>بيانات المورّد (المُسلِّم):</span>
              <span className="text-[10px] text-slate-500 font-normal">SUPPLIER</span>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-slate-900">{order.supplier.name}</div>
              {order.supplier.phone && (
                <div className="text-slate-700">الهاتف: <span className="font-mono font-semibold">{order.supplier.phone}</span></div>
              )}
              {order.supplier.email && (
                <div className="text-slate-600">البريد: <span>{order.supplier.email}</span></div>
              )}
            </div>
          </div>

          {/* Buyer & Destination Data */}
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 text-start">
            <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
              <span>بيانات المشتري وجهة الاستلام:</span>
              <span className="text-[10px] text-slate-500 font-normal">BUYER / DESTINATION</span>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-slate-900">{companyName}</div>
              <div className="text-slate-700">موقع الاستلام: <span className="font-semibold">المستودع الرئيسي / المقر المعتمد</span></div>
              <div className="text-slate-600">شروط التوريد والدفع: <span className="font-semibold">{order.paymentTerms || "سداد نقدي / آجل حسب الاتفاق"}</span></div>
            </div>
          </div>
        </div>

        {/* C. Accounting Items Table */}
        <div className="mb-4">
          <table className="w-full text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                <th className="py-1.5 px-2 text-center w-8 border-e border-slate-300">#</th>
                <th className="py-1.5 px-2 text-start border-e border-slate-300">بيان الصنف والمواصفات</th>
                <th className="py-1.5 px-2 text-center w-24 border-e border-slate-300">كود / SKU</th>
                <th className="py-1.5 px-2 text-center w-16 border-e border-slate-300">المطلوب</th>
                <th className="py-1.5 px-2 text-center w-16 border-e border-slate-300">المستلم</th>
                <th className="py-1.5 px-2 text-center w-16 border-e border-slate-300">المتبقي</th>
                <th className="py-1.5 px-2 text-center w-24 border-e border-slate-300">سعر الوحدة</th>
                <th className="py-1.5 px-2 text-end w-24">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const qty = Number(item.quantity) || 0;
                const rec = Number(item.receivedQuantity) || 0;
                const rem = Math.max(0, qty - rec);
                return (
                  <tr key={item.id} className="border-b border-slate-200 even:bg-slate-50/50">
                    <td className="py-1.5 px-2 text-center font-mono border-e border-slate-200">{idx + 1}</td>
                    <td className="py-1.5 px-2 font-medium border-e border-slate-200 text-start">
                      <div>{item.productName || item.product?.name || "صنف بدون اسم"}</div>
                      {item.description && <div className="text-[10px] text-slate-500">{item.description}</div>}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono text-[11px] text-slate-600 border-e border-slate-200">
                      {item.product?.sku || "—"}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-bold border-e border-slate-200">{qty}</td>
                    <td className="py-1.5 px-2 text-center font-mono text-emerald-700 font-semibold border-e border-slate-200">{rec}</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-500 border-e border-slate-200">{rem}</td>
                    <td className="py-1.5 px-2 text-center font-mono tabular-nums border-e border-slate-200">
                      {formatCurrency(item.unitPrice, { locale: i18n.language })}
                    </td>
                    <td className="py-1.5 px-2 text-end font-mono font-bold tabular-nums">
                      {formatCurrency(item.totalPrice, { locale: i18n.language })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* D. Totals & Notes Summary (Side-by-Side Compact) */}
        <div className="grid grid-cols-2 gap-4 mb-6 no-break">
          {/* Terms & Notes */}
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50/30 text-xs space-y-1.5 text-start">
            <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
              شروط وملاحظات أمر الشراء:
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {order.notes || "يخضع هذا الأمر للمطابقة والفحص الفني بالمستودعات قبل القبول النهائي وإصدار فاتورة الشراء."}
            </p>
            {order.paymentTerms && (
              <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200">
                <strong>شروط السداد:</strong> {order.paymentTerms}
              </p>
            )}
          </div>

          {/* Financial Summary Box */}
          <div className="border border-slate-300 rounded overflow-hidden text-xs">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-1 px-3 text-slate-600 text-start">المجموع قبل الخصم:</td>
                  <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                    {formatCurrency(order.subtotal, { locale: i18n.language })}
                  </td>
                </tr>
                {Number(order.discountAmount) > 0 && (
                  <tr className="border-b border-slate-200 text-rose-700">
                    <td className="py-1 px-3 text-start">الخصم التجاري:</td>
                    <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                      -{formatCurrency(order.discountAmount, { locale: i18n.language })}
                    </td>
                  </tr>
                )}
                {Number(order.taxAmount) > 0 && (
                  <tr className="border-b border-slate-200 text-slate-700">
                    <td className="py-1 px-3 text-start">ضريبة القيمة المضافة:</td>
                    <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                      +{formatCurrency(order.taxAmount, { locale: i18n.language })}
                    </td>
                  </tr>
                )}
                {Number(order.shippingCost) > 0 && (
                  <tr className="border-b border-slate-200 text-slate-700">
                    <td className="py-1 px-3 text-start">مصاريف الشحن / النقل:</td>
                    <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                      +{formatCurrency(order.shippingCost, { locale: i18n.language })}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-black text-sm border-t-2 border-slate-800">
                  <td className="py-1.5 px-3 text-slate-900 text-start">المبلغ الإجمالي المستحق:</td>
                  <td className="py-1.5 px-3 text-end font-mono text-slate-900 tabular-nums">
                    {formatCurrency(order.totalAmount, { locale: i18n.language })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* E. 3-Signature Official Approvals Block */}
        <div className="border border-slate-300 rounded p-3 bg-slate-50/40 no-break">
          <div className="text-[11px] font-bold text-slate-500 mb-4 pb-1 border-b border-slate-200 flex justify-between">
            <span>الاعتمادات والتواقيع الرسمية</span>
            <span className="font-mono">OFFICIAL APPROVALS & SIGNATURES</span>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-800">
            <div>
              <p className="font-bold text-slate-900 mb-8">إعداد مسؤول المشتريات</p>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
                الاسم والتوقيع
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-8">اعتماد الإدارة المالية / المدير</p>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
                الختم الرسمي والاعتماد
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-8">تأكيد واستلام المورد / المستودع</p>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
                توقيع المستلم والتاريخ
              </div>
            </div>
          </div>
        </div>

        {/* F. Formal Footer */}
        <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500 flex justify-between">
          <span>مستند شراء رسمي صادر إلكترونياً من منصة MaxP لإدارة المشتريات والتجارة</span>
          <span>صفحة 1 من 1</span>
        </div>
      </div>

      {/* Modals & Dialogs (Print Hidden) */}
      <div className="print:hidden">
        {/* Receive Items Modal */}
        <ReceiveItemsDialog
          open={receiveDialogOpen}
          onClose={() => setReceiveDialogOpen(false)}
          order={order}
          onSuccess={() => fetchOrder()}
        />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          content={confirmDialog.content}
          confirmColor={confirmDialog.confirmColor}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderDetail;

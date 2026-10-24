import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Pencil,
  Printer,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { apiClient } from "../../services/apiClient";
import CompanyContext from "../../contexts/CompanyContext";
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

interface InvoiceItem {
  id: string;
  productId?: string | null;
  productName: string;
  description?: string | null;
  quantity: number | string;
  unitPrice: number | string;
  taxRate?: number | string;
  discountRate?: number | string;
  totalPrice: number | string;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
  } | null;
}

interface SupplierPaymentRecord {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number | string;
  paymentMethod: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

interface PurchaseInvoiceFull {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  status: string;
  subtotal: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  shippingCost: number | string;
  totalAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
  notes?: string | null;
  purchaseOrderId?: string | null;
  purchaseOrder?: {
    id: string;
    orderNumber: string;
  } | null;
  supplier: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  items?: InvoiceItem[];
  purchaseInvoiceItems?: InvoiceItem[];
  payments?: SupplierPaymentRecord[];
  supplierPayments?: SupplierPaymentRecord[];
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  PAID: "default",
  CANCELLED: "outline",
};

export const PurchaseInvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [invoice, setInvoice] = useState<PurchaseInvoiceFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusLabels: Record<string, string> = {
    PENDING: t("procurement.purchaseInvoices.statusPending", "غير مدفوعة"),
    PAID: t("procurement.purchaseInvoices.statusPaid", "مدفوعة بالكامل"),
    CANCELLED: t("procurement.purchaseInvoices.statusCancelled", "ملغاة"),
  };

  const paymentMethodLabels: Record<string, string> = {
    CASH: t("procurement.supplierPayments.methodCash", "نقدي"),
    BANK_TRANSFER: t("procurement.supplierPayments.methodBankTransfer", "تحويل بنكي"),
    CHECK: t("procurement.supplierPayments.methodCheck", "شيك"),
    CREDIT_CARD: t("procurement.supplierPayments.methodCreditCard", "بطاقة ائتمان"),
    OTHER: t("procurement.supplierPayments.methodOther", "أخرى"),
  };

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PurchaseInvoiceFull>(`/procurement/purchase-invoices/${id}`);
      setInvoice(response.data);
    } catch (err: unknown) {
      console.error("Error fetching purchase invoice:", err);
      const errResp = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        errResp.response?.data?.message ||
          t("procurement.purchaseInvoiceDetail.loadError", "فشل تحميل تفاصيل الفاتورة"),
      );
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">{t("common.loading", "جاري التحميل...")}</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error || t("procurement.purchaseInvoiceDetail.loadError", "الفاتورة غير موجودة")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={fetchInvoice}>
            إعادة المحاولة
          </Button>
          <Button variant="outline" onClick={() => navigate("/procurement/purchase-invoices")}>
            <BackIcon className="size-4 me-2" />
            {t("procurement.purchaseInvoiceDetail.backToList", "العودة لقائمة الفواتير")}
          </Button>
        </div>
      </div>
    );
  }

  const items = invoice.items || invoice.purchaseInvoiceItems || [];
  const payments = invoice.payments || invoice.supplierPayments || [];

  const isOverdue = (() => {
    if (!invoice.dueDate) return false;
    if (invoice.status === "PAID" || invoice.status === "CANCELLED") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(invoice.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  })();

  const canPay = invoice.status !== "PAID" && invoice.status !== "CANCELLED";
  const canEdit = invoice.status !== "PAID";

  const companyContext = React.useContext(CompanyContext);
  const companyName = companyContext?.company?.name || "منصة MaxP للتجارة المتكاملة";

  return (
    <div className="purchase-invoice-detail-container">
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
          .purchase-invoice-detail-container {
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

      {/* 1. SCREEN ONLY VIEW: Interactive Dashboard */}
      <div className="print:hidden p-3 sm:p-6 max-w-6xl mx-auto space-y-5">

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/70 print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/procurement/purchase-invoices")}
            className="gap-1.5"
          >
            <BackIcon className="size-4" />
            {t("procurement.purchaseInvoiceDetail.backToList", "العودة للفواتير")}
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {invoice.invoiceNumber}
          </h1>
          <Badge variant={statusColors[invoice.status] || "outline"} className="ms-1 font-semibold">
            {statusLabels[invoice.status] ?? invoice.status}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="font-semibold">
              {t("procurement.purchaseInvoiceDetail.statusOverdue", "متأخر")}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canPay && (
            <Button
              size="sm"
              variant="default"
              onClick={() =>
                navigate(`/procurement/supplier-payments/new?invoiceId=${invoice.id}`)
              }
              className="gap-1.5"
            >
              <CreditCard className="size-4" />
              {t("procurement.purchaseInvoiceDetail.recordPaymentBtn", "تسجيل دفعة")}
            </Button>
          )}

          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/procurement/purchase-invoices/${invoice.id}/edit`)}
              className="gap-1.5"
            >
              <Pencil className="size-4" />
              {t("procurement.purchaseInvoiceDetail.editBtn", "تعديل")}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="size-4" />
            {t("procurement.purchaseInvoiceDetail.printBtn", "طباعة")}
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
              {t("procurement.purchaseInvoiceDetail.supplierInfo", "بيانات المورد")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="font-bold text-base text-foreground">
              {invoice.supplier.name}
            </div>
            {invoice.supplier.phone && (
              <div className="text-xs text-muted-foreground font-mono">
                {invoice.supplier.phone}
              </div>
            )}
            {invoice.supplier.email && (
              <div className="text-xs text-muted-foreground">
                {invoice.supplier.email}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates & Linked PO */}
        <Card size="sm" className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary" />
              {t("procurement.purchaseInvoiceDetail.invoiceInfo", "التواريخ والأمر المرتبط")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("procurement.purchaseInvoiceDetail.invoiceDate", "تاريخ الفاتورة")}:</span>
              <span className="font-semibold tabular-nums">{formatShortDate(invoice.invoiceDate, i18n.language)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("procurement.purchaseInvoiceDetail.dueDate", "تاريخ الاستحقاق")}:</span>
              <span className={`font-semibold tabular-nums ${isOverdue ? "text-destructive" : ""}`}>
                {formatShortDate(invoice.dueDate, i18n.language)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-border/50">
              <span className="text-muted-foreground">{t("procurement.purchaseInvoiceDetail.linkedOrder", "أمر الشراء")}:</span>
              {invoice.purchaseOrder ? (
                <button
                  type="button"
                  onClick={() => navigate(`/procurement/purchase-orders/${invoice.purchaseOrder?.id}`)}
                  className="font-mono font-semibold text-primary hover:underline flex items-center gap-1 text-xs"
                >
                  {invoice.purchaseOrder.orderNumber}
                  <ExternalLink className="size-3" />
                </button>
              ) : (
                <span className="text-muted-foreground font-normal">
                  {t("procurement.purchaseInvoiceDetail.directInvoice", "فاتورة مباشرة")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Balances */}
        <Card size="sm" className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-primary" />
              {t("procurement.purchaseInvoiceDetail.summaryTitle", "المبالغ والرصيد")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-muted-foreground">الإجمالي:</span>
              <span className="text-lg font-bold font-mono text-foreground tabular-nums">
                {formatCurrency(invoice.totalAmount, { locale: i18n.language })}
              </span>
            </div>
            <div className="flex justify-between items-baseline text-xs text-emerald-600">
              <span>المدفوع:</span>
              <span className="font-bold font-mono tabular-nums">{formatCurrency(invoice.paidAmount, { locale: i18n.language })}</span>
            </div>
            <div className="flex justify-between items-baseline text-xs text-destructive pt-1 border-t border-border/50">
              <span className="font-semibold">المتبقي:</span>
              <span className="text-sm font-bold font-mono tabular-nums">{formatCurrency(invoice.remainingAmount, { locale: i18n.language })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card size="sm" className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <FileText className="size-4 text-primary" />
            {t("procurement.purchaseInvoiceDetail.itemsTitle", "بنود الفاتورة")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t("procurement.purchaseInvoiceDetail.columnProduct", "الصنف")}</TableHead>
                  <TableHead className="text-center w-24">{t("procurement.purchaseInvoiceDetail.columnQuantity", "الكمية")}</TableHead>
                  <TableHead className="text-center w-28">{t("procurement.purchaseInvoiceDetail.columnUnitPrice", "سعر الوحدة")}</TableHead>
                  <TableHead className="text-center w-20">{t("procurement.purchaseInvoiceDetail.columnTax", "الضريبة")}</TableHead>
                  <TableHead className="text-center w-20">{t("procurement.purchaseInvoiceDetail.columnDiscount", "الخصم")}</TableHead>
                  <TableHead className="text-end w-28">{t("procurement.purchaseInvoiceDetail.columnTotal", "الإجمالي")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>{item.productName || item.product?.name || "صنف"}</div>
                      {item.product?.sku && (
                        <div className="text-[11px] text-muted-foreground font-mono">{item.product.sku}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold">{item.quantity}</TableCell>
                    <TableCell className="text-center font-mono tabular-nums">{formatCurrency(item.unitPrice, { locale: i18n.language })}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notes */}
        <Card size="sm" className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">
              {t("procurement.purchaseOrderForm.notesLabel", "ملاحظات الفاتورة")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p className="p-3 rounded-lg bg-muted/40 border border-border/50 text-foreground min-h-[80px]">
              {invoice.notes || "لا توجد ملاحظات مسجلة على هذه الفاتورة"}
            </p>
          </CardContent>
        </Card>

        {/* Financial Breakdown */}
        <Card size="sm" className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">
              {t("procurement.purchaseInvoiceDetail.summaryTitle", "ملخص المبالغ والمدفوعات")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("procurement.purchaseInvoiceDetail.subtotal", "المجموع:")}</span>
              <span className="font-mono font-medium tabular-nums">{formatCurrency(invoice.subtotal, { locale: i18n.language })}</span>
            </div>
            {Number(invoice.discountAmount) > 0 && (
              <div className="flex justify-between text-destructive">
                <span>{t("procurement.purchaseInvoiceDetail.discountAmount", "الخصم:")}</span>
                <span className="font-mono font-medium tabular-nums">-{formatCurrency(invoice.discountAmount, { locale: i18n.language })}</span>
              </div>
            )}
            {Number(invoice.taxAmount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{t("procurement.purchaseInvoiceDetail.taxAmount", "الضرائب:")}</span>
                <span className="font-mono font-medium tabular-nums">+{formatCurrency(invoice.taxAmount, { locale: i18n.language })}</span>
              </div>
            )}
            {Number(invoice.shippingCost) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("procurement.purchaseInvoiceDetail.shippingCost", "الشحن:")}</span>
                <span className="font-mono font-medium tabular-nums">+{formatCurrency(invoice.shippingCost, { locale: i18n.language })}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border font-bold">
              <span>{t("procurement.purchaseInvoiceDetail.totalAmount", "المبلغ الإجمالي:")}</span>
              <span className="font-mono text-primary tabular-nums">{formatCurrency(invoice.totalAmount, { locale: i18n.language })}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>{t("procurement.purchaseInvoiceDetail.paidAmount", "المدفوع:")}</span>
              <span className="font-mono tabular-nums">{formatCurrency(invoice.paidAmount, { locale: i18n.language })}</span>
            </div>
            <div className="flex justify-between text-destructive font-bold text-base">
              <span>{t("procurement.purchaseInvoiceDetail.remainingAmount", "المتبقي:")}</span>
              <span className="font-mono tabular-nums">{formatCurrency(invoice.remainingAmount, { locale: i18n.language })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linked Payments Table */}
      <Card size="sm" className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CreditCard className="size-4 text-primary" />
              {t("procurement.purchaseInvoiceDetail.paymentsTitle", "سجل المدفوعات المسجلة")}
            </div>
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {payments.length} دفعات
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {payments.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {t("procurement.purchaseInvoiceDetail.noPayments", "لا توجد دفعات مسجلة لهذه الفاتورة بعد")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">{t("procurement.purchaseInvoiceDetail.columnPaymentNumber", "رقم الدفعة")}</TableHead>
                    <TableHead className="text-start">{t("procurement.purchaseInvoiceDetail.columnPaymentDate", "تاريخ الدفع")}</TableHead>
                    <TableHead className="text-center">{t("procurement.purchaseInvoiceDetail.columnAmount", "المبلغ")}</TableHead>
                    <TableHead className="text-center">{t("procurement.purchaseInvoiceDetail.columnMethod", "طريقة الدفع")}</TableHead>
                    <TableHead className="text-center">{t("procurement.purchaseInvoiceDetail.columnReference", "المرجع")}</TableHead>
                    <TableHead className="text-start">{t("procurement.purchaseInvoiceDetail.columnNotes", "ملاحظات")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((pmt) => (
                    <TableRow key={pmt.id}>
                      <TableCell className="font-mono font-semibold">{pmt.paymentNumber}</TableCell>
                      <TableCell className="tabular-nums">{formatShortDate(pmt.paymentDate, i18n.language)}</TableCell>
                      <TableCell className="text-center font-mono font-bold text-emerald-600 tabular-nums">
                        {formatCurrency(pmt.amount, { locale: i18n.language })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {paymentMethodLabels[pmt.paymentMethod] || pmt.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {pmt.referenceNumber || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {pmt.notes || "-"}
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

      {/* 2. PRINT ONLY VIEW: Standalone Official Commercial Purchase Invoice (A4 Standard) */}
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
                فاتورة شراء وتوريد رسمية معتمدة
              </p>
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-0.5">
                <p>تاريخ الطباعة: <span className="font-mono">{formatShortDate(new Date().toISOString(), i18n.language)}</span></p>
              </div>
            </div>

            {/* Document Title & Reference Box */}
            <div className="text-end">
              <div className="inline-block text-end">
                <div className="text-lg font-black text-slate-900">
                  فاتورة شراء توريد
                </div>
                <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase font-mono">
                  TAX PURCHASE INVOICE
                </div>
                <div className="mt-1.5 border border-slate-300 rounded px-2.5 py-1 bg-slate-50 text-xs space-y-0.5 min-w-[210px] text-start">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-600">رقم الفاتورة:</span>
                    <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-600">تاريخ الفاتورة:</span>
                    <span className="font-mono tabular-nums">{formatShortDate(invoice.invoiceDate, i18n.language)}</span>
                  </div>
                  {invoice.dueDate && (
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-600">تاريخ الاستحقاق:</span>
                      <span className="font-mono tabular-nums">{formatShortDate(invoice.dueDate, i18n.language)}</span>
                    </div>
                  )}
                  {invoice.purchaseOrder && (
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-600">أمر الشراء المرتبط:</span>
                      <span className="font-mono font-semibold text-slate-900">{invoice.purchaseOrder.orderNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-600">حالة السداد:</span>
                    <span className="font-semibold">{statusLabels[invoice.status] ?? invoice.status}</span>
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
              <div className="font-bold text-sm text-slate-900">{invoice.supplier.name}</div>
              {invoice.supplier.phone && (
                <div className="text-slate-700">الهاتف: <span className="font-mono font-semibold">{invoice.supplier.phone}</span></div>
              )}
              {invoice.supplier.email && (
                <div className="text-slate-600">البريد: <span>{invoice.supplier.email}</span></div>
              )}
            </div>
          </div>

          {/* Buyer & Billing Data */}
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 text-start">
            <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
              <span>بيانات المشتري (الفوترة والاستلام):</span>
              <span className="text-[10px] text-slate-500 font-normal">BUYER / BILL TO</span>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-slate-900">{companyName}</div>
              <div className="text-slate-700">المقر: <span className="font-semibold">المقر الرئيسي المعتمد</span></div>
              <div className="text-slate-600">
                نوع القيد: <span className="font-semibold">{invoice.purchaseOrder ? `بناءً على أمر الشراء ${invoice.purchaseOrder.orderNumber}` : "فاتورة شراء مباشرة"}</span>
              </div>
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
                <th className="py-1.5 px-2 text-center w-16 border-e border-slate-300">الكمية</th>
                <th className="py-1.5 px-2 text-center w-24 border-e border-slate-300">سعر الوحدة</th>
                <th className="py-1.5 px-2 text-center w-16 border-e border-slate-300">الخصم</th>
                <th className="py-1.5 px-2 text-center w-16 border-e border-slate-300">الضريبة</th>
                <th className="py-1.5 px-2 text-end w-24">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-200 even:bg-slate-50/50">
                  <td className="py-1.5 px-2 text-center font-mono border-e border-slate-200">{idx + 1}</td>
                  <td className="py-1.5 px-2 font-medium border-e border-slate-200 text-start">
                    <div>{item.productName || item.product?.name || "صنف بدون اسم"}</div>
                    {item.description && <div className="text-[10px] text-slate-500">{item.description}</div>}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono text-[11px] text-slate-600 border-e border-slate-200">
                    {item.product?.sku || "—"}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono font-bold border-e border-slate-200">{item.quantity}</td>
                  <td className="py-1.5 px-2 text-center font-mono tabular-nums border-e border-slate-200">
                    {formatCurrency(item.unitPrice, { locale: i18n.language })}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono border-e border-slate-200 text-slate-500">
                    {Number(item.discountRate) > 0 ? `${item.discountRate}%` : "—"}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono border-e border-slate-200 text-slate-500">
                    {Number(item.taxRate) > 0 ? `${item.taxRate}%` : "—"}
                  </td>
                  <td className="py-1.5 px-2 text-end font-mono font-bold tabular-nums">
                    {formatCurrency(item.totalPrice, { locale: i18n.language })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* D. Totals & Notes Summary (Side-by-Side Compact) */}
        <div className="grid grid-cols-2 gap-4 mb-6 no-break">
          {/* Terms & Notes */}
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50/30 text-xs space-y-1.5 text-start">
            <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
              ملاحظات الفاتورة والتسوية:
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {invoice.notes || "تعتبر هذه الفاتورة سند التزام مالي معتمد بعد اكتمال التوريد ومطابقة الأصناف."}
            </p>
            {invoice.dueDate && (
              <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200">
                <strong>تاريخ الاستحقاق النهائي:</strong> {formatShortDate(invoice.dueDate, i18n.language)}
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
                    {formatCurrency(invoice.subtotal, { locale: i18n.language })}
                  </td>
                </tr>
                {Number(invoice.discountAmount) > 0 && (
                  <tr className="border-b border-slate-200 text-rose-700">
                    <td className="py-1 px-3 text-start">الخصم التجاري:</td>
                    <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                      -{formatCurrency(invoice.discountAmount, { locale: i18n.language })}
                    </td>
                  </tr>
                )}
                {Number(invoice.taxAmount) > 0 && (
                  <tr className="border-b border-slate-200 text-slate-700">
                    <td className="py-1 px-3 text-start">ضريبة القيمة المضافة:</td>
                    <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                      +{formatCurrency(invoice.taxAmount, { locale: i18n.language })}
                    </td>
                  </tr>
                )}
                {Number(invoice.shippingCost) > 0 && (
                  <tr className="border-b border-slate-200 text-slate-700">
                    <td className="py-1 px-3 text-start">مصاريف الشحن / النقل:</td>
                    <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                      +{formatCurrency(invoice.shippingCost, { locale: i18n.language })}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-black text-sm border-t-2 border-slate-800">
                  <td className="py-1.5 px-3 text-slate-900 text-start">المبلغ الإجمالي للفاتورة:</td>
                  <td className="py-1.5 px-3 text-end font-mono text-slate-900 tabular-nums">
                    {formatCurrency(invoice.totalAmount, { locale: i18n.language })}
                  </td>
                </tr>
                <tr className="border-t border-slate-200 text-emerald-700 font-semibold">
                  <td className="py-1 px-3 text-start">المبلغ المدفوع:</td>
                  <td className="py-1 px-3 text-end font-mono tabular-nums">
                    {formatCurrency(invoice.paidAmount, { locale: i18n.language })}
                  </td>
                </tr>
                <tr className="border-t border-slate-200 text-rose-700 font-bold">
                  <td className="py-1 px-3 text-start">المبلغ المتبقي:</td>
                  <td className="py-1 px-3 text-end font-mono tabular-nums">
                    {formatCurrency(invoice.remainingAmount, { locale: i18n.language })}
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
              <p className="font-bold text-slate-900 mb-8">إعداد المحاسب المسؤول</p>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
                الاسم والتوقيع
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-8">اعتماد المدير المالي / الإدارة</p>
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
          <span>فاتورة شراء رسمية صادرة إلكترونياً من منصة MaxP لإدارة التجارة والمشتريات</span>
          <span>صفحة 1 من 1</span>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoiceDetail;

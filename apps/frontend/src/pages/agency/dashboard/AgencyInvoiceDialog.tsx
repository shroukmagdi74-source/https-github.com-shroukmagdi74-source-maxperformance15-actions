import React from "react";
import { BarChart3, MessageCircle, Printer, Receipt } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { ClientInvoiceStatement, InvoicesResponse, PRICING_MODEL_LABELS } from "./types";

interface AgencyInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInvoice: ClientInvoiceStatement | null;
  invoicesData: InvoicesResponse | null;
  currency: string;
  onShareWhatsApp: (stmt: ClientInvoiceStatement) => void;
}

export const AgencyInvoiceDialog: React.FC<AgencyInvoiceDialogProps> = ({
  open,
  onOpenChange,
  selectedInvoice,
  invoicesData,
  currency,
  onShareWhatsApp,
}) => {
  if (!selectedInvoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90dvh] flex flex-col p-0 overflow-hidden"
        dir="rtl"
      >
        <div className="bg-background flex flex-col h-full overflow-hidden">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #agency-formal-invoice-print-area, #agency-formal-invoice-print-area * {
                visibility: visible !important;
              }
              #agency-formal-invoice-print-area {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                margin: 0 !important;
                padding: 24px !important;
                background: #ffffff !important;
                color: #000000 !important;
                z-index: 99999 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          {/* Header / Actions Bar (Hidden in Print) */}
          <div className="p-3.5 sm:p-4 bg-muted/40 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 no-print">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <Receipt className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">
                  معاينة الفاتورة وكشف الحساب الرسمي
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  جاهزة للطباعة، الحفظ كـ PDF، أو الإرسال للعميل
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 font-bold text-xs gap-1.5 flex-1 sm:flex-initial"
                onClick={() => window.print()}
              >
                <Printer className="size-3.5 text-primary" />
                طباعة / حفظ PDF
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 font-bold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-initial"
                onClick={() => onShareWhatsApp(selectedInvoice)}
              >
                <MessageCircle className="size-3.5" />
                مشاركة عبر واتساب
              </Button>
            </div>
          </div>

          {/* PRINTABLE INVOICE SHEET */}
          <div
            id="agency-formal-invoice-print-area"
            className="p-4 sm:p-8 bg-card text-card-foreground space-y-5 sm:space-y-6 overflow-y-auto flex-1"
          >
            {/* Agency Letterhead */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-primary/20 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-base shadow-xs">
                    M
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                    {invoicesData?.agencyName || "وكالة التسويق الرقمي وإدارة الحملات"}
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  منظومة إدارة أداء وحسابات الإعلانات والتسويق الرقمي
                </p>
              </div>

              <div className="text-left sm:text-left space-y-1" dir="ltr">
                <div className="inline-block">
                  <Badge
                    variant="outline"
                    className={`text-xs px-2.5 py-0.5 font-black uppercase tracking-wider ${
                      selectedInvoice.isPaid
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-400"
                        : "bg-amber-500/10 text-amber-600 border-amber-400"
                    }`}
                  >
                    {selectedInvoice.isPaid
                      ? "PAID / مسددة بالكامل"
                      : "PAYMENT DUE / بانتظار التحصيل"}
                  </Badge>
                </div>
                <p className="text-xs font-mono font-bold text-muted-foreground tabular-nums">
                  #INV-{selectedInvoice.month.replace("-", "")}-
                  {selectedInvoice.clientId.slice(-4).toUpperCase()}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                  Month: {selectedInvoice.month}
                </p>
              </div>
            </div>

            {/* Bill To & Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-muted/20 border border-border/60 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  مفوتر إلى (العميل):
                </span>
                <h4 className="text-sm font-black text-foreground">
                  {selectedInvoice.clientName}
                </h4>
                {selectedInvoice.contactPerson && (
                  <p className="text-muted-foreground">
                    المسؤول: {selectedInvoice.contactPerson}
                  </p>
                )}
                {selectedInvoice.phone && (
                  <p className="text-muted-foreground font-mono tabular-nums" dir="ltr">
                    الهاتف: {selectedInvoice.phone}
                  </p>
                )}
                {selectedInvoice.email && (
                  <p className="text-muted-foreground">البريد: {selectedInvoice.email}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:border-r sm:border-border/60 sm:pr-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  تفاصيل التعاقد والحملة:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">نموذج التسعير:</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      PRICING_MODEL_LABELS[selectedInvoice.pricingModel]?.badgeColor
                    }`}
                  >
                    {PRICING_MODEL_LABELS[selectedInvoice.pricingModel]?.label}
                  </Badge>
                </div>
                <div className="flex justify-between font-mono tabular-nums">
                  <span className="text-muted-foreground font-sans">شهر الفاتورة:</span>
                  <span className="font-bold">{selectedInvoice.month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نطاق العمل:</span>
                  <span className="font-bold">
                    {selectedInvoice.isOffPlatform ? "تتبع إعلاني خارجي" : "متصل بالمنصة"}
                  </span>
                </div>
              </div>
            </div>

            {/* Campaign Performance Snapshot */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BarChart3 className="size-3.5 text-primary" />
                  ملخص أداء الحملات الإعلانية المعتمد
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                <div className="p-2.5 sm:p-3 rounded-lg border border-border/60 bg-muted/10 font-mono tabular-nums">
                  <span className="text-[10px] font-bold text-muted-foreground block font-sans">
                    الإنفاق الإعلاني الفعلي
                  </span>
                  <span className="text-sm font-black text-primary mt-0.5 block">
                    {selectedInvoice.performance.spend.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg border border-border/60 bg-muted/10 font-mono tabular-nums">
                  <span className="text-[10px] font-bold text-muted-foreground block font-sans">
                    إجمالي المبيعات المحققة
                  </span>
                  <span className="text-sm font-black text-foreground mt-0.5 block">
                    {selectedInvoice.performance.sales.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg border border-border/60 bg-muted/10 font-mono tabular-nums">
                  <span className="text-[10px] font-bold text-muted-foreground block font-sans">
                    عائد الإنفاق (ROAS)
                  </span>
                  <span className="text-sm font-black text-emerald-600 mt-0.5 block">
                    {selectedInvoice.performance.roas ||
                      (selectedInvoice.performance.spend > 0
                        ? (
                            selectedInvoice.performance.sales /
                            selectedInvoice.performance.spend
                          ).toFixed(2)
                        : 0)}
                    x
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg border border-border/60 bg-muted/10 font-mono tabular-nums">
                  <span className="text-[10px] font-bold text-muted-foreground block font-sans">
                    تكلفة الطلب (CPA)
                  </span>
                  <span className="text-sm font-black text-foreground mt-0.5 block">
                    {selectedInvoice.performance.cpa ||
                      (selectedInvoice.performance.orders > 0
                        ? Math.round(
                            selectedInvoice.performance.spend /
                              selectedInvoice.performance.orders,
                          )
                        : 0)}{" "}
                    {currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Invoice Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Receipt className="size-3.5 text-primary" />
                بيان الأتعاب والخدمات المفوترة
              </h4>

              <div className="border border-border/60 rounded-xl overflow-x-auto text-xs">
                <div className="min-w-[460px]">
                  <div className="grid grid-cols-12 bg-muted/40 p-2.5 font-black border-b border-border/60 text-[11px] text-muted-foreground">
                    <div className="col-span-6">البند / الخدمة</div>
                    <div className="col-span-3">النوع والتفاصيل</div>
                    <div className="col-span-3 text-left">المبلغ المستحق</div>
                  </div>

                  {/* Core Agency Fee Row */}
                  <div className="grid grid-cols-12 p-3 border-b border-border/40 items-center font-medium bg-background/50">
                    <div className="col-span-6">
                      <p className="font-black text-foreground">
                        أتعاب إدارة الحملات والتسويق الرقمي
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedInvoice.calculationExplanation}
                      </p>
                    </div>
                    <div className="col-span-3">
                      <Badge variant="outline" className="text-[10px] font-bold">
                        أتعاب أساسية
                      </Badge>
                    </div>
                    <div className="col-span-3 text-left font-black text-sm text-foreground font-mono tabular-nums">
                      {selectedInvoice.baseAgencyFee.toLocaleString()} {currency}
                    </div>
                  </div>

                  {/* Extra Services Rows */}
                  {selectedInvoice.extraServices.map((srv) => (
                    <div
                      key={srv.id}
                      className="grid grid-cols-12 p-3 border-b border-border/40 items-center font-medium"
                    >
                      <div className="col-span-6">
                        <p className="font-bold text-foreground">{srv.title}</p>
                        {srv.notes && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {srv.notes}
                          </p>
                        )}
                      </div>
                      <div className="col-span-3">
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {srv.category}
                        </Badge>
                      </div>
                      <div className="col-span-3 text-left font-black text-sm text-foreground font-mono tabular-nums">
                        {srv.amount.toLocaleString()} {currency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
              <div className="text-xs text-muted-foreground space-y-1 max-w-sm">
                <p className="font-bold text-foreground">شروط ومعلومات السداد:</p>
                <p>
                  كافة الأتعاب والعمولات مبنية على أرقام الأداء والبنود المعتمدة لشهر{" "}
                  {selectedInvoice.month}. في حال وجود أي استفسار يرجى مراجعة إدارة الوكالة مباشرة.
                </p>
              </div>

              <div className="w-full sm:w-72 space-y-2 p-3.5 bg-muted/20 rounded-xl border border-border/60 text-xs font-mono tabular-nums">
                <div className="flex justify-between font-bold">
                  <span className="text-muted-foreground font-sans">
                    أتعاب الوكالة الأساسية:
                  </span>
                  <span>
                    {selectedInvoice.baseAgencyFee.toLocaleString()} {currency}
                  </span>
                </div>
                {selectedInvoice.extraServicesSum > 0 && (
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground font-sans">
                      إجمالي البنود الإضافية:
                    </span>
                    <span>
                      {selectedInvoice.extraServicesSum.toLocaleString()} {currency}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-primary/20 flex justify-between items-baseline font-black">
                  <span className="text-sm text-foreground font-sans">
                    إجمالي الفاتورة المستحق:
                  </span>
                  <span className="text-base text-primary">
                    {selectedInvoice.totalAmount.toLocaleString()} {currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Stamp / Signature Area */}
            <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <div className="space-y-1">
                <p className="font-bold">اعتماد إدارة الوكالة:</p>
                <p className="font-mono text-[10px] text-muted-foreground/80">
                  Digital Signature Verified
                </p>
              </div>
              <div className="text-left space-y-1">
                <p className="font-bold">تاريخ الإصدار:</p>
                <p className="font-mono text-[10px] tabular-nums">
                  {new Date().toISOString().slice(0, 10)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

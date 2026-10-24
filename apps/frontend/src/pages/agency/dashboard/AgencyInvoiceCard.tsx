import React from "react";
import { CheckCircle, Clock, MessageCircle, Plus, Printer, Trash2 } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  AgencyClient,
  ClientInvoiceStatement,
  PRICING_MODEL_LABELS,
} from "./types";

interface AgencyInvoiceCardProps {
  stmt: ClientInvoiceStatement;
  clientObj?: AgencyClient;
  currency: string;
  selectedMonth: string;
  getArabicMonthName: (m: string) => string;
  onToggleInvoicePaid: (clientId: string, isPaid: boolean) => void;
  onOpenFormalInvoice: (stmt: ClientInvoiceStatement) => void;
  onShareInvoiceWhatsApp: (stmt: ClientInvoiceStatement) => void;
  onOpenPerfModal: (client: AgencyClient) => void;
  onOpenExtraModal: (client: AgencyClient) => void;
  onDeleteExtraService: (clientId: string, serviceId: string) => void;
}

export const AgencyInvoiceCard: React.FC<AgencyInvoiceCardProps> = ({
  stmt,
  clientObj,
  currency,
  selectedMonth,
  getArabicMonthName,
  onToggleInvoicePaid,
  onOpenFormalInvoice,
  onShareInvoiceWhatsApp,
  onOpenPerfModal,
  onOpenExtraModal,
  onDeleteExtraService,
}) => {
  return (
    <Card className="border-border/60 hover:border-primary/40 transition-all shadow-xs">
      <CardContent className="p-3.5 sm:p-5 space-y-3.5 text-xs">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-base text-foreground">{stmt.clientName}</span>
            <Badge
              variant="outline"
              className={`text-[10px] font-bold ${
                PRICING_MODEL_LABELS[stmt.pricingModel]?.badgeColor
              }`}
            >
              {PRICING_MODEL_LABELS[stmt.pricingModel]?.label || stmt.pricingModel}
            </Badge>
            {stmt.isOffPlatform && (
              <Badge variant="secondary" className="text-[10px]">
                خارج المنصة
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Paid Status Toggle */}
            <button
              type="button"
              onClick={() => onToggleInvoicePaid(stmt.clientId, stmt.isPaid)}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                stmt.isPaid
                  ? "bg-emerald-500/15 text-emerald-600 border border-emerald-300 hover:bg-emerald-500/25"
                  : "bg-amber-500/15 text-amber-600 border border-amber-300 hover:bg-amber-500/25"
              }`}
            >
              {stmt.isPaid ? (
                <>
                  <CheckCircle className="size-3.5 text-emerald-600" />
                  <span>مسدد بالكامل</span>
                </>
              ) : (
                <>
                  <Clock className="size-3.5 text-amber-600" />
                  <span>معلق السداد (اضغط للتأكيد)</span>
                </>
              )}
            </button>

            {/* Formal Invoice Preview & Print Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-h-[36px] px-2.5 text-xs font-bold gap-1 border-border/80 hover:bg-muted"
              onClick={() => onOpenFormalInvoice(stmt)}
            >
              <Printer className="size-3.5 ml-1 text-primary" />
              معاينة الفاتورة
            </Button>

            {/* WhatsApp Share Button */}
            <Button
              type="button"
              size="sm"
              className="min-h-[36px] px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              onClick={() => onShareInvoiceWhatsApp(stmt)}
            >
              <MessageCircle className="size-3.5 ml-1" />
              مشاركة واتساب
            </Button>
          </div>
        </div>

        {/* Performance & Calculations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Box 1: Actual Performance */}
          <div className="p-3 bg-muted/20 rounded-xl space-y-1.5 border border-border/30">
            <p className="font-bold text-[11px] text-muted-foreground uppercase flex items-center justify-between">
              <span>أرقام الأداء ({getArabicMonthName(selectedMonth)})</span>
              {clientObj && (
                <button
                  type="button"
                  onClick={() => onOpenPerfModal(clientObj)}
                  className="text-primary hover:underline text-[10px] font-bold"
                >
                  تعديل الأرقام
                </button>
              )}
            </p>
            <div className="space-y-1 font-bold font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">الإنفاق الإعلاني:</span>
                <span className="text-primary font-black">
                  {stmt.performance.spend.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">المبيعات المحققة:</span>
                <span>
                  {stmt.performance.sales.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">الطلبات / القطع:</span>
                <span>
                  {stmt.performance.orders} طلب / {stmt.performance.units} قطعة
                </span>
              </div>
            </div>

            {/* ROAS, CPA, AOV Badges */}
            <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-border/30 text-[10px] text-center font-bold">
              <div className="bg-background/80 p-1 rounded-sm border border-border/40">
                <span className="text-muted-foreground block text-[9px]">عائد ROAS</span>
                <span className="text-emerald-600 font-black font-mono tabular-nums">
                  {stmt.performance.roas ||
                    (stmt.performance.spend > 0
                      ? (stmt.performance.sales / stmt.performance.spend).toFixed(2)
                      : 0)}
                  x
                </span>
              </div>
              <div className="bg-background/80 p-1 rounded-sm border border-border/40">
                <span className="text-muted-foreground block text-[9px]">تكلفة CPA</span>
                <span className="text-primary font-black font-mono tabular-nums">
                  {stmt.performance.cpa ||
                    (stmt.performance.orders > 0
                      ? Math.round(stmt.performance.spend / stmt.performance.orders)
                      : 0)}{" "}
                  {currency}
                </span>
              </div>
              <div className="bg-background/80 p-1 rounded-sm border border-border/40">
                <span className="text-muted-foreground block text-[9px]">متوسط AOV</span>
                <span className="text-foreground font-black font-mono tabular-nums">
                  {stmt.performance.aov ||
                    (stmt.performance.orders > 0
                      ? Math.round(stmt.performance.sales / stmt.performance.orders)
                      : 0)}{" "}
                  {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: Core Agency Fee */}
          <div className="p-3 bg-muted/20 rounded-xl space-y-1.5 border border-border/30">
            <p className="font-bold text-[11px] text-muted-foreground uppercase">
              أتعاب الوكالة الأساسية
            </p>
            <div className="space-y-1">
              <div className="flex justify-between items-baseline font-mono tabular-nums">
                <span className="text-muted-foreground font-bold font-sans">المستحق:</span>
                <span className="text-base font-black text-emerald-600">
                  {stmt.baseAgencyFee.toLocaleString()} {currency}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                {stmt.calculationExplanation}
              </p>
            </div>
          </div>

          {/* Box 3: Extra Services & Total */}
          <div className="p-3 bg-muted/20 rounded-xl space-y-1.5 border border-border/30">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[11px] text-muted-foreground uppercase">
                بنود إضافية ({stmt.extraServices.length})
              </p>
              {clientObj && (
                <button
                  type="button"
                  onClick={() => onOpenExtraModal(clientObj)}
                  className="text-emerald-600 font-bold hover:underline text-[10px] flex items-center"
                >
                  <Plus className="size-3 ml-0.5" />
                  إضافة بند
                </button>
              )}
            </div>

            {stmt.extraServices.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">
                لا توجد خدمات إضافية لهذا الشهر
              </p>
            ) : (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {stmt.extraServices.map((extra) => (
                  <div
                    key={extra.id}
                    className="flex items-center justify-between text-[11px] bg-background/60 p-1 rounded-sm"
                  >
                    <span className="font-medium truncate max-w-[140px]">{extra.title}</span>
                    <div className="flex items-center gap-1 shrink-0 font-black text-primary font-mono tabular-nums">
                      <span>
                        {extra.amount.toLocaleString()} {currency}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteExtraService(stmt.clientId, extra.id)}
                        className="size-6 rounded-sm flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 ml-1"
                        title="حذف البند"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-border/40 flex items-center justify-between font-mono tabular-nums">
              <span className="font-black text-xs font-sans">إجمالي الفاتورة:</span>
              <span className="font-black text-sm text-foreground">
                {stmt.totalAmount.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import React from "react";
import { Receipt, RefreshCw } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { AgencyInvoiceCard } from "./AgencyInvoiceCard";
import {
  AgencyClient,
  ClientInvoiceStatement,
  InvoicesResponse,
} from "./types";

interface AgencyInvoicesTabProps {
  selectedMonth: string;
  onMonthChange: (m: string) => void;
  invoicesLoading: boolean;
  onRefreshInvoices: (m: string) => void;
  invoicesData: InvoicesResponse | null;
  clients: AgencyClient[];
  currency: string;
  getArabicMonthName: (m: string) => string;
  onToggleInvoicePaid: (clientId: string, isPaid: boolean) => void;
  onOpenFormalInvoice: (stmt: ClientInvoiceStatement) => void;
  onShareInvoiceWhatsApp: (stmt: ClientInvoiceStatement) => void;
  onOpenPerfModal: (client: AgencyClient) => void;
  onOpenExtraModal: (client: AgencyClient) => void;
  onDeleteExtraService: (clientId: string, serviceId: string) => void;
  onNavigateToClients: () => void;
}

export const AgencyInvoicesTab: React.FC<AgencyInvoicesTabProps> = ({
  selectedMonth,
  onMonthChange,
  invoicesLoading,
  onRefreshInvoices,
  invoicesData,
  clients,
  currency,
  getArabicMonthName,
  onToggleInvoicePaid,
  onOpenFormalInvoice,
  onShareInvoiceWhatsApp,
  onOpenPerfModal,
  onOpenExtraModal,
  onDeleteExtraService,
  onNavigateToClients,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Bar with Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-3.5 sm:p-4 rounded-2xl border border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            <h2 className="text-base font-black text-foreground">كشوف حساب وفواتير الوكالة</h2>
            <Badge
              variant="secondary"
              className="text-[11px] font-bold bg-primary/10 text-primary border-primary/20"
            >
              {getArabicMonthName(selectedMonth)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            حساب أتعاب الوكالة آلياً بناءً على نموذج التسعير المعتمد، وإضافة النفقات الإضافية، والمشاركة عبر الواتساب
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-xs font-bold text-muted-foreground shrink-0 hidden sm:inline">
            شهر الفاتورة:
          </Label>
          <Input
            type="month"
            className="h-10 sm:h-9 flex-1 sm:w-44 text-base sm:text-xs font-bold bg-background rounded-xl"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onRefreshInvoices(selectedMonth)}
            className="h-10 sm:h-9 px-3 shrink-0 rounded-xl"
            title="تحديث الفواتير"
          >
            <RefreshCw
              className={`size-4 sm:size-3.5 ${invoicesLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Invoice Summary Cards */}
      {invoicesData?.summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3 sm:p-3.5 rounded-xl border border-border/60 bg-card/60">
            <p className="text-[11px] sm:text-xs font-bold text-muted-foreground">
              إجمالي المستحقات
            </p>
            <p className="text-lg sm:text-xl font-black mt-0.5 text-foreground font-mono tabular-nums">
              {invoicesData.summary.totalInvoiced.toLocaleString()} {currency}
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
              شامل الأتعاب والبنود الإضافية
            </p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl border border-border/60 bg-card/60">
            <p className="text-[11px] sm:text-xs font-bold text-muted-foreground">تم تحصيله</p>
            <p className="text-lg sm:text-xl font-black mt-0.5 text-emerald-600 font-mono tabular-nums">
              {invoicesData.summary.totalPaid.toLocaleString()} {currency}
            </p>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-0.5">
              فواتير مسددة بالكامل
            </p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl border border-border/60 bg-card/60">
            <p className="text-[11px] sm:text-xs font-bold text-muted-foreground">
              بانتظار التحصيل
            </p>
            <p className="text-lg sm:text-xl font-black mt-0.5 text-amber-600 font-mono tabular-nums">
              {invoicesData.summary.totalUnpaid.toLocaleString()} {currency}
            </p>
            <p className="text-[10px] sm:text-[11px] text-amber-600 font-bold mt-0.5">
              مبالغ مستحقة لم تسدد
            </p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl border border-border/60 bg-card/60">
            <p className="text-[11px] sm:text-xs font-bold text-muted-foreground">
              العملاء المفوترين
            </p>
            <p className="text-lg sm:text-xl font-black mt-0.5 text-primary font-mono tabular-nums">
              {invoicesData.summary.totalClientsCount} عميل
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
              لـ {getArabicMonthName(selectedMonth)}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Client Invoice Cards / Table */}
      {invoicesData?.statements && invoicesData.statements.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {invoicesData.statements.map((stmt) => (
            <AgencyInvoiceCard
              key={stmt.clientId}
              stmt={stmt}
              clientObj={clients.find((c) => c.id === stmt.clientId)}
              currency={currency}
              selectedMonth={selectedMonth}
              getArabicMonthName={getArabicMonthName}
              onToggleInvoicePaid={onToggleInvoicePaid}
              onOpenFormalInvoice={onOpenFormalInvoice}
              onShareInvoiceWhatsApp={onShareInvoiceWhatsApp}
              onOpenPerfModal={onOpenPerfModal}
              onOpenExtraModal={onOpenExtraModal}
              onDeleteExtraService={onDeleteExtraService}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 border border-dashed rounded-2xl bg-muted/10 space-y-3">
          <Receipt className="size-10 mx-auto text-muted-foreground/40" />
          <p className="text-sm font-bold text-foreground">
            لا توجد فواتير مسجلة لشهر {getArabicMonthName(selectedMonth)}
          </p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            أضف عملاءك أو سجل أداء الشهر لتوليد كشوف الحساب تلقائياً.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={onNavigateToClients}
            className="mt-1 h-9 text-xs font-bold"
          >
            الانتقال لإدارة العملاء
          </Button>
        </div>
      )}
    </div>
  );
};

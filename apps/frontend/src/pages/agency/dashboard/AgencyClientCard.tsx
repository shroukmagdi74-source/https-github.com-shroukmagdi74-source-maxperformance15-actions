import React from "react";
import {
  Edit2,
  FileSpreadsheet,
  Megaphone,
  MessageCircle,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import AgencyMetaSyncControl from "../AgencyMetaSyncControl";
import { AgencyClient, PRICING_MODEL_LABELS } from "./types";

interface AgencyClientCardProps {
  client: AgencyClient;
  currency: string;
  selectedMonth: string;
  onOpenPerfModal: (client: AgencyClient) => void;
  onOpenExtraModal: (client: AgencyClient) => void;
  onOpenFormalInvoiceFromClient: (client: AgencyClient) => void;
  onOpenEditClient: (client: AgencyClient) => void;
  onDeleteClient: (id: string, name: string) => void;
  onMetaSynced: () => void;
  onNavigateToMetaAds: (adAccountId: string) => void;
}

export const AgencyClientCard: React.FC<AgencyClientCardProps> = ({
  client,
  currency,
  selectedMonth,
  onOpenPerfModal,
  onOpenExtraModal,
  onOpenFormalInvoiceFromClient,
  onOpenEditClient,
  onDeleteClient,
  onMetaSynced,
  onNavigateToMetaAds,
}) => {
  const budget = Number(client.monthlyBudget) || 0;
  const spend = Number(client.currentSpend) || 0;
  const sales = Number(client.monthlySales) || 0;
  const orders = Number(client.monthlyOrders) || 0;
  const roas = spend > 0 ? (sales / spend).toFixed(2) : null;
  const cpa = orders > 0 ? Math.round(spend / orders) : null;
  const aov = orders > 0 ? Math.round(sales / orders) : null;
  const pacingPct = budget > 0 ? Math.round((spend / budget) * 100) : 0;
  const modelMeta =
    PRICING_MODEL_LABELS[client.pricingModel] || PRICING_MODEL_LABELS.RETAINER;

  const getStatusBadge = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-300 text-[10px] font-bold"
          >
            نشط
          </Badge>
        );
      case "lead":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 border-blue-300 text-[10px] font-bold"
          >
            عميل محتمل (Lead)
          </Badge>
        );
      case "paused":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 border-amber-300 text-[10px] font-bold"
          >
            متوقف مؤقتاً
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-zinc-500/10 text-zinc-600 border-zinc-300 text-[10px] font-bold"
          >
            مكتمل
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] font-bold">
            {status}
          </Badge>
        );
    }
  };

  const dailyLogsThisMonth = Array.isArray(client.dailyLogs)
    ? client.dailyLogs.filter((d: any) => d.date?.startsWith(selectedMonth))
    : [];

  return (
    <Card className="border-border/60 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between">
      <CardHeader className="p-3.5 sm:p-5 pb-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-black text-foreground">{client.name}</CardTitle>
            {client.contactPerson && (
              <p className="text-xs text-muted-foreground mt-0.5">{client.contactPerson}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {dailyLogsThisMonth.length > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold font-mono tabular-nums"
              >
                {dailyLogsThisMonth.length} يوم مسجل
              </Badge>
            )}
            {client.isOffPlatform && (
              <Badge variant="outline" className="text-[10px] bg-muted/40 font-bold">
                تتبع يدوي
              </Badge>
            )}
            {getStatusBadge(client.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 sm:p-5 pt-0 space-y-3 text-xs flex-1">
        {/* Model Details Box */}
        <div className="p-3 bg-muted/20 rounded-xl space-y-2 border border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-bold">نموذج الربح:</span>
            <Badge variant="outline" className={`text-[10px] font-bold ${modelMeta.badgeColor}`}>
              {modelMeta.label}
            </Badge>
          </div>

          {/* Model Specific Rates */}
          {client.pricingModel === "RETAINER" && (
            <div className="flex justify-between font-bold">
              <span className="text-muted-foreground">الاشتراك الشهري:</span>
              <span className="text-emerald-600 font-black font-mono tabular-nums">
                {client.baseRetainer?.toLocaleString()} {currency}
              </span>
            </div>
          )}
          {client.pricingModel === "PERCENT_SPEND" && (
            <div className="flex justify-between font-bold">
              <span className="text-muted-foreground">النسبة من الإنفاق:</span>
              <span className="text-blue-600 font-black font-mono tabular-nums">
                {client.pricingRate}% من المصروف
              </span>
            </div>
          )}
          {client.pricingModel === "PERCENT_SALES" && (
            <div className="flex justify-between font-bold">
              <span className="text-muted-foreground">النسبة من المبيعات:</span>
              <span className="text-purple-600 font-black font-mono tabular-nums">
                {client.pricingRate}% من الإيراد
              </span>
            </div>
          )}
          {client.pricingModel === "FIXED_ORDER" && (
            <div className="flex justify-between font-bold">
              <span className="text-muted-foreground">عمولة الأوردر:</span>
              <span className="text-amber-600 font-black font-mono tabular-nums">
                {client.feePerOrder} {currency} / طلب
              </span>
            </div>
          )}
          {client.pricingModel === "FIXED_ITEM" && (
            <div className="flex justify-between font-bold">
              <span className="text-muted-foreground">عمولة القطعة:</span>
              <span className="text-cyan-600 font-black font-mono tabular-nums">
                {client.feePerItem} {currency} / قطعة
              </span>
            </div>
          )}
          {client.pricingModel === "HYBRID" && (
            <div className="space-y-1 font-bold">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الاشتراك الثابت:</span>
                <span className="text-emerald-600 font-black font-mono tabular-nums">
                  {client.baseRetainer?.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-indigo-600 font-mono tabular-nums">
                <span>عمولة الأداء:</span>
                <span>
                  {client.hybridType === "PERCENT_SPEND"
                    ? `${client.pricingRate}% من الإنفاق`
                    : client.hybridType === "PERCENT_SALES"
                    ? `${client.pricingRate}% من المبيعات`
                    : `${client.feePerOrder} ${currency} / أوردر`}
                </span>
              </div>
            </div>
          )}

          {/* Spend Progress */}
          <div className="pt-1.5 border-t border-border/40 space-y-1">
            <div className="flex justify-between font-bold text-[11px] font-mono tabular-nums">
              <span className="text-muted-foreground font-sans">الإنفاق الإعلاني:</span>
              <span>
                <strong className="text-primary">{spend.toLocaleString()}</strong> /{" "}
                {budget.toLocaleString()} {currency}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  pacingPct > 100 ? "bg-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(pacingPct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ROAS & CPA Performance badges */}
        {(sales > 0 || orders > 0 || spend > 0) && (
          <div className="grid grid-cols-3 gap-1.5 p-2 bg-background/80 rounded-xl border border-border/50 text-[10px] text-center font-bold">
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground text-[9px]">عائد ROAS</span>
              <span
                className={`font-black font-mono tabular-nums ${
                  Number(roas) >= 3
                    ? "text-emerald-600"
                    : Number(roas) >= 2
                    ? "text-blue-600"
                    : "text-amber-600"
                }`}
              >
                {roas ? `${roas}x` : "—"}
              </span>
            </div>
            <div className="flex flex-col items-center border-x border-border/40">
              <span className="text-muted-foreground text-[9px]">تكلفة CPA</span>
              <span className="font-black text-foreground font-mono tabular-nums">
                {cpa ? `${cpa} ${currency}` : "—"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground text-[9px]">متوسط AOV</span>
              <span className="font-black text-foreground font-mono tabular-nums">
                {aov ? `${aov} ${currency}` : "—"}
              </span>
            </div>
          </div>
        )}

        {/* Sync control from Meta */}
        <AgencyMetaSyncControl
          clientId={client.id}
          adAccountId={client.adAccountId}
          dataSource={client.dataSource}
          lastSyncedAt={client.lastSyncedAt}
          onSynced={onMetaSynced}
        />

        {/* Action buttons on client card */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-[38px] sm:h-8 text-xs sm:text-[11px] font-bold bg-background hover:bg-muted/50"
            onClick={() => onOpenPerfModal(client)}
          >
            <FileSpreadsheet className="size-3.5 ml-1 text-primary" />
            تسجيل الأداء
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-[38px] sm:h-8 text-xs sm:text-[11px] font-bold bg-background hover:bg-muted/50"
            onClick={() => onOpenExtraModal(client)}
          >
            <Plus className="size-3.5 ml-1 text-emerald-600" />
            بند إضافي / نفقة
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-[38px] sm:h-8 text-xs sm:text-[11px] font-bold bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary col-span-2"
            onClick={() => onOpenFormalInvoiceFromClient(client)}
          >
            <Printer className="size-3.5 ml-1" />
            معاينة الفاتورة الرسمية والطباعة
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            {client.phone && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2.5 text-emerald-600 hover:bg-emerald-500/10 text-xs font-bold rounded-lg"
                onClick={() =>
                  window.open(
                    `https://wa.me/${client.phone?.replace(/[^0-9]/g, "")}`,
                    "_blank",
                  )
                }
              >
                <MessageCircle className="size-3.5 ml-1" />
                واتساب
              </Button>
            )}
            {client.adAccountId && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-blue-600 hover:bg-blue-500/10 text-xs font-bold rounded-lg"
                onClick={() => onNavigateToMetaAds(client.adAccountId!)}
                title="فتح حساب إعلانات ميتا للعميل"
              >
                <Megaphone className="size-3.5 ml-1" />
                ميتا ادز
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 sm:size-7 rounded-lg"
              onClick={() => onOpenEditClient(client)}
              title="تعديل العميل"
            >
              <Edit2 className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 sm:size-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => onDeleteClient(client.id, client.name)}
              title="حذف العميل"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

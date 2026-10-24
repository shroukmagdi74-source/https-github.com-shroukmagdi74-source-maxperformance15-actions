import React from "react";
import {
  DollarSign,
  ExternalLink,
  Plus,
  Receipt,
  Sliders,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { AgencyClient, PRICING_MODEL_LABELS } from "./types";

interface AgencyOverviewTabProps {
  overview: {
    totalClients: number;
    activeClients: number;
    totalBudget: number;
    totalSpend: number;
    totalRetainers: number;
    totalAgencyRevenue: number;
    unpaidInvoicesCount: number;
    totalUncollected: number;
    pendingApprovals: number;
    expectedPacingPercent: number;
    currentDay: number;
    daysInMonth: number;
  };
  clients: AgencyClient[];
  currency: string;
  onNavigateToClients: () => void;
  onOpenNewClient: () => void;
}

export const AgencyOverviewTab: React.FC<AgencyOverviewTabProps> = ({
  overview,
  clients,
  currency,
  onNavigateToClients,
  onOpenNewClient,
}) => {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
          <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-muted-foreground">
                عملاء الوكالة
              </p>
              <p className="text-xl sm:text-2xl font-black mt-0.5 text-foreground font-mono tabular-nums">
                {overview.totalClients}
              </p>
              <p className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-0.5 font-mono tabular-nums">
                {overview.activeClients} عميل نشط
              </p>
            </div>
            <div className="p-2 sm:p-2.5 bg-blue-500/10 text-blue-600 rounded-xl w-fit">
              <Users className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
          <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-muted-foreground">
                أرباح الوكالة (الشهر)
              </p>
              <p className="text-xl sm:text-2xl font-black mt-0.5 text-emerald-600 font-mono tabular-nums">
                {overview.totalAgencyRevenue.toLocaleString()} {currency}
              </p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                من كافة نماذج التسعير
              </p>
            </div>
            <div className="p-2 sm:p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl w-fit">
              <DollarSign className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
          <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-muted-foreground">
                استهلاك الميزانيات
              </p>
              <p className="text-sm sm:text-xl font-black mt-0.5 text-primary break-words font-mono tabular-nums">
                {overview.totalSpend.toLocaleString()} / {overview.totalBudget.toLocaleString()}{" "}
                {currency}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                  الإنفاق:
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-black px-1.5 py-0 font-mono tabular-nums ${
                    overview.totalBudget > 0 &&
                    overview.totalSpend / overview.totalBudget > 1
                      ? "bg-rose-500/10 text-rose-600 border-rose-300"
                      : "bg-blue-500/10 text-blue-600 border-blue-300"
                  }`}
                >
                  {overview.totalBudget > 0
                    ? Math.round((overview.totalSpend / overview.totalBudget) * 100)
                    : 0}
                  %
                </Badge>
              </div>
            </div>
            <div className="p-2 sm:p-2.5 bg-purple-500/10 text-purple-600 rounded-xl w-fit">
              <TrendingUp className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
          <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-muted-foreground">
                فواتير بانتظار التحصيل
              </p>
              <p className="text-xl sm:text-2xl font-black mt-0.5 text-amber-600 font-mono tabular-nums">
                {overview.totalUncollected.toLocaleString()} {currency}
              </p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 font-mono tabular-nums">
                {overview.unpaidInvoicesCount} غير مسددة
              </p>
            </div>
            <div className="p-2 sm:p-2.5 bg-amber-500/10 text-amber-600 rounded-xl w-fit">
              <Receipt className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Spend Tracker */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                معدل استهلاك الميزانيات الإعلانية (Pacing)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                متابعة الإنفاق الإعلاني الفعلي مقارنة بالميزانية المرصودة لتفادي تجاوز السقف الشهري
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToClients}
              className="text-xs font-bold w-fit"
            >
              إدارة العملاء
              <ExternalLink className="size-3.5 mr-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {clients.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-xl bg-muted/10 space-y-2">
              <Users className="size-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs font-bold text-muted-foreground">
                لا يوجد عملاء مضافون حتى الآن
              </p>
              <Button
                size="sm"
                onClick={onOpenNewClient}
                className="mt-2 text-xs font-bold h-9"
              >
                <Plus className="size-3.5 ml-1" />
                إضافة أول عميل للوكالة
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.slice(0, 5).map((c) => {
                const budget = Number(c.monthlyBudget) || 0;
                const spend = Number(c.currentSpend) || 0;
                const pct = budget > 0 ? Math.round((spend / budget) * 100) : 0;
                const isOver = pct > 100;

                return (
                  <div
                    key={c.id}
                    className="p-3 sm:p-3.5 rounded-xl border border-border/50 bg-background/50 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-black text-sm text-foreground">{c.name}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${PRICING_MODEL_LABELS[c.pricingModel]?.badgeColor}`}
                        >
                          {PRICING_MODEL_LABELS[c.pricingModel]?.label || c.pricingModel}
                        </Badge>
                        {c.isOffPlatform && (
                          <Badge variant="secondary" className="text-[10px] font-medium">
                            خارج المنصة
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 font-bold font-mono tabular-nums">
                        <span className="text-muted-foreground">
                          <strong className="text-foreground">{spend.toLocaleString()}</strong> /{" "}
                          {budget.toLocaleString()} {currency}
                        </span>
                        <Badge
                          className={`text-[10px] font-black ${
                            isOver ? "bg-rose-500 text-white" : "bg-emerald-600 text-white"
                          }`}
                        >
                          {pct}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? "bg-rose-500" : pct > 85 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

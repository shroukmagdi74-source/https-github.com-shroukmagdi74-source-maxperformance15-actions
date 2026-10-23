import React from "react";
import { useTranslation } from "react-i18next";
import { Users, ShoppingCart, UserPlus, Activity, BarChart2 } from "lucide-react";
import { Input } from "../../../components/ui/input";
import type { Audience } from "./types";

interface CustomerWhatsAppAudienceCardProps {
  audience: Audience;
  newDays: number;
  audienceCount: number | null;
  audienceLoading: boolean;
  onAudienceChange: (aud: Audience) => void;
  onNewDaysChange: (days: number) => void;
}

export const CustomerWhatsAppAudienceCard: React.FC<CustomerWhatsAppAudienceCardProps> = ({
  audience,
  newDays,
  audienceCount,
  audienceLoading,
  onAudienceChange,
  onNewDaysChange,
}) => {
  const { t } = useTranslation();

  const options = [
    {
      value: "withOrders" as Audience,
      label: t("whatsappNotify.audienceOptions.withOrders", "عملاء لديهم طلبات"),
      desc: t("whatsappNotify.audienceOptions.withOrdersDesc", "العملاء الذين أجروا عمليات شراء سابقة"),
      icon: ShoppingCart,
    },
    {
      value: "all" as Audience,
      label: t("whatsappNotify.audienceOptions.all", "جميع العملاء"),
      desc: t("whatsappNotify.audienceOptions.allDesc", "كافة جهات الاتصال المسجلة في المتجر"),
      icon: Users,
    },
    {
      value: "newCustomers" as Audience,
      label: t("whatsappNotify.audienceOptions.newCustomers", "العملاء الجدد"),
      desc: t("whatsappNotify.audienceOptions.newCustomersDesc", "المنضمين خلال فترة محددة"),
      icon: UserPlus,
    },
    {
      value: "activeCustomers" as Audience,
      label: t("whatsappNotify.audienceOptions.activeCustomers", "العملاء النشطون"),
      desc: t("whatsappNotify.audienceOptions.activeCustomersDesc", "تفاعلوا أو طلبوا مؤخراً"),
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/50 pb-3">
        <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-sm font-semibold text-foreground">
          {t("whatsappNotify.audienceTarget", "تحديد شريحة الجمهور المستهدفة")}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = audience === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAudienceChange(opt.value)}
              className={`flex flex-col text-start p-3 rounded-lg border transition-colors ${
                isSelected
                  ? "border-emerald-500/60 bg-emerald-500/10 text-foreground dark:bg-emerald-500/15"
                  : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <Icon
                  className={`h-4 w-4 ${
                    isSelected
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                />
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </div>
              <span className="text-xs font-semibold text-foreground">
                {opt.label}
              </span>
              <span className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Days Input for New Customers */}
      {audience === "newCustomers" && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2.5">
          <span className="text-xs text-foreground font-medium">
            {t("whatsappNotify.joinedInLast", "انضموا خلال آخر:")}
          </span>
          <Input
            type="number"
            min={1}
            max={365}
            value={newDays}
            onChange={(e) => onNewDaysChange(Number(e.target.value) || 7)}
            className="h-7 w-20 font-mono text-xs tabular-nums text-center"
          />
          <span className="text-xs text-muted-foreground">
            {t("whatsappNotify.days", "يوم")}
          </span>
        </div>
      )}

      {/* Audience Counter Summary */}
      <div className="flex items-center justify-between rounded-md border border-border/50 bg-muted/30 p-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">
              {t("whatsappNotify.willSendTo", "إجمالي المستلمين المتوقع")}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("whatsappNotify.realCustomers", "أرقام هواتف موثقة في النظام")}
            </p>
          </div>
        </div>

        <div>
          {audienceLoading ? (
            <div className="h-6 w-14 bg-muted animate-pulse rounded" />
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-lg font-bold tabular-nums text-foreground">
                {audienceCount?.toLocaleString() ?? 0}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t("whatsappNotify.customer", "عميل")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

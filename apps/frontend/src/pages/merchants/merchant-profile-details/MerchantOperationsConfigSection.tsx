import React from "react";
import { TruckIcon } from "@heroicons/react/24/outline";
import {
  fulfillmentModeLabels,
  InfoRow,
  MerchantRecord,
  MerchantWarehouse,
  ShippingCompany,
} from "./types";

interface MerchantOperationsConfigSectionProps {
  merchant: MerchantRecord;
  fulfillmentMode: string;
  defaultWarehouse?: MerchantWarehouse | null;
  defaultShippingCompany?: ShippingCompany | null;
}

export const MerchantOperationsConfigSection: React.FC<MerchantOperationsConfigSectionProps> = ({
  merchant,
  fulfillmentMode,
  defaultWarehouse,
  defaultShippingCompany,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <TruckIcon className="h-5 w-5 text-slate-500" />
        <h2 className="text-lg font-bold">إعدادات التشغيل</h2>
      </div>
      <div className="mt-4">
        <InfoRow
          label="مسار التنفيذ"
          value={fulfillmentModeLabels[fulfillmentMode] || fulfillmentMode}
        />
        <InfoRow
          label="التنفيذ التلقائي"
          value={merchant.autoFulfill ? "مفعل" : "غير مفعل"}
        />
        <InfoRow
          label="المخزن الافتراضي"
          value={defaultWarehouse?.name || "غير محدد"}
        />
        <InfoRow
          label="شركة الشحن"
          value={defaultShippingCompany?.name || "غير محدد"}
        />
        <InfoRow
          label="Webhook"
          value={
            merchant.webhookUrl ? (
              <span className="break-all font-mono text-xs">{merchant.webhookUrl}</span>
            ) : (
              "غير محدد"
            )
          }
        />
      </div>
    </section>
  );
};

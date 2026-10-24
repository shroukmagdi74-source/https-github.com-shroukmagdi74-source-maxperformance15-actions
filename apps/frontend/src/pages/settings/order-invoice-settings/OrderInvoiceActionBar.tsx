import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Loader2,
  Printer,
  RefreshCcw,
  RotateCcw,
  Save,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OrderInvoiceActionBarProps {
  saving: boolean;
  onRefresh: () => void;
  onResetInvoice: () => void;
  onSaveAll: () => void;
}

export function OrderInvoiceActionBar({
  saving,
  onRefresh,
  onResetInvoice,
  onSaveAll,
}: OrderInvoiceActionBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-5 xl:flex-row xl:items-center xl:justify-between dark:border-slate-800 dark:bg-slate-900/60">
      <div className="grid gap-3 sm:grid-cols-3 xl:flex xl:flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-2xl"
          onClick={() => navigate("/orders/invoices")}
        >
          <FileText className="size-4" />
          <span>سجل الفواتير</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-2xl"
          onClick={() => navigate("/orders/invoices/print-multiple")}
        >
          <Printer className="size-4" />
          <span>طباعة متعددة</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-2xl"
          onClick={() => navigate("/settings/orders?tab=preparation")}
        >
          <Workflow className="size-4" />
          <span>تجهيز الطلبات التشغيلي</span>
        </Button>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-2xl"
          onClick={onRefresh}
          disabled={saving}
        >
          <RefreshCcw className="size-4" />
          <span>إعادة تحميل</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-2xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
          onClick={onResetInvoice}
          disabled={saving}
        >
          <RotateCcw className="size-4" />
          <span>إعادة الفاتورة</span>
        </Button>
        <Button
          type="button"
          size="lg"
          className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700"
          onClick={onSaveAll}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          <span>
            {saving
              ? t("orderInvoiceSettings.k_95")
              : t("orderInvoiceSettings.k_96")}
          </span>
        </Button>
      </div>
    </div>
  );
}

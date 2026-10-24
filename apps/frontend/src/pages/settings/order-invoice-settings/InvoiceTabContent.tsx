import React from "react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Palette,
  ScanText,
  Settings2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SettingsSection } from "../components/SettingsPagePrimitives";
import { ToggleCard } from "./ToggleCard";
import {
  statuses,
  type InvoiceSettings,
} from "./types";

export interface InvoiceTabContentProps {
  invoice: InvoiceSettings;
  invoiceFlags: readonly (readonly [keyof InvoiceSettings, string])[];
  barcodeFlags: readonly (readonly [keyof InvoiceSettings, string])[];
  labelForStatus: (status: string) => string;
  onUpdateInvoice: (updates: Partial<InvoiceSettings>) => void;
}

export function InvoiceTabContent({
  invoice,
  invoiceFlags,
  barcodeFlags,
  labelForStatus,
  onUpdateInvoice,
}: InvoiceTabContentProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 pt-0">
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Automation & Numbering */}
        <SettingsSection
          icon={Settings2}
          title={t("orderInvoiceSettings.k_6")}
          description={t("orderInvoiceSettings.k_7")}
          accentClassName="bg-sky-50 text-sky-700 ring-sky-200/70 dark:bg-sky-950/40 dark:text-sky-300"
          surfaceClassName="bg-white/90 dark:bg-slate-900/60"
        >
          <ToggleCard
            title={t("orderInvoiceSettings.k_8")}
            description={t("orderInvoiceSettings.k_9")}
            checked={invoice.autoGenerate}
            onCheckedChange={(checked) =>
              onUpdateInvoice({ autoGenerate: checked })
            }
          />

          {invoice.autoGenerate && (
            <div className="space-y-2">
              <Label htmlFor="auto-generate-status">
                توليد الفاتورة عند الحالة
              </Label>
              <Select
                value={invoice.autoGenerateOnStatus}
                onValueChange={(value) =>
                  onUpdateInvoice({ autoGenerateOnStatus: value })
                }
              >
                <SelectTrigger
                  id="auto-generate-status"
                  aria-label={t("orderInvoiceSettings.k_10")}
                  className="h-11 rounded-xl"
                >
                  <span className="flex flex-1 text-start font-medium">
                    {invoice.autoGenerateOnStatus
                      ? labelForStatus(invoice.autoGenerateOnStatus)
                      : t("orderInvoiceSettings.k_70")}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {labelForStatus(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice-prefix">
                {t("orderInvoiceSettings.k_34")}
              </Label>
              <Input
                id="invoice-prefix"
                value={invoice.invoicePrefix}
                onChange={(e) =>
                  onUpdateInvoice({ invoicePrefix: e.target.value })
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-number-format">
                تنسيق رقم الفاتورة
              </Label>
              <Input
                id="invoice-number-format"
                value={invoice.invoiceNumberFormat}
                onChange={(e) =>
                  onUpdateInvoice({ invoiceNumberFormat: e.target.value })
                }
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="rounded-[20px] border border-dashed border-sky-200 bg-sky-50/80 p-4 dark:border-sky-800 dark:bg-sky-950/20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
              معاينة رقم الفاتورة
            </p>
            <p className="mt-2 text-sm font-bold font-mono tabular-nums text-slate-950 dark:text-slate-100" dir="ltr">
              {invoice.invoicePrefix || "INV"}-20260429-000001
            </p>
          </div>
        </SettingsSection>

        {/* Financial Defaults */}
        <SettingsSection
          icon={ScanText}
          title={t("orderInvoiceSettings.k_11")}
          description={t("orderInvoiceSettings.k_12")}
          accentClassName="bg-indigo-50 text-indigo-700 ring-indigo-200/70 dark:bg-indigo-950/40 dark:text-indigo-300"
          surfaceClassName="bg-white/90 dark:bg-slate-900/60"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default-tax-rate">
                {t("orderInvoiceSettings.k_35")}
              </Label>
              <Input
                id="default-tax-rate"
                type="number"
                value={invoice.defaultTaxRate}
                onChange={(e) =>
                  onUpdateInvoice({
                    defaultTaxRate: Number(e.target.value) || 0,
                  })
                }
                className="h-11 rounded-xl font-mono tabular-nums"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-due-days">
                {t("orderInvoiceSettings.k_36")}
              </Label>
              <Input
                id="default-due-days"
                type="number"
                value={invoice.defaultDueDays}
                onChange={(e) =>
                  onUpdateInvoice({
                    defaultDueDays: Number(e.target.value) || 0,
                  })
                }
                className="h-11 rounded-xl font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-terms">
              {t("orderInvoiceSettings.k_37")}
            </Label>
            <Textarea
              id="default-terms"
              rows={3}
              value={invoice.defaultTerms}
              onChange={(e) =>
                onUpdateInvoice({ defaultTerms: e.target.value })
              }
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-notes">
              {t("orderInvoiceSettings.k_38")}
            </Label>
            <Textarea
              id="default-notes"
              rows={3}
              value={invoice.defaultNotes}
              onChange={(e) =>
                onUpdateInvoice({ defaultNotes: e.target.value })
              }
              className="rounded-2xl"
            />
          </div>
        </SettingsSection>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Visible Elements & Barcode */}
        <SettingsSection
          icon={Palette}
          title={t("orderInvoiceSettings.k_13")}
          description={t("orderInvoiceSettings.k_14")}
          accentClassName="bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300"
          surfaceClassName="bg-white/90 dark:bg-slate-900/60"
        >
          <div className="space-y-3">
            {invoiceFlags.map(([key, label]) => (
              <ToggleCard
                key={String(key)}
                title={label}
                description={t("orderInvoiceSettings.k_15", { label })}
                checked={Boolean(invoice[key])}
                onCheckedChange={(checked) =>
                  onUpdateInvoice({ [key]: checked })
                }
              />
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              إعدادات الباركود
            </p>
            {barcodeFlags.map(([key, label]) => (
              <ToggleCard
                key={String(key)}
                title={label}
                description={t("orderInvoiceSettings.k_15", { label })}
                checked={Boolean(invoice[key])}
                onCheckedChange={(checked) =>
                  onUpdateInvoice({ [key]: checked })
                }
              />
            ))}
          </div>
        </SettingsSection>

        {/* Customer Notifications */}
        <SettingsSection
          icon={Mail}
          title={t("orderInvoiceSettings.k_16")}
          description={t("orderInvoiceSettings.k_17")}
          accentClassName="bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300"
          surfaceClassName="bg-white/90 dark:bg-slate-900/60"
        >
          <ToggleCard
            title={t("orderInvoiceSettings.k_18")}
            description={t("orderInvoiceSettings.k_19")}
            checked={invoice.autoEmailToCustomer}
            onCheckedChange={(checked) =>
              onUpdateInvoice({ autoEmailToCustomer: checked })
            }
          />

          <div className="space-y-2">
            <Label htmlFor="email-subject">
              {t("orderInvoiceSettings.k_20")}
            </Label>
            <Input
              id="email-subject"
              value={invoice.emailSubject}
              onChange={(e) =>
                onUpdateInvoice({ emailSubject: e.target.value })
              }
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-body">
              {t("orderInvoiceSettings.k_21")}
            </Label>
            <Textarea
              id="email-body"
              rows={5}
              value={invoice.emailBody}
              onChange={(e) =>
                onUpdateInvoice({ emailBody: e.target.value })
              }
              className="rounded-2xl"
            />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

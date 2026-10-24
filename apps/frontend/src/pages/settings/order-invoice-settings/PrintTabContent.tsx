import React from "react";
import { useTranslation } from "react-i18next";
import { FileOutput, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSection } from "../components/SettingsPagePrimitives";
import type { InvoiceSettings } from "./types";

export interface PrintTabContentProps {
  invoice: InvoiceSettings;
  orientationLabelMap: Record<string, string>;
  onUpdateInvoice: (updates: Partial<InvoiceSettings>) => void;
}

export function PrintTabContent({
  invoice,
  orientationLabelMap,
  onUpdateInvoice,
}: PrintTabContentProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-5 xl:grid-cols-2 pt-0">
      {/* Layout & Typography */}
      <SettingsSection
        icon={FileOutput}
        title={t("orderInvoiceSettings.k_22")}
        description={t("orderInvoiceSettings.k_23")}
        accentClassName="bg-cyan-50 text-cyan-700 ring-cyan-200/70 dark:bg-cyan-950/40 dark:text-cyan-300"
        surfaceClassName="bg-white/90 dark:bg-slate-900/60"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pdf-page-size">
              {t("orderInvoiceSettings.k_24")}
            </Label>
            <Select
              value={invoice.pdfPageSize}
              onValueChange={(value) =>
                onUpdateInvoice({
                  pdfPageSize: value as InvoiceSettings["pdfPageSize"],
                })
              }
            >
              <SelectTrigger
                id="pdf-page-size"
                aria-label={t("orderInvoiceSettings.k_24")}
                className="h-11 rounded-xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf-orientation">
              {t("orderInvoiceSettings.k_25")}
            </Label>
            <Select
              value={invoice.pdfOrientation}
              onValueChange={(value) =>
                onUpdateInvoice({
                  pdfOrientation: value as InvoiceSettings["pdfOrientation"],
                })
              }
            >
              <SelectTrigger
                id="pdf-orientation"
                aria-label={t("orderInvoiceSettings.k_25")}
                className="h-11 rounded-xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">
                  {orientationLabelMap.portrait}
                </SelectItem>
                <SelectItem value="landscape">
                  {orientationLabelMap.landscape}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="font-family">
            {t("orderInvoiceSettings.k_26")}
          </Label>
          <Select
            value={invoice.fontFamily}
            onValueChange={(value) =>
              onUpdateInvoice({ fontFamily: value })
            }
          >
            <SelectTrigger
              id="font-family"
              aria-label={t("orderInvoiceSettings.k_26")}
              className="h-11 rounded-xl"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Cairo">Cairo</SelectItem>
              <SelectItem value="Tahoma">Tahoma</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>

      {/* Brand Colors */}
      <SettingsSection
        icon={Palette}
        title={t("orderInvoiceSettings.k_27")}
        description={t("orderInvoiceSettings.k_28")}
        accentClassName="bg-violet-50 text-violet-700 ring-violet-200/70 dark:bg-violet-950/40 dark:text-violet-300"
        surfaceClassName="bg-white/90 dark:bg-slate-900/60"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primary-color">
              {t("orderInvoiceSettings.k_29")}
            </Label>
            <div className="flex items-center gap-3">
              <input
                id="primary-color"
                type="color"
                value={invoice.primaryColor}
                onChange={(e) =>
                  onUpdateInvoice({ primaryColor: e.target.value })
                }
                className="size-11 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-800"
              />
              <Input
                value={invoice.primaryColor}
                onChange={(e) =>
                  onUpdateInvoice({ primaryColor: e.target.value })
                }
                className="h-11 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">
              {t("orderInvoiceSettings.k_30")}
            </Label>
            <div className="flex items-center gap-3">
              <input
                id="secondary-color"
                type="color"
                value={invoice.secondaryColor}
                onChange={(e) =>
                  onUpdateInvoice({ secondaryColor: e.target.value })
                }
                className="size-11 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-800"
              />
              <Input
                value={invoice.secondaryColor}
                onChange={(e) =>
                  onUpdateInvoice({ secondaryColor: e.target.value })
                }
                className="h-11 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

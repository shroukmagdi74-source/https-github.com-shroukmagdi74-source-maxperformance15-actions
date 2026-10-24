import React from "react";
import { useTranslation } from "react-i18next";
import {
  FileSpreadsheet,
  PackageCheck,
  ScanText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SettingsSection } from "../components/SettingsPagePrimitives";
import { ToggleCard } from "./ToggleCard";
import type { SlipSettings } from "./types";

export interface SlipTabContentProps {
  slip: SlipSettings;
  slipFlags: readonly (readonly [keyof SlipSettings, string])[];
  orientationLabelMap: Record<string, string>;
  onUpdateSlip: (updates: Partial<SlipSettings>) => void;
}

export function SlipTabContent({
  slip,
  slipFlags,
  orientationLabelMap,
  onUpdateSlip,
}: SlipTabContentProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 pt-0">
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Document Setup */}
        <SettingsSection
          icon={PackageCheck}
          title={t("orderInvoiceSettings.k_41")}
          description={t("orderInvoiceSettings.k_42")}
          accentClassName="bg-blue-50 text-blue-700 ring-blue-200/70 dark:bg-blue-950/40 dark:text-blue-300"
          surfaceClassName="bg-white/90 dark:bg-slate-900/60"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slip-title">
                {t("orderInvoiceSettings.k_43")}
              </Label>
              <Input
                id="slip-title"
                value={slip.documentTitle}
                onChange={(e) =>
                  onUpdateSlip({ documentTitle: e.target.value })
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slip-subtitle">
                {t("orderInvoiceSettings.k_44")}
              </Label>
              <Input
                id="slip-subtitle"
                value={slip.documentSubtitle}
                onChange={(e) =>
                  onUpdateSlip({ documentSubtitle: e.target.value })
                }
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slip-page-size">
                {t("orderInvoiceSettings.k_45")}
              </Label>
              <Select
                value={slip.pageSize}
                onValueChange={(value) =>
                  onUpdateSlip({
                    pageSize: value as SlipSettings["pageSize"],
                  })
                }
              >
                <SelectTrigger
                  id="slip-page-size"
                  aria-label={t("orderInvoiceSettings.k_45")}
                  className="h-11 rounded-xl"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="A5">A5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slip-orientation">
                {t("orderInvoiceSettings.k_25")}
              </Label>
              <Select
                value={slip.pageOrientation}
                onValueChange={(value) =>
                  onUpdateSlip({
                    pageOrientation: value as SlipSettings["pageOrientation"],
                  })
                }
              >
                <SelectTrigger
                  id="slip-orientation"
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
            <Label htmlFor="slip-accent-color">
              {t("orderInvoiceSettings.k_47")}
            </Label>
            <div className="flex items-center gap-3">
              <input
                id="slip-accent-color"
                type="color"
                value={slip.accentColor}
                onChange={(e) =>
                  onUpdateSlip({ accentColor: e.target.value })
                }
                className="size-11 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-800"
              />
              <Input
                value={slip.accentColor}
                onChange={(e) =>
                  onUpdateSlip({ accentColor: e.target.value })
                }
                className="h-11 rounded-xl font-mono"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Operational Display Flags */}
        <SettingsSection
          icon={FileSpreadsheet}
          title={t("orderInvoiceSettings.k_31")}
          description={t("orderInvoiceSettings.k_32")}
          accentClassName="bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300"
          surfaceClassName="bg-white/90 dark:bg-slate-900/60"
        >
          <div className="space-y-3">
            {slipFlags.map(([key, label]) => (
              <ToggleCard
                key={String(key)}
                title={label}
                description={t("orderInvoiceSettings.k_48", { label })}
                checked={Boolean(slip[key])}
                onCheckedChange={(checked) =>
                  onUpdateSlip({ [key]: checked })
                }
              />
            ))}
          </div>
        </SettingsSection>
      </div>

      {/* Instructions & Notes */}
      <SettingsSection
        icon={ScanText}
        title="تعليمات التشغيل وملاحظات التجهيز"
        description="توجيهات تظهر للمجهز داخل مستند التجهيز لتسهيل إعداد وتغليف الشحنة بدقة."
        accentClassName="bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-800 dark:text-slate-200"
        surfaceClassName="bg-white/90 dark:bg-slate-900/60"
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slip-instructions">
              تعليمات التجهيز الافتراضية
            </Label>
            <Textarea
              id="slip-instructions"
              rows={4}
              value={slip.preparationInstructions}
              onChange={(e) =>
                onUpdateSlip({ preparationInstructions: e.target.value })
              }
              className="rounded-2xl"
              placeholder="اكتب تعليمات التجهيز التي تظهر للمجهز..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slip-footer">
              ملاحظة التذييل في مستند التجهيز
            </Label>
            <Textarea
              id="slip-footer"
              rows={4}
              value={slip.footerNote}
              onChange={(e) =>
                onUpdateSlip({ footerNote: e.target.value })
              }
              className="rounded-2xl"
              placeholder="ملاحظة ختامية في أسفل مستند التجهيز..."
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

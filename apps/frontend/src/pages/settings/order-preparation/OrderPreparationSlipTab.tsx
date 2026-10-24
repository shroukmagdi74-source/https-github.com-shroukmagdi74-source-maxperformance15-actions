import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToggleRow } from "./ToggleRow";
import { OrderPreparationSlipLivePreview } from "./OrderPreparationSlipLivePreview";
import type { PreparationSlipDocumentSettings } from "./types";

export interface OrderPreparationSlipTabProps {
  slipDocument: PreparationSlipDocumentSettings;
  onUpdateSlip: <K extends keyof PreparationSlipDocumentSettings>(
    key: K,
    value: PreparationSlipDocumentSettings[K],
  ) => void;
}

const DOCUMENT_COLUMNS: Array<{
  key: keyof Pick<
    PreparationSlipDocumentSettings,
    | "showCompanyName"
    | "showCustomerEmail"
    | "showOrderNotes"
    | "showPaymentSummary"
    | "showFinancialSummary"
  >;
  label: string;
}> = [
  { key: "showCompanyName", label: "إظهار اسم الشركة" },
  { key: "showCustomerEmail", label: "إظهار البريد الإلكتروني" },
  { key: "showOrderNotes", label: "إظهار ملاحظات الطلب" },
  { key: "showPaymentSummary", label: "إظهار ملخص الدفع" },
  { key: "showFinancialSummary", label: "إظهار الملخص المالي" },
];

const ITEM_COLUMNS: Array<{
  key: keyof Pick<
    PreparationSlipDocumentSettings,
    | "showItemSku"
    | "showItemDetails"
    | "showItemColor"
    | "showItemSize"
    | "showItemPrice"
    | "showItemTotal"
  >;
  label: string;
}> = [
  { key: "showItemSku", label: "SKU" },
  { key: "showItemDetails", label: "التفاصيل" },
  { key: "showItemColor", label: "اللون" },
  { key: "showItemSize", label: "المقاس" },
  { key: "showItemPrice", label: "السعر" },
  { key: "showItemTotal", label: "الإجمالي" },
];

export const OrderPreparationSlipTab: React.FC<OrderPreparationSlipTabProps> = ({
  slipDocument,
  onUpdateSlip,
}) => {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Settings Form Column */}
      <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/90">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
            إعدادات ورقة التجهيز
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            تحكم في شكل المستند الذي يخرج عند طباعة ورقة التجهيز
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              عنوان المستند
            </Label>
            <Input
              value={slipDocument.documentTitle}
              onChange={(e) => onUpdateSlip("documentTitle", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              الوصف المختصر
            </Label>
            <Input
              value={slipDocument.documentSubtitle}
              onChange={(e) => onUpdateSlip("documentSubtitle", e.target.value)}
            />
          </div>

          <Separator className="border-slate-200/80 dark:border-slate-800" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                مقاس الصفحة
              </Label>
              <Select
                value={slipDocument.pageSize}
                onValueChange={(v: "A4" | "A5") => onUpdateSlip("pageSize", v)}
              >
                <SelectTrigger className="border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="A5">A5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                اتجاه الصفحة
              </Label>
              <Select
                value={slipDocument.pageOrientation}
                onValueChange={(v: "portrait" | "landscape") =>
                  onUpdateSlip("pageOrientation", v)
                }
              >
                <SelectTrigger className="border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">رأسي</SelectItem>
                  <SelectItem value="landscape">أفقي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              اللون الرئيسي
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={slipDocument.accentColor}
                onChange={(e) => onUpdateSlip("accentColor", e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border p-0.5"
              />
              <Input
                value={slipDocument.accentColor}
                onChange={(e) => onUpdateSlip("accentColor", e.target.value)}
                className="w-32 font-mono"
              />
            </div>
          </div>

          <Separator className="border-slate-200/80 dark:border-slate-800" />

          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              الأعمدة الظاهرة
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {DOCUMENT_COLUMNS.map((item) => (
                <ToggleRow
                  key={item.key}
                  title={item.label}
                  description=""
                  checked={slipDocument[item.key]}
                  onChange={(v) => onUpdateSlip(item.key, v)}
                />
              ))}
            </div>
          </div>

          <Separator className="border-slate-200/80 dark:border-slate-800" />

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              أعمدة المنتجات
            </Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {ITEM_COLUMNS.map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80"
                >
                  <Switch
                    checked={slipDocument[item.key]}
                    onCheckedChange={(v) => onUpdateSlip(item.key, v)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator className="border-slate-200/80 dark:border-slate-800" />

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              تعليمات التجهيز
            </Label>
            <Textarea
              value={slipDocument.preparationInstructions}
              onChange={(e) => onUpdateSlip("preparationInstructions", e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              نص الفوتر
            </Label>
            <Textarea
              value={slipDocument.footerNote}
              onChange={(e) => onUpdateSlip("footerNote", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Column */}
      <OrderPreparationSlipLivePreview slipDocument={slipDocument} />
    </div>
  );
};

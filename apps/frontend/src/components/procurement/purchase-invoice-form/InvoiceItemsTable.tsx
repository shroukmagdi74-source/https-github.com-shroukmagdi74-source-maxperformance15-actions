import React from "react";
import {
  PackageCheck,
  Lightbulb,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ProcurementItemCombobox,
  ProcurementCatalogItem,
} from "../components";
import { formatCurrency } from "../../../utils/currency";
import { InvoiceItem } from "./types";

export interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  catalogItems: ProcurementCatalogItem[];
  showAdvancedItemColumns: boolean;
  itemInputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  updateItem: (index: number, field: keyof InvoiceItem, value: any) => void;
  updateItemDetails: (index: number, updates: Partial<InvoiceItem>) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  handlePriceKeyDown: (e: React.KeyboardEvent, index: number) => void;
  handleOpenQuickAddProduct: (index: number, initialName: string) => void;
  setCatalogModalOpen: (open: boolean) => void;
  t: (key: string, fallback: string) => string;
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
  items,
  catalogItems,
  showAdvancedItemColumns,
  itemInputRefs,
  updateItem,
  updateItemDetails,
  addItem,
  removeItem,
  handlePriceKeyDown,
  handleOpenQuickAddProduct,
  setCatalogModalOpen,
  t,
}) => {
  return (
    <Card
      className="border border-border/70 shadow-2xs relative z-20 overflow-visible bg-card"
      size="sm"
    >
      <CardContent className="p-4 sm:p-5 space-y-3.5 overflow-visible">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="size-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              {t("procurement.purchaseInvoiceForm.itemsSection", "بنود الفاتورة")}
            </h2>
            <span className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-full tabular-nums">
              {items.length} {items.length === 1 ? "صنف" : "أصناف"}
            </span>
          </div>

          <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
            <Lightbulb className="size-3.5 text-amber-500 shrink-0" />
            <span>
              اضغط{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
                Enter
              </kbd>{" "}
              في خانة السعر لإضافة سطر جديد فوراً
            </span>
          </span>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:block overflow-visible">
          <Table>
            <TableHeader className="bg-muted/40 rounded-xl">
              <TableRow className="border-b border-border/60">
                <TableHead className="min-w-[260px] font-bold text-foreground">
                  {t("procurement.purchaseInvoiceForm.columnItem", "الصنف / الخامة")}
                </TableHead>
                <TableHead className="w-[100px] text-center font-bold text-foreground">
                  {t("procurement.purchaseInvoiceForm.columnQuantity", "الكمية")}
                </TableHead>
                <TableHead className="w-[125px] text-center font-bold text-foreground">
                  {t("procurement.purchaseInvoiceForm.columnUnitPrice", "سعر الوحدة")}
                </TableHead>
                {showAdvancedItemColumns && (
                  <>
                    <TableHead className="w-[90px] text-center font-bold text-foreground">
                      {t("procurement.purchaseInvoiceForm.columnTax", "الضريبة %")}
                    </TableHead>
                    <TableHead className="w-[90px] text-center font-bold text-foreground">
                      {t("procurement.purchaseInvoiceForm.columnDiscount", "الخصم %")}
                    </TableHead>
                  </>
                )}
                <TableHead className="w-[125px] text-right font-bold text-foreground">
                  {t("procurement.purchaseInvoiceForm.columnTotal", "الإجمالي")}
                </TableHead>
                <TableHead className="w-[44px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="relative overflow-visible py-2">
                    <ProcurementItemCombobox
                      value={item.productName}
                      initialCatalog={catalogItems}
                      placeholder={t(
                        "procurement.purchaseInvoiceForm.itemPlaceholder",
                        "اختر صنفاً أو اكتب اسمه...",
                      )}
                      onAddNewProduct={(typedName) => handleOpenQuickAddProduct(index, typedName)}
                      onSelect={(selected) => {
                        updateItemDetails(index, {
                          productId: selected.productId,
                          variantId: selected.variantId || null,
                          productName: selected.productName,
                          unitPrice:
                            selected.unitPrice !== undefined
                              ? selected.unitPrice
                              : item.unitPrice,
                          description: selected.description || item.description,
                        });
                      }}
                    />
                    {!item.productId && item.productName.trim() && (
                      <button
                        type="button"
                        onClick={() => handleOpenQuickAddProduct(index, item.productName)}
                        className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mt-1 font-medium transition-colors"
                      >
                        <AlertCircle className="size-3 shrink-0" />
                        <span>غير مسجل بالمخزن — اضغط هنا لإضافته كمنتج جديد</span>
                      </button>
                    )}
                  </TableCell>

                  {/* Quantity */}
                  <TableCell className="py-2">
                    <Input
                      type="number"
                      min="1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="h-10 text-center font-mono tabular-nums rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </TableCell>

                  {/* Unit Price */}
                  <TableCell className="py-2">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                      onKeyDown={(e) => handlePriceKeyDown(e, index)}
                      className="h-10 text-center font-mono tabular-nums rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </TableCell>

                  {/* Optional Advanced Columns */}
                  {showAdvancedItemColumns && (
                    <>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={item.taxRate}
                          onChange={(e) => updateItem(index, "taxRate", e.target.value)}
                          className="h-10 text-center font-mono tabular-nums rounded-xl"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={item.discountRate}
                          onChange={(e) => updateItem(index, "discountRate", e.target.value)}
                          className="h-10 text-center font-mono tabular-nums rounded-xl"
                        />
                      </TableCell>
                    </>
                  )}

                  {/* Line Total */}
                  <TableCell className="text-right font-mono font-bold text-sm text-foreground py-2 tabular-nums">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>

                  {/* Remove Button */}
                  <TableCell className="text-center py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View: Single-depth cards per item */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl border border-border bg-card/60 space-y-3 relative shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono tabular-nums bg-muted px-2 py-0.5 rounded-md">
                  بند #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:bg-red-500/10 h-7 px-2"
                >
                  <Trash2 className="size-3.5 me-1" /> حذف
                </Button>
              </div>

              <div className="space-y-1 relative">
                <Label className="text-xs font-medium">اسم الصنف أو الخامة</Label>
                <ProcurementItemCombobox
                  value={item.productName}
                  initialCatalog={catalogItems}
                  placeholder="ابحث أو اكتب اسم الصنف..."
                  onAddNewProduct={(typedName) => handleOpenQuickAddProduct(index, typedName)}
                  onSelect={(selected) => {
                    updateItemDetails(index, {
                      productId: selected.productId,
                      variantId: selected.variantId || null,
                      productName: selected.productName,
                      unitPrice:
                        selected.unitPrice !== undefined ? selected.unitPrice : item.unitPrice,
                      description: selected.description || item.description,
                    });
                  }}
                />
                {!item.productId && item.productName.trim() && (
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAddProduct(index, item.productName)}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mt-1 font-medium transition-colors"
                  >
                    <AlertCircle className="size-3 shrink-0" />
                    <span>غير مسجل بالمخزن — اضغط لإضافته كمنتج جديد</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">الكمية</Label>
                  <Input
                    type="number"
                    min="1"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    className="h-9 font-mono tabular-nums"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">سعر الوحدة</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                    onKeyDown={(e) => handlePriceKeyDown(e, index)}
                    className="h-9 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground font-medium">إجمالي البند:</span>
                <span className="text-sm font-bold font-mono tabular-nums text-primary">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full sm:w-auto rounded-xl gap-2 active:scale-[0.98] transition-transform duration-100 text-sm h-10 font-semibold"
          >
            <Plus className="size-4" />{" "}
            {t("procurement.purchaseInvoiceForm.addItem", "إضافة بند يدوي")}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setCatalogModalOpen(true)}
            className="w-full sm:w-auto rounded-xl gap-2 active:scale-[0.98] transition-transform duration-100 text-sm h-10 font-semibold"
          >
            <PackageCheck className="w-4 h-4 text-primary" />
            استعراض منتجات وخامات المتجر
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenQuickAddProduct(-1, "")}
            className="w-full sm:w-auto rounded-xl gap-2 active:scale-[0.98] transition-transform duration-100 text-sm h-10 font-semibold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          >
            <Plus className="size-4" />
            إضافة منتج جديد للمخزن
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

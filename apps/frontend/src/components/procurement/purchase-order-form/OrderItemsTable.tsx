import React from "react";
import { PackageCheck, Trash2, Plus, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  ProcurementItemCombobox,
  ProcurementCatalogItem,
} from "../components";
import { formatCurrency } from "../../../utils/currency";
import { OrderItem } from "./types";

interface OrderItemsTableProps {
  items: OrderItem[];
  catalogItems: ProcurementCatalogItem[];
  showAdvancedItemColumns: boolean;
  itemInputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  updateItem: (index: number, field: keyof OrderItem, value: any) => void;
  updateItemDetails: (index: number, updates: Partial<OrderItem>) => void;
  handlePriceKeyDown: (e: React.KeyboardEvent, index: number) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  onOpenCatalogModal: () => void;
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  items,
  catalogItems,
  showAdvancedItemColumns,
  itemInputRefs,
  updateItem,
  updateItemDetails,
  handlePriceKeyDown,
  addItem,
  removeItem,
  onOpenCatalogModal,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      className="border border-border/70 shadow-2xs relative z-20 overflow-visible bg-card"
      size="sm"
    >
      <CardContent className="p-4 sm:p-5 space-y-4 overflow-visible">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <PackageCheck className="size-5 text-primary" />
            {t("procurement.purchaseOrderForm.itemsSection", "الأصناف والخامات")}
          </h2>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-mono font-medium">
            {items.length} {items.length === 1 ? "صنف" : "أصناف"}
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-visible">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[280px] font-bold">
                  {t("procurement.purchaseOrderForm.columnItem", "الصنف")}
                </TableHead>
                <TableHead className="w-[110px] text-center font-bold">
                  {t("procurement.purchaseOrderForm.columnQuantity", "الكمية")}
                </TableHead>
                <TableHead className="w-[140px] text-center font-bold">
                  {t("procurement.purchaseOrderForm.columnUnitPrice", "سعر الوحدة")}
                </TableHead>
                {showAdvancedItemColumns && (
                  <>
                    <TableHead className="w-[100px] text-center font-bold">
                      {t("procurement.purchaseOrderForm.columnTax", "الضريبة %")}
                    </TableHead>
                    <TableHead className="w-[100px] text-center font-bold">
                      {t("procurement.purchaseOrderForm.columnDiscount", "الخصم %")}
                    </TableHead>
                  </>
                )}
                <TableHead className="w-[140px] text-right font-bold">
                  {t("procurement.purchaseOrderForm.columnTotal", "الإجمالي")}
                </TableHead>
                <TableHead className="w-[50px] text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="overflow-visible">
                    <ProcurementItemCombobox
                      inputRef={(el) => {
                        if (itemInputRefs.current) {
                          itemInputRefs.current[index] = el;
                        }
                      }}
                      value={item.productName}
                      initialCatalog={catalogItems}
                      placeholder={t(
                        "procurement.purchaseOrderForm.itemPlaceholder",
                        "اختر صنفاً أو اكتب اسمه...",
                      )}
                      onSelect={(selected) => {
                        updateItemDetails(index, {
                          productId: selected.productId,
                          variantId: selected.variantId || null,
                          productName: selected.productName,
                          unitPrice:
                            selected.unitPrice !== undefined && selected.unitPrice > 0
                              ? selected.unitPrice
                              : (Number(item.unitPrice) || selected.unitPrice || 0),
                          description: selected.description || item.description,
                        });
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="h-10 text-center rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono tabular-nums"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                      onKeyDown={(e) => handlePriceKeyDown(e, index)}
                      className="h-10 text-center rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono tabular-nums"
                    />
                  </TableCell>

                  {showAdvancedItemColumns && (
                    <>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={item.taxRate}
                          onChange={(e) => updateItem(index, "taxRate", e.target.value)}
                          className="h-10 text-center rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono tabular-nums"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={item.discountRate}
                          onChange={(e) => updateItem(index, "discountRate", e.target.value)}
                          className="h-10 text-center rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono tabular-nums"
                        />
                      </TableCell>
                    </>
                  )}

                  <TableCell className="text-right font-bold font-mono text-sm text-foreground tabular-nums">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg"
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
              className="p-3.5 rounded-xl border border-border/80 bg-card/60 space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono bg-muted px-2 py-0.5 rounded-md">
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
                  placeholder="ابحث أو اختر صنفاً..."
                  onSelect={(selected) => {
                    updateItemDetails(index, {
                      productId: selected.productId,
                      variantId: selected.variantId || null,
                      productName: selected.productName,
                      unitPrice:
                        selected.unitPrice !== undefined && selected.unitPrice > 0
                          ? selected.unitPrice
                          : (Number(item.unitPrice) || selected.unitPrice || 0),
                      description: selected.description || item.description,
                    });
                  }}
                />
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
                    className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono tabular-nums"
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
                    className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono tabular-nums"
                  />
                </div>
              </div>

              {showAdvancedItemColumns && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">ضريبة %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={item.taxRate}
                      onChange={(e) => updateItem(index, "taxRate", e.target.value)}
                      className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">خصم %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={item.discountRate}
                      onChange={(e) => updateItem(index, "discountRate", e.target.value)}
                      className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono tabular-nums"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground font-medium">
                  إجمالي البند:
                </span>
                <span className="text-sm font-bold font-mono text-primary tabular-nums">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full sm:w-auto rounded-xl gap-2 active:scale-[0.98] transition-transform duration-100 text-sm h-10 font-semibold"
          >
            <Plus className="size-4" />{" "}
            {t("procurement.purchaseOrderForm.addItem", "إضافة بند جديد")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onOpenCatalogModal}
            className="w-full sm:w-auto rounded-xl gap-2 active:scale-[0.98] transition-transform duration-100 text-sm h-10 font-semibold"
          >
            <ShoppingCart className="size-4" /> استعراض منتجات المتجر
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

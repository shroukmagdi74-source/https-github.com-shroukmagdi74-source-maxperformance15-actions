import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";
import { StarRating } from "./StarRating";
import { Supplier, parseTags } from "./types";

interface SupplierDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onClose: () => void;
}

export const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({
  open,
  onOpenChange,
  supplier,
  onClose,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{t("procurement.suppliers.viewTitle")}</DialogTitle>
        {supplier && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div>
              <p className="text-xs text-muted-foreground">{t("procurement.suppliers.columnName")}</p>
              <p className="text-sm font-medium">{supplier.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("procurement.suppliers.columnContact")}</p>
              <p className="text-sm">{supplier.contactPerson || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("procurement.suppliers.columnEmail")}</p>
              <p className="text-sm">{supplier.email || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("procurement.suppliers.columnPhone")}</p>
              <p className="text-sm">{supplier.phone || supplier.mobile || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("procurement.suppliers.columnBalance")}</p>
              <p className="text-sm font-medium tabular-nums">
                {formatCurrency(supplier.currentBalance, { locale: i18n.language })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("procurement.suppliers.columnRating")}</p>
              <StarRating value={supplier.rating || 0} readonly />
            </div>
            <div className="col-span-full">
              <p className="text-xs text-muted-foreground">{t("procurement.suppliers.labelAddress")}</p>
              <p className="text-sm">{supplier.address || "-"}</p>
            </div>
            <div className="col-span-full">
              <p className="text-xs text-muted-foreground">{t("procurement.suppliers.labelNotes")}</p>
              <p className="text-sm">{supplier.notes || "-"}</p>
            </div>
            <div className="col-span-full">
              <p className="text-xs text-muted-foreground mb-1">{t("procurement.suppliers.columnTags", "الوسوم")}</p>
              <div className="flex flex-wrap gap-1">
                {parseTags(supplier.tags).length > 0 ? (
                  parseTags(supplier.tags).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

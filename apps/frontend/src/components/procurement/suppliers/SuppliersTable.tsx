import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { StarRating } from "./StarRating";
import { Supplier, parseTags } from "./types";

interface SuppliersTableProps {
  suppliers: Supplier[];
  loading: boolean;
  searchTerm: string;
  recalculatingId: string | null;
  onRecalculateSingle: (id: string, name: string) => void;
  onQuickTag: (supplier: Supplier) => void;
  onViewDetails: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export const SuppliersTable: React.FC<SuppliersTableProps> = ({
  suppliers,
  loading,
  searchTerm,
  recalculatingId,
  onRecalculateSingle,
  onQuickTag,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const tr = (key: string, defaultValue?: string) => t(key, defaultValue ?? key);

  return (
    <div className="hidden md:block rounded-xl border bg-card text-card-foreground">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">{t("procurement.suppliers.columnName")}</TableHead>
            <TableHead className="text-start">{t("procurement.suppliers.columnContact")}</TableHead>
            <TableHead className="text-start">{t("procurement.suppliers.columnPhone")}</TableHead>
            <TableHead className="text-start">{t("procurement.suppliers.columnEmail")}</TableHead>
            <TableHead className="text-start">{t("procurement.suppliers.columnTags", "الوسوم")}</TableHead>
            <TableHead className="text-end">{t("procurement.suppliers.columnBalance")}</TableHead>
            <TableHead className="text-center">{t("procurement.suppliers.columnRating")}</TableHead>
            <TableHead className="text-center">{t("procurement.suppliers.columnStatus")}</TableHead>
            <TableHead className="text-center">{t("procurement.suppliers.columnActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={9}>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </TableCell>
              </TableRow>
            ))
          ) : suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                {searchTerm ? "لا توجد نتائج مطابقة لبحثك" : "لا يوجد موردون مسجلون حالياً"}
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium text-start">{supplier.name}</TableCell>
                <TableCell className="text-start">{supplier.contactPerson || "-"}</TableCell>
                <TableCell className="text-start">{supplier.phone || supplier.mobile || "-"}</TableCell>
                <TableCell className="text-start">{supplier.email || "-"}</TableCell>
                <TableCell className="text-start">
                  {parseTags(supplier.tags).length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1">
                      {parseTags(supplier.tags).slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {parseTags(supplier.tags).length > 2 && (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          +{parseTags(supplier.tags).length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-end tabular-nums font-medium">
                  {Number(supplier.currentBalance) > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-amber-500 font-semibold">
                        {formatCurrency(supplier.currentBalance, { locale: i18n.language })}
                      </span>
                      <span className="text-[10px] text-amber-500/80 font-normal">مستحق للمورد</span>
                    </div>
                  ) : Number(supplier.currentBalance) < 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-sky-400 font-semibold">
                        {formatCurrency(Math.abs(supplier.currentBalance), { locale: i18n.language })}
                      </span>
                      <span className="text-[10px] text-sky-400/80 font-normal">دفعة مقدمة</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground font-mono">
                      {formatCurrency(0, { locale: i18n.language })}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <StarRating value={supplier.rating || 0} readonly />
                </TableCell>
                <TableCell>
                  <Badge variant={supplier.isActive ? "default" : "secondary"}>
                    {supplier.isActive
                      ? t("procurement.suppliers.statusActive")
                      : t("procurement.suppliers.statusInactive")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={recalculatingId === supplier.id}
                      onClick={() => onRecalculateSingle(supplier.id, supplier.name)}
                      title="تدقيق ومزامنة رصيد المورد"
                    >
                      <RefreshCw className={`size-4 ${recalculatingId === supplier.id ? "animate-spin text-primary" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onQuickTag(supplier)}
                      title={tr("procurement.suppliers.quickAddTag")}
                    >
                      <Plus className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(supplier)}
                      title={tr("procurement.suppliers.viewDetails")}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(supplier)}
                      title={tr("common.edit")}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(supplier.id)}
                      title={tr("common.delete")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

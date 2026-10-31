import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { StarRating } from "./StarRating";
import { Supplier, parseTags } from "./types";
import { ProcurementMobileCard, ProcurementMobileState } from "../ProcurementMobileCard";

interface SuppliersMobileViewProps {
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

export const SuppliersMobileView: React.FC<SuppliersMobileViewProps> = ({
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
    <div className="grid md:hidden gap-2">
      {loading ? (
        [...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-5 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))
      ) : suppliers.length === 0 ? (
        <ProcurementMobileState>
          {searchTerm
            ? "لا توجد نتائج مطابقة لبحثك"
            : "لا يوجد موردون مسجلون حالياً"}
        </ProcurementMobileState>
      ) : (
        suppliers.map((supplier) => (
          <ProcurementMobileCard
            key={supplier.id}
            eyebrow={supplier.contactPerson || t("procurement.suppliers.columnContact")}
            title={supplier.name}
            subtitle={supplier.email || supplier.phone || supplier.mobile || "-"}
            status={
              <Badge variant={supplier.isActive ? "default" : "secondary"}>
                {supplier.isActive
                  ? t("procurement.suppliers.statusActive")
                  : t("procurement.suppliers.statusInactive")}
              </Badge>
            }
            fields={[
              {
                label: t("procurement.suppliers.columnPhone"),
                value: supplier.phone || supplier.mobile || "-",
              },
              {
                label: t("procurement.suppliers.columnTags", "الوسوم"),
                value: parseTags(supplier.tags).length > 0 ? (
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
                ) : "-",
              },
              {
                label: t("procurement.suppliers.columnBalance"),
                value: formatCurrency(supplier.currentBalance, { locale: i18n.language }),
                emphasis: true,
              },
              {
                label: t("procurement.suppliers.columnRating"),
                value: <StarRating value={supplier.rating || 0} readonly />,
              },
              {
                label: t("procurement.suppliers.labelCity"),
                value: supplier.city || supplier.country || "-",
              },
            ]}
            actions={
              <>
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
              </>
            }
          />
        ))
      )}
    </div>
  );
};

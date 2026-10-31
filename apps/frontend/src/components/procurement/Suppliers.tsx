import React from "react";
import { Search, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSuppliersController,
  SuppliersHeader,
  SuppliersTable,
  SuppliersMobileView,
  SupplierFormModal,
  SupplierDetailsModal,
  SupplierQuickTagModal,
} from "./suppliers/index";

export const Suppliers: React.FC = () => {
  const { t, i18n } = useTranslation();
  const tr = (key: string, defaultValue?: string) => t(key, defaultValue ?? key);
  const isRtl = i18n.dir() === "rtl";

  const {
    suppliers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    openDialog,
    setOpenDialog,
    openViewDialog,
    setOpenViewDialog,
    selectedSupplier,
    formData,
    setFormData,
    newTagInput,
    setNewTagInput,
    quickTagSupplier,
    setQuickTagSupplier,
    quickTagInput,
    setQuickTagInput,
    savingQuickTag,
    recalculatingAll,
    recalculatingId,
    deleteConfirmDialog,
    setDeleteConfirmDialog,
    fetchSuppliers,
    handleOpenDialog,
    handleCloseDialog,
    handleOpenQuickTagDialog,
    handleSaveQuickTag,
    handleAddFormTag,
    handleRemoveFormTag,
    handleSubmit,
    handleDelete,
    confirmDelete,
    handleRecalculateAll,
    handleRecalculateSingle,
    handleViewDetails,
  } = useSuppliersController();

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <SuppliersHeader
        recalculatingAll={recalculatingAll}
        loading={loading}
        onRecalculateAll={handleRecalculateAll}
        onAddNew={() => handleOpenDialog()}
      />

      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchSuppliers} className="h-7 text-xs">
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Integrated Single-Surface Filter Bar */}
      <div className="p-3 rounded-xl border border-border/70 bg-card">
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={tr("procurement.suppliers.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-8"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <SuppliersTable
        suppliers={suppliers}
        loading={loading}
        searchTerm={searchTerm}
        recalculatingId={recalculatingId}
        onRecalculateSingle={handleRecalculateSingle}
        onQuickTag={handleOpenQuickTagDialog}
        onViewDetails={handleViewDetails}
        onEdit={(s) => handleOpenDialog(s)}
        onDelete={handleDelete}
      />

      {/* Mobile Card List View */}
      <SuppliersMobileView
        suppliers={suppliers}
        loading={loading}
        searchTerm={searchTerm}
        recalculatingId={recalculatingId}
        onRecalculateSingle={handleRecalculateSingle}
        onQuickTag={handleOpenQuickTagDialog}
        onViewDetails={handleViewDetails}
        onEdit={(s) => handleOpenDialog(s)}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <div className="flex justify-center mt-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t("common.previous")}
          </Button>
          <span className="text-sm px-3 tabular-nums font-mono">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t("common.next")}
          </Button>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <SupplierFormModal
        open={openDialog}
        onOpenChange={setOpenDialog}
        isEditing={Boolean(selectedSupplier)}
        formData={formData}
        setFormData={setFormData}
        newTagInput={newTagInput}
        setNewTagInput={setNewTagInput}
        onAddTag={handleAddFormTag}
        onRemoveTag={handleRemoveFormTag}
        onSubmit={handleSubmit}
        onCancel={handleCloseDialog}
      />

      {/* View Details Dialog */}
      <SupplierDetailsModal
        open={openViewDialog}
        onOpenChange={setOpenViewDialog}
        supplier={selectedSupplier}
        onClose={() => setOpenViewDialog(false)}
      />

      {/* Quick Add Tag Dialog */}
      <SupplierQuickTagModal
        supplier={quickTagSupplier}
        onClose={() => setQuickTagSupplier(null)}
        quickTagInput={quickTagInput}
        setQuickTagInput={setQuickTagInput}
        saving={savingQuickTag}
        onSave={handleSaveQuickTag}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirmDialog.open}
        title={t("procurement.suppliers.deleteConfirm", "تأكيد حذف المورد")}
        content={t("procurement.suppliers.deleteConfirm", "هل أنت متأكد من حذف هذا المورد؟")}
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmDialog({ open: false, supplierId: null })}
      />
    </div>
  );
};

export default Suppliers;

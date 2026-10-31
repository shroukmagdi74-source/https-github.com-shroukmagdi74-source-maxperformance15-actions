import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag, X, Plus } from "lucide-react";
import { StarRating } from "./StarRating";
import { SupplierFormData } from "./types";

interface SupplierFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: SupplierFormData;
  setFormData: React.Dispatch<React.SetStateAction<SupplierFormData>>;
  newTagInput: string;
  setNewTagInput: (val: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  open,
  onOpenChange,
  isEditing,
  formData,
  setFormData,
  newTagInput,
  setNewTagInput,
  onAddTag,
  onRemoveTag,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const tr = (key: string, defaultValue?: string) => t(key, defaultValue ?? key);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogTitle>
          {isEditing
            ? t("procurement.suppliers.editTitle")
            : t("procurement.suppliers.addNew")}
        </DialogTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <Label>{t("procurement.suppliers.labelName")}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("procurement.suppliers.labelContact")}</Label>
            <Input
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("procurement.suppliers.labelEmail")}</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("procurement.suppliers.labelPhone")}</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("procurement.suppliers.labelMobile")}</Label>
            <Input
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("procurement.suppliers.labelCity")}</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("procurement.suppliers.labelCountry")}</Label>
            <Input
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("procurement.suppliers.labelTaxNumber")}</Label>
            <Input
              value={formData.taxNumber}
              onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("procurement.suppliers.labelCommercialRegister")}</Label>
            <Input
              value={formData.commercialRegister}
              onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("procurement.suppliers.labelCreditLimit")}</Label>
            <Input
              type="number"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
            />
          </div>
          <div className="space-y-1 col-span-full">
            <Label>{t("procurement.suppliers.labelAddress")}</Label>
            <Textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="space-y-1 col-span-full">
            <Label>{t("procurement.suppliers.labelPaymentTerms")}</Label>
            <Textarea
              rows={2}
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            />
          </div>
          <div className="space-y-1 col-span-full">
            <Label>{t("procurement.suppliers.labelNotes")}</Label>
            <Textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="space-y-2 col-span-full">
            <Label>{t("procurement.suppliers.labelTags", "الوسوم")}</Label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg border border-input bg-background/50">
              {formData.tags.length > 0 ? (
                formData.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-700"
                  >
                    <Tag className="size-3 text-zinc-400" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => onRemoveTag(tag)}
                      className="ms-1 text-zinc-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground self-center">
                  {t("procurement.suppliers.noTags", "لا توجد وسوم")}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddTag();
                  }
                }}
                placeholder={tr("procurement.suppliers.addTagPlaceholder")}
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddTag}
                disabled={!newTagInput.trim()}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          <div className="col-span-full">
            <Label className="mb-1 block">{t("procurement.suppliers.labelRating")}</Label>
            <StarRating
              value={formData.rating}
              onChange={(value) => setFormData({ ...formData, rating: value })}
            />
          </div>
          <div className="col-span-full">
            <Label>{t("procurement.suppliers.labelStatus")}</Label>
            <Select
              value={formData.isActive ? "true" : "false"}
              onValueChange={(value) =>
                setFormData({ ...formData, isActive: value === "true" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{t("procurement.suppliers.statusActive")}</SelectItem>
                <SelectItem value="false">{t("procurement.suppliers.statusInactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>{t("common.cancel")}</Button>
          <Button onClick={onSubmit}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

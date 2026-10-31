import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Supplier } from "./types";

interface SupplierQuickTagModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  quickTagInput: string;
  setQuickTagInput: (val: string) => void;
  saving: boolean;
  onSave: () => void;
}

export const SupplierQuickTagModal: React.FC<SupplierQuickTagModalProps> = ({
  supplier,
  onClose,
  quickTagInput,
  setQuickTagInput,
  saving,
  onSave,
}) => {
  const { t } = useTranslation();
  const tr = (key: string, defaultValue?: string) => t(key, defaultValue ?? key);

  return (
    <Dialog open={!!supplier} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xs">
        <DialogTitle>{t("procurement.suppliers.quickAddTagTitle", "إضافة وسم للمورد")}</DialogTitle>
        <div className="py-2 space-y-2">
          <Label>{t("procurement.suppliers.labelTags", "الوسم")}</Label>
          <Input
            value={quickTagInput}
            onChange={(e) => setQuickTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSave();
              }
            }}
            placeholder={tr("procurement.suppliers.tagPlaceholder")}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button size="sm" onClick={onSave} disabled={!quickTagInput.trim() || saving}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

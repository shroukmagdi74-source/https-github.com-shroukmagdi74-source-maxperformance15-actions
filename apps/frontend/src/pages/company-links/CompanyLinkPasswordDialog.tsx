import React from "react";
import { Copy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

interface CompanyLinkPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shownPassword: string;
  onCopyPassword: () => void;
  onClose: () => void;
}

export const CompanyLinkPasswordDialog: React.FC<CompanyLinkPasswordDialogProps> = ({
  open,
  onOpenChange,
  shownPassword,
  onCopyPassword,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-right">
          <DialogTitle>{t("companyLinks.password")}</DialogTitle>
          <DialogDescription>
            يمكنك عرض كلمة المرور أو نسخها لاستخدامها خارج المنصة.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="company-link-shown-password">
            {t("companyLinks.password")}
          </Label>
          <Input
            id="company-link-shown-password"
            value={shownPassword}
            readOnly
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCopyPassword}
          >
            <Copy className="size-4" />
            {t("companyLinks.copy")}
          </Button>
          <Button type="button" onClick={onClose}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

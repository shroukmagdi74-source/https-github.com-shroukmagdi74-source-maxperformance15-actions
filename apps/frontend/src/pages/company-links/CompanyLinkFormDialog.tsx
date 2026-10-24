import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { LinkFormState } from "./types";

interface CompanyLinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  form: LinkFormState;
  setForm: React.Dispatch<React.SetStateAction<LinkFormState>>;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyLinkFormDialog: React.FC<CompanyLinkFormDialogProps> = ({
  open,
  onOpenChange,
  isEditing,
  form,
  setForm,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="text-right">
          <DialogTitle>
            {isEditing ? t("companyLinks.editLink") : t("companyLinks.addLink")}
          </DialogTitle>
          <DialogDescription>
            أضف رابطًا داخليًا أو خارجيًا للفريق مع بيانات الدخول عند الحاجة.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-link-name">{t("companyLinks.linkName")}</Label>
            <Input
              id="company-link-name"
              value={form.name}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-link-url">{t("companyLinks.url")}</Label>
            <Input
              id="company-link-url"
              value={form.url}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  url: event.target.value,
                }))
              }
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-link-username">
              {t("companyLinks.username")}
            </Label>
            <Input
              id="company-link-username"
              value={form.username}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  username: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-link-password">
              {isEditing
                ? t("companyLinks.passwordPlaceholderEdit")
                : t("companyLinks.password")}
            </Label>
            <Input
              id="company-link-password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  password: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{t("companyLinks.openMode")}</Label>
            <Select
              value={form.openMode}
              onValueChange={(value) =>
                setForm((previous) => ({
                  ...previous,
                  openMode: value === "in_app" ? "in_app" : "new_tab",
                }))
              }
            >
              <SelectTrigger aria-label={String(t("companyLinks.openMode"))}>
                <SelectValue placeholder={t("companyLinks.openMode")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new_tab">
                  {t("companyLinks.newTab")}
                </SelectItem>
                <SelectItem value="in_app">
                  {t("companyLinks.inApp")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={onSave}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

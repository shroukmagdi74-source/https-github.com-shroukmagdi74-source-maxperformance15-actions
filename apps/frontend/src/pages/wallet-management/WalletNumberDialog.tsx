import React from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type WalletFormState, type WalletNumberRecord } from "./types";

export type WalletNumberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingWallet: WalletNumberRecord | null;
  formData: WalletFormState;
  onChange: (field: keyof WalletFormState, value: string) => void;
  onSubmit: () => void;
  saving: boolean;
};

export const WalletNumberDialog: React.FC<WalletNumberDialogProps> = ({
  open,
  onOpenChange,
  editingWallet,
  formData,
  onChange,
  onSubmit,
  saving,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto text-right sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editingWallet ? "تعديل المحفظة" : "إضافة محفظة جديدة"}
          </DialogTitle>
          <DialogDescription>
            احفظ بيانات المحفظة مرة واحدة لتظهر في كل أماكن الدفع اليدوي داخل لوحة الإدارة.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="wallet-name">اسم المحفظة</Label>
            <Input
              id="wallet-name"
              name="walletName"
              value={formData.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="مثال: فودافون كاش"
              className="h-11 rounded-2xl text-right"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="wallet-number">رقم المحفظة</Label>
            <Input
              id="wallet-number"
              name="walletNumber"
              value={formData.number}
              onChange={(event) => onChange("number", event.target.value)}
              placeholder="0100 000 0000"
              className="h-11 rounded-2xl text-right font-mono tabular-nums"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
            <div className="grid gap-2">
              <Label htmlFor="wallet-icon">رمز المحفظة</Label>
              <Input
                id="wallet-icon"
                name="walletIcon"
                value={formData.icon}
                onChange={(event) => onChange("icon", event.target.value)}
                placeholder="رمز أو اختصار"
                className="h-11 rounded-2xl text-right"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wallet-color">اللون</Label>
              <input
                id="wallet-color"
                name="walletColor"
                type="color"
                value={formData.color}
                onChange={(event) => onChange("color", event.target.value)}
                className="h-11 w-full cursor-pointer rounded-2xl border border-input bg-background p-1"
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/60 bg-muted/20 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">معاينة سريعة</p>
            <div className="flex items-center gap-3">
              <div
                className="inline-flex size-12 items-center justify-center rounded-2xl text-xl shadow-2xs"
                style={{
                  backgroundColor: `${formData.color || "#1d4ed8"}18`,
                  color: formData.color || "#1d4ed8",
                }}
              >
                {formData.icon ? (
                  <span>{formData.icon}</span>
                ) : (
                  <CreditCard className="size-5" />
                )}
              </div>
              <div className="space-y-1 text-right">
                <p className="font-semibold text-foreground">
                  {formData.name || "اسم المحفظة"}
                </p>
                <p className="font-mono text-xs text-muted-foreground tabular-nums">
                  {formData.number || "رقم المحفظة"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button type="button" disabled={saving} onClick={onSubmit}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {saving ? "جاري الحفظ..." : editingWallet ? "حفظ التعديلات" : "إضافة المحفظة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

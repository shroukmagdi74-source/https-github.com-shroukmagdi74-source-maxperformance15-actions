import React from "react";
import { Landmark, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  type CompanyWalletRecord,
  type FundsFormState,
  formatCurrency,
} from "./types";

export type AddFundsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyWalletRecord | null;
  formData: FundsFormState;
  onChange: (field: keyof FundsFormState, value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
};

export const AddFundsDialog: React.FC<AddFundsDialogProps> = ({
  open,
  onOpenChange,
  company,
  formData,
  onChange,
  onSubmit,
  submitting,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto text-right sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {company ? `إضافة رصيد - ${company.companyName}` : "إضافة رصيد"}
          </DialogTitle>
          <DialogDescription>
            حدّد قيمة الإضافة والبونص الاختياري، وسيتم تحديث رصيد الشركة مباشرة بعد الحفظ.
          </DialogDescription>
        </DialogHeader>

        {company ? (
          <div className="rounded-[1.5rem] border border-border/60 bg-muted/20 p-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-muted-foreground">الشركة</p>
                <p className="font-semibold text-foreground">{company.companyName}</p>
                <p className="text-xs text-muted-foreground">{company.companyEmail}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">الرصيد الحالي</p>
                <p className="font-semibold text-primary font-mono tabular-nums">
                  {formatCurrency(company.balance)}
                </p>
                <p className="text-xs text-muted-foreground font-mono tabular-nums">
                  إجمالي الإيداعات: {formatCurrency(company.totalDeposited)}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="funds-amount">المبلغ</Label>
            <Input
              id="funds-amount"
              name="fundsAmount"
              type="number"
              min="0"
              value={formData.amount}
              onChange={(event) => onChange("amount", event.target.value)}
              placeholder="0"
              className="h-11 rounded-2xl text-right font-mono tabular-nums"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="funds-bonus">بونص إضافي</Label>
            <Input
              id="funds-bonus"
              name="fundsBonus"
              type="number"
              min="0"
              value={formData.bonus}
              onChange={(event) => onChange("bonus", event.target.value)}
              placeholder="0"
              className="h-11 rounded-2xl text-right font-mono tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              مبلغ إضافي يضاف للرصيد كهدية للشركة بشكل اختياري.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="funds-notes">ملاحظات</Label>
            <Textarea
              id="funds-notes"
              name="fundsNotes"
              value={formData.notes}
              onChange={(event) => onChange("notes", event.target.value)}
              placeholder="ملاحظات داخلية عن سبب الإضافة"
              className="min-h-[104px] rounded-2xl text-right"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            disabled={submitting || !formData.amount.trim()}
            onClick={onSubmit}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Landmark className="size-4" />
            )}
            {submitting ? "جاري إضافة الرصيد..." : "تأكيد إضافة الرصيد"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

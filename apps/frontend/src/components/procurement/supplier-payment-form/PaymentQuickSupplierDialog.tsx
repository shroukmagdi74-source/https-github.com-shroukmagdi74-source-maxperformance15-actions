import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface PaymentQuickSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quickSupplierName: string;
  setQuickSupplierName: (name: string) => void;
  quickSupplierPhone: string;
  setQuickSupplierPhone: (phone: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const PaymentQuickSupplierDialog: React.FC<PaymentQuickSupplierDialogProps> = ({
  open,
  onOpenChange,
  quickSupplierName,
  setQuickSupplierName,
  quickSupplierPhone,
  setQuickSupplierPhone,
  submitting,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            إضافة مورد جديد سريعاً
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">اسم الشركة أو المورد *</Label>
            <Input
              required
              placeholder="مثال: شركة إيفوكلار للأسنان"
              value={quickSupplierName}
              onChange={(e) => setQuickSupplierName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">رقم الهاتف / الموبايل</Label>
            <Input
              placeholder="010xxxxxxxx"
              value={quickSupplierPhone}
              onChange={(e) => setQuickSupplierPhone(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <LoadingSpinner size="sm" /> : "إضافة وحفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

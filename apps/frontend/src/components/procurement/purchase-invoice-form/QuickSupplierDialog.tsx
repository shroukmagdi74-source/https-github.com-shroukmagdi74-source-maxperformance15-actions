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

export interface QuickSupplierDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  contact: string;
  setContact: (contact: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const QuickSupplierDialog: React.FC<QuickSupplierDialogProps> = ({
  isOpen,
  setIsOpen,
  name,
  setName,
  phone,
  setPhone,
  contact,
  setContact,
  submitting,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">رقم الهاتف / الموبايل</Label>
            <Input
              placeholder="010xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 rounded-xl font-mono tabular-nums"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">اسم مسؤول المبيعات (اختياري)</Label>
            <Input
              placeholder="اسم الشخص المسؤول"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-xl">
              {submitting ? <LoadingSpinner size="sm" /> : "إضافة وحفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

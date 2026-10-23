import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { Occasion } from './types';

interface CustomerOccasionsDeleteDialogProps {
  occasion: Occasion | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const CustomerOccasionsDeleteDialog: React.FC<CustomerOccasionsDeleteDialogProps> = ({
  occasion,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={!!occasion} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-xl p-5">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">حذف المناسبة؟</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            سيتم حذف المناسبة «{occasion?.name}» نهائياً وإلغاء جدولتها. الرسائل التي تم إرسالها سابقاً لن تتأثر.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 rounded-lg text-xs"
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="h-8 gap-1.5 rounded-lg text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف نهائي
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

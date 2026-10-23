import React from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CustomerList } from '../types';

interface DeleteListConfirmDialogProps {
  list: CustomerList | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteListConfirmDialog: React.FC<DeleteListConfirmDialogProps> = ({
  list,
  deleting,
  onClose,
  onConfirm,
}) => {
  return (
    <AlertDialog open={!!list} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md rounded-xl p-5">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-bold">حذف قائمة العملاء</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            هل أنت متأكد من حذف قائمة «{list?.name}»؟ لن يتم حذف بيانات العملاء أنفسهم، ولكن سيتم إزالة تصنيف القائمة.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel className="h-8 rounded-lg text-xs" onClick={onClose}>
            إلغاء
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-8 gap-1.5 rounded-lg text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            تأكيد الحذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

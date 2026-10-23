import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MetaTemplateDeleteDialogProps {
  templateName: string | null;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export const MetaTemplateDeleteDialog: React.FC<MetaTemplateDeleteDialogProps> = ({
  templateName,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={Boolean(templateName)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30">
              <Trash2 className="size-5 text-red-500" />
            </div>
            <div>
              <DialogTitle>حذف القالب</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف القالب <strong>{templateName}</strong>؟
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
          سيتم حذف جميع ترجمات هذا القالب. هذا الإجراء لا يمكن التراجع عنه.
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={() => templateName && onConfirm(templateName)}
            className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

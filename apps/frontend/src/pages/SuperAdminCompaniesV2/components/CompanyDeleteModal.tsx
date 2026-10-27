import React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { ResponsiveOverlay } from "./ResponsiveOverlay";

interface CompanyDeleteModalProps {
  isOpen: boolean;
  isMobile: boolean;
  ids: string[];
  name: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CompanyDeleteModal: React.FC<CompanyDeleteModalProps> = ({
  isOpen,
  isMobile,
  ids,
  name,
  deleting,
  onClose,
  onConfirm,
}) => {
  return (
    <ResponsiveOverlay
      mobile={isMobile}
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={ids.length > 1 ? `حذف ${ids.length} شركة` : "حذف الشركة"}
      description={
        name
          ? `هل أنت متأكد من حذف "${name}"؟`
          : "هذا الإجراء لا يمكن التراجع عنه."
      }
      bodyClassName="space-y-4"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl"
            onClick={onClose}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 rounded-2xl"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin ml-2" />
            ) : (
              <Trash2 className="size-4 ml-2" />
            )}
            تأكيد الحذف
          </Button>
        </>
      }
    >
      <Alert
        variant="destructive"
        className="rounded-lg border-rose-200/60 bg-rose-50/50 p-5 shadow-sm"
      >
        <AlertTriangle className="size-5 text-rose-600" />
        <AlertTitle className="text-base font-black text-rose-700">تحذير نهائي</AlertTitle>
        <AlertDescription className="text-sm font-bold text-rose-600/80 leading-relaxed">
          سيتم حذف الشركة وجميع البيانات المرتبطة (الأعضاء، العملاء، الرسائل، الصفحات) بشكل
          نهائي. هذا الإجراء مدمر ولا يمكن التراجع عنه أبداً.
        </AlertDescription>
      </Alert>
    </ResponsiveOverlay>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { ProductRecord } from './types';

interface ProductDeleteDialogProps {
  deleteTarget: ProductRecord | null;
  setDeleteTarget: (product: ProductRecord | null) => void;
  onDelete: () => void;
  deleting: boolean;
}

export const ProductDeleteDialog: React.FC<ProductDeleteDialogProps> = ({
  deleteTarget,
  setDeleteTarget,
  onDelete,
  deleting,
}) => {
  const { t } = useTranslation();

  return (
    <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="size-5 text-destructive" />
            <AlertDialogTitle className="font-black">
              {t('aiCatalog.deleteConfirm')}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>{deleteTarget?.name}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
            {t('aiCatalog.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <>
                <Trash2 className="mr-1 size-4" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ProductDeleteDialog;

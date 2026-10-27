import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Pencil, Palette, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { ProductFormData, ProductVariant } from './types';
import { useIsMobile } from './useIsMobile';
import { ImageUploadArea } from './ImageUploadArea';

interface ProductFormDrawerProps {
  open: boolean;
  formData: ProductFormData;
  onChange: (data: ProductFormData) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}

export const ProductFormDrawer: React.FC<ProductFormDrawerProps> = ({
  open,
  formData,
  onChange,
  onSave,
  onClose,
  saving,
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const handleField = (field: keyof ProductFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const handleMainImageFile = async (file: File) => {
    const preview = URL.createObjectURL(file);
    onChange({
      ...formData,
      _mainImageFile: file,
      _mainImagePreview: preview,
    });
  };

  const clearMainImage = () => {
    if (formData._mainImagePreview) {
      URL.revokeObjectURL(formData._mainImagePreview);
    }
    onChange({
      ...formData,
      mainImage: '',
      _mainImageFile: undefined,
      _mainImagePreview: undefined,
    });
  };

  const addVariant = () => {
    onChange({
      ...formData,
      variants: [...formData.variants, { color: '', imageUrl: '' }],
    });
  };

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    const next = [...formData.variants];
    next[index] = { ...next[index], ...updates };
    onChange({ ...formData, variants: next });
  };

  const removeVariant = (index: number) => {
    const removed = formData.variants[index];
    if (removed?._localPreview) URL.revokeObjectURL(removed._localPreview);
    onChange({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const handleVariantFile = (index: number, file: File) => {
    const preview = URL.createObjectURL(file);
    updateVariant(index, {
      _localFile: file,
      _localPreview: preview,
    });
  };

  const isEditing = !!formData.id;

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        showCloseButton={false}
        className={cn(
          'flex flex-col p-0 bg-card text-card-foreground border-border shadow-2xl z-50',
          isMobile ? 'h-[92vh] rounded-t-[20px]' : 'border-l dark:border-white/10'
        )}
        style={{ maxWidth: isMobile ? '100%' : 460, width: isMobile ? '100%' : 460 }}
      >
        <SheetHeader className="border-b border-border px-6 py-5 bg-card shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Pencil className="size-5 text-primary" />
              ) : (
                <Plus className="size-5 text-primary" />
              )}
              <SheetTitle className="text-lg font-black text-foreground">
                {isEditing ? t('aiCatalog.editProduct') : t('aiCatalog.addProduct')}
              </SheetTitle>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label={t('common.close', 'إغلاق')}
            >
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        {saving && (
          <div className="h-1 w-full overflow-hidden bg-muted">
            <div className="h-full w-full animate-pulse bg-primary" />
          </div>
        )}

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 bg-card">
          <div className="flex justify-center">
            <ImageUploadArea
              previewUrl={formData._mainImagePreview || formData.mainImage}
              onFileSelect={handleMainImageFile}
              onClear={clearMainImage}
              label={t('aiCatalog.imageUpload')}
              size={120}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t('aiCatalog.productName')} <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={e => handleField('name', e.target.value)}
              className="bg-background/80 dark:bg-black/30 border-border"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t('aiCatalog.price')} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">💲</span>
                <Input
                  value={formData.price}
                  onChange={e => handleField('price', e.target.value)}
                  type="number"
                  className="pl-8 bg-background/80 dark:bg-black/30 border-border tabular-nums"
                  required
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t('aiCatalog.stock')}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">📦</span>
                <Input
                  value={formData.stock}
                  onChange={e => handleField('stock', e.target.value)}
                  type="number"
                  className="pl-8 bg-background/80 dark:bg-black/30 border-border tabular-nums"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t('aiCatalog.sku')}
            </label>
            <Input
              value={formData.sku}
              onChange={e => handleField('sku', e.target.value)}
              className="bg-background/80 dark:bg-black/30 border-border font-mono"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t('aiCatalog.description')}
            </label>
            <Textarea
              value={formData.description}
              onChange={e => handleField('description', e.target.value)}
              rows={3}
              className="bg-background/80 dark:bg-black/30 border-border"
            />
          </div>

          <Separator className="border-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              <span className="text-sm font-extrabold text-foreground">
                {t('aiCatalog.variants')}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={addVariant}>
              <Plus className="mr-1 size-3.5" />
              {t('aiCatalog.addVariant')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t('aiCatalog.addVariantDesc')}</p>

          {formData.variants.map((variant, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-muted/30 dark:bg-white/[0.03] p-3"
            >
              <div className="flex items-center gap-3">
                <ImageUploadArea
                  previewUrl={variant._localPreview || variant.imageUrl}
                  onFileSelect={f => handleVariantFile(idx, f)}
                  onClear={() =>
                    updateVariant(idx, {
                      imageUrl: '',
                      _localFile: undefined,
                      _localPreview: undefined,
                    })
                  }
                  label={t('aiCatalog.variantImage')}
                  size={64}
                />
                <div className="flex-1">
                  <Input
                    value={variant.color}
                    onChange={e => updateVariant(idx, { color: e.target.value })}
                    placeholder={t('aiCatalog.variantColor')}
                    className="bg-background/80 dark:bg-black/30 border-border"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariant(idx)}
                  aria-label="Remove variant"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="border-t border-border px-6 py-4 bg-card shrink-0">
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1"
            >
              {t('aiCatalog.cancel')}
            </Button>
            <Button
              onClick={onSave}
              disabled={saving || !formData.name.trim() || !formData.price}
              className="flex-[2] rounded-lg font-extrabold"
            >
              {saving ? <LoadingSpinner size="sm" color="white" /> : t('aiCatalog.save')}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProductFormDrawer;

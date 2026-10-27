import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Plus,
  Pencil,
  Copy,
  Trash2,
  Image as ImageIcon,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductRecord } from './types';

interface ProductMobileListViewProps {
  products: ProductRecord[];
  loading: boolean;
  isDark: boolean;
  totalCount: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage: number;
  openAddForm: () => void;
  openEditForm: (product: ProductRecord) => void;
  handleDuplicate: (product: ProductRecord) => void;
  setDeleteTarget: (product: ProductRecord) => void;
}

export const ProductMobileListView: React.FC<ProductMobileListViewProps> = ({
  products,
  loading,
  isDark,
  totalCount,
  page,
  setPage,
  rowsPerPage,
  openAddForm,
  openEditForm,
  handleDuplicate,
  setDeleteTarget,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-xl border bg-card p-3">
            <Skeleton className="size-20 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <ShoppingBag className="size-14 text-muted-foreground/50" />
        <p className="font-semibold text-muted-foreground">{t('aiCatalog.empty')}</p>
        <Button variant="outline" onClick={openAddForm}>
          <Plus className="mr-1 size-4" />
          {t('aiCatalog.addProduct')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {products.map(product => {
          let thumb = product.mainImage || '';
          if (!thumb && product.images) {
            try {
              const imgs = JSON.parse(product.images);
              thumb = Array.isArray(imgs) ? imgs[0] || '' : '';
            } catch {
              /* empty */
            }
          }
          const variantCount = product.variants?.length || 0;
          return (
            <div
              key={product.id}
              onClick={() => openEditForm(product)}
              className="flex gap-3 rounded-xl border bg-card p-3 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-lg">
                {thumb ? (
                  <img src={thumb} alt={product.name} className="size-full object-cover" />
                ) : (
                  <div
                    className={cn(
                      'flex size-full items-center justify-center',
                      isDark ? 'bg-white/6' : 'bg-black/4'
                    )}
                  >
                    <ImageIcon className="size-6 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="truncate text-sm font-bold">{product.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{product.sku || '—'}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black tabular-nums">
                    {product.price?.toFixed(2)}
                  </span>
                  <Badge
                    variant={product.stock > 0 ? 'outline' : 'destructive'}
                    className={cn(
                      'text-[0.7rem] tabular-nums',
                      product.stock > 0 && 'border-success text-success'
                    )}
                  >
                    {product.stock}
                  </Badge>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {variantCount > 0 && (
                    <Badge variant="outline" className="text-[0.6rem] tabular-nums">
                      <Palette className="ml-0.5 size-3" />
                      {variantCount}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openEditForm(product)}
                    aria-label={t('aiCatalog.editProduct')}
                  >
                    <Pencil className="size-3.5 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDuplicate(product)}
                    aria-label="Duplicate"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setDeleteTarget(product)}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && products.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-xs text-muted-foreground tabular-nums">
            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, totalCount)} /{' '}
            {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
              onClick={() => setPage(p => p + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductMobileListView;

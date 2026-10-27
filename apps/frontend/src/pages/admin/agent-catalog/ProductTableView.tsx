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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import type { ProductRecord } from './types';

interface ProductTableViewProps {
  products: ProductRecord[];
  loading: boolean;
  isDark: boolean;
  totalCount: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage: number;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
  openAddForm: () => void;
  openEditForm: (product: ProductRecord) => void;
  handleDuplicate: (product: ProductRecord) => void;
  setDeleteTarget: (product: ProductRecord) => void;
}

export const ProductTableView: React.FC<ProductTableViewProps> = ({
  products,
  loading,
  isDark,
  totalCount,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  openAddForm,
  openEditForm,
  handleDuplicate,
  setDeleteTarget,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border',
        isDark ? 'border-white/8' : 'border-black/6'
      )}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className={cn(isDark ? 'bg-white/3' : 'bg-black/2')}>
              <TableHead className="w-[60px] font-extrabold">{t('aiCatalog.image')}</TableHead>
              <TableHead className="font-extrabold">{t('aiCatalog.title')}</TableHead>
              <TableHead className="font-extrabold">{t('aiCatalog.sku')}</TableHead>
              <TableHead className="text-center font-extrabold">{t('aiCatalog.price')}</TableHead>
              <TableHead className="text-center font-extrabold">{t('aiCatalog.stock')}</TableHead>
              <TableHead className="text-center font-extrabold">{t('aiCatalog.variants')}</TableHead>
              <TableHead className="w-[140px] text-center font-extrabold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <ShoppingBag className="size-14 text-muted-foreground/50" />
                    <p className="font-semibold text-muted-foreground">{t('aiCatalog.empty')}</p>
                    <Button variant="outline" onClick={openAddForm}>
                      <Plus className="mr-1 size-4" />
                      {t('aiCatalog.addProduct')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map(product => {
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
                  <TableRow
                    key={product.id}
                    className="cursor-pointer transition-colors"
                    onClick={() => openEditForm(product)}
                  >
                    <TableCell>
                      <Avatar className="size-11 rounded-md">
                        <AvatarImage src={thumb || undefined} alt={product.name} />
                        <AvatarFallback
                          className={cn('rounded-md', isDark ? 'bg-white/6' : 'bg-black/4')}
                        >
                          <ImageIcon className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <span className="max-w-[220px] truncate text-sm font-bold">
                        {product.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-muted-foreground font-mono">
                        {product.sku || '—'}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-bold text-xs tabular-nums">
                        {product.price?.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={product.stock > 0 ? 'outline' : 'destructive'}
                        className={cn(
                          'font-bold text-xs tabular-nums',
                          product.stock > 0 && 'border-success text-success'
                        )}
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {variantCount > 0 ? (
                        <Badge variant="outline" className="text-[0.7rem] tabular-nums">
                          <Palette className="mr-0.5 size-3.5" />
                          {variantCount}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="flex items-center justify-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEditForm(product)}
                                aria-label={t('aiCatalog.editProduct')}
                              >
                                <Pencil className="size-3.5 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('aiCatalog.editProduct')}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDuplicate(product)}
                                aria-label="Duplicate"
                              >
                                <Copy className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicate</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setDeleteTarget(product)}
                                aria-label="Delete"
                              >
                                <Trash2 className="size-3.5 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('rowsPerPage') || 'Rows per page:'}
            </span>
            <select
              value={rowsPerPage}
              onChange={e => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              className="rounded-md border border-input bg-background px-2 py-1 text-sm tabular-nums"
            >
              {[5, 10, 25, 50].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              السابق
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {t('pagination.page', 'صفحة {{page}} من {{total}}', {
                page: page + 1,
                total: Math.max(1, Math.ceil(totalCount / rowsPerPage)),
              })}
            </span>
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
    </div>
  );
};

export default ProductTableView;

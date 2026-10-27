import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, RefreshCw, Search, ShoppingBag } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPageHeader } from '@/components/Admin';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  type ProductRecord,
  useIsMobile,
  useProductForm,
  ProductFormDrawer,
  ProductStatsCards,
  ProductTableView,
  ProductMobileListView,
  ProductDeleteDialog,
} from './agent-catalog';

export default function AgentCatalogPage() {
  const { t } = useTranslation();
  const { derivedTheme } = useTheme();
  const isDark = derivedTheme === 'dark';
  const isMobile = useIsMobile();

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await apiClient.get<{
        success: boolean;
        data: ProductRecord[];
        totalProducts?: number;
        pagination?: { totalProducts?: number; totalCount?: number };
      }>('/products', { params });

      const data = res.data;
      setProducts(data.data || []);
      setTotalCount(
        data.pagination?.total ??
          data.pagination?.totalProducts ??
          data.pagination?.totalCount ??
          data.totalProducts ??
          (data.data?.length || 0)
      );
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const {
    drawerOpen,
    formData,
    setFormData,
    saving,
    openAddForm,
    openEditForm,
    handleSave,
    closeDrawer,
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleDelete,
    handleDuplicate,
  } = useProductForm({ fetchProducts, t });

  const stats = useMemo(() => {
    const total = totalCount;
    const outOfStock = products.filter(p => p.stock <= 0).length;
    const avgPrice =
      products.length > 0
        ? (products.reduce((s, p) => s + (p.price || 0), 0) / products.length).toFixed(0)
        : '0';
    return { total, outOfStock, avgPrice };
  }, [products, totalCount]);

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-background p-4 md:p-6" dir="rtl">
      <AdminPageHeader
        title={t('aiCatalog.title')}
        subtitle={t('aiCatalog.subtitle')}
        icon={<ShoppingBag className="size-7" />}
        actions={
          isMobile ? (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={fetchProducts}>
                      {loading ? <LoadingSpinner size="sm" /> : <RefreshCw className="size-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <>
              <div className="relative w-[260px]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('aiCatalog.search')}
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  className="pl-8"
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={openAddForm}
                      className="rounded-lg px-6 font-extrabold shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
                    >
                      <Plus className="mr-1 size-4" />
                      {t('aiCatalog.addProduct')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('aiCatalog.addProduct')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={fetchProducts}>
                      {loading ? <LoadingSpinner size="sm" /> : <RefreshCw className="size-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )
        }
      />

      {isMobile && (
        <div className="sticky top-0 z-10 -mx-4 mb-4 bg-background px-4 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('aiCatalog.search')}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <ProductStatsCards isMobile={isMobile} stats={stats} />

      {error && (
        <div
          className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="icon-xs" onClick={() => setError(null)}>
              <X className="size-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="animate-in fade-in duration-800">
        {isMobile ? (
          <ProductMobileListView
            products={products}
            loading={loading}
            isDark={isDark}
            totalCount={totalCount}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            openAddForm={openAddForm}
            openEditForm={openEditForm}
            handleDuplicate={handleDuplicate}
            setDeleteTarget={setDeleteTarget}
          />
        ) : (
          <ProductTableView
            products={products}
            loading={loading}
            isDark={isDark}
            totalCount={totalCount}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            openAddForm={openAddForm}
            openEditForm={openEditForm}
            handleDuplicate={handleDuplicate}
            setDeleteTarget={setDeleteTarget}
          />
        )}
      </div>

      <ProductFormDrawer
        open={drawerOpen}
        formData={formData}
        onChange={setFormData}
        onSave={handleSave}
        onClose={closeDrawer}
        saving={saving}
      />

      <ProductDeleteDialog
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        onDelete={handleDelete}
        deleting={deleting}
      />

      {isMobile && (
        <button
          onClick={openAddForm}
          className="fixed bottom-6 left-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_32px_rgba(99,102,241,0.4)] transition-all active:scale-90 hover:scale-105"
          aria-label={t('aiCatalog.addProduct')}
        >
          <Plus className="size-6" />
        </button>
      )}
    </div>
  );
}

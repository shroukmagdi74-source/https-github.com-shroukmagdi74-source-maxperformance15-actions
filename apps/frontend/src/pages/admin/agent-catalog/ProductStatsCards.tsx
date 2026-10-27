import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Package, TrendingUp } from 'lucide-react';
import { AdminDataCard } from '@/components/Admin';

interface ProductStatsCardsProps {
  isMobile: boolean;
  stats: {
    total: number;
    outOfStock: number;
    avgPrice: string;
  };
}

export const ProductStatsCards: React.FC<ProductStatsCardsProps> = ({
  isMobile,
  stats,
}) => {
  const { t } = useTranslation();

  if (isMobile) {
    return (
      <div className="mb-4 flex gap-3 overflow-x-auto px-0 scrollbar-none">
        <div className="flex shrink-0 items-center gap-3 rounded-xl border bg-card p-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'rgb(99,102,241)' }}
          >
            <ShoppingBag className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">{t('aiCatalog.totalProducts')}</p>
            <p className="text-lg font-black tabular-nums">{stats.total}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-xl border bg-card p-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'rgb(239,68,68)' }}
          >
            <Package className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">{t('aiCatalog.outOfStock')}</p>
            <p className="text-lg font-black tabular-nums">{stats.outOfStock}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-xl border bg-card p-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: 'rgb(34,197,94)' }}
          >
            <TrendingUp className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">{t('aiCatalog.avgPrice')}</p>
            <p className="text-lg font-black tabular-nums">{stats.avgPrice}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <AdminDataCard
        icon={<ShoppingBag className="size-5" />}
        label={t('aiCatalog.totalProducts')}
        value={stats.total}
        accentColor="99,102,241"
      />
      <AdminDataCard
        icon={<Package className="size-5" />}
        label={t('aiCatalog.outOfStock')}
        value={stats.outOfStock}
        accentColor="239,68,68"
      />
      <AdminDataCard
        icon={<TrendingUp className="size-5" />}
        label={t('aiCatalog.avgPrice')}
        value={stats.avgPrice}
        accentColor="34,197,94"
      />
    </div>
  );
};

export default ProductStatsCards;

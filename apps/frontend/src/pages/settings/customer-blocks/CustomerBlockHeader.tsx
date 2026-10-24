import React from 'react';
import { Ban } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CustomerBlockHeaderProps {
  activeRulesCount: number;
}

export const CustomerBlockHeader: React.FC<CustomerBlockHeaderProps> = ({
  activeRulesCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Ban className="size-6 text-red-500 shrink-0" />
            {t('customerBlocks.k_35', 'إعدادات حظر العملاء والقائمة السوداء')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              'customerBlocks.k_36',
              'تحكم في سياسات الحظر التلقائي ومنع العملاء غير الملتزمين من إنشاء الطلبات',
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <span className="font-mono tabular-nums">{activeRulesCount}</span>
          <span>{t('customerBlocks.k_37', 'عميل محظور حالياً')}</span>
        </div>
      </div>
    </div>
  );
};

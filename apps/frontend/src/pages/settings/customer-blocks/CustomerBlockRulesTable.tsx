import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CustomerBlockRule } from './types';

interface CustomerBlockRulesTableProps {
  rules: CustomerBlockRule[];
  search: string;
  setSearch: (v: string) => void;
  loadData: () => Promise<void>;
  handleLiftRule: (rule: CustomerBlockRule) => Promise<void>;
  getActionLabel: (action?: string | null) => string;
  getReasonLabel: (reason?: string | null) => string;
  formatDate: (date?: string | null) => string;
}

export const CustomerBlockRulesTable: React.FC<CustomerBlockRulesTableProps> = ({
  rules,
  search,
  setSearch,
  loadData,
  handleLiftRule,
  getActionLabel,
  getReasonLabel,
  formatDate,
}) => {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-base font-semibold text-foreground">
          {t('customerBlocks.k_46', 'قائمة العملاء المحظورين حالياً')}
        </h3>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('customerBlocks.k_29', 'بحث بالهاتف أو البريد...')}
              className="pr-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={loadData}
            className="font-semibold text-xs"
          >
            {t('customerBlocks.k_47', 'تحديث')}
          </Button>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          {t('customerBlocks.k_48', 'لا توجد قواعد حظر مسجلة تطابق البحث')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead>
              <tr className="text-right text-xs font-semibold uppercase text-muted-foreground">
                <th className="px-3 py-3">{t('customerBlocks.k_30', 'العميل')}</th>
                <th className="px-3 py-3">{t('customerBlocks.k_27', 'رقم الهاتف')}</th>
                <th className="px-3 py-3">{t('customerBlocks.k_31', 'الإجراء')}</th>
                <th className="px-3 py-3">{t('customerBlocks.k_32', 'السبب')}</th>
                <th className="px-3 py-3">{t('customerBlocks.k_33', 'تاريخ الانتهاء')}</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rules.map((rule) => (
                <tr key={rule.id} className="transition hover:bg-muted/30">
                  <td className="px-3 py-3 font-medium text-foreground">
                    {rule.customer
                      ? `${rule.customer.firstName || ''} ${rule.customer.lastName || ''}`.trim()
                      : rule.email || t('customerBlocks.k_34', 'عميل غير مسجل')}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground font-mono tabular-nums" dir="ltr">
                    {rule.phone || '—'}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                      {getActionLabel(rule.action)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {getReasonLabel(rule.reasonCode)}
                    {rule.reasonNote ? ` - ${rule.reasonNote}` : ''}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground font-mono tabular-nums">
                    {formatDate(rule.expiresAt)}
                  </td>
                  <td className="px-3 py-3 text-left">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLiftRule(rule)}
                      className="gap-1.5 text-xs font-semibold text-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Unlock className="size-3.5" />
                      {t('customerBlocks.k_49', 'رفع الحظر')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

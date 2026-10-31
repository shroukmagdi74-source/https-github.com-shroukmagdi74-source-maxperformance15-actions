import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface SuppliersHeaderProps {
  title?: string;
  addNewLabel?: string;
  recalculatingAll: boolean;
  loading: boolean;
  onRecalculateAll: () => void;
  onAddNew: () => void;
}

export const SuppliersHeader: React.FC<SuppliersHeaderProps> = ({
  title,
  addNewLabel,
  recalculatingAll,
  loading,
  onRecalculateAll,
  onAddNew,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      data-testid="suppliers-header"
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {title || t('procurement.suppliers.title')}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          سجل الموردين المعتمدين، بيانات الاتصال، والأرصدة الدائنة والتقييمات
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onRecalculateAll}
          disabled={recalculatingAll || loading}
          className="gap-2"
          title="تدقيق ومزامنة أرصدة كافة الموردين مع الفواتير وسندات الصرف الحقيقية"
        >
          <RefreshCw className={`size-4 ${recalculatingAll ? 'animate-spin text-primary' : ''}`} />
          <span>{recalculatingAll ? 'جاري التدقيق...' : 'مزامنة وتدقيق الأرصدة'}</span>
        </Button>
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="size-4" /> {addNewLabel || t('procurement.suppliers.addNew')}
        </Button>
      </div>
    </div>
  );
};

export default SuppliersHeader;

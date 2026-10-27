import React from 'react';
import { Lightbulb, BadgeCheck } from 'lucide-react';
import type { DevTaskFormData } from './types';

interface DevTaskBusinessCriteriaCardProps {
  formData: DevTaskFormData;
  handleChange: (field: keyof DevTaskFormData, value: string) => void;
}

export const DevTaskBusinessCriteriaCard: React.FC<DevTaskBusinessCriteriaCardProps> = ({
  formData,
  handleChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <label className="block text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span>القيمة التجارية (Business Value)</span>
        </label>
        <textarea
          value={formData.businessValue}
          onChange={e => handleChange('businessValue', e.target.value)}
          placeholder="لماذا نقوم بهذا العمل؟ ما الأثر والعائد المتوقع على الأعمال والعملاء؟"
          rows={5}
          className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-muted/20 focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground text-xs leading-relaxed resize-none transition-colors"
        />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <label className="block text-xs font-semibold text-foreground mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-emerald-500" />
            <span>معايير القبول (Acceptance Criteria)</span>
          </span>
        </label>
        <p className="text-[11px] text-muted-foreground mb-2">
          اكتب كل معيار في سطر منفصل؛ سيتم تنظيمها تلقائياً كقائمة تحقق
        </p>
        <textarea
          value={formData.acceptanceCriteria}
          onChange={e => handleChange('acceptanceCriteria', e.target.value)}
          placeholder="- يجب تنفيذ الطلب خلال 200ms&#10;- يجب إظهار إشعار تأكيد للعميل&#10;- حفظ السجل في قاعدة البيانات"
          rows={4}
          className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-muted/20 focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground text-xs leading-relaxed resize-none transition-colors"
        />
      </div>
    </div>
  );
};

export default DevTaskBusinessCriteriaCard;

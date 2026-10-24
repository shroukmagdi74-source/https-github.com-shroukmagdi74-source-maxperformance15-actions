import React from 'react';
import { AVAILABLE_STATUS_OPTIONS } from './constants';
import type { DuplicateOrderSettingsData } from './types';

interface DuplicateOrderStatusesCardProps {
  settings: DuplicateOrderSettingsData;
  onStatusToggle: (code: string) => void;
}

export const DuplicateOrderStatusesCard: React.FC<DuplicateOrderStatusesCardProps> = ({
  settings,
  onStatusToggle,
}) => {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-4 shadow-xs space-y-3">
      <div className="space-y-0.5">
        <label className="block text-xs font-semibold text-foreground">
          الحالات المحسوبة «جاري العمل عليها»
        </label>
        <p className="text-[11px] text-muted-foreground">
          يقارن التكرار فقط بالطلبات التي تحمل إحدى الحالات المحددة أدناه:
        </p>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {AVAILABLE_STATUS_OPTIONS.map((st) => {
          const selected = settings.activeStatuses.includes(st.code);
          return (
            <button
              key={st.code}
              type="button"
              onClick={() => onStatusToggle(st.code)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selected
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
              }`}
            >
              <span className={`size-2 rounded-full ${st.dot}`} />
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>
      <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-muted-foreground leading-relaxed">
        الحالات المنتهية (تم التسليم · مرتجع · مرتجع جزئي · مسترد · ملغي · مفقود · فشل الدفع) تُعتبر منتهية، وإذا طلب العميل مجددًا يُسجّل كطلب جديد عادي دون تصنيفه مكررًا.
      </div>
    </div>
  );
};

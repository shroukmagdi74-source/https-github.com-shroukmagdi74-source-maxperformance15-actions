import React from 'react';
import { Clock } from 'lucide-react';
import { TIME_WINDOW_PRESETS } from './constants';
import type { DuplicateOrderSettingsData } from './types';

interface DuplicateOrderTimeWindowCardProps {
  settings: DuplicateOrderSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<DuplicateOrderSettingsData>>;
}

export const DuplicateOrderTimeWindowCard: React.FC<DuplicateOrderTimeWindowCardProps> = ({
  settings,
  setSettings,
}) => {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary shrink-0" />
          <label className="text-xs font-semibold text-foreground">النافذة الزمنية للفحص</label>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.windowEnabled}
          onClick={() => setSettings((s) => ({ ...s, windowEnabled: !s.windowEnabled }))}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            settings.windowEnabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
              settings.windowEnabled ? '-translate-x-4.5' : '-translate-x-1'
            }`}
          />
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {settings.windowEnabled
          ? 'يتم البحث عن المكرر فقط خلال الفترة المحددة أدناه.'
          : 'النافذة مغلقة (افتراضي): يتم فحص أي طلب سابق نشط للعميل بلا مدة زمنية محددة.'}
      </p>
      {settings.windowEnabled && (
        <div className="space-y-2.5 pt-1">
          <div className="flex flex-wrap gap-2">
            {TIME_WINDOW_PRESETS.map((preset) => (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => setSettings((s) => ({ ...s, windowMinutes: preset.minutes }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border tabular-nums transition-colors active:scale-[0.98] ${
                  settings.windowMinutes === preset.minutes
                    ? 'border-primary bg-primary text-primary-foreground font-semibold'
                    : 'border-border/60 bg-muted/30 text-foreground hover:bg-muted/60'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-border/30">
            <label className="text-[11px] text-muted-foreground whitespace-nowrap">المدة المخصصة:</label>
            <input
              type="number"
              min={5}
              max={10080}
              value={settings.windowMinutes}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  windowMinutes: Math.max(5, Math.min(10080, parseInt(e.target.value, 10) || 60)),
                }))
              }
              className="w-24 px-2.5 py-1 text-xs border border-border/60 rounded-lg bg-background text-foreground font-mono tabular-nums focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <span className="text-[11px] text-muted-foreground">دقيقة (بين 5 و 10080)</span>
          </div>
        </div>
      )}
    </div>
  );
};

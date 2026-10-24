import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { DuplicateOrderSettingsData } from './types';

interface DuplicateOrderHeaderProps {
  settings: DuplicateOrderSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<DuplicateOrderSettingsData>>;
}

export const DuplicateOrderHeader: React.FC<DuplicateOrderHeaderProps> = ({
  settings,
  setSettings,
}) => {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary shrink-0" />
            <h2 className="text-base font-semibold text-foreground">
              إعدادات فحص الطلبات المكررة
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            فحص تلقائي للطلبات المتكررة لنفس العميل لحماية المخزون ومنع الشحن المزدوج. تُحفظ الإعدادات لكل شركة على حدة.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-foreground">
            {settings.enabled ? 'الفحص مفعّل' : 'الفحص معطّل'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.enabled}
            onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              settings.enabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                settings.enabled ? '-translate-x-6' : '-translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ACTION_OPTIONS } from './constants';
import type { DuplicateOrderSettingsData } from './types';

interface DuplicateOrderActionCardProps {
  settings: DuplicateOrderSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<DuplicateOrderSettingsData>>;
}

export const DuplicateOrderActionCard: React.FC<DuplicateOrderActionCardProps> = ({
  settings,
  setSettings,
}) => {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-4 shadow-xs space-y-3">
      <label className="block text-xs font-semibold text-foreground">
        التصرف عند اكتشاف مكرر
      </label>
      <div className="space-y-2">
        {ACTION_OPTIONS.map((act) => (
          <label
            key={act.id}
            className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
              settings.action === act.id
                ? 'border-primary/50 bg-primary/5'
                : 'border-border/50 hover:bg-muted/40'
            }`}
          >
            <input
              type="radio"
              name="duplicateAction"
              value={act.id}
              checked={settings.action === act.id}
              onChange={() =>
                setSettings((s) => ({
                  ...s,
                  action: act.id as DuplicateOrderSettingsData['action'],
                }))
              }
              className="mt-0.5 text-primary focus:ring-primary"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">{act.title}</span>
              <p className="text-[11px] text-muted-foreground">{act.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

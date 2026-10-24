import React from 'react';
import { Users } from 'lucide-react';

interface DuplicateOrderWhitelistCardProps {
  exemptPhonesText: string;
  setExemptPhonesText: (v: string) => void;
}

export const DuplicateOrderWhitelistCard: React.FC<DuplicateOrderWhitelistCardProps> = ({
  exemptPhonesText,
  setExemptPhonesText,
}) => {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-4 shadow-xs space-y-2">
      <div className="flex items-center gap-2">
        <Users className="size-4 text-primary shrink-0" />
        <label className="text-xs font-semibold text-foreground">
          استثناءات (أرقام مستثناة من الفحص)
        </label>
      </div>
      <p className="text-[11px] text-muted-foreground">
        أرقام تجار الجملة والعملاء المميزين (VIP) لتجاوز فحص التكرار والسماح بطلبات متتالية دون تقييد:
      </p>
      <textarea
        rows={4}
        value={exemptPhonesText}
        onChange={(e) => setExemptPhonesText(e.target.value)}
        placeholder="01012345678&#10;01234567890&#10;(اكتب كل رقم في سطر جديد أو افصل بفواصل)"
        className="w-full px-3 py-2 text-xs border border-border/60 rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none font-mono tabular-nums"
      />
    </div>
  );
};

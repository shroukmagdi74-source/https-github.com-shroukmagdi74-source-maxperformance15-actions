import React, { useRef } from 'react';
import { BadgeCheck, CheckCircle2, X } from 'lucide-react';

interface DevTaskChecklistCardProps {
  checklistItems: string[];
  setChecklistItems: React.Dispatch<React.SetStateAction<string[]>>;
}

export const DevTaskChecklistCard: React.FC<DevTaskChecklistCardProps> = ({
  checklistItems,
  setChecklistItems,
}) => {
  const checklistInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const val = checklistInputRef.current?.value.trim();
    if (val) {
      setChecklistItems(prev => [...prev, val]);
      if (checklistInputRef.current) {
        checklistInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    setChecklistItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
        <BadgeCheck className="h-4 w-4 text-primary" />
        <span>قوائم التحقق المبدئية (Checklists)</span>
      </h3>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            ref={checklistInputRef}
            type="text"
            placeholder="أضف بنداً جديداً للقائمة..."
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-1.5 text-xs border border-border rounded-lg bg-muted/20 focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            إضافة
          </button>
        </div>

        {checklistItems.length > 0 && (
          <ul className="space-y-1.5">
            {checklistItems.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between p-2.5 bg-muted/30 border border-border/50 rounded-lg group text-xs"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-foreground truncate">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1"
                  aria-label="Remove checklist item"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DevTaskChecklistCard;

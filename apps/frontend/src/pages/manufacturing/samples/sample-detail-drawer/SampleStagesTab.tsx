import React from 'react';
import { Plus, Play, Check, CheckCircle2 } from 'lucide-react';
import { SampleOrder, SampleOrderStage } from '../manufacturingApi';

export interface SampleStagesTabProps {
  sample: SampleOrder;
  loading: boolean;
  isAddingStage: boolean;
  setIsAddingStage: (val: boolean) => void;
  newStageName: string;
  setNewStageName: (val: string) => void;
  onAddStage: (e: React.FormEvent) => void;
  onStageStatusChange: (stage: SampleOrderStage, newStatus: string) => void;
}

export const SampleStagesTab: React.FC<SampleStagesTabProps> = ({
  sample,
  loading,
  isAddingStage,
  setIsAddingStage,
  newStageName,
  setNewStageName,
  onAddStage,
  onStageStatusChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">
          مسار تشغيل مراحل العينة
        </span>
        <button
          onClick={() => setIsAddingStage(true)}
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> إضافة مرحلة
        </button>
      </div>

      {isAddingStage && (
        <form
          onSubmit={onAddStage}
          className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2"
        >
          <input
            type="text"
            required
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            placeholder="اسم المرحلة الجديدة (مثال: تطريز اللوجو)"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingStage(false)}
              className="px-2.5 py-1 text-xs rounded-md border hover:bg-muted"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground font-medium"
            >
              إضافة
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sample.stages?.map((st) => (
          <div
            key={st.id}
            className="p-3 rounded-xl border border-border/70 bg-card hover:border-border transition-all flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-bold text-[11px] tabular-nums shrink-0">
                {st.sequence}
              </span>
              <div>
                <p className="font-semibold text-foreground">{st.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {st.status === 'COMPLETED'
                    ? 'مكتملة بنجاح'
                    : st.status === 'IN_PROGRESS'
                    ? 'قيد التنفيذ حالياً'
                    : 'في الانتظار'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {st.status === 'PENDING' && (
                <button
                  onClick={() => onStageStatusChange(st, 'IN_PROGRESS')}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 flex items-center gap-1 active:scale-95"
                >
                  <Play className="w-3 h-3" />
                  <span>بدء</span>
                </button>
              )}
              {st.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => onStageStatusChange(st, 'COMPLETED')}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-100 flex items-center gap-1 active:scale-95"
                >
                  <Check className="w-3 h-3" />
                  <span>إنهاء</span>
                </button>
              )}
              {st.status === 'COMPLETED' && (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

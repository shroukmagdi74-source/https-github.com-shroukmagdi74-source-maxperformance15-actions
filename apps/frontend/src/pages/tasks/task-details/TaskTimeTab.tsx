import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { BusinessSectionPanel } from '../../../components/business/BusinessSurface';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { TaskTimeEntry, formatDuration, formatDateTime, getPersonName } from './types';
import { TaskEmptyState } from './TaskInfoWidgets';

interface TaskTimeTabProps {
  totalTimeMinutes: number;
  estimatedHours: number;
  timeEntries: TaskTimeEntry[];
  showManualTimeForm: boolean;
  setShowManualTimeForm: React.Dispatch<React.SetStateAction<boolean>>;
  manualTimeEntry: { hours: number; minutes: number; description: string };
  setManualTimeEntry: React.Dispatch<React.SetStateAction<{ hours: number; minutes: number; description: string }>>;
  onAddManualTime: () => void;
}

export const TaskTimeTab: React.FC<TaskTimeTabProps> = ({
  totalTimeMinutes,
  estimatedHours,
  timeEntries,
  showManualTimeForm,
  setShowManualTimeForm,
  manualTimeEntry,
  setManualTimeEntry,
  onAddManualTime,
}) => {
  return (
    <BusinessSectionPanel
      title="سجل الوقت"
      description="تابع الوقت الفعلي للمهمة وقارنه بالتقدير حتى تبقى الصورة التشغيلية واقعية."
      headerAside={
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowManualTimeForm((current) => !current)}
        >
          <PlusIcon className="size-4" />
          إضافة وقت يدوي
        </Button>
      }
      contentClassName="space-y-4"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[24px] border border-border/65 bg-background/65 px-4 py-4">
          <p className="text-xs font-semibold text-muted-foreground">
            إجمالي الوقت المسجل
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {formatDuration(totalTimeMinutes)}
          </p>
        </div>
        <div className="rounded-[24px] border border-border/65 bg-background/65 px-4 py-4">
          <p className="text-xs font-semibold text-muted-foreground">
            الوقت المقدر
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {estimatedHours || 0} ساعة
          </p>
        </div>
      </div>

      {showManualTimeForm ? (
        <div className="rounded-[26px] border border-border/70 bg-background/60 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                ساعات
              </label>
              <Input
                type="number"
                min="0"
                value={manualTimeEntry.hours}
                onChange={(event) =>
                  setManualTimeEntry((current) => ({
                    ...current,
                    hours: parseInt(event.target.value, 10) || 0,
                  }))
                }
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                دقائق
              </label>
              <Input
                type="number"
                min="0"
                max="59"
                value={manualTimeEntry.minutes}
                onChange={(event) =>
                  setManualTimeEntry((current) => ({
                    ...current,
                    minutes: parseInt(event.target.value, 10) || 0,
                  }))
                }
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">
                الوصف
              </label>
              <Input
                value={manualTimeEntry.description}
                onChange={(event) =>
                  setManualTimeEntry((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="ما الذي تم إنجازه خلال هذا الوقت؟"
                className="h-11 rounded-2xl"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowManualTimeForm(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={onAddManualTime}
              disabled={
                manualTimeEntry.hours === 0 &&
                manualTimeEntry.minutes === 0
              }
            >
              حفظ الوقت
            </Button>
          </div>
        </div>
      ) : null}

      {timeEntries.length > 0 ? (
        <div className="space-y-3">
          {timeEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-2 rounded-[24px] border border-border/70 bg-background/65 px-4 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {formatDuration(entry.duration)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getPersonName(entry.user)} • {formatDateTime(entry.startTime)}
                </p>
              </div>
              {entry.description ? (
                <p className="text-sm leading-7 text-muted-foreground">
                  {entry.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <TaskEmptyState
          title="لا توجد سجلات وقت"
          description="ابدأ المؤقت أو أضف وقتًا يدويًا عندما تريد تتبع الجهد المبذول على هذه المهمة."
        />
      )}
    </BusinessSectionPanel>
  );
};

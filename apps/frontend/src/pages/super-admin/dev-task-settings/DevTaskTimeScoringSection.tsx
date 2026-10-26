import React from "react";
import { SettingsData } from "./types";

interface DevTaskTimeScoringSectionProps {
  settings: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData | null>>;
}

export const DevTaskTimeScoringSection: React.FC<DevTaskTimeScoringSectionProps> = ({
  settings,
  setSettings,
}) => {
  const currentBaseXP = settings.leaderboardSettings?.baseXP || 10;
  const currentTaskTypeScores = settings.leaderboardSettings?.taskTypeScores || {};
  const currentPriorityScores = settings.leaderboardSettings?.priorityScores || {};
  const timeScoring = settings.leaderboardSettings?.timeBasedScoring;

  const updateTimeScoringField = (
    field: string,
    val: boolean | number,
  ) => {
    setSettings({
      ...settings,
      leaderboardSettings: {
        baseXP: currentBaseXP,
        taskTypeScores: currentTaskTypeScores,
        priorityScores: currentPriorityScores,
        timeBasedScoring: {
          earlyCompletionBonus: 20,
          onTimeBonus: 10,
          lateCompletionPenalty: 15,
          maxBonusPercent: 50,
          maxPenaltyPercent: 30,
          ...(timeScoring || {}),
          [field]: val,
        },
      },
    });
  };

  return (
    <>
      {/* Example Calculation */}
      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
        <h4 className="text-sm font-semibold text-primary mb-2">
          مثال توضيحي على الحساب:
        </h4>
        <p className="text-sm text-foreground/80">
          مهمة من نوع <strong className="font-mono">FEATURE</strong> بأولوية{" "}
          <strong className="font-mono">HIGH</strong> ={" "}
          <strong className="font-mono">{currentBaseXP}</strong> (أساسي) +{" "}
          <strong className="font-mono">
            {currentTaskTypeScores["FEATURE"] || 0}
          </strong>{" "}
          (نوع المهمة) +{" "}
          <strong className="font-mono">
            {currentPriorityScores["HIGH"] || 0}
          </strong>{" "}
          (الأولوية) ={" "}
          <strong className="text-lg font-mono text-primary tabular-nums">
            {currentBaseXP +
              (currentTaskTypeScores["FEATURE"] || 0) +
              (currentPriorityScores["HIGH"] || 0)}
          </strong>{" "}
          نقطة
        </p>
      </div>

      {/* Time-Based Scoring */}
      <div className="border-t border-border pt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              حساب النقاط بناءً على الوقت
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              مكافأة للإنجاز المبكر وخصم للتأخير الزمني
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={timeScoring?.enabled || false}
              onChange={(e) => updateTimeScoringField("enabled", e.target.checked)}
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {timeScoring?.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Early Completion Bonus */}
            <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/20">
              <label className="block text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                مكافأة الإنجاز المبكر
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                عند إكمال المهمة في 90% أو أقل من الوقت المقدر
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={timeScoring?.earlyCompletionBonus ?? 20}
                  onChange={(e) =>
                    updateTimeScoringField(
                      "earlyCompletionBonus",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-20 border rounded px-2 py-1 text-sm bg-background border-input text-foreground focus:ring-1 focus:ring-primary font-mono tabular-nums"
                />
                <span className="text-xs text-muted-foreground">% مكافأة</span>
              </div>
            </div>

            {/* On Time Bonus */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <label className="block text-sm font-medium text-primary mb-1">
                مكافأة الالتزام بالموعد
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                عند إكمال المهمة في حدود ±10% من الوقت المقدر
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={timeScoring?.onTimeBonus ?? 10}
                  onChange={(e) =>
                    updateTimeScoringField(
                      "onTimeBonus",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-20 border rounded px-2 py-1 text-sm bg-background border-input text-foreground focus:ring-1 focus:ring-primary font-mono tabular-nums"
                />
                <span className="text-xs text-muted-foreground">% مكافأة</span>
              </div>
            </div>

            {/* Late Completion Penalty */}
            <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
              <label className="block text-sm font-medium text-destructive mb-1">
                خصم التأخير
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                عند إكمال المهمة بعد الوقت المقدر بأكثر من 10%
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={timeScoring?.lateCompletionPenalty ?? 15}
                  onChange={(e) =>
                    updateTimeScoringField(
                      "lateCompletionPenalty",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-20 border rounded px-2 py-1 text-sm bg-background border-input text-foreground focus:ring-1 focus:ring-primary font-mono tabular-nums"
                />
                <span className="text-xs text-muted-foreground">% خصم</span>
              </div>
            </div>

            {/* Max Bonus & Penalty */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <label className="block text-sm font-medium text-foreground mb-2">
                الحد الأقصى للمكافأة والخصم
              </label>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    أقصى مكافأة:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={timeScoring?.maxBonusPercent ?? 50}
                      onChange={(e) =>
                        updateTimeScoringField(
                          "maxBonusPercent",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-20 border rounded px-2 py-1 text-sm bg-background border-input text-foreground focus:ring-1 focus:ring-primary font-mono tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    أقصى خصم:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={timeScoring?.maxPenaltyPercent ?? 30}
                      onChange={(e) =>
                        updateTimeScoringField(
                          "maxPenaltyPercent",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-20 border rounded px-2 py-1 text-sm bg-background border-input text-foreground focus:ring-1 focus:ring-primary font-mono tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
        <p className="text-xs text-amber-700 dark:text-amber-300">
          <strong>ملاحظة هامة:</strong> بعد تغيير هذه الإعدادات، يمكنك إعادة
          حساب النقاط لجميع المهام المكتملة سابقاً باستخدام سكريبت{" "}
          <code className="bg-amber-500/15 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded font-mono">
            npm run fix:xp
          </code>
        </p>
      </div>
    </>
  );
};

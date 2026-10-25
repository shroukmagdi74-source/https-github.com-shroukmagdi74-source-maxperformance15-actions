import React from "react";
import { Trash2, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Switch } from "../../../../../components/ui/switch";
import { Separator } from "../../../../../components/ui/separator";
import {
  PunctualityRules,
  FinancialPenalties,
} from "../../../../../components/hr/AutoDeductionSettings";
import type { HRSettingsData } from "../../types/hrSettingsTypes";

interface AttendancePunctualityPanelProps {
  settings: HRSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<HRSettingsData>>;
}

export const AttendancePunctualityPanel: React.FC<
  AttendancePunctualityPanelProps
> = ({ settings, setSettings }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          سياسات الالتزام والجزاءات
        </CardTitle>
        <CardDescription>
          تعريف قواعد الحضور والعقوبات المالية المترتبة على التأخير
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 1. القواعد العامة (Thresholds) */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30">
              <Label htmlFor="earlyLeaveThreshold">
                حد الانصراف المبكر (بالدقائق)
              </Label>
              <Input
                id="earlyLeaveThreshold"
                name="earlyLeaveThreshold"
                className="mt-2 tabular-nums font-mono"
                type="number"
                min={0}
                value={settings.earlyLeaveThreshold}
                onChange={(e) =>
                  setSettings((previous) => ({
                    ...previous,
                    earlyLeaveThreshold: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30">
              <Label htmlFor="monthlyLateLimit">
                حد التأخير الشهري (مرات)
              </Label>
              <Input
                id="monthlyLateLimit"
                name="monthlyLateLimit"
                className="mt-2 tabular-nums font-mono"
                type="number"
                min={0}
                value={settings.monthlyLateLimit}
                onChange={(e) =>
                  setSettings((previous) => ({
                    ...previous,
                    monthlyLateLimit: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* 2. رصيد التسامح (Grace Period) */}
        <PunctualityRules settings={settings} setSettings={setSettings} />

        {/* 3. الجزاءات المالية (Financial Penalties) */}
        <FinancialPenalties settings={settings} setSettings={setSettings} />

        <Separator className="opacity-50" />

        {/* 4. مستويات الإنذار (Legacy Levels) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 dark:text-white">
              جدول الخصومات المتصاعد (حسب عدد المرات)
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSettings((previous) => ({
                  ...previous,
                  lateWarningLevels: [
                    ...previous.lateWarningLevels,
                    {
                      count: previous.lateWarningLevels.length + 1,
                      deductionFactor: 0.25,
                    },
                  ],
                }))
              }
            >
              إضافة مستوى
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {settings.lateWarningLevels.map((level, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="w-16">
                  <Label
                    htmlFor={`late-count-${index}`}
                    className="text-[10px]"
                  >
                    المرة
                  </Label>
                  <Input
                    id={`late-count-${index}`}
                    name={`late-count-${index}`}
                    type="number"
                    className="tabular-nums font-mono"
                    value={level.count}
                    onChange={(e) => {
                      const newLevels = [...settings.lateWarningLevels];
                      newLevels[index].count = parseInt(e.target.value) || 0;
                      setSettings((previous) => ({
                        ...previous,
                        lateWarningLevels: newLevels,
                      }));
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor={`late-deduction-${index}`}
                    className="text-[10px]"
                  >
                    الخصم (نصيب يوم)
                  </Label>
                  <Input
                    id={`late-deduction-${index}`}
                    name={`late-deduction-${index}`}
                    type="number"
                    step="0.25"
                    className="tabular-nums font-mono"
                    value={level.deductionFactor}
                    onChange={(e) => {
                      const newLevels = [...settings.lateWarningLevels];
                      newLevels[index].deductionFactor =
                        parseFloat(e.target.value) || 0;
                      setSettings((previous) => ({
                        ...previous,
                        lateWarningLevels: newLevels,
                      }));
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-4 text-red-500"
                  onClick={() => {
                    const newLevels = settings.lateWarningLevels.filter(
                      (_, i) => i !== index,
                    );
                    setSettings((previous) => ({
                      ...previous,
                      lateWarningLevels: newLevels,
                    }));
                  }}
                  aria-label="حذف المستوى"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* 5. التحكم بالبصمة */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl border bg-gray-50/20">
            <Label className="text-xs mb-2 block">البصمة عن بُعد</Label>
            <Switch
              checked={settings.allowRemoteCheckIn}
              onCheckedChange={(c) =>
                setSettings((previous) => ({
                  ...previous,
                  allowRemoteCheckIn: c,
                }))
              }
            />
          </div>
          <div className="p-3 rounded-xl border bg-gray-50/20">
            <Label className="text-xs mb-2 block">طلب الموقع عند البصمة</Label>
            <Switch
              checked={settings.requireLocation}
              onCheckedChange={(c) =>
                setSettings((previous) => ({
                  ...previous,
                  requireLocation: c,
                }))
              }
            />
          </div>
          <div className="p-3 rounded-xl border bg-gray-50/20">
            <Label className="text-xs mb-2 block">تسجيل الغياب الآلي</Label>
            <Switch
              checked={settings.autoAbsentMarking}
              onCheckedChange={(c) =>
                setSettings((previous) => ({
                  ...previous,
                  autoAbsentMarking: c,
                }))
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import React from "react";
import { AlertCircle, Zap, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { TestScenario } from "./types";

interface PayrollScenariosTabProps {
  scenarios: TestScenario[];
  applyScenario: (scenario: TestScenario) => void;
  applyAdvancedScenario: (type: "max_overtime" | "half_month_absence" | "max_deductions" | "reset") => void;
}

export const PayrollScenariosTab: React.FC<PayrollScenariosTabProps> = ({
  scenarios,
  applyScenario,
  applyAdvancedScenario,
}) => {
  return (
    <div className="mt-0 space-y-6">
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 p-4 rounded-xl flex items-start gap-4 mb-6">
        <AlertCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
        <p className="text-sm text-purple-800 dark:text-purple-200">
          اختر من السيناريوهات الجاهزة لاختبار حالات مختلفة من حساب الرواتب
          بسرعة، مثل التأخير، الغياب، العمل الإضافي، والخصومات المختلفة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <Card key={scenario.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900 p-4 flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {scenario.config.attendance && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                        <div className="text-xs text-slate-500">أيام الحضور</div>
                        <div className="font-bold font-mono tabular-nums">
                          {
                            scenario.config.attendance.filter(
                              (a) => a.status === "PRESENT" || a.status === "LATE",
                            ).length
                          }{" "}
                          يوم
                        </div>
                      </div>
                    )}

                    {scenario.config.attendance && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                        <div className="text-xs text-slate-500">أيام الغياب</div>
                        <div className="font-bold font-mono tabular-nums">
                          {
                            scenario.config.attendance.filter(
                              (a) => a.status === "ABSENT",
                            ).length
                          }{" "}
                          يوم
                        </div>
                      </div>
                    )}

                    {scenario.config.leaves && scenario.config.leaves.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                        <div className="text-xs text-slate-500">أيام الإجازة</div>
                        <div className="font-bold font-mono tabular-nums">
                          {scenario.config.leaves.reduce(
                            (sum, leave) => sum + (leave.days || 0),
                            0,
                          )}{" "}
                          يوم
                        </div>
                      </div>
                    )}

                    {scenario.config.deductions && scenario.config.deductions.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                        <div className="text-xs text-slate-500">الخصومات</div>
                        <div className="font-bold font-mono tabular-nums">
                          {scenario.config.deductions.length} خصم
                        </div>
                      </div>
                    )}

                    {scenario.config.allowances && scenario.config.allowances.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                        <div className="text-xs text-slate-500">البدلات</div>
                        <div className="font-bold font-mono tabular-nums">
                          {scenario.config.allowances.length} بدل
                        </div>
                      </div>
                    )}

                    {scenario.config.attendance &&
                      scenario.config.attendance.some((a) => (a.overtimeHours || 0) > 0) && (
                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                          <div className="text-xs text-slate-500">ساعات إضافية</div>
                          <div className="font-bold font-mono tabular-nums">
                            {scenario.config.attendance.reduce(
                              (sum, a) => sum + (a.overtimeHours || 0),
                              0,
                            )}{" "}
                            ساعة
                          </div>
                        </div>
                      )}
                  </div>

                  <Button
                    className="w-full mt-2"
                    onClick={() => applyScenario(scenario)}
                  >
                    <Zap className="h-4 w-4 ml-2" />
                    تطبيق هذا السيناريو
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            سيناريوهات متقدمة
          </CardTitle>
          <CardDescription>
            سيناريوهات لاختبار حالات خاصة وحدود قصوى
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() => applyAdvancedScenario("max_overtime")}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">الحد الأقصى للعمل الإضافي</span>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  4 ساعات إضافية لكل يوم عمل
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() => applyAdvancedScenario("half_month_absence")}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">غياب نصف الشهر</span>
                <span className="text-xs text-slate-500">
                  غياب كامل للنصف الثاني من الشهر
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() => applyAdvancedScenario("max_deductions")}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">الحد الأقصى للخصومات</span>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  60% من الراتب خصومات متنوعة
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() => applyAdvancedScenario("reset")}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">إعادة ضبط الكل</span>
                <span className="text-xs text-slate-500">
                  إعادة جميع البيانات للقيم الافتراضية
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

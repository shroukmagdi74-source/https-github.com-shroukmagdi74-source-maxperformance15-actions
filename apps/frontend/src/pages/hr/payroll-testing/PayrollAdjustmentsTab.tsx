import React from "react";
import {
  MinusCircle,
  Plus,
  Trash2,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Deduction } from "./types";

interface PayrollAdjustmentsTabProps {
  deductions: Deduction[];
  setDeductions: (deductions: Deduction[]) => void;
}

export const PayrollAdjustmentsTab: React.FC<PayrollAdjustmentsTabProps> = ({
  deductions,
  setDeductions,
}) => {
  return (
    <div className="mt-0 space-y-6">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl flex items-start gap-4 mb-6">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          يمكنك إضافة أنواع مختلفة من الخصومات لاختبار تأثيرها على الراتب
          النهائي، مثل خصومات التأخير، الغياب، السلف، وغيرها.
        </p>
      </div>

      <div className="space-y-6">
        {/* Deduction Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MinusCircle className="h-5 w-5 text-rose-600" />
              الخصومات والجزاءات
            </CardTitle>
            <CardDescription>
              إضافة أنواع مختلفة من الخصومات للاختبار
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deductions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic">
                  لا توجد خصومات مضافة
                </div>
              ) : (
                <div className="space-y-3">
                  {deductions.map((deduction, index) => (
                    <div
                      key={deduction.id}
                      className="flex items-end gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                    >
                      <div className="w-32">
                        <Label className="text-xs">نوع الخصم</Label>
                        <Select
                          value={deduction.type}
                          onValueChange={(value) => {
                            const newDeductions = [...deductions];
                            newDeductions[index].type = value;
                            setDeductions(newDeductions);
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LATE">تأخير</SelectItem>
                            <SelectItem value="ABSENCE">غياب</SelectItem>
                            <SelectItem value="ADVANCE">سلفة</SelectItem>
                            <SelectItem value="LOAN">قرض</SelectItem>
                            <SelectItem value="DAMAGE">إتلاف معدات</SelectItem>
                            <SelectItem value="VIOLATION">مخالفة</SelectItem>
                            <SelectItem value="OTHER">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">الوصف</Label>
                        <Input
                          value={deduction.name}
                          onChange={(e) => {
                            const newDeductions = [...deductions];
                            newDeductions[index].name = e.target.value;
                            setDeductions(newDeductions);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">القيمة</Label>
                        <Input
                          type="number"
                          value={deduction.amount}
                          onChange={(e) => {
                            const newDeductions = [...deductions];
                            newDeductions[index].amount = Number(e.target.value);
                            setDeductions(newDeductions);
                          }}
                          className="mt-1 font-mono tabular-nums"
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">نوع القيمة</Label>
                        <Select
                          value={deduction.isPercentage ? "percentage" : "fixed"}
                          onValueChange={(value) => {
                            const newDeductions = [...deductions];
                            newDeductions[index].isPercentage = value === "percentage";
                            setDeductions(newDeductions);
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">ثابت</SelectItem>
                            <SelectItem value="percentage">نسبة %</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        onClick={() => {
                          setDeductions(deductions.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setDeductions([
                    ...deductions,
                    {
                      id: `deduction-${Date.now()}`,
                      type: "OTHER",
                      name: `خصم ${deductions.length + 1}`,
                      amount: 0,
                      isPercentage: false,
                    },
                  ]);
                }}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة خصم جديد
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Common Deduction Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-600" />
              نماذج خصومات شائعة
            </CardTitle>
            <CardDescription>نماذج جاهزة للخصومات الشائعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => {
                  setDeductions([
                    ...deductions,
                    {
                      id: `deduction-${Date.now()}`,
                      type: "LATE",
                      name: "خصم تأخير (ساعة)",
                      amount: 50,
                      isPercentage: false,
                    },
                  ]);
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold">خصم تأخير</span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    50 جنيه لكل ساعة تأخير
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => {
                  setDeductions([
                    ...deductions,
                    {
                      id: `deduction-${Date.now()}`,
                      type: "ABSENCE",
                      name: "خصم يوم غياب كامل",
                      amount: 8,
                      isPercentage: true,
                    },
                  ]);
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold">خصم غياب</span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    8% من الراتب لكل يوم
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => {
                  setDeductions([
                    ...deductions,
                    {
                      id: `deduction-${Date.now()}`,
                      type: "ADVANCE",
                      name: "سلفة شهرية",
                      amount: 500,
                      isPercentage: false,
                    },
                  ]);
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold">سلفة شهرية</span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    500 جنيه خصم ثابت
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => {
                  setDeductions([
                    ...deductions,
                    {
                      id: `deduction-${Date.now()}`,
                      type: "DAMAGE",
                      name: "تلف معدات",
                      amount: 200,
                      isPercentage: false,
                    },
                  ]);
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold">تلف معدات</span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    200 جنيه تعويض
                  </span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import React from "react";
import {
  Banknote,
  Plus,
  Trash2,
  RefreshCw,
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
import { Employee, Allowance } from "./types";
import { formatCurrency } from "./payrollCalculations";

interface PayrollEmployeeTabProps {
  selectedEmployee: Employee | null;
  baseSalary: number;
  setBaseSalary: (val: number) => void;
  allowances: Allowance[];
  setAllowances: (allowances: Allowance[]) => void;
}

export const PayrollEmployeeTab: React.FC<PayrollEmployeeTabProps> = ({
  selectedEmployee,
  baseSalary,
  setBaseSalary,
  allowances,
  setAllowances,
}) => {
  return (
    <div className="mt-0 space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 p-4 rounded-xl flex items-start gap-4 mb-6">
        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          هنا يمكنك تعديل الراتب الأساسي للموظف وإضافة البدلات المختلفة لاختبار
          تأثيرها على الراتب النهائي.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Salary Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Banknote className="h-5 w-5 text-indigo-600" />
              الراتب الأساسي
            </CardTitle>
            <CardDescription>
              تعديل الراتب الأساسي للموظف لأغراض الاختبار
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="baseSalary">الراتب الأساسي</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="baseSalary"
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="flex-1 font-mono tabular-nums"
                  />
                  <span className="text-sm text-slate-500">جنيه</span>
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-500">
                  الراتب الأساسي الفعلي
                </Label>
                <div className="mt-1 font-bold font-mono tabular-nums text-lg">
                  {formatCurrency(selectedEmployee?.baseSalary || 0)}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setBaseSalary(selectedEmployee?.baseSalary || 0)}
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                استعادة القيمة الأصلية
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Allowances Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              البدلات والمزايا
            </CardTitle>
            <CardDescription>إضافة بدلات مختلفة للموظف</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allowances.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic">
                  لا توجد بدلات مضافة
                </div>
              ) : (
                <div className="space-y-3">
                  {allowances.map((allowance, index) => (
                    <div
                      key={allowance.id}
                      className="flex items-end gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                    >
                      <div className="flex-1">
                        <Label className="text-xs">اسم البدل</Label>
                        <Input
                          value={allowance.name}
                          onChange={(e) => {
                            const newAllowances = [...allowances];
                            newAllowances[index].name = e.target.value;
                            setAllowances(newAllowances);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">القيمة</Label>
                        <Input
                          type="number"
                          value={allowance.amount}
                          onChange={(e) => {
                            const newAllowances = [...allowances];
                            newAllowances[index].amount = Number(e.target.value);
                            setAllowances(newAllowances);
                          }}
                          className="mt-1 font-mono tabular-nums"
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">نوع البدل</Label>
                        <Select
                          value={allowance.isPercentage ? "percentage" : "fixed"}
                          onValueChange={(value) => {
                            const newAllowances = [...allowances];
                            newAllowances[index].isPercentage = value === "percentage";
                            setAllowances(newAllowances);
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
                          setAllowances(allowances.filter((_, i) => i !== index));
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
                  setAllowances([
                    ...allowances,
                    {
                      id: `allowance-${Date.now()}`,
                      name: `بدل ${allowances.length + 1}`,
                      amount: 0,
                      isPercentage: false,
                    },
                  ]);
                }}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة بدل جديد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

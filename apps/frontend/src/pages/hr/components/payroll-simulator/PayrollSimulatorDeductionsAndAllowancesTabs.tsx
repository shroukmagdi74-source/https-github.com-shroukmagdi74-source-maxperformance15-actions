import React from "react";
import { Trash2, Plus, MinusCircle } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { TabsContent } from "../../../../components/ui/tabs";
import { SimulationState } from "./types";

interface PayrollSimulatorDeductionsAndAllowancesTabsProps {
  simulation: SimulationState;
  onSimulationChange: (sim: SimulationState) => void;
}

export const PayrollSimulatorDeductionsAndAllowancesTabs: React.FC<
  PayrollSimulatorDeductionsAndAllowancesTabsProps
> = ({ simulation, onSimulationChange }) => {
  return (
    <>
      <TabsContent value="deductions" className="mt-0 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
            <MinusCircle className="h-5 w-5 text-rose-500" />
            الخصومات والجزاءات المخصصة
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-8"
            onClick={() => {
              onSimulationChange({
                ...simulation,
                manualDeductions: [
                  ...simulation.manualDeductions,
                  {
                    id: Math.random().toString(),
                    amount: 0,
                    reason: "",
                    type: "OTHER",
                    date: new Date(),
                  },
                ],
              });
            }}
          >
            <Plus className="h-4 w-4 ml-1" /> إدخال خصم
          </Button>
        </div>
        <div className="space-y-3">
          {simulation.manualDeductions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic text-sm">
              لا توجد خصومات مخصصة مضافة حالياً
            </div>
          ) : (
            simulation.manualDeductions.map((d, i) => (
              <div
                key={d.id}
                className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 items-end border border-slate-100 dark:border-slate-800"
              >
                <div className="space-y-1 flex-[2]">
                  <Label className="text-xs">السبب / الوصف</Label>
                  <Input
                    placeholder="مثلاً: سلفة مرتب، مخالفة سياسة..."
                    value={d.reason}
                    onChange={(e) => {
                      const newD = [...simulation.manualDeductions];
                      newD[i].reason = e.target.value;
                      onSimulationChange({
                        ...simulation,
                        manualDeductions: newD,
                      });
                    }}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">المبلغ (EGP)</Label>
                  <Input
                    type="number"
                    value={d.amount}
                    className="font-mono tabular-nums"
                    onChange={(e) => {
                      const newD = [...simulation.manualDeductions];
                      newD[i].amount = parseFloat(e.target.value) || 0;
                      onSimulationChange({
                        ...simulation,
                        manualDeductions: newD,
                      });
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="حذف الخصم"
                  className="text-rose-500 hover:bg-rose-50 rounded-xl"
                  onClick={() => {
                    onSimulationChange({
                      ...simulation,
                      manualDeductions: simulation.manualDeductions.filter(
                        (item) => item.id !== d.id
                      ),
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="allowances" className="mt-0 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-emerald-500" />
            البدلات والمزايا الإضافية
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-8"
            onClick={() => {
              const name = `بدل جديد ${Object.keys(simulation.allowances).length + 1}`;
              onSimulationChange({
                ...simulation,
                allowances: {
                  ...simulation.allowances,
                  [name]: 0,
                },
              });
            }}
          >
            <Plus className="h-4 w-4 ml-1" /> إضافة بدل
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(simulation.allowances).map(([name, amount], idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 items-end border border-slate-100 dark:border-slate-800"
            >
              <div className="space-y-1 flex-[2]">
                <Label className="text-xs">اسم البدل</Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const { [name]: oldAmount, ...rest } =
                      simulation.allowances;
                    onSimulationChange({
                      ...simulation,
                      allowances: {
                        ...rest,
                        [newName]: oldAmount,
                      },
                    });
                  }}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">المبلغ</Label>
                <Input
                  type="number"
                  value={amount}
                  className="font-mono tabular-nums"
                  onChange={(e) => {
                    onSimulationChange({
                      ...simulation,
                      allowances: {
                        ...simulation.allowances,
                        [name]: parseFloat(e.target.value) || 0,
                      },
                    });
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="حذف البدل"
                className="text-rose-500 hover:bg-rose-50"
                onClick={() => {
                  const { [name]: _, ...rest } = simulation.allowances;
                  onSimulationChange({
                    ...simulation,
                    allowances: rest,
                  });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </TabsContent>
    </>
  );
};

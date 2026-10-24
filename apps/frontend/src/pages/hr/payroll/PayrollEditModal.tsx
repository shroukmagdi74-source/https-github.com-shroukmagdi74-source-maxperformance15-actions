import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Payroll, EditFormData, KeyedAmountItem, formatCurrency } from './types';

interface PayrollEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: Payroll | null;
  editFormData: EditFormData;
  setEditFormData: React.Dispatch<React.SetStateAction<EditFormData>>;
  editingAllowances: KeyedAmountItem[];
  setEditingAllowances: React.Dispatch<React.SetStateAction<KeyedAmountItem[]>>;
  editingDeductions: KeyedAmountItem[];
  setEditingDeductions: React.Dispatch<React.SetStateAction<KeyedAmountItem[]>>;
  saving: boolean;
  onSave: () => void;
}

export const PayrollEditModal: React.FC<PayrollEditModalProps> = ({
  open,
  onOpenChange,
  payroll,
  editFormData,
  setEditFormData,
  editingAllowances,
  setEditingAllowances,
  editingDeductions,
  setEditingDeductions,
  saving,
  onSave,
}) => {
  if (!payroll) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>تعديل كشف الراتب</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2 px-1">
          {/* Employee Info */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <Avatar className="h-12 w-12">
              <AvatarImage src={payroll.employee?.avatar} />
              <AvatarFallback>
                {payroll.employee?.firstName?.[0]}{payroll.employee?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {payroll.employee?.firstName} {payroll.employee?.lastName}
              </h3>
              <p className="text-sm text-gray-500">{payroll.employee?.position?.title}</p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الراتب الأساسي (المُستحق)</Label>
              <Input
                type="number"
                value={editFormData.baseSalary === 0 ? "" : editFormData.baseSalary}
                placeholder="0.00"
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                  setEditFormData(prev => ({ ...prev, baseSalary: val }));
                }}
              />
              {payroll.fullMonthBaseSalary && (
                <p className="text-[10px] text-gray-500 italic">
                  الراتب الشهري الكامل في العقد: {formatCurrency(payroll.fullMonthBaseSalary)}
                </p>
              )}
            </div>

            <div className="space-y-4 border p-4 rounded-lg bg-green-50/50">
              <div className="flex justify-between items-center">
                <Label className="text-green-700">تفاصيل البدلات</Label>
                <span className="font-bold text-green-700 tabular-nums">
                  {formatCurrency(editingAllowances.reduce((sum, item) => sum + (item.amount || 0), 0))}
                </span>
              </div>
              <div className="space-y-2">
                {editingAllowances.map((item) => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <Input
                      value={item.name}
                      onChange={(e) => {
                        setEditingAllowances(prev => prev.map(i =>
                          i.id === item.id ? { ...i, name: e.target.value } : i
                        ));
                      }}
                      placeholder="البيان"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) => {
                        setEditingAllowances(prev => prev.map(i =>
                          i.id === item.id ? { ...i, amount: parseFloat(e.target.value) || 0 } : i
                        ));
                      }}
                      className="w-24"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingAllowances(prev => prev.filter(i => i.id !== item.id));
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAllowances([
                      ...editingAllowances,
                      { id: Math.random().toString(36).substr(2, 9), name: '', amount: 0 }
                    ]);
                  }}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة بند بدل
                </Button>
              </div>
            </div>

            <div className="space-y-4 border p-4 rounded-lg bg-red-50/50">
              <div className="flex justify-between items-center">
                <Label className="text-red-700">تفاصيل الخصومات</Label>
                <span className="font-bold text-red-700 tabular-nums">
                  {formatCurrency(editingDeductions.reduce((sum, item) => sum + (item.amount || 0), 0))}
                </span>
              </div>
              <div className="space-y-2">
                {editingDeductions.map((item) => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <Input
                      value={item.name}
                      onChange={(e) => {
                        setEditingDeductions(prev => prev.map(i =>
                          i.id === item.id ? { ...i, name: e.target.value } : i
                        ));
                      }}
                      placeholder="البيان"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) => {
                        setEditingDeductions(prev => prev.map(i =>
                          i.id === item.id ? { ...i, amount: parseFloat(e.target.value) || 0 } : i
                        ));
                      }}
                      className="w-24"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingDeductions(prev => prev.filter(i => i.id !== item.id));
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingDeductions([
                      ...editingDeductions,
                      { id: Math.random().toString(36).substr(2, 9), name: '', amount: 0 }
                    ]);
                  }}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة بند خصم
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>العمل الإضافي</Label>
              <Input
                type="number"
                value={editFormData.overtimeAmount}
                onChange={(e) => setEditFormData(prev => ({ ...prev, overtimeAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>المكافآت</Label>
              <Input
                type="number"
                value={editFormData.bonuses}
                onChange={(e) => setEditFormData(prev => ({ ...prev, bonuses: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>التأمينات</Label>
              <Input
                type="number"
                value={editFormData.socialInsurance}
                onChange={(e) => setEditFormData(prev => ({ ...prev, socialInsurance: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>الضرائب</Label>
              <Input
                type="number"
                value={editFormData.taxAmount}
                onChange={(e) => setEditFormData(prev => ({ ...prev, taxAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Calculated Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-lg">
              <span className="font-semibold">صافي الراتب المتوقع</span>
              <span className="font-bold text-primary tabular-nums">
                {formatCurrency(
                  editFormData.baseSalary +
                  editingAllowances.reduce((sum, item) => sum + (item.amount || 0), 0) +
                  editFormData.overtimeAmount +
                  editFormData.bonuses -
                  editingDeductions.reduce((sum, item) => sum + (item.amount || 0), 0) -
                  editFormData.socialInsurance -
                  editFormData.taxAmount
                )}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                جاري الحفظ...
              </>
            ) : (
              'حفظ التغييرات'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

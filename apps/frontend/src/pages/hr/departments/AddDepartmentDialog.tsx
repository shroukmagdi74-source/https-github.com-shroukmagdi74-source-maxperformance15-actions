import React from "react";
import {
  Building2,
  Plus,
  UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Department, Employee, DepartmentFormData, colorOptions } from "./types";
import { DepartmentEmployeePicker } from "./DepartmentEmployeePicker";

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: DepartmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<DepartmentFormData>>;
  departments: Department[];
  employees: Employee[];
  filteredEmployees: Employee[];
  selectedEmployees: string[];
  toggleEmployeeSelection: (id: string) => void;
  employeeSearchQuery: string;
  setEmployeeSearchQuery: (query: string) => void;
  isProcessing: boolean;
  onAddDepartment: () => void;
}

export const AddDepartmentDialog: React.FC<AddDepartmentDialogProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  departments,
  employees,
  filteredEmployees,
  selectedEmployees,
  toggleEmployeeSelection,
  employeeSearchQuery,
  setEmployeeSearchQuery,
  isProcessing,
  onAddDepartment,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            إضافة قسم جديد
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            أدخل بيانات القسم ويمكنك اختيار المدير وإضافة الموظفين إن رغبت.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Department Info Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              معلومات القسم
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  اسم القسم *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="مثال: قسم المبيعات"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  الاسم بالإنجليزية
                </Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                  placeholder="e.g. Sales Department"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  الوصف
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="وصف مختصر للقسم..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    اللون
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color.value
                            ? "border-gray-900 dark:border-gray-100 scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() =>
                          setFormData({ ...formData, color: color.value })
                        }
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    القسم الأب
                  </Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, parentId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم الأب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    ترتيب العرض
                  </Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="font-mono tabular-nums"
                  />
                  <p className="text-[10px] text-gray-400">
                    أرقام أصغر تظهر أولاً
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  مدير القسم (اختياري)
                </Label>
                <Select
                  value={formData.managerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, managerId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدير" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="none">بدون</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="text-gray-500 text-sm">
                            {emp.email || "لا يوجد بريد"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4 py-2">
                <Label
                  htmlFor="isActive-add"
                  className="text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  القسم نشط
                </Label>
                <Switch
                  id="isActive-add"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Employees Selection Section */}
          <DepartmentEmployeePicker
            employees={employees}
            filteredEmployees={filteredEmployees}
            selectedEmployees={selectedEmployees}
            toggleEmployeeSelection={toggleEmployeeSelection}
            employeeSearchQuery={employeeSearchQuery}
            setEmployeeSearchQuery={setEmployeeSearchQuery}
          />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            إلغاء
          </Button>
          <Button
            onClick={onAddDepartment}
            className="w-full sm:w-auto gap-2"
            disabled={isProcessing || !formData.name}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                {selectedEmployees.length > 0 ? (
                  <>
                    <UserPlus className="h-4 w-4" />
                    إضافة القسم و {selectedEmployees.length} موظف
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    إضافة القسم
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

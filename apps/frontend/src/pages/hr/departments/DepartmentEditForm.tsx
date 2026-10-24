import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
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

interface DepartmentEditFormProps {
  formData: DepartmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<DepartmentFormData>>;
  selectedDepartment: Department;
  departments: Department[];
  employees: Employee[];
  onCancel: () => void;
  onSave: () => void;
}

export const DepartmentEditForm: React.FC<DepartmentEditFormProps> = ({
  formData,
  setFormData,
  selectedDepartment,
  departments,
  employees,
  onCancel,
  onSave,
}) => {
  return (
    <Card className="bg-white/90 dark:bg-gray-900/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">تعديل القسم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              اسم القسم *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>ترتيب العرض (اختياري)</Label>
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
            <p className="text-[10px] text-gray-400">أرقام أصغر تظهر أولاً</p>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              الاسم بالإنجليزية
            </Label>
            <Input
              value={formData.nameEn}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nameEn: e.target.value,
                })
              }
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700 dark:text-gray-300">
            الوصف
          </Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    setFormData({
                      ...formData,
                      color: color.value,
                    })
                  }
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
                {departments
                  .filter((d) => d.id !== selectedDepartment?.id)
                  .map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
            htmlFor="isActive-details"
            className="text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            القسم نشط
          </Label>
          <Switch
            id="isActive-details"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
            className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button onClick={onSave} disabled={!formData.name}>
            حفظ التغييرات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

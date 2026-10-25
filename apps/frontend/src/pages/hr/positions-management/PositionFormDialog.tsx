import React from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Department, PositionFormData } from "./types";

interface PositionFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  editingTitle?: string;
  departments: Department[];
  form: UseFormReturn<PositionFormData>;
  loading: boolean;
  onSubmit: (data: PositionFormData) => void;
  onCancel: () => void;
}

export const PositionFormDialog: React.FC<PositionFormDialogProps> = ({
  isOpen,
  onOpenChange,
  isEditing,
  editingTitle,
  departments,
  form,
  loading,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "تعديل المنصب" : "إنشاء منصب جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `تعديل بيانات المنصب: ${editingTitle || ""}`
              : "أدخل بيانات المنصب الجديد"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                عنوان المنصب <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="مثال: مدير تسويق"
                {...register("title", { required: "عنوان المنصب مطلوب" })}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>كود المنصب</Label>
              <Input placeholder="مثال: MKT-MGR" {...register("code")} />
            </div>

            <div className="space-y-2">
              <Label>المستوى</Label>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? field.value.toString() : "1"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">مبتدئ</SelectItem>
                      <SelectItem value="2">متوسط</SelectItem>
                      <SelectItem value="3">خبير</SelectItem>
                      <SelectItem value="4">إداري</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>القسم</Label>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون قسم</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>الحد الأدنى للراتب</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("minSalary", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label>الحد الأعلى للراتب</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("maxSalary", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea
              placeholder="وصف المنصب ومسؤولياته..."
              className="min-h-[100px]"
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "جاري الحفظ..."
                : isEditing
                  ? "تحديث المنصب"
                  : "حفظ المنصب"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import React from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { AlertCircle, Award, Lightbulb, User } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Card, CardContent } from "../../../components/ui/card";
import { TrainingFormData } from "./types";
import { TRAINING_TYPES } from "./helpers";

interface CreateTrainingSidebarProps {
  employees: any[];
  control: Control<TrainingFormData>;
  register: UseFormRegister<TrainingFormData>;
  errors: FieldErrors<TrainingFormData>;
}

export const CreateTrainingSidebar: React.FC<CreateTrainingSidebarProps> = ({
  employees,
  control,
  register,
  errors,
}) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <Card className="overflow-hidden border-none shadow-xl ring-1 ring-purple-100/50">
        <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500" />
        <CardContent className="p-6 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-purple-800">
            <User className="h-5 w-5" />
            الموظف والبرنامج
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-2">
                الموظف <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="employeeId"
                control={control}
                rules={{ required: "يجب اختيار الموظف" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 border-purple-100 focus:ring-purple-200 rounded-xl bg-gray-50/30">
                      <SelectValue placeholder="اختر الموظف المستهدف" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {employees.length === 0 ? (
                        <SelectItem value="no-employees" disabled>
                          لا يوجد موظفين حالياً
                        </SelectItem>
                      ) : (
                        employees.map((emp) => (
                          <SelectItem
                            key={emp.id}
                            value={emp.id}
                            className="py-3"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-gray-900">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono tabular-nums">
                                #{emp.employeeNumber} |{" "}
                                {emp.position?.title || "موظف"}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.employeeId && (
                <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />{" "}
                  {errors.employeeId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-2">
                اسم البرنامج <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="مثال: تحليل البيانات باستخدام Excel"
                className="h-12 border-purple-100 focus:ring-purple-200 rounded-xl"
                {...register("trainingName", {
                  required: "اسم البرنامج مطلوب",
                })}
              />
              {errors.trainingName && (
                <p className="text-xs font-bold text-rose-500 mt-1">
                  {errors.trainingName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-bold">نوع التدريب</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 border-purple-100 rounded-xl bg-gray-50/30">
                      <SelectValue placeholder="اختر تصنيف البرنامج" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAINING_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl overflow-hidden relative">
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Award className="w-32 h-32" />
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-yellow-300" />
          </div>
          <h3 className="text-xl font-black">نصيحة التدريب</h3>
          <p className="text-indigo-100 text-sm leading-relaxed font-medium">
            احرص على رفع شهادة التدريب في قسم المستندات بعد انتهاء البرنامج
            لتوثيق السجل المهني للموظف.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

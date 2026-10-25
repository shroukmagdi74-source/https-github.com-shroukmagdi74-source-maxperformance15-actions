import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ArrowLeft, DollarSign } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { PromotionFormData } from "./types";

interface EditPromotionMovementSectionProps {
  register: UseFormRegister<PromotionFormData>;
  errors: FieldErrors<PromotionFormData>;
}

export const EditPromotionMovementSection: React.FC<
  EditPromotionMovementSectionProps
> = ({ register, errors }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-slate-50 p-6 rounded-xl border border-slate-100">
      {/* From */}
      <div className="md:col-span-5 space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-500 text-xs uppercase tracking-wide">
            المنصب الحالي
          </Label>
          <Input
            {...register("fromPositionName")}
            placeholder="اسم المنصب الحالي"
            className="bg-white border-slate-200 focus-visible:ring-slate-400 font-medium"
          />
        </div>
        <div className="space-y-2 relative">
          <Label className="text-gray-500 text-xs uppercase tracking-wide">
            الراتب الحالي
          </Label>
          <div className="relative">
            <DollarSign className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              {...register("fromSalary", { valueAsNumber: true })}
              placeholder="0.00"
              className="pr-9 bg-white border-slate-200 font-mono tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="md:col-span-1 flex justify-center py-4 md:py-0">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
          <ArrowLeft className="h-6 w-6" />
        </div>
      </div>

      {/* To */}
      <div className="md:col-span-5 space-y-4">
        <div className="space-y-2">
          <Label className="text-blue-600 text-xs uppercase tracking-wide font-bold">
            المنصب الجديد
          </Label>
          <Input
            {...register("toPositionName", {
              required: "المنصب الجديد مطلوب",
            })}
            placeholder="اسم المنصب الجديد"
            className="bg-blue-50/50 border-blue-200 focus-visible:ring-blue-400 font-medium text-blue-900"
          />
          {errors.toPositionName && (
            <p className="text-xs text-red-500">
              {errors.toPositionName.message}
            </p>
          )}
        </div>
        <div className="space-y-2 relative">
          <Label className="text-blue-600 text-xs uppercase tracking-wide font-bold">
            الراتب الجديد
          </Label>
          <div className="relative">
            <DollarSign className="absolute right-3 top-2.5 h-4 w-4 text-blue-500" />
            <Input
              type="number"
              {...register("toSalary", { valueAsNumber: true })}
              placeholder="0.00"
              className="pr-9 bg-blue-50/50 border-blue-200 text-blue-900 font-bold font-mono tabular-nums"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

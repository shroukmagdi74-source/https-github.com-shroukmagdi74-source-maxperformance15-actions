import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Award, DollarSign, FileText, Save, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { TrainingFormData } from "./types";

interface CreateTrainingInvestmentCardProps {
  register: UseFormRegister<TrainingFormData>;
  isEdit: boolean;
  loading: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

export const CreateTrainingInvestmentCard: React.FC<
  CreateTrainingInvestmentCardProps
> = ({ register, isEdit, loading, onCancel, onDelete }) => {
  return (
    <>
      <Card className="border-none shadow-xl ring-1 ring-purple-100/50">
        <CardHeader className="border-b border-gray-50 bg-gray-50/30">
          <h3 className="text-lg font-bold flex items-center gap-2 text-purple-800">
            <DollarSign className="h-5 w-5" />
            الاستثمار والنتائج
          </h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-2">
                تكلفة البرنامج التدريبي
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">
                  EGP
                </span>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0.00"
                  className="h-14 pl-12 text-lg font-bold font-mono tabular-nums border-purple-50 focus:ring-purple-200 rounded-xl bg-gray-50/20"
                  {...register("cost")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-2">
                الدرجة أو النتيجة النهائية
              </Label>
              <div className="relative">
                <Award className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input
                  id="score"
                  type="number"
                  max="100"
                  placeholder="الدرجة من 100"
                  className="h-14 pr-12 text-lg font-bold font-mono tabular-nums border-purple-50 focus:ring-purple-200 rounded-xl bg-gray-50/20"
                  {...register("score")}
                />
              </div>
            </div>

            <div className="col-span-full space-y-2">
              <Label className="font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                وصف البرنامج وملاحظات إضافية
              </Label>
              <Textarea
                placeholder="اكتب هنا تفاصيل المنهج التدريبي أو أي تقييم إضافي لأداء الموظف خلال التدريب..."
                className="min-h-[120px] border-purple-50 focus:ring-purple-200 rounded-xl resize-none p-4"
                {...register("description")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row items-center justify-end gap-4 py-8 mt-4 border-t border-purple-100/50">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="w-full md:w-auto font-bold text-gray-500 hover:bg-gray-100 rounded-xl px-8 h-12"
        >
          إلغاء التغييرات
        </Button>

        {isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onDelete}
            disabled={loading}
            className="w-full md:w-auto font-bold text-rose-600 border-rose-100 hover:bg-rose-50 rounded-xl px-8 h-12"
          >
            <Trash2 className="h-4 w-4 ml-2" />
            حذف السجل نهائياً
          </Button>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black px-12 rounded-xl shadow-xl shadow-purple-200 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              جاري الحفظ...
            </div>
          ) : (
            <>
              <Save className="h-5 w-5 ml-2" />
              حفظ السجل التدريبي
            </>
          )}
        </Button>
      </div>
    </>
  );
};

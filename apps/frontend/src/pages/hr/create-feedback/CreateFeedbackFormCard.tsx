import React from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Save, Star, Info, AlertCircle } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { FeedbackEmployee, FeedbackFormData } from "./types";
import { isReviewFeedbackType } from "./helpers";

interface CreateFeedbackFormCardProps {
  isEdit: boolean;
  isPersonal: boolean;
  employees: FeedbackEmployee[];
  loading: boolean;
  hoverRating: number;
  onHoverRatingChange: (val: number) => void;
  currentRating: number;
  currentType: string;
  register: UseFormRegister<FeedbackFormData>;
  handleSubmit: UseFormHandleSubmit<FeedbackFormData>;
  control: Control<FeedbackFormData>;
  setValue: UseFormSetValue<FeedbackFormData>;
  errors: FieldErrors<FeedbackFormData>;
  onSubmit: (data: FeedbackFormData) => Promise<void>;
}

export const CreateFeedbackFormCard: React.FC<CreateFeedbackFormCardProps> = ({
  isEdit,
  isPersonal,
  employees,
  loading,
  hoverRating,
  onHoverRatingChange,
  currentRating,
  currentType,
  register,
  handleSubmit,
  control,
  setValue,
  errors,
  onSubmit,
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm border-t border-white/5">
        <CardHeader className="bg-muted/50 border-b dark:border-white/5">
          <CardTitle className="text-xl flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            تفاصيل الرسالة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {!isPersonal ? (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    الموظف المستهدف
                  </Label>
                  <Controller
                    name="toEmployeeId"
                    control={control}
                    rules={{ required: "يجب اختيار الموظف" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="h-12 bg-gray-50/30">
                          <SelectValue placeholder="اختر الموظف" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="management">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                  HQ
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-bold">الإدارة (الشركة)</span>
                            </div>
                          </SelectItem>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-[10px]">
                                    {emp.firstName?.[0] || ""}
                                    {emp.lastName?.[0] || ""}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {emp.firstName} {emp.lastName}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.toEmployeeId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {errors.toEmployeeId.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      HQ
                    </div>
                    <div>
                      <p className="text-sm font-bold">جهة الإرسال</p>
                      <p className="text-xs text-muted-foreground">
                        الإدارة العامة للشركة
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    رسالة رسمية
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">نوع الرسالة</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger className="h-12 bg-muted/30 border-muted-foreground/20">
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SUGGESTION">اقتراح</SelectItem>
                          <SelectItem value="COMPLAINT">شكوى</SelectItem>
                          <SelectItem value="INQUIRY">استفسار</SelectItem>
                          {!isPersonal && (
                            <>
                              <SelectItem value="PEER">تقييم زميل</SelectItem>
                              <SelectItem value="MANAGER">تقييم مدير</SelectItem>
                              <SelectItem value="SUBORDINATE">
                                تقييم مرؤوس
                              </SelectItem>
                            </>
                          )}
                          <SelectItem value="OTHER">آخر</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-semibold">
                    التصنيف (اختياري)
                  </Label>
                  <Input
                    id="category"
                    placeholder="مثال: أداء، سلوك، تعاون..."
                    className="h-12 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
                    {...register("category")}
                  />
                </div>
              </div>

              {!isPersonal && isReviewFeedbackType(currentType) && (
                <div className="space-y-3 pt-2">
                  <Label className="text-base font-semibold">التقييم</Label>
                  <div className="flex items-center gap-2 bg-muted/20 p-4 rounded-xl border border-dashed border-muted-foreground/30">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`تقييم ${star}`}
                        className="transition-transform active:scale-90"
                        onMouseEnter={() => onHoverRatingChange(star)}
                        onMouseLeave={() => onHoverRatingChange(0)}
                        onClick={() => setValue("rating", star)}
                      >
                        <Star
                          className={`h-10 w-10 transition-colors ${
                            (hoverRating || currentRating) >= star
                              ? "fill-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="mr-4 font-bold text-xl text-yellow-600 dark:text-yellow-400 font-mono tabular-nums">
                      {currentRating > 0 ? currentRating : ""}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-semibold">
                  رسالتك
                </Label>
                <Textarea
                  id="content"
                  placeholder="اكتب ملاحظاتك بشكل بناء ومفيد..."
                  className="min-h-[150px] bg-muted/30 border-muted-foreground/20 focus:bg-background resize-none transition-colors"
                  {...register("content", { required: "المحتوى مطلوب" })}
                />
                {errors.content && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{" "}
                    {errors.content.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 space-x-reverse p-4 bg-primary/5 rounded-xl border border-primary/10">
                <Controller
                  name="isAnonymous"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isAnonymous"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-6 w-6"
                    />
                  )}
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="isAnonymous"
                    className="text-base font-bold cursor-pointer"
                  >
                    إرسال كمجهول الهوية
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    لن يتم عرض اسمك للموظف المتلقي
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto h-12 px-10 shadow-lg"
              >
                {loading ? (
                  "جاري الحفظ..."
                ) : (
                  <>
                    <Save className="h-5 w-5 ml-2" />
                    {isEdit
                      ? "تحديث التغذية الراجعة"
                      : "إرسال التغذية الراجعة"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

import React from "react";
import { AlertCircle, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";

interface CreateWarningSidebarProps {
  selectedEmployee: any;
}

export const CreateWarningSidebar: React.FC<CreateWarningSidebarProps> = ({
  selectedEmployee,
}) => {
  return (
    <div className="space-y-6">
      {selectedEmployee ? (
        <Card className="border-none shadow-lg bg-gradient-to-br from-muted to-background animate-in fade-in zoom-in duration-300">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              ملف الموظف
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
              <AvatarFallback className="text-2xl">
                {selectedEmployee.firstName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedEmployee.position?.title || "موظف"}
              </p>
              {selectedEmployee.department?.name && (
                <Badge variant="secondary" className="mt-2">
                  {selectedEmployee.department.name}
                </Badge>
              )}
            </div>
            <div className="w-full pt-4 border-t grid grid-cols-2 gap-2 text-sm">
              <div className="bg-background/50 p-2 rounded">
                <p className="text-xs text-muted-foreground">الرقم الوظيفي</p>
                <p className="font-semibold font-mono tabular-nums">
                  {selectedEmployee.employeeNumber || "-"}
                </p>
              </div>
              <div className="bg-background/50 p-2 rounded">
                <p className="text-xs text-muted-foreground">تاريخ التعيين</p>
                <p className="font-semibold font-mono tabular-nums">
                  {selectedEmployee.hireDate
                    ? new Date(selectedEmployee.hireDate).toLocaleDateString(
                        "ar-EG",
                      )
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-sm bg-muted/30 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
            <User className="h-12 w-12 mb-3 opacity-20" />
            <p>اختر موظفاً لعرض ملفه المختصر هنا</p>
          </CardContent>
        </Card>
      )}

      {/* Guidelines Card */}
      <Card className="border-none shadow-md bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
        <CardHeader>
          <CardTitle className="text-base text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            سياسة التدرج في العقوبات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-700/80 dark:text-blue-400/80">
          <div className="flex gap-2 items-start">
            <div className="h-5 w-5 rounded-full bg-blue-200 dark:bg-blue-800 flex flex-shrink-0 items-center justify-center text-[10px] font-bold font-mono tabular-nums mt-0.5">
              1
            </div>
            <p>
              <span className="font-semibold">تنبيه شفهي:</span> للمخالفات
              البسيطة الأولى (مثل التأخير البسيط).
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <div className="h-5 w-5 rounded-full bg-blue-200 dark:bg-blue-800 flex flex-shrink-0 items-center justify-center text-[10px] font-bold font-mono tabular-nums mt-0.5">
              2
            </div>
            <p>
              <span className="font-semibold">إنذار كتابي:</span> عند تكرار
              المخالفة أو للمخالفات المتوسطة.
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <div className="h-5 w-5 rounded-full bg-blue-200 dark:bg-blue-800 flex flex-shrink-0 items-center justify-center text-[10px] font-bold font-mono tabular-nums mt-0.5">
              3
            </div>
            <p>
              <span className="font-semibold">فصل / إنهاء:</span> للمخالفات
              الجسيمة جداً أو استنفاد رصيد الإنذارات.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

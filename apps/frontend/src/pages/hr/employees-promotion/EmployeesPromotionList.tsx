import React from "react";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Edit,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Promotion } from "./types";
import { getStatusLabel } from "./helpers";

interface EmployeesPromotionListProps {
  promotions: Promotion[];
  onUpdateStatus: (
    promotionId: string,
    status: string,
    rejectionReason?: string,
  ) => void;
  onDeletePromotion: (promotionId: string) => void;
  onEditPromotion: (promotionId: string) => void;
}

export const EmployeesPromotionList: React.FC<EmployeesPromotionListProps> = ({
  promotions,
  onUpdateStatus,
  onDeletePromotion,
  onEditPromotion,
}) => {
  return (
    <div className="space-y-4">
      {promotions.map((promotion) => {
        const statusInfo = getStatusLabel(promotion.status);
        const person = promotion.user || promotion.employee;

        return (
          <Card
            key={promotion.id}
            className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={person?.avatar} />
                    <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                      {person?.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {person?.firstName || ""} {person?.lastName || ""}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={statusInfo?.color || "bg-gray-100"}>
                        {statusInfo?.label || promotion.status}
                      </Badge>
                      <Badge variant="outline">
                        {promotion.fromPositionName || "غير محدد"} →{" "}
                        {promotion.toPositionName}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {promotion.status === "PENDING" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(promotion.id, "APPROVED");
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 ml-1" />
                        اعتماد
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          const reason = prompt(
                            "الرجاء إدخال سبب الرفض (اختياري):",
                          );
                          onUpdateStatus(promotion.id, "REJECTED", reason || "");
                        }}
                      >
                        <XCircle className="h-4 w-4 ml-1" />
                        رفض
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPromotion(promotion.id);
                    }}
                  >
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف ترقية {person?.firstName}{" "}
                          {person?.lastName}؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeletePromotion(promotion.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">المسار الوظيفي</p>
                      <p className="font-medium">
                        {promotion.fromPositionName || "غير محدد"}{" "}
                        <span className="text-gray-400">←</span>{" "}
                        {promotion.toPositionName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">تعديل الراتب</p>
                      <p className="font-medium font-mono tabular-nums">
                        {promotion.fromSalary != null
                          ? Number(promotion.fromSalary).toLocaleString()
                          : "-"}
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="text-green-600 font-bold">
                          {promotion.toSalary != null
                            ? Number(promotion.toSalary).toLocaleString()
                            : "-"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">التواريخ</p>
                      <p className="font-medium font-mono tabular-nums">
                        الترقية:{" "}
                        {new Date(promotion.promotionDate).toLocaleDateString(
                          "ar-EG",
                        )}
                      </p>
                      <p className="text-xs text-orange-600 font-mono tabular-nums">
                        السريان:{" "}
                        {new Date(promotion.effectiveDate).toLocaleDateString(
                          "ar-EG",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 border-r-4 border-gray-200 bg-gray-50 rounded-l-md">
                <p className="text-xs text-gray-500 mb-1 font-bold">
                  سبب الترقية:
                </p>
                <p className="text-sm text-gray-700 italic">
                  "{promotion.reason}"
                </p>
              </div>

              {promotion.status === "REJECTED" && promotion.rejectionReason && (
                <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                  <strong>سبب الرفض:</strong> {promotion.rejectionReason}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

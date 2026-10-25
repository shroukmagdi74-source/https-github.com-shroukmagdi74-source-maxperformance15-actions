import React from "react";
import { User, Phone, MapPin, Heart, CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Employee, genderLabels, maritalLabels } from "./types";
import { calculateAge } from "./helpers";

interface EmployeePersonalTabProps {
  employee: Employee;
}

export const EmployeePersonalTab: React.FC<EmployeePersonalTabProps> = ({
  employee,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-primary" />
            المعلومات الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">تاريخ الميلاد</p>
              <p className="font-medium font-mono tabular-nums">
                {employee.dateOfBirth
                  ? `${new Date(employee.dateOfBirth).toLocaleDateString("ar-EG")} (${calculateAge(employee.dateOfBirth)} سنة)`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الجنس</p>
              <p className="font-medium">
                {genderLabels[employee.gender] || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الحالة الاجتماعية</p>
              <p className="font-medium">
                {maritalLabels[employee.maritalStatus] || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">رقم الهوية</p>
              <p className="font-medium font-mono tabular-nums">
                {employee.nationalId || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-5 w-5 text-primary" />
            معلومات الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">البريد الإلكتروني</p>
              <p className="font-medium truncate">{employee.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الهاتف</p>
              <p className="font-medium font-mono tabular-nums">
                {employee.phone || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الجوال</p>
              <p className="font-medium font-mono tabular-nums">
                {employee.mobile || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-primary" />
            العنوان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm text-gray-500">العنوان</p>
              <p className="font-medium">{employee.address || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">المدينة</p>
              <p className="font-medium">{employee.city || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الدولة</p>
              <p className="font-medium">{employee.country || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-5 w-5 text-rose-500" />
            جهة اتصال الطوارئ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">الاسم</p>
              <p className="font-medium">
                {employee.emergencyContactName || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الهاتف</p>
              <p className="font-medium font-mono tabular-nums">
                {employee.emergencyContactPhone || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">صلة القرابة</p>
              <p className="font-medium">
                {employee.emergencyContactRelation || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Information */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" />
            المعلومات البنكية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">اسم البنك</p>
              <p className="font-medium">{employee.bankName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">رقم الحساب</p>
              <p className="font-medium font-mono tabular-nums">
                {employee.bankAccountNumber || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IBAN</p>
              <p className="font-medium font-mono tabular-nums">
                {employee.bankIban || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

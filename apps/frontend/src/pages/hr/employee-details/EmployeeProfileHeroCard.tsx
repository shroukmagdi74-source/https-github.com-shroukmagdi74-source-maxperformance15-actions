import React from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Employee, statusLabels, contractLabels } from "./types";
import { formatCurrency, calculateTenure } from "./helpers";

interface EmployeeProfileHeroCardProps {
  employee: Employee;
}

export const EmployeeProfileHeroCard: React.FC<EmployeeProfileHeroCardProps> = ({
  employee,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Avatar className="h-32 w-32 ring-2 ring-primary/10">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback className="text-3xl font-bold">
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-right">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-gray-500 font-mono tabular-nums text-sm">
                {employee.employeeNumber}
              </p>
              <Badge
                className={`mt-2 ${statusLabels[employee.status]?.color || ""}`}
              >
                {statusLabels[employee.status]?.label || employee.status}
              </Badge>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">القسم:</span>
                <span className="font-medium text-sm">
                  {employee.department?.name || "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">المنصب:</span>
                <span className="font-medium text-sm">
                  {employee.position?.title || "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">تاريخ التعيين:</span>
                <span className="font-medium text-sm font-mono tabular-nums">
                  {employee.hireDate
                    ? new Date(employee.hireDate).toLocaleDateString("ar-EG")
                    : "-"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">البريد:</span>
                <span className="font-medium text-sm truncate">
                  {employee.email || "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">الهاتف:</span>
                <span className="font-medium text-sm font-mono tabular-nums">
                  {employee.phone || employee.mobile || "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">المدير:</span>
                <span className="font-medium text-sm">
                  {employee.manager
                    ? `${employee.manager.firstName} ${employee.manager.lastName}`
                    : "-"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">مدة الخدمة:</span>
                <span className="font-medium text-sm">
                  {employee.hireDate
                    ? calculateTenure(employee.hireDate)
                    : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">نوع العقد:</span>
                <span className="font-medium text-sm">
                  {contractLabels[employee.contractType] ||
                    employee.contractType ||
                    "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">الراتب:</span>
                <span className="font-medium text-sm font-mono tabular-nums">
                  {formatCurrency(employee.baseSalary || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

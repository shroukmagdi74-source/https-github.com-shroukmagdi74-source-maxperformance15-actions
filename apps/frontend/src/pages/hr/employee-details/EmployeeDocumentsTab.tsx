import React from "react";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Employee } from "./types";

interface EmployeeDocumentsTabProps {
  employee: Employee;
  onManageDocuments: () => void;
}

export const EmployeeDocumentsTab: React.FC<EmployeeDocumentsTabProps> = ({
  employee,
  onManageDocuments,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">المستندات</CardTitle>
          <Button onClick={onManageDocuments}>
            <FileText className="h-4 w-4 ml-2" />
            إدارة المستندات
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!employee.employeeDocuments ||
        employee.employeeDocuments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">لا توجد مستندات</p>
            <Button onClick={onManageDocuments}>
              <FileText className="h-4 w-4 ml-2" />
              إضافة مستند
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employee.employeeDocuments.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/40"
              >
                <FileText className="h-8 w-8 text-blue-500 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{doc.title}</p>
                  <p className="text-xs text-gray-500">{doc.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

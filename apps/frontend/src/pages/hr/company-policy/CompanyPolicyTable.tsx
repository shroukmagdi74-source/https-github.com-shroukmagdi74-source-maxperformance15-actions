import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Policy } from "./types";
import { getCategoryLabel } from "./helpers";

interface CompanyPolicyTableProps {
  policies: Policy[];
  loading: boolean;
  onView: (policy: Policy) => void;
  onEdit: (policy: Policy) => void;
  onDelete: (id: string) => void;
}

export const CompanyPolicyTable: React.FC<CompanyPolicyTableProps> = ({
  policies,
  loading,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">لا توجد سياسات مطابقة</h3>
            <p>جرب تغيير معايير البحث أو أضف سياسة جديدة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead className="text-right font-bold w-[300px]">
                    عنوان السياسة
                  </TableHead>
                  <TableHead className="text-right font-bold">الفئة</TableHead>
                  <TableHead className="text-right font-bold">الحالة</TableHead>
                  <TableHead className="text-right font-bold">الإصدار</TableHead>
                  <TableHead className="text-right font-bold">
                    آخر تحديث
                  </TableHead>
                  <TableHead className="text-left font-bold">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow
                    key={policy.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                    onClick={() => onView(policy)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="line-clamp-1">{policy.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {getCategoryLabel(policy.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {policy.isActive ? (
                        <div className="flex items-center text-green-600 gap-1.5 text-xs font-semibold">
                          <CheckCircle className="h-3 w-3" />
                          نشط
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 gap-1.5 text-xs font-semibold">
                          <XCircle className="h-3 w-3" />
                          غير نشط
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500 font-mono tabular-nums">
                        V{policy.version}.0
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono tabular-nums">
                      {new Date(policy.updatedAt).toLocaleDateString("ar-EG")}
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-1 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          onClick={() => onView(policy)}
                          title="عرض"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => onEdit(policy)}
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(policy.id)}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

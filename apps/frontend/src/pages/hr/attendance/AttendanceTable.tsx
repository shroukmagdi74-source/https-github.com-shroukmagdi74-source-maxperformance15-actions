import React from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendanceRecord } from "./types";
import { AttendanceTableRow } from "./AttendanceTableRow";

interface AttendanceTableProps {
  loading: boolean;
  records: AttendanceRecord[];
  attendanceTimezone: string;
  pagination: { page: number; limit: number; total: number; totalPages: number };
  setPagination: React.Dispatch<React.SetStateAction<any>>;
  handleCheckIn: (empId: string) => void;
  handleCheckOut: (empId: string) => void;
  handleEditClick: (record: AttendanceRecord) => void;
  confirmDelete: (id: string) => void;
  openAutoCloseReview: (record: AttendanceRecord) => void;
  setSelectedNotes: (notes: string) => void;
  setShowNotesDialog: (open: boolean) => void;
  openLocationInMap: (latitude: number, longitude: number, type: string) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  loading,
  records,
  attendanceTimezone,
  pagination,
  setPagination,
  handleCheckIn,
  handleCheckOut,
  handleEditClick,
  confirmDelete,
  openAutoCloseReview,
  setSelectedNotes,
  setShowNotesDialog,
  openLocationInMap,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>سجل الحضور</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Clock className="h-12 w-12 mb-4 opacity-50" />
            <p>لا توجد سجلات</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الموظف</TableHead>
                <TableHead className="text-right">اليوم والتاريخ</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">الحضور</TableHead>
                <TableHead className="text-right">الانصراف</TableHead>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">ساعات العمل</TableHead>
                <TableHead className="text-right">ساعات إضافية</TableHead>
                <TableHead className="text-right">التأخير</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right w-[120px]">التحكم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <AttendanceTableRow
                  key={record.id}
                  record={record}
                  attendanceTimezone={attendanceTimezone}
                  handleCheckIn={handleCheckIn}
                  handleCheckOut={handleCheckOut}
                  handleEditClick={handleEditClick}
                  confirmDelete={confirmDelete}
                  openAutoCloseReview={openAutoCloseReview}
                  setSelectedNotes={setSelectedNotes}
                  setShowNotesDialog={setShowNotesDialog}
                  openLocationInMap={openLocationInMap}
                />
              ))}
            </TableBody>
          </Table>
        )}

        {pagination.totalPages > 1 && records.length > 0 && (
          <div className="p-4 border-t flex items-center justify-between" dir="rtl">
            <span className="text-sm text-gray-500 font-medium">
              صفحة {pagination.page} من {pagination.totalPages} ({pagination.total} سجل)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  setPagination((p: any) => ({
                    ...p,
                    page: Math.max(1, p.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
              >
                <ChevronRight className="h-4 w-4" /> السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  setPagination((p: any) => ({
                    ...p,
                    page: Math.min(p.totalPages, p.page + 1),
                  }))
                }
                disabled={pagination.page === pagination.totalPages}
              >
                التالي <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

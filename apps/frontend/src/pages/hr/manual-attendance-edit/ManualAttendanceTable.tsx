import React from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { AttendanceRecord, EditingRecord } from "./types";
import { ManualAttendanceTableRow } from "./ManualAttendanceTableRow";

interface ManualAttendanceTableProps {
  loading: boolean;
  records: AttendanceRecord[];
  saving: string | null;
  editingRecords: Map<string, EditingRecord>;
  isEditing: (id: string) => boolean;
  onStartEditing: (record: AttendanceRecord) => void;
  onCancelEditing: (recordId: string) => void;
  onSaveRecord: (recordId: string) => void;
  onUpdateField: (
    recordId: string,
    field: keyof EditingRecord,
    value: string | number,
  ) => void;
  onSetCurrentTimeCheckIn: (recordId: string) => void;
  onSetCurrentTimeCheckOut: (recordId: string) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
}

export const ManualAttendanceTable: React.FC<ManualAttendanceTableProps> = ({
  loading,
  records,
  saving,
  editingRecords,
  isEditing,
  onStartEditing,
  onCancelEditing,
  onSaveRecord,
  onUpdateField,
  onSetCurrentTimeCheckIn,
  onSetCurrentTimeCheckOut,
  pagination,
  onPageChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">سجلات الحضور</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Clock className="h-12 w-12 mb-4 opacity-50" />
            <p>لا توجد سجلات حضور</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الحضور</TableHead>
                  <TableHead className="text-right">الانصراف</TableHead>
                  <TableHead className="text-right">ساعات العمل</TableHead>
                  <TableHead className="text-right">تأخير/مبكر (د)</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">ملاحظات</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <ManualAttendanceTableRow
                    key={record.id}
                    record={record}
                    editing={isEditing(record.id)}
                    editData={editingRecords.get(record.id)}
                    saving={saving === record.id}
                    onStartEditing={onStartEditing}
                    onCancelEditing={onCancelEditing}
                    onSaveRecord={onSaveRecord}
                    onUpdateField={onUpdateField}
                    onSetCurrentTimeCheckIn={onSetCurrentTimeCheckIn}
                    onSetCurrentTimeCheckOut={onSetCurrentTimeCheckOut}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-gray-500 font-mono tabular-nums">
            عرض {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} من{" "}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

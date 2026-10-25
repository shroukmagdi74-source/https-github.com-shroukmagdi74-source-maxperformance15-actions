import React from "react";
import { Clock, Save, X, Edit2 } from "lucide-react";
import { TableRow, TableCell } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { AttendanceRecord, EditingRecord, statusOptions } from "./types";
import { calculateWorkHours, getStatusColor, getStatusLabel } from "./helpers";

interface ManualAttendanceTableRowProps {
  record: AttendanceRecord;
  editing: boolean;
  editData?: EditingRecord;
  saving: boolean;
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
}

export const ManualAttendanceTableRow: React.FC<ManualAttendanceTableRowProps> = ({
  record,
  editing,
  editData,
  saving,
  onStartEditing,
  onCancelEditing,
  onSaveRecord,
  onUpdateField,
  onSetCurrentTimeCheckIn,
  onSetCurrentTimeCheckOut,
}) => {
  return (
    <TableRow
      className={
        editing
          ? "bg-blue-50/70 dark:bg-blue-900/10"
          : record.isNew
            ? "bg-yellow-50/70 dark:bg-yellow-900/10"
            : ""
      }
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={record.employee?.avatar} />
            <AvatarFallback>
              {record.employee?.firstName?.[0]}
              {record.employee?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {record.employee?.firstName} {record.employee?.lastName}
            </p>
            <p className="text-xs text-gray-500 font-mono tabular-nums">
              {record.employee?.employeeNumber}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <span className="text-sm font-mono tabular-nums">
          {new Date(record.date).toLocaleDateString("ar-EG")}
        </span>
      </TableCell>

      <TableCell>
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={editData?.checkIn || ""}
              onChange={(e) =>
                onUpdateField(record.id, "checkIn", e.target.value)
              }
              className="w-[120px] font-mono tabular-nums text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSetCurrentTimeCheckIn(record.id)}
              className="px-2 py-1 h-8"
              title="تسجيل الوقت الحالي"
            >
              <Clock className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <span className="text-green-600 font-medium text-sm font-mono tabular-nums">
            {record.checkIn
              ? new Date(record.checkIn).toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "-"}
          </span>
        )}
      </TableCell>

      <TableCell>
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={editData?.checkOut || ""}
              onChange={(e) =>
                onUpdateField(record.id, "checkOut", e.target.value)
              }
              className="w-[120px] font-mono tabular-nums text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSetCurrentTimeCheckOut(record.id)}
              className="px-2 py-1 h-8"
              title="تسجيل الوقت الحالي"
            >
              <Clock className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <span className="text-blue-600 font-medium text-sm font-mono tabular-nums">
            {record.checkOut
              ? new Date(record.checkOut).toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "-"}
          </span>
        )}
      </TableCell>

      <TableCell>
        {editing && editData ? (
          <span className="text-sm font-medium font-mono tabular-nums">
            {editData.checkIn && editData.checkOut
              ? `${calculateWorkHours(editData.checkIn, editData.checkOut).toFixed(1)} ساعة`
              : "-"}
          </span>
        ) : (
          <span className="text-sm font-mono tabular-nums">
            {record.workHours
              ? `${Number(record.workHours).toFixed(1)} ساعة`
              : "-"}
          </span>
        )}
      </TableCell>

      <TableCell>
        {editing && editData ? (
          <div className="flex flex-col gap-2 min-w-[140px]">
            <div className="flex flex-col gap-1 border-b pb-1">
              <span className="text-[10px] text-gray-500 font-bold">
                التأخير:
              </span>
              <div className="flex items-center gap-1 font-mono tabular-nums">
                <Input
                  type="number"
                  min="0"
                  value={editData.lateHours}
                  onChange={(e) =>
                    onUpdateField(
                      record.id,
                      "lateHours",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-12 h-7 text-xs px-1 text-center font-mono tabular-nums"
                />
                <span className="text-[10px]">س</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={editData.lateMins}
                  onChange={(e) =>
                    onUpdateField(
                      record.id,
                      "lateMins",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-12 h-7 text-xs px-1 text-center font-mono tabular-nums"
                />
                <span className="text-[10px]">د</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 font-bold">مبكر:</span>
              <div className="flex items-center gap-1 font-mono tabular-nums">
                <Input
                  type="number"
                  min="0"
                  value={editData.earlyHours}
                  onChange={(e) =>
                    onUpdateField(
                      record.id,
                      "earlyHours",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-12 h-7 text-xs px-1 text-center font-mono tabular-nums"
                />
                <span className="text-[10px]">س</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={editData.earlyMins}
                  onChange={(e) =>
                    onUpdateField(
                      record.id,
                      "earlyMins",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-12 h-7 text-xs px-1 text-center font-mono tabular-nums"
                />
                <span className="text-[10px]">د</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs space-y-1 font-mono tabular-nums">
            {Number(record.lateMinutes || 0) > 0 && (
              <div className="flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/40 italic">
                <span>تأخير:</span>
                <span className="font-bold">
                  {Math.floor(record.lateMinutes! / 60) > 0 &&
                    `${Math.floor(record.lateMinutes! / 60)}س `}
                  {record.lateMinutes! % 60}د
                </span>
              </div>
            )}
            {Number(record.earlyLeaveMinutes || 0) > 0 && (
              <div className="flex items-center gap-1 text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-900/40 italic">
                <span>مبكر:</span>
                <span className="font-bold">
                  {Math.floor(record.earlyLeaveMinutes! / 60) > 0 &&
                    `${Math.floor(record.earlyLeaveMinutes! / 60)}س `}
                  {record.earlyLeaveMinutes! % 60}د
                </span>
              </div>
            )}
            {!record.lateMinutes && !record.earlyLeaveMinutes && (
              <span className="text-gray-400">-</span>
            )}
          </div>
        )}
      </TableCell>

      <TableCell>
        {editing ? (
          <Select
            value={editData?.status || ""}
            onValueChange={(value) =>
              onUpdateField(record.id, "status", value)
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge className={getStatusColor(record.status)}>
            {getStatusLabel(record.status)}
          </Badge>
        )}
      </TableCell>

      <TableCell>
        {editing ? (
          <Input
            value={editData?.notes || ""}
            onChange={(e) =>
              onUpdateField(record.id, "notes", e.target.value)
            }
            placeholder="ملاحظات..."
            className="w-[150px] text-sm"
          />
        ) : (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {record.notes || "-"}
          </span>
        )}
      </TableCell>

      <TableCell>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={() => onSaveRecord(record.id)}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white ml-1" />
                ) : (
                  <Save className="h-3 w-3 ml-1" />
                )}
                {saving ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancelEditing(record.id)}
                disabled={saving}
              >
                <X className="h-3 w-3 ml-1" />
                إلغاء
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStartEditing(record)}
            >
              <Edit2 className="h-3 w-3 ml-1" />
              تعديل
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

import React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { AttendanceRecord, Employee } from "./types";

interface PayrollAttendanceTableProps {
  attendance: AttendanceRecord[];
  setAttendance: (records: AttendanceRecord[]) => void;
  selectedEmployee: Employee | null;
  handleSelectEmployee: (emp: Employee) => void;
}

export const PayrollAttendanceTable: React.FC<PayrollAttendanceTableProps> = ({
  attendance,
  setAttendance,
  selectedEmployee,
  handleSelectEmployee,
}) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          سجلات الحضور والانصراف
        </CardTitle>
        <CardDescription>
          تعديل سجلات الحضور للموظف للشهر الحالي
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>وقت الحضور</TableHead>
                  <TableHead>وقت الانصراف</TableHead>
                  <TableHead>دقائق التأخير</TableHead>
                  <TableHead>ساعات إضافية</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-slate-400 italic"
                    >
                      لا توجد سجلات حضور متاحة
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.map((record, index) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium font-mono tabular-nums">
                            {format(record.date, "dd/MM/yyyy", { locale: ar })}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={record.status}
                              onValueChange={(
                                value: "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "HOLIDAY",
                              ) => {
                                const newAttendance = [...attendance];
                                newAttendance[index].status = value;
                                setAttendance(newAttendance);
                              }}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PRESENT">
                                  <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    حاضر
                                  </span>
                                </SelectItem>
                                <SelectItem value="ABSENT">
                                  <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                    غائب
                                  </span>
                                </SelectItem>
                                <SelectItem value="LATE">
                                  <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                    متأخر
                                  </span>
                                </SelectItem>
                                <SelectItem value="LEAVE">
                                  <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                    إجازة
                                  </span>
                                </SelectItem>
                                <SelectItem value="HOLIDAY">
                                  <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                    عطلة
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={record.inTime || ""}
                              onChange={(e) => {
                                const newAttendance = [...attendance];
                                newAttendance[index].inTime = e.target.value;
                                setAttendance(newAttendance);
                              }}
                              className="w-[120px]"
                              disabled={
                                record.status === "ABSENT" ||
                                record.status === "LEAVE" ||
                                record.status === "HOLIDAY"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={record.outTime || ""}
                              onChange={(e) => {
                                const newAttendance = [...attendance];
                                newAttendance[index].outTime = e.target.value;
                                setAttendance(newAttendance);
                              }}
                              className="w-[120px]"
                              disabled={
                                record.status === "ABSENT" ||
                                record.status === "LEAVE" ||
                                record.status === "HOLIDAY"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={record.lateMinutes}
                              onChange={(e) => {
                                const newAttendance = [...attendance];
                                newAttendance[index].lateMinutes = Number(e.target.value);
                                setAttendance(newAttendance);
                              }}
                              className="w-[80px] font-mono tabular-nums"
                              disabled={
                                record.status === "ABSENT" ||
                                record.status === "LEAVE" ||
                                record.status === "HOLIDAY"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={record.overtimeHours}
                              onChange={(e) => {
                                const newAttendance = [...attendance];
                                newAttendance[index].overtimeHours = Number(e.target.value);
                                setAttendance(newAttendance);
                              }}
                              className="w-[80px] font-mono tabular-nums"
                              disabled={
                                record.status === "ABSENT" ||
                                record.status === "LEAVE" ||
                                record.status === "HOLIDAY"
                              }
                            />
                          </TableCell>
                        </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-slate-500 font-mono tabular-nums">
              إجمالي السجلات: {attendance.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedEmployee) {
                    handleSelectEmployee(selectedEmployee);
                  }
                }}
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة ضبط
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

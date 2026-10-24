import React from "react";
import { AlertCircle } from "lucide-react";
import { AttendanceRecord, LeaveRecord, Employee } from "./types";
import { PayrollAttendanceTable } from "./PayrollAttendanceTable";
import { PayrollLeavesCard } from "./PayrollLeavesCard";
import { PayrollOvertimeCard } from "./PayrollOvertimeCard";

interface PayrollAttendanceTabProps {
  attendance: AttendanceRecord[];
  setAttendance: (records: AttendanceRecord[]) => void;
  leaves: LeaveRecord[];
  setLeaves: (leaves: LeaveRecord[]) => void;
  selectedEmployee: Employee | null;
  handleSelectEmployee: (emp: Employee) => void;
}

export const PayrollAttendanceTab: React.FC<PayrollAttendanceTabProps> = ({
  attendance,
  setAttendance,
  leaves,
  setLeaves,
  selectedEmployee,
  handleSelectEmployee,
}) => {
  return (
    <div className="mt-0 space-y-6">
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 p-4 rounded-xl flex items-start gap-4 mb-6">
        <AlertCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <p className="text-sm text-green-800 dark:text-green-200">
          يمكنك تعديل سجلات الحضور والإجازات للموظف لاختبار تأثيرها على الراتب
          النهائي، مثل التأخير، الغياب، الإجازات المدفوعة وغير المدفوعة، وساعات
          العمل الإضافي.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PayrollAttendanceTable
          attendance={attendance}
          setAttendance={setAttendance}
          selectedEmployee={selectedEmployee}
          handleSelectEmployee={handleSelectEmployee}
        />

        <PayrollLeavesCard
          leaves={leaves}
          setLeaves={setLeaves}
        />

        <PayrollOvertimeCard
          attendance={attendance}
        />
      </div>
    </div>
  );
};

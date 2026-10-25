export interface SheetDay {
  day: number;
  date: string;
  weekday: string;
  isWorkingDay: boolean;
  isHoliday: boolean;
}

export interface SheetCell {
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
}

export interface SheetEmployee {
  id: string;
  name: string;
  employeeNumber: string;
  department: string;
  position: string;
  totals: { present: number; late: number; absent: number; leave: number };
  cells: SheetCell[];
}

export interface AttendanceSheetData {
  month: number;
  year: number;
  days: SheetDay[];
  totalEmployees: number;
  totals: { present: number; late: number; absent: number; leave: number };
  employees: SheetEmployee[];
}

export interface AttendanceCellStyle {
  label: string;
  cell: string;
  dot: string;
  timeColor: string;
}

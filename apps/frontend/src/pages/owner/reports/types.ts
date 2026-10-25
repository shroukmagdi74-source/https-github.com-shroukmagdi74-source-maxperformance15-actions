export interface CompanySalesData {
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
  stats: {
    totalOrders: number;
    totalRevenue: number;
    completedOrders: number;
    cancelledOrders: number;
    completionRate: number;
  };
}

export interface SalesReportData {
  dateRange: { start: string; end: string };
  overview: {
    totalCompanies: number;
    totalOrders: number;
    totalRevenue: number;
    totalCompleted: number;
    totalCancelled: number;
  };
  byCompany: CompanySalesData[];
}

export interface TodayAttendanceRecord {
  id: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
    employeeNumber: string | null;
  };
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
  checkIn: string;
  checkOut: string | null;
  workHours: number | null;
  lateMinutes: number;
  status: "PRESENT" | "LATE";
}

export interface TodayAttendanceData {
  date: string;
  totalPresent: number;
  totalLate: number;
  records: TodayAttendanceRecord[];
}

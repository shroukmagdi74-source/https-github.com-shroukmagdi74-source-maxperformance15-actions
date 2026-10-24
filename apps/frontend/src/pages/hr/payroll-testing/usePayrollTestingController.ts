import { useState, useEffect } from "react";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import {
  Employee,
  Deduction,
  Allowance,
  LeaveRecord,
  AttendanceRecord,
  PayrollResult,
  TestScenario,
  PRESET_SCENARIOS,
} from "./types";
import { calculatePayrollSimulation } from "./payrollCalculations";

export function usePayrollTestingController() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [baseSalary, setBaseSalary] = useState(0);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState("employee");

  const [payrollResult, setPayrollResult] = useState<PayrollResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const [scenarios] = useState<TestScenario[]>(PRESET_SCENARIOS);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await api.get("/hr/employees?limit=100&isActive=true");
      const list = response?.data?.employees || [];
      setEmployees(list);
      setFilteredEmployees(list);
    } catch (error) {
      console.error("Error fetching employees:", error);
      tToast.error("PayrollTesting.failed_fetch_8a11");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query) ||
          emp.employeeNumber?.includes(query) ||
          emp.department?.name?.toLowerCase().includes(query) ||
          emp.position?.title?.toLowerCase().includes(query),
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    const correctedSalary =
      employee.baseSalary < 1000
        ? employee.baseSalary * 10
        : employee.baseSalary;
    setBaseSalary(correctedSalary);

    const currentYear = 2026;
    const currentMonth = 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const initialAttendance: AttendanceRecord[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        initialAttendance.push({
          id: `att-${day}`,
          date,
          status: "PRESENT",
          inTime: "08:00",
          outTime: "16:00",
          lateMinutes: 0,
          earlyLeaveMinutes: 0,
          overtimeHours: 0,
        });
      }
    }

    setAttendance(initialAttendance);
    setLeaves([]);
    setDeductions([]);
    setAllowances([]);
    setPayrollResult(null);
    setActiveTab("employee");
  };

  const calculatePayroll = async () => {
    if (!selectedEmployee) return;
    setCalculating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const res = calculatePayrollSimulation({
        baseSalary,
        attendance,
        allowances,
        deductions,
      });
      setPayrollResult(res);
    } catch (error) {
      console.error("Error calculating payroll:", error);
      tToast.error("PayrollTesting.failed_account_1ffd");
    } finally {
      setCalculating(false);
    }
  };

  const applyScenario = (scenario: TestScenario) => {
    if (scenario.config.baseSalary && selectedEmployee) {
      setBaseSalary(scenario.config.baseSalary);
    }

    if (scenario.config.attendance) {
      const currentYear = 2026;
      const currentMonth = 1;
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      const newAttendance: AttendanceRecord[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 5 && dayOfWeek !== 6) {
          const scenarioDay = scenario.config.attendance.find(
            (a) => a.date && a.date.getDate() === day,
          );

          if (scenarioDay) {
            newAttendance.push({
              id: `att-${day}`,
              date,
              status: scenarioDay.status as "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "HOLIDAY",
              inTime:
                scenarioDay.status === "PRESENT" || scenarioDay.status === "LATE"
                  ? "08:00"
                  : undefined,
              outTime:
                scenarioDay.status === "PRESENT" || scenarioDay.status === "LATE"
                  ? "16:00"
                  : undefined,
              lateMinutes: scenarioDay.lateMinutes || 0,
              earlyLeaveMinutes: scenarioDay.earlyLeaveMinutes || 0,
              overtimeHours: scenarioDay.overtimeHours || 0,
            });
          } else {
            newAttendance.push({
              id: `att-${day}`,
              date,
              status: "PRESENT",
              inTime: "08:00",
              outTime: "16:00",
              lateMinutes: 0,
              earlyLeaveMinutes: 0,
              overtimeHours: 0,
            });
          }
        }
      }
      setAttendance(newAttendance);
    }

    if (scenario.config.leaves) {
      setLeaves(
        scenario.config.leaves.map((leave, i) => ({
          id: `leave-${i}-${Date.now()}`,
          type: leave.type || "ANNUAL",
          startDate: leave.startDate || new Date(),
          endDate: leave.endDate || new Date(),
          days: leave.days || 1,
          isPaid: leave.isPaid !== undefined ? leave.isPaid : true,
          description: leave.description,
        })),
      );
    } else {
      setLeaves([]);
    }

    if (scenario.config.deductions) {
      setDeductions(
        scenario.config.deductions.map((deduction, i) => ({
          id: `deduction-${i}-${Date.now()}`,
          type: deduction.type || "OTHER",
          name: deduction.name || `خصم ${i + 1}`,
          amount: deduction.amount || 0,
          isPercentage: deduction.isPercentage !== undefined ? deduction.isPercentage : false,
          description: deduction.description,
        })),
      );
    } else {
      setDeductions([]);
    }

    if (scenario.config.allowances) {
      setAllowances(
        scenario.config.allowances.map((allowance, i) => ({
          id: `allowance-${i}-${Date.now()}`,
          name: allowance.name || `بدل ${i + 1}`,
          amount: allowance.amount || 0,
          isPercentage: allowance.isPercentage !== undefined ? allowance.isPercentage : false,
        })),
      );
    } else {
      setAllowances([]);
    }

    setActiveTab("employee");
    toast.success(`تم تطبيق سيناريو ${scenario.name} بنجاح`);
  };

  const applyAdvancedScenario = (type: "max_overtime" | "half_month_absence" | "max_deductions" | "reset") => {
    if (type === "max_overtime") {
      const newAttendance = [...attendance];
      newAttendance.forEach((record) => {
        if (record.status === "PRESENT") {
          record.overtimeHours = 4;
        }
      });
      setAttendance(newAttendance);
      setActiveTab("attendance");
      toast.success("تم تطبيق سيناريو العمل الإضافي الأقصى");
    } else if (type === "half_month_absence") {
      const newAttendance = [...attendance];
      const halfIndex = Math.floor(newAttendance.length / 2);
      newAttendance.forEach((record, index) => {
        if (index >= halfIndex) {
          record.status = "ABSENT";
          record.inTime = undefined;
          record.outTime = undefined;
          record.lateMinutes = 0;
          record.overtimeHours = 0;
        }
      });
      setAttendance(newAttendance);
      setActiveTab("attendance");
      toast.success("تم تطبيق سيناريو الغياب لنصف الشهر");
    } else if (type === "max_deductions") {
      setDeductions([
        {
          id: `deduction-1-${Date.now()}`,
          type: "ADVANCE",
          name: "سلفة شهرية",
          amount: 30,
          isPercentage: true,
        },
        {
          id: `deduction-2-${Date.now()}`,
          type: "LOAN",
          name: "قسط قرض",
          amount: 20,
          isPercentage: true,
        },
        {
          id: `deduction-3-${Date.now()}`,
          type: "DAMAGE",
          name: "تلف معدات",
          amount: 10,
          isPercentage: true,
        },
      ]);
      setActiveTab("deductions");
      toast.success("تم تطبيق سيناريو الخصومات القصوى");
    } else if (type === "reset") {
      if (selectedEmployee) {
        handleSelectEmployee(selectedEmployee);
        toast.success("تم إعادة ضبط جميع البيانات للقيم الافتراضية");
      }
    }
  };

  return {
    employees,
    filteredEmployees,
    selectedEmployee,
    setSelectedEmployee,
    searchQuery,
    setSearchQuery,
    loadingEmployees,
    baseSalary,
    setBaseSalary,
    deductions,
    setDeductions,
    allowances,
    setAllowances,
    leaves,
    setLeaves,
    attendance,
    setAttendance,
    activeTab,
    setActiveTab,
    payrollResult,
    calculating,
    saveAsDraft,
    setSaveAsDraft,
    scenarios,
    handleSelectEmployee,
    calculatePayroll,
    applyScenario,
    applyAdvancedScenario,
  };
}

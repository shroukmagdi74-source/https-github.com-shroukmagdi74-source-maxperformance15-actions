import {
  CheckCircle,
  Clock,
  Zap,
  MinusCircle,
  Banknote,
} from "lucide-react";
import { PayrollScenario, SimulationState } from "./types";

export const SCENARIOS: PayrollScenario[] = [
  {
    id: "normal",
    name: "حالة طبيعية",
    description: "موظف بـ 22 يوم عمل كامل وبدون خصومات",
    icon: CheckCircle,
    apply: (salary: number) => ({
      baseSalary: salary,
      attendance: Array.from({ length: 22 }, (_, i) => ({
        date: new Date(2026, 1, i + 1),
        status: "PRESENT",
        lateMinutes: 0,
        overtimeHours: 0,
      })),
      leaves: [],
      manualDeductions: [],
      allowances: {},
    }),
  },
  {
    id: "absent_late",
    name: "تأخير وغيابات",
    description: "غياب يومين وتأخير متكرر",
    icon: Clock,
    apply: (salary: number) => ({
      baseSalary: salary,
      attendance: [
        ...Array.from({ length: 18 }, (_, i) => ({
          date: new Date(2026, 1, i + 1),
          status: "PRESENT",
          lateMinutes: 0,
          overtimeHours: 0,
        })),
        {
          date: new Date(2026, 1, 19),
          status: "LATE",
          lateMinutes: 60,
          overtimeHours: 0,
        },
        {
          date: new Date(2026, 1, 20),
          status: "LATE",
          lateMinutes: 120,
          overtimeHours: 0,
        },
      ],
      leaves: [],
      manualDeductions: [],
      allowances: {},
    }),
  },
  {
    id: "overtime_bonus",
    name: "إضافي ومكافآت",
    description: "ساعات عمل إضافية مع مكافأة مالية",
    icon: Zap,
    apply: (salary: number) => ({
      baseSalary: salary,
      attendance: Array.from({ length: 22 }, (_, i) => ({
        date: new Date(2026, 1, i + 1),
        status: "PRESENT",
        lateMinutes: 0,
        overtimeHours: i < 5 ? 3 : 0,
      })),
      leaves: [],
      manualDeductions: [
        {
          id: "bonus1",
          amount: 1000,
          reason: "مكافأة أداء",
          date: new Date(),
          type: "BONUS",
        },
      ],
      allowances: { "بدل طبيعة عمل": 500 },
    }),
  },
  {
    id: "unpaid_leave",
    name: "إجازة بدون راتب",
    description: "إجازة سلبية لمدة أسبوع",
    icon: MinusCircle,
    apply: (salary: number) => ({
      baseSalary: salary,
      attendance: Array.from({ length: 15 }, (_, i) => ({
        date: new Date(2026, 1, i + 1),
        status: "PRESENT",
        lateMinutes: 0,
        overtimeHours: 0,
      })),
      leaves: [
        {
          id: "leave1",
          startDate: new Date(2026, 1, 16),
          endDate: new Date(2026, 1, 22),
          type: "UNPAID",
          status: "APPROVED",
        },
      ],
      manualDeductions: [],
      allowances: {},
    }),
  },
  {
    id: "loan_advance",
    name: "خصم سلفة وصيانة",
    description: "خصم سلفة شهرية + غرامة عهدة",
    icon: Banknote,
    apply: (salary: number) => ({
      baseSalary: salary,
      attendance: Array.from({ length: 22 }, (_, i) => ({
        date: new Date(2026, 1, i + 1),
        status: "PRESENT",
        lateMinutes: 0,
        overtimeHours: 0,
      })),
      leaves: [],
      manualDeductions: [
        {
          id: "m1",
          amount: 500,
          reason: "تسديد سلفة",
          date: new Date(),
          type: "ADVANCE",
        },
        {
          id: "m2",
          amount: 200,
          reason: "إهلاك معدات",
          date: new Date(),
          type: "DAMAGE",
        },
      ],
      allowances: {},
    }),
  },
];

export const createInitialSimulationState = (
  baseSalary: number
): SimulationState => ({
  baseSalary,
  attendance: Array.from({ length: 22 }, (_, i) => ({
    id: `att-${i}`,
    date: new Date(2026, 1, i + 1),
    status: "PRESENT",
    lateMinutes: 0,
    overtimeHours: 0,
  })),
  leaves: [],
  manualDeductions: [],
  allowances: {},
});

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(val);
};

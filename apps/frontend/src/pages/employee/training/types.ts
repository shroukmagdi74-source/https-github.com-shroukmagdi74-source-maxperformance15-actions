import React from "react";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";

export interface Training {
  id: string;
  trainingName: string;
  provider?: string;
  type: string;
  startDate: string;
  endDate?: string;
  status: "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  cost?: number;
  duration?: number;
  score?: number;
  description?: string;
}

export interface TrainingStats {
  total: number;
  completed: number;
  ongoing: number;
  totalHours: number;
}

export const trainingTypeLabels: Record<string, string> = {
  technical: "employee.training.typeTechnical",
  "soft-skills": "employee.training.typeSoftSkills",
  management: "employee.training.typeLeadership",
  safety: "employee.training.typeHealthSafety",
  language: "employee.training.typeLanguages",
  compliance: "employee.training.typeCompliance",
  other: "employee.training.typeOther",
};

export const trainingStatusConfig: Record<
  string,
  { labelKey: string; color: string; icon: React.ReactNode }
> = {
  PLANNED: {
    labelKey: "employee.training.plannedStatus",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: React.createElement(AlertCircle, { className: "h-3.5 w-3.5" }),
  },
  ONGOING: {
    labelKey: "employee.training.inProgressStatus",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: React.createElement(Loader2, {
      className: "h-3.5 w-3.5 animate-spin",
    }),
  },
  COMPLETED: {
    labelKey: "employee.training.completedStatus",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: React.createElement(CheckCircle2, { className: "h-3.5 w-3.5" }),
  },
  CANCELLED: {
    labelKey: "employee.training.cancelledStatus",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    icon: React.createElement(XCircle, { className: "h-3.5 w-3.5" }),
  },
};

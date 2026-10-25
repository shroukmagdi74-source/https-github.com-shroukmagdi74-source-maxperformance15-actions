export interface WarningEmployee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string;
  position?: { title: string };
  department?: { name: string };
  image?: string;
}

export interface Warning {
  id: string;
  type: "VERBAL" | "WRITTEN" | "FINAL" | "TERMINATION" | string;
  severity: "minor" | "moderate" | "severe" | string;
  title: string;
  description: string;
  incidentDate: string;
  acknowledgedAt?: string;
  actionTaken?: string;
  employee: WarningEmployee;
}

export interface WarningStats {
  total: number;
  byType: Array<{ type: string; _count: number }>;
  bySeverity: Array<{ severity: string; _count: number }>;
  acknowledged: number;
  acknowledgmentRate: number;
}

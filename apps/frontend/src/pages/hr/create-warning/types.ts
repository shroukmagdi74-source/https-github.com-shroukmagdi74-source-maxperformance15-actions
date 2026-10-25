export type WarningType = "VERBAL" | "WRITTEN" | "FINAL" | "TERMINATION";
export type WarningSeverity = "minor" | "medium" | "major" | "critical";

export type WarningFormData = {
  employeeId: string;
  type: WarningType;
  severity: WarningSeverity;
  title: string;
  description: string;
  incidentDate: string;
  actionTaken: string;
};

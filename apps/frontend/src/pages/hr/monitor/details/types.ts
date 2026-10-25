export type MonitorDetailsTabId = "tasks" | "timeline" | "apps";

export interface TeamMemberSwitchOption {
  employeeId: string;
  employeeName?: string;
}

export interface EmployeeMonitorDetailsProps {
  employeeIdProp?: string;
  onBackProp?: () => void;
  teamMembersProp?: TeamMemberSwitchOption[];
  onSelectEmployeeProp?: (id: string) => void;
}

export interface EmployeeMonitorTimelineData {
  summary?: any;
  employee?: any;
  taskPerformance?: any;
  breaksSummary?: any;
  activities: any[];
  apps: any[];
  websites: any[];
}

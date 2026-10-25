export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  avatar: string;
  baseSalary: number;
  department?: { name: string } | null;
  position?: { title: string } | null;
}

export interface SimulationState {
  baseSalary: number;
  attendance: any[];
  leaves: any[];
  manualDeductions: any[];
  allowances: Record<string, number>;
}

export interface PayrollScenario {
  id: string;
  name: string;
  description: string;
  icon: any;
  apply: (salary: number) => SimulationState;
}

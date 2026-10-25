export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  employeeNumber?: string;
  isActive?: boolean;
  department?: {
    id: string;
    name: string;
  };
  position?: {
    id: string;
    title: string;
  };
}

export interface Assignment {
  id: string;
  date: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber?: string;
  };
}

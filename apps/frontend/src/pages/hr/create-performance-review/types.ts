export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  position?: { title: string };
  department?: { name: string };
  hasEmployeeRecord?: boolean;
}

export interface PerformanceReviewFormData {
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  periodStart: string;
  periodEnd: string;
  overallRating: number;
  strengths: string;
  improvements: string;
  reviewerComments: string;
  status: string;
}

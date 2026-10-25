export type TrainingStatus =
  | "PLANNED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export type TrainingFormData = {
  employeeId: string;
  trainingName: string;
  provider: string;
  type: string;
  startDate: string;
  endDate: string;
  status: TrainingStatus;
  cost: string;
  duration: string;
  score: string;
  description: string;
};

export interface TrainingTypeOption {
  value: string;
  label: string;
}

export interface TrainingStatusOption {
  value: TrainingStatus;
  label: string;
  color: string;
}

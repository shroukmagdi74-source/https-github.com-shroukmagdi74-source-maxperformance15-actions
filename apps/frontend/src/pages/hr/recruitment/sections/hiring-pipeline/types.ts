export interface PipelineStage {
  id: string;
  name: string;
  count: number;
  color: string;
}

export interface StageApplicant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  createdAt?: string;
  jobTitle?: string;
  job?: {
    title?: string;
  } | null;
}

export interface Policy {
  id: string;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface PolicyCategory {
  value: string;
  label: string;
}

export interface PolicyFormData {
  title: string;
  content: string;
  category: string;
  isActive: boolean;
}

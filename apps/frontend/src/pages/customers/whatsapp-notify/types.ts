export type Audience = 'all' | 'withOrders' | 'newCustomers' | 'activeCustomers';
export type NotifyMode = 'general' | 'birthday';
export type DelayUnit = 'seconds' | 'minutes';
export type DelayMode = 'perMessage' | 'perSession';

export interface CustomerWhatsAppNotifyProps {
  mode?: NotifyMode;
}

export interface Session {
  sessionId: string;
  phoneNumber: string;
  isConnected: boolean;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  price: number | string;
  images: string[];
  description?: string;
}

export interface CampaignError {
  customerId: string;
  phone?: string;
  formattedPhone?: string;
  name?: string;
  error: string;
  timestamp?: string;
}

export interface CampaignStatus {
  status: 'running' | 'completed' | 'cancelled';
  sent: number;
  failed: number;
  total: number;
  progress: number;
  startedAt: string;
  completedAt?: string;
  errors: CampaignError[];
}

export interface TemplateSnippet {
  label: string;
  text: string;
}

export interface CampaignFormData {
  name: string;
  message: string;
  targetAudience: string;
  scheduledAt: string;
  scheduledTime: string;
  recipientCount: number;
  tags: string[];
  priority: "low" | "medium" | "high";
  includeImages: boolean;
  trackClicks: boolean;
  autoResend: boolean;
  sendNow: boolean;
  images: File[];
}

export interface CustomerList {
  id: string;
  name: string;
  description: string;
  count: number;
  criteria: string;
}

import {
  FacebookCampaign,
  FacebookAdsPerformanceTotals,
} from "../../../../services/facebookAdsService";

export interface CampaignQuickViewModalProps {
  isOpen: boolean;
  campaign: FacebookCampaign | null;
  performance?: FacebookAdsPerformanceTotals | null;
  selectedCurrency: string;
  selectedAdAccountId: string;
  onClose: () => void;
  onCampaignUpdated?: (updatedCampaign: FacebookCampaign) => void;
}

export type TabType = "summary" | "weaknesses" | "structure";

export interface DiagnosedWeakness {
  id: string;
  severity: "critical" | "warning" | "opportunity";
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  metricLabel?: string;
  metricValue?: string;
  actionLabel?: string;
  actionLabelEn?: string;
  action?: () => void;
}

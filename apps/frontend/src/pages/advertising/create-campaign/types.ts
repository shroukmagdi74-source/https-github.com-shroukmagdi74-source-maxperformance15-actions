import { FacebookAdAccount } from "../../../services/facebookAdsService";

export interface FacebookPixel {
  pixelId: string;
  pixelName: string;
  businessId: string;
  businessName: string;
}

export interface CampaignFormData {
  name: string;
  objective: string;
  status: "ACTIVE" | "PAUSED";
  budgetType: "DAILY" | "LIFETIME";
  budgetAmount: number;
  startDate: string;
  endDate: string;
  adAccountId: string;
  pixelId: string;
  description: string;
  specialAdCategories: string[];
  budgetOptimization: boolean;
  spendLimit: number | undefined;
  timezone: string;
  buyingType: string;
  bidStrategy: string;
  // Ad Set fields
  conversionLocation: string;
  optimizationGoal: string;
  // Targeting fields
  targetingAgeMin: number;
  targetingAgeMax: number;
  targetingGenders: string[];
  targetingLocations: string[];
  targetingInterests: string[];
  // Placements
  placementType: "AUTOMATIC" | "MANUAL";
  placements: string[];
}

export interface SpecialAdCategoryOption {
  value: string;
  label: string;
  description: string;
}

export interface TimezoneOption {
  value: string;
  label: string;
}

export interface BidStrategyOption {
  value: string;
  label: string;
  description: string;
}

export interface BuyingTypeOption {
  value: string;
  label: string;
  description: string;
}

export interface ConversionLocationOption {
  value: string;
  label: string;
  description: string;
  icon?: string;
}

export interface OptimizationGoalOption {
  value: string;
  label: string;
  description: string;
}

export interface PlacementOption {
  value: string;
  label: string;
  platform: string;
}

export interface InterestOption {
  value: string;
  label: string;
  category: string;
}

export interface LocationOption {
  value: string;
  label: string;
}

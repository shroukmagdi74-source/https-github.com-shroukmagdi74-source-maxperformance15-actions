import React from "react";
import type { FormData, CarouselCard } from "../../types";
import type {
  FacebookAdAccount,
  FacebookPage,
  FacebookPagesMeta,
  FacebookPagePost,
} from "../../../../../services/facebookAdsService";

export interface Step5CreativeProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleChange: (field: keyof FormData, value: any) => void;
  getError: (field: string) => string;
  facebookPages: FacebookPage[];
  facebookPagesMeta: FacebookPagesMeta | null;
  loadingPages: boolean;
  selectedFacebookPage: FacebookPage | undefined;
  selectedAdAccount: FacebookAdAccount | undefined;
  selectedAdAccountId: string;
  selectedAdAccountIsActive: boolean;
  syncingAdAccount: boolean;
  handleActivateSelectedAdAccount: () => Promise<void>;
  isStorefrontProductLaunch: boolean;
  isAiDraftPrefill: boolean;
  launchPrefillProductTitle: string;
}

export type CreativeSourceType = "NEW_AD" | "EXISTING_POST";

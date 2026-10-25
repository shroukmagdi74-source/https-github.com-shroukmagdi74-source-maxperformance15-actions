import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { useAuth } from "../../../hooks/useAuthSimple";
import { apiClient } from "../../../services/apiClient";
import {
  facebookAdsService,
  CAMPAIGN_OBJECTIVES,
  FacebookAdAccount,
} from "../../../services/facebookAdsService";
import { CampaignFormData, FacebookPixel } from "./types";
import { initialCampaignFormData } from "./constants";

export const useCreateCampaignController = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [adAccounts, setAdAccounts] = useState<FacebookAdAccount[]>([]);
  const [pixels, setPixels] = useState<FacebookPixel[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingPixels, setLoadingPixels] = useState(false);

  const [formData, setFormData] = useState<CampaignFormData>(initialCampaignFormData);

  const totalSteps = 6;

  const loadAdAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);
      const accounts = await facebookAdsService.getAdAccounts();
      setAdAccounts(accounts);
      if (accounts.length > 0 && !formData.adAccountId) {
        const defaultAccount =
          accounts.find((account) => account.isActive) || accounts[0];
        setFormData((prev) => ({
          ...prev,
          adAccountId:
            defaultAccount?.account_id || defaultAccount?.id || "",
        }));
      }
    } catch (error: unknown) {
      console.error("Error loading Ad Accounts:", error);
      tToast.error("CreateCampaign.failed_load_7ed0");
    } finally {
      setLoadingAccounts(false);
    }
  }, [formData.adAccountId]);

  const loadPixels = useCallback(async () => {
    if (!user?.companyId) return;

    try {
      setLoadingPixels(true);
      const response = await apiClient.get("/facebook-oauth/pixels", {
        params: { companyId: user.companyId },
      });

      if (response.data.success && response.data.pixels) {
        setPixels(response.data.pixels);
        if (response.data.pixels.length === 1 && !formData.pixelId) {
          setFormData((prev) => ({
            ...prev,
            pixelId: response.data.pixels[0].pixelId,
          }));
        }
      }
    } catch (error: unknown) {
      console.error("Error loading Pixels:", error);
    } finally {
      setLoadingPixels(false);
    }
  }, [formData.pixelId, user?.companyId]);

  useEffect(() => {
    void loadAdAccounts();
    void loadPixels();
  }, [loadAdAccounts, loadPixels]);

  const handleInputChange = (
    field: keyof CampaignFormData,
    value: CampaignFormData[keyof CampaignFormData],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpecialAdCategoryToggle = (category: string) => {
    setFormData((prev) => {
      const current = prev.specialAdCategories || [];
      const updated = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];
      return { ...prev, specialAdCategories: updated };
    });
  };

  const handleLocationToggle = (locationCode: string) => {
    setFormData((prev) => ({
      ...prev,
      targetingLocations: prev.targetingLocations.includes(locationCode)
        ? prev.targetingLocations.filter((l) => l !== locationCode)
        : [...prev.targetingLocations, locationCode],
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      targetingInterests: prev.targetingInterests.includes(interest)
        ? prev.targetingInterests.filter((i) => i !== interest)
        : [...prev.targetingInterests, interest],
    }));
  };

  const handlePlacementToggle = (placement: string) => {
    setFormData((prev) => ({
      ...prev,
      placements: prev.placements.includes(placement)
        ? prev.placements.filter((p) => p !== placement)
        : [...prev.placements, placement],
    }));
  };

  const handleGenderToggle = (gender: string) => {
    setFormData((prev) => ({
      ...prev,
      targetingGenders: prev.targetingGenders.includes(gender)
        ? prev.targetingGenders.filter((g) => g !== gender)
        : [...prev.targetingGenders, gender],
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          tToast.error("CreateCampaign.please_name_c07b");
          return false;
        }
        if (!formData.objective) {
          tToast.error("CreateCampaign.msg_0457");
          return false;
        }
        return true;
      case 2:
        if (!formData.budgetAmount || formData.budgetAmount <= 0) {
          tToast.error("CreateCampaign.msg_61ce");
          return false;
        }
        return true;
      case 3:
        if (!formData.conversionLocation) {
          tToast.error("CreateCampaign.msg_136c");
          return false;
        }
        if (formData.targetingLocations.length === 0) {
          tToast.error("CreateCampaign.msg_4753");
          return false;
        }
        return true;
      case 4:
        if (
          formData.placementType === "MANUAL" &&
          formData.placements.length === 0
        ) {
          toast.error(
            "يرجى اختيار موضع واحد على الأقل أو استخدام المواضع التلقائية",
          );
          return false;
        }
        return true;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      return;
    }

    try {
      setLoading(true);
      const campaignData = {
        name: formData.name,
        objective: formData.objective,
        status: formData.status || "PAUSED",
        budgetType: formData.budgetType,
        budgetAmount: formData.budgetAmount,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        adAccountId: formData.adAccountId || undefined,
        pixelId: formData.pixelId || undefined,
        description: formData.description || undefined,
        specialAdCategories: formData.specialAdCategories?.length
          ? formData.specialAdCategories
          : undefined,
        budgetOptimization: formData.budgetOptimization || false,
        spendLimit: formData.spendLimit || undefined,
        timezone: formData.timezone || "Africa/Cairo",
        buyingType: formData.buyingType || "AUCTION",
        bidStrategy: formData.bidStrategy || "LOWEST_COST_WITHOUT_CAP",
        conversionLocation: formData.conversionLocation,
        optimizationGoal: formData.optimizationGoal,
        targeting: {
          ageMin: formData.targetingAgeMin,
          ageMax: formData.targetingAgeMax,
          genders:
            formData.targetingGenders.length > 0
              ? formData.targetingGenders
              : undefined,
          locations: formData.targetingLocations,
          interests:
            formData.targetingInterests.length > 0
              ? formData.targetingInterests
              : undefined,
        },
        placementType: formData.placementType,
        placements:
          formData.placementType === "MANUAL" ? formData.placements : undefined,
      };

      const campaign = await facebookAdsService.createCampaign(campaignData);
      tToast.success("CreateCampaign.success_create_76a9");
      navigate(`/advertising/facebook-ads/campaigns/${campaign.id}`);
    } catch (error: unknown) {
      console.error("Error creating campaign:", error);
      toast.error(
        error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response &&
          error.response.data &&
          typeof error.response.data === "object" &&
          "error" in error.response.data &&
          typeof error.response.data.error === "string"
          ? error.response.data.error
          : "فشل في إنشاء الحملة",
      );
    } finally {
      setLoading(false);
    }
  };

  const getObjectiveDescription = (objective: string) => {
    const obj = CAMPAIGN_OBJECTIVES.find((o) => o.value === objective);
    return obj?.description || "";
  };

  return {
    navigate,
    user,
    currentStep,
    setCurrentStep,
    totalSteps,
    loading,
    adAccounts,
    pixels,
    loadingAccounts,
    loadingPixels,
    formData,
    handleInputChange,
    handleSpecialAdCategoryToggle,
    handleLocationToggle,
    handleInterestToggle,
    handlePlacementToggle,
    handleGenderToggle,
    validateStep,
    handleNext,
    handlePrevious,
    handleSubmit,
    getObjectiveDescription,
  };
};

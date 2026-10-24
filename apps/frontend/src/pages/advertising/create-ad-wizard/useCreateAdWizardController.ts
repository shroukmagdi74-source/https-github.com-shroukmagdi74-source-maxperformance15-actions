import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import {
  facebookAdsService,
  CreateFullAdData,
  FacebookAdAccount,
  FacebookCustomAudience,
  FacebookLookalikeAudience,
  FacebookPage,
  FacebookPagesMeta,
  FacebookPixel,
  FacebookSavedAdAccount,
} from "../../../services/facebookAdsService";
import {
  buildCreateAdWizardTargetingPayload,
  buildWizardCreativeSummary,
  buildWizardGeoSummary,
  formatAdAccountCurrency,
  getCompatibleAttributionWindows,
  getFullAdMinimumBudgetAmount,
  isCappedBidStrategy,
  normalizeAttributionWindowForObjective,
  normalizeCurrencyCode,
  normalizeWizardBidStrategy,
} from "../CreateAdWizard.helpers";
import { getResultEntityId } from "../wizard/types";
import type {
  CreatedFullAdSummary,
  FormData,
  CreateAdWizardErrors,
  TargetingOption,
} from "../wizard/types";
import {
  getWizardSteps,
  getObjectives,
  getCountries,
  COUNTRIES,
  ATTRIBUTION_WINDOWS,
  DEFAULT_WIZARD_BUDGET_AMOUNT,
} from "../wizard/constants";
import {
  humanizeProductSlug,
  buildPrefilledCampaignName,
  buildDefaultUrlParameters,
  getProductLaunchPrefillPayload,
  getPrefilledCarouselCards,
  getSafePrefillImageUrls,
  createClientRequestId,
} from "../wizard/utils/prefillStorage";

export function useCreateAdWizardController() {
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language && i18n.language.startsWith("en"));
  const wizardSteps = useMemo(() => getWizardSteps(isEn), [isEn]);
  const objectives = useMemo(() => getObjectives(isEn), [isEn]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const launchPrefillId = searchParams.get("launchPrefillId") || "";
  const storedLaunchPrefill = getProductLaunchPrefillPayload(launchPrefillId);
  const isAiDraftPrefill = !!storedLaunchPrefill;
  const prefillProductUrl =
    storedLaunchPrefill?.productUrl || searchParams.get("productUrl") || "";
  const prefillProductId =
    storedLaunchPrefill?.productId || searchParams.get("productId") || "";
  const prefillProductSlug =
    storedLaunchPrefill?.productSlug || searchParams.get("productSlug") || "";
  const prefillProductTitle =
    storedLaunchPrefill?.productTitle ||
    searchParams.get("productTitle") ||
    humanizeProductSlug(prefillProductSlug) ||
    (isEn ? "Product" : "المنتج");
  const isStorefrontProductLaunch = Boolean(
    isAiDraftPrefill ||
      prefillProductUrl ||
      prefillProductId ||
      prefillProductSlug
  );
  const launchPrefillProductTitle = prefillProductTitle;
  const productLaunchUrl = prefillProductUrl;
  const prefillBudget =
    Number(
      storedLaunchPrefill?.budget ||
        searchParams.get("budget") ||
        DEFAULT_WIZARD_BUDGET_AMOUNT
    ) || DEFAULT_WIZARD_BUDGET_AMOUNT;
  const prefillObjective =
    storedLaunchPrefill?.objective || searchParams.get("objective") || "";
  const prefillPixelId =
    storedLaunchPrefill?.pixelId || searchParams.get("pixelId") || "";
  const prefillPageId =
    storedLaunchPrefill?.pageId || searchParams.get("pageId") || "";
  const prefillStatus =
    storedLaunchPrefill?.status === "ACTIVE" ? "ACTIVE" : "PAUSED";
  const prefillImageUrls = getSafePrefillImageUrls(
    storedLaunchPrefill?.imageUrls
  );
  const prefillCreativeType =
    storedLaunchPrefill?.creativeType === "SINGLE_IMAGE" ||
    prefillImageUrls.length < 2
      ? "SINGLE_IMAGE"
      : "CAROUSEL";
  const requestedAdAccountId = searchParams.get("adAccountId") || "";
  const [currentStep, setCurrentStep] = useState(1);
  const [showFullWizard, setShowFullWizard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CreateAdWizardErrors>({});
  const getError = useCallback(
    (field: string) => errors[field] || "",
    [errors]
  );
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [publishAccountConfirmed, setPublishAccountConfirmed] = useState(false);
  const [activePublishConfirmed, setActivePublishConfirmed] = useState(false);
  const [createdFullAd, setCreatedFullAd] =
    useState<CreatedFullAdSummary | null>(null);
  const [publishRequestId, setPublishRequestId] = useState(
    () =>
      storedLaunchPrefill?.publishRequestId ||
      createClientRequestId("fb-full-ad")
  );
  const publishDialogRef = useRef<HTMLDivElement | null>(null);
  const restorePublishFocusRef = useRef<HTMLElement | null>(null);

  // Advanced Targeting State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TargetingOption[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<TargetingOption[]>(
    []
  );
  const [relationshipStatuses, setRelationshipStatuses] = useState<number[]>(
    []
  );
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [showAdvancedTargeting, setShowAdvancedTargeting] = useState(false);

  // Audiences State
  const [customAudiences, setCustomAudiences] = useState<
    FacebookCustomAudience[]
  >([]);
  const [lookalikeAudiences, setLookalikeAudiences] = useState<
    FacebookLookalikeAudience[]
  >([]);
  const [selectedCustomAudiences, setSelectedCustomAudiences] = useState<
    string[]
  >([]);
  const [selectedLookalikeAudiences, setSelectedLookalikeAudiences] = useState<
    string[]
  >([]);
  const [loadingAudiences, setLoadingAudiences] = useState(false);

  // Detailed Demographics State
  const [selectedEducation, setSelectedEducation] = useState<number[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);
  const [selectedIncome, setSelectedIncome] = useState<string[]>([]);
  const [selectedLifeEvents, setSelectedLifeEvents] = useState<string[]>([]);
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [excludedAudiences, setExcludedAudiences] = useState<string[]>([]);

  // Pages & Pixels State
  const [adAccounts, setAdAccounts] = useState<FacebookAdAccount[]>([]);
  const [savedAdAccounts, setSavedAdAccounts] = useState<
    FacebookSavedAdAccount[]
  >([]);
  const [selectedAdAccountId, setSelectedAdAccountId] = useState("");
  const [loadingAdAccounts, setLoadingAdAccounts] = useState(false);
  const [syncingAdAccount, setSyncingAdAccount] = useState(false);
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([]);
  const [facebookPagesMeta, setFacebookPagesMeta] =
    useState<FacebookPagesMeta | null>(null);
  const [facebookPixels, setFacebookPixels] = useState<FacebookPixel[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingPixels, setLoadingPixels] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Step 1
    campaignName:
      storedLaunchPrefill?.campaignName ||
      buildPrefilledCampaignName(prefillProductSlug),
    adSetName:
      storedLaunchPrefill?.adSetName ||
      storedLaunchPrefill?.createFullAdData?.adSetName ||
      "",
    adName:
      storedLaunchPrefill?.adName ||
      storedLaunchPrefill?.createFullAdData?.adName ||
      "",
    objective: prefillObjective || "",
    specialAdCategories: [],
    isSplitTest: false,
    splitTestVariable: "CREATIVE",
    spendLimit: undefined,

    // Step 2 - Ad Set Level
    performanceGoal: "MAXIMIZE_CONVERSIONS",
    conversionEvent: "PURCHASE",
    conversionLocation: "WEBSITE",
    attributionWindow: "7d_click_1d_view",
    dynamicCreative: false,
    pixelId: prefillPixelId,
    budgetOptimization: true,
    budgetType: "DAILY",
    budgetAmount:
      prefillBudget > 0 ? prefillBudget : DEFAULT_WIZARD_BUDGET_AMOUNT,
    bidStrategy: "LOWEST_COST",
    bidValue: undefined,
    startTime: "",
    endTime: "",
    frequencyCap: undefined,
    frequencyCapInterval: undefined,
    adSchedulingEnabled: false,
    adScheduleStartHour: 0,
    adScheduleEndHour: 24,
    adScheduleDays: [1, 2, 3, 4, 5, 6, 7],
    adSetSpendLimitsEnabled: false,
    adSetMinDailySpend: undefined,
    adSetMaxDailySpend: undefined,

    // Step 3
    ageMin: storedLaunchPrefill?.ageMin || 18,
    ageMax: storedLaunchPrefill?.ageMax || 65,
    genders: storedLaunchPrefill?.genders || [],
    locations: storedLaunchPrefill?.locations || ["EG"],
    regions: [],
    cities: [],
    locationTypes: ["home", "recent"],
    interests: [],
    excludedInterests: [],
    narrowInterests: [],
    advantageAudience: storedLaunchPrefill?.advantageAudience || false,
    customerLifecycleStrategy: "ALL_AUDIENCES",

    // Step 4
    placementType: "AUTOMATIC",
    placements: [],
    devicePlatforms: [],
    onlyWifi: false,
    inventoryFilter: "STANDARD",

    // Step 5
    pageId: prefillPageId,
    creativeType: prefillCreativeType,
    primaryText:
      storedLaunchPrefill?.primaryText ||
      (prefillProductUrl
        ? isEn
          ? `Choose ${prefillProductTitle} for a comfortable and stylish look. See photos and details, and order online now.`
          : `اختاري ${prefillProductTitle} بإطلالة مريحة وسهلة التنسيق. شوفي الصور والتفاصيل واطلبي أونلاين الآن.`
        : ""),
    headline:
      storedLaunchPrefill?.headline ||
      (prefillProductUrl ? `${prefillProductTitle}` : ""),
    description:
      storedLaunchPrefill?.description ||
      (prefillProductUrl
        ? isEn
          ? "Check product details and images before ordering."
          : "شاهدي تفاصيل المنتج والصور قبل الطلب."
        : ""),
    callToAction:
      storedLaunchPrefill?.callToAction ||
      storedLaunchPrefill?.createFullAdData?.callToAction ||
      (prefillProductUrl ? "SHOP_NOW" : "LEARN_MORE"),
    linkUrl: prefillProductUrl,
    productId: prefillProductId,
    displayLink: "",
    urlParameters: prefillProductUrl
      ? buildDefaultUrlParameters(prefillProductSlug)
      : "",
    imageUrl: prefillImageUrls[0] || "",
    videoUrl: "",
    customStoriesMedia: false,
    storyImageUrl: "",
    storyVideoUrl: "",
    carouselCards:
      prefillCreativeType === "CAROUSEL"
        ? getPrefilledCarouselCards(
            storedLaunchPrefill?.createFullAdData?.carouselCards,
            prefillImageUrls,
            prefillProductTitle,
            prefillProductUrl
          )
        : [],
    flexibleAssets: [],
    textVariations: [],
    headlineVariations: [],
    whatsappGreeting: isEn
      ? "Hello! I saw your ad on Facebook and would like to inquire about product details and ordering."
      : "أهلاً بك! رأيت إعلانك على فيسبوك وأرغب بالاستفسار عن تفاصيل المنتج والطلب.",
    whatsappQuickFaqs: isEn
      ? [
          "I want to order this product, what are the confirmation steps?",
          "What is the delivery time and shipping cost to my area?",
          "Can I inspect the order before receiving and paying?",
        ]
      : [
          "أرغب بطلب هذا المنتج، ما هي خطوات التأكيد؟",
          "ما هي مدة وتكلفة الشحن لمحافظتي؟",
          "هل متاح المعاينة قبل الاستلام والدفع؟",
        ],
    useLeadForm: false,
    leadFormId: undefined,
    instagramActorId: "",
    multiAdvertiserAds: true,
    advantageCreative: false,
    textGeneration: false,
    imageEnhancement: false,

    // Status
    status: prefillStatus,
  });

  useEffect(() => {
    const nextAttributionWindow = normalizeAttributionWindowForObjective(
      formData.objective,
      formData.attributionWindow
    );

    if (nextAttributionWindow !== formData.attributionWindow) {
      setFormData((prev) => ({
        ...prev,
        attributionWindow: nextAttributionWindow,
      }));
    }
  }, [formData.attributionWindow, formData.objective]);

  const selectedSavedAdAccount =
    savedAdAccounts.find((account) => account.accountId === selectedAdAccountId) ||
    null;
  const resolveAdAccountId = useCallback(
    (
      account:
        | Pick<FacebookAdAccount, "id" | "account_id">
        | Pick<FacebookSavedAdAccount, "accountId">
    ) => ("accountId" in account ? account.accountId : account.account_id || account.id.replace(/^act_/, "")),
    []
  );
  const selectedRemoteAdAccount =
    adAccounts.find((account) => resolveAdAccountId(account) === selectedAdAccountId) ||
    null;
  const selectedAdAccount = selectedRemoteAdAccount || undefined;
  const selectedAdAccountCurrency = normalizeCurrencyCode(
    selectedSavedAdAccount?.currency || selectedRemoteAdAccount?.currency || "EGP"
  );
  const minimumWizardBudget = getFullAdMinimumBudgetAmount(
    selectedAdAccountCurrency
  );
  const formatSelectedAdAccountCurrency = useCallback(
    (value?: number) =>
      formatAdAccountCurrency(value, selectedAdAccountCurrency, isEn),
    [isEn, selectedAdAccountCurrency]
  );

  const selectedFacebookPage =
    facebookPages.find((page) => page.id === formData.pageId) || null;
  const selectedFacebookPixel =
    facebookPixels.find((pixel) => pixel.id === formData.pixelId) || null;

  const validateStep = (
    step: number,
    outErrors?: { current?: CreateAdWizardErrors }
  ): boolean => {
    const newErrors: CreateAdWizardErrors = {};
    const stepsToValidate = step === 6 ? [1, 2, 3, 4, 5] : [step];

    for (const stepToValidate of stepsToValidate) {
      switch (stepToValidate) {
        case 1:
          if (!formData.campaignName.trim()) {
            newErrors["campaignName"] = isEn
              ? "Campaign name is required"
              : "اسم الحملة مطلوب";
          }
          if (!formData.objective) {
            newErrors["objective"] = isEn
              ? "Campaign objective is required"
              : "هدف الحملة مطلوب";
          }
          break;

        case 2:
          if (!selectedAdAccountId.trim()) {
            newErrors["adAccountId"] = isEn
              ? "A Facebook Ads account must be selected"
              : "يجب اختيار حساب Facebook Ads";
          }
          if (
            !formData.budgetAmount ||
            formData.budgetAmount < minimumWizardBudget
          ) {
            newErrors["budgetAmount"] = isEn
              ? `Budget cannot be less than ${formatSelectedAdAccountCurrency(minimumWizardBudget)}`
              : `الميزانية لا تقل عن ${formatSelectedAdAccountCurrency(
                  minimumWizardBudget
                )}`;
          }
          if (
            isCappedBidStrategy(formData.bidStrategy) &&
            (!formData.bidValue || formData.bidValue <= 0)
          ) {
            newErrors["bidValue"] = isEn
              ? "Enter a bid or cost cap value"
              : "أدخل قيمة المزايدة أو التكلفة";
          }
          if (
            (formData.objective === "OUTCOME_SALES" ||
              formData.objective === "OUTCOME_LEADS") &&
            !formData.pixelId.trim()
          ) {
            newErrors["pixelId"] = isEn
              ? "Choose a suitable Facebook Pixel or activate the ad account first"
              : "اختر Facebook Pixel مناسبًا أو فعّل الحساب الإعلاني أولًا";
          }
          break;

        case 3:
          if (
            formData.locations.length === 0 &&
            formData.regions.length === 0 &&
            formData.cities.length === 0
          ) {
            newErrors["locations"] = isEn
              ? "At least one location must be selected"
              : "يجب اختيار موقع واحد على الأقل";
          }
          if (formData.ageMin < 13 || formData.ageMax > 65) {
            newErrors["age"] = isEn
              ? "Age must be between 13 and 65"
              : "العمر يجب أن يكون بين 13 و 65";
          }
          break;

        case 4:
          if (
            formData.placementType === "MANUAL" &&
            formData.placements.length === 0
          ) {
            newErrors["placements"] = isEn
              ? "At least one placement must be selected"
              : "يجب اختيار موضع واحد على الأقل";
          }
          break;

        case 5:
          if (!formData.pageId.trim()) {
            newErrors["pageId"] = isEn
              ? "Page ID is required"
              : "معرف الصفحة مطلوب";
          }
          if (
            formData.pageId.trim() &&
            selectedFacebookPage?.status &&
            selectedFacebookPage.status !== "READY"
          ) {
            newErrors["pageId"] = isEn
              ? "Choose a page connected to your company and ready for publishing in MaxP."
              : "اختار صفحة مربوطة بالشركة وجاهزة للنشر داخل MaxP.";
          }
          if (formData.creativeType === "EXISTING_POST") {
            if (!formData.postId?.trim()) {
              newErrors["postId"] = isEn
                ? "An existing page post ID must be selected or entered"
                : "يجب اختيار أو إدخال معرف المنشور الحالي من الصفحة";
            }
          } else {
            if (!formData.primaryText.trim()) {
              newErrors["primaryText"] = isEn
                ? "Primary text is required"
                : "النص الأساسي مطلوب";
            }
            if (!formData.linkUrl.trim()) {
              newErrors["linkUrl"] = isEn
                ? "Destination link is required"
                : "رابط الوجهة مطلوب";
            }
            if (formData.creativeType === "FLEXIBLE") {
              newErrors["creativeType"] = isEn
                ? "Flexible format is being prepared. Use single image, video, or carousel for now."
                : "التنسيق المرن قيد التجهيز. استخدم صورة أو فيديو أو دوّار حالياً.";
            }
            if (
              formData.creativeType === "SINGLE_IMAGE" &&
              !formData.imageUrl.trim()
            ) {
              newErrors["imageUrl"] = isEn
                ? "Image URL is required before publishing"
                : "رابط الصورة مطلوب حالياً قبل الإرسال";
            }
            if (
              formData.creativeType === "SINGLE_VIDEO" &&
              !formData.videoUrl.trim()
            ) {
              newErrors["videoUrl"] = isEn
                ? "Video URL is required before publishing"
                : "رابط الفيديو مطلوب حالياً قبل الإرسال";
            }
            if (formData.creativeType === "CAROUSEL") {
              if (formData.carouselCards.length < 2) {
                newErrors["carouselCards"] = isEn
                  ? "Carousel requires at least 2 cards"
                  : "الدوّار يحتاج بطاقتين على الأقل";
              } else {
                const invalidCardIndex = formData.carouselCards.findIndex(
                  (card) =>
                    !card.imageUrl.trim() ||
                    !card.headline.trim() ||
                    !card.linkUrl.trim()
                );
                if (invalidCardIndex >= 0) {
                  newErrors["carouselCards"] = isEn
                    ? `Carousel card #${invalidCardIndex + 1} requires an image, headline, and link`
                    : `بطاقة الدوّار رقم ${invalidCardIndex + 1} تحتاج صورة وعنوان ورابط`;
                }
              }
            }
          }
          break;
      }
    }

    setErrors(newErrors);
    if (outErrors) outErrors.current = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleChange = (
    field: keyof FormData,
    value: FormData[keyof FormData]
  ) => {
    setFormData((prev) => {
      if (field === "bidStrategy") {
        const nextBidStrategy = normalizeWizardBidStrategy(String(value));
        return {
          ...prev,
          bidStrategy: nextBidStrategy,
          bidValue:
            nextBidStrategy === "LOWEST_COST" ? undefined : prev.bidValue,
        };
      }

      if (field === "objective") {
        const nextObjective = String(value);
        return {
          ...prev,
          objective: nextObjective,
          attributionWindow: normalizeAttributionWindowForObjective(
            nextObjective,
            prev.attributionWindow
          ),
        };
      }

      return { ...prev, [field]: value };
    });
    const fieldKey = field as string;
    if (errors[fieldKey]) {
      setErrors((prev) => ({ ...prev, [fieldKey]: "" }));
    }
  };

  const toggleArrayValue = (field: keyof FormData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    handleChange(field, newArray);
  };

  const handleSearchInterests = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = (await facebookAdsService.searchTargetingOptions(
        query,
        "adinterest"
      )) as TargetingOption[];
      setSearchResults(results || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const addInterest = (interest: TargetingOption) => {
    if (!selectedInterests.find((i) => i.id === interest.id)) {
      setSelectedInterests((prev) => [...prev, interest]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeInterest = (id: string) => {
    setSelectedInterests((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleRelationshipStatus = (value: number) => {
    setRelationshipStatuses((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleLanguage = (id: number) => {
    setSelectedLanguages((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleDevice = (value: string) => {
    setSelectedDevices((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const loadPagesAndPixels = useCallback(async (adAccountId?: string) => {
    try {
      setLoadingPages(true);
      setLoadingPixels(true);

      const [pagesResult, pixelsResult] = await Promise.allSettled([
        facebookAdsService.getFacebookPageOptions(),
        adAccountId
          ? facebookAdsService.getFacebookPixels(adAccountId)
          : Promise.resolve([] as FacebookPixel[]),
      ]);

      const pagesResponse =
        pagesResult.status === "fulfilled"
          ? pagesResult.value
          : { data: [], meta: null };
      const pages = pagesResponse.data || [];
      const pixels =
        pixelsResult.status === "fulfilled" ? pixelsResult.value || [] : [];

      setFacebookPages(pages);
      setFacebookPagesMeta(pagesResponse.meta || null);
      setFacebookPixels(pixels);
      setFormData((prev) => ({
        ...prev,
        pageId:
          (prev.pageId &&
            pages.find(
              (page) =>
                page.id === prev.pageId &&
                page.status === "READY" &&
                page.isSelectable !== false
            )?.id) ||
          pages.find((page) => page.status === "READY")?.id ||
          "",
        pixelId:
          prev.pixelId && pixels.some((pixel) => pixel.id === prev.pixelId)
            ? prev.pixelId
            : pixels[0]?.id || "",
      }));
    } catch (error) {
      console.error("Failed to load Facebook pages or pixels:", error);
      setFacebookPages([]);
      setFacebookPagesMeta(null);
      setFacebookPixels([]);
    } finally {
      setLoadingPages(false);
      setLoadingPixels(false);
    }
  }, []);

  const saveAdAccountSelection = useCallback(
    async (account: FacebookAdAccount) =>
      facebookAdsService.saveAdAccount({
        accountId: resolveAdAccountId(account),
        name: account.name,
        currency: account.currency,
        timezone: account.timezone_name,
      }),
    [resolveAdAccountId]
  );

  const refreshSavedAdAccounts = useCallback(async () => {
    const res = await facebookAdsService.getSavedAdAccounts();
    const nextSavedAdAccounts = Array.isArray(res)
      ? res
      : (res as any)?.data || [];
    setSavedAdAccounts(nextSavedAdAccounts);
    return nextSavedAdAccounts;
  }, []);

  const activateSelectedAdAccount = useCallback(async () => {
    if (!selectedAdAccountId) {
      throw new Error(
        isEn
          ? "Select a Facebook Ads account first"
          : "اختر حساب Facebook Ads أولاً"
      );
    }

    const activeSavedAccount = savedAdAccounts.find(
      (account) =>
        account.isActive && account.accountId === selectedAdAccountId
    );

    if (activeSavedAccount) {
      return selectedAdAccountId;
    }

    const selectedAccount = adAccounts.find(
      (account) => resolveAdAccountId(account) === selectedAdAccountId
    );

    if (!selectedAccount) {
      throw new Error(
        isEn
          ? "The selected ad account is not available"
          : "الحساب الإعلاني المحدد غير متاح"
      );
    }

    setSyncingAdAccount(true);
    try {
      await saveAdAccountSelection(selectedAccount);
      await refreshSavedAdAccounts();
      return resolveAdAccountId(selectedAccount);
    } finally {
      setSyncingAdAccount(false);
    }
  }, [
    adAccounts,
    isEn,
    refreshSavedAdAccounts,
    resolveAdAccountId,
    savedAdAccounts,
    saveAdAccountSelection,
    selectedAdAccountId,
  ]);

  const ensureSelectedAdAccountReady = useCallback(async () => {
    if (!selectedAdAccountId) {
      throw new Error(
        isEn
          ? "Select a Facebook Ads account first"
          : "اختر حساب Facebook Ads أولاً"
      );
    }

    const activeSavedAccount = savedAdAccounts.find(
      (account) =>
        account.isActive && account.accountId === selectedAdAccountId
    );

    if (!activeSavedAccount) {
      await activateSelectedAdAccount();
    }

    return selectedAdAccountId;
  }, [activateSelectedAdAccount, isEn, savedAdAccounts, selectedAdAccountId]);

  const handleActivateSelectedAdAccount = useCallback(async () => {
    try {
      const activeAdAccountId = await activateSelectedAdAccount();
      await loadPagesAndPixels(activeAdAccountId);
      tToast.success("CreateAdWizard.success_activate_0a35");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEn
            ? "Failed to activate ad account"
            : "تعذر تفعيل الحساب الإعلاني"
      );
    }
  }, [activateSelectedAdAccount, isEn, loadPagesAndPixels]);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setLoadingAudiences(true);
      setLoadingAdAccounts(true);

      try {
        const [
          customResult,
          lookalikeResult,
          adAccountsResult,
          savedAccountsResult,
        ] = await Promise.allSettled([
          facebookAdsService.getCustomAudiences(),
          facebookAdsService.getLookalikeAudiences(),
          facebookAdsService.getAdAccounts(),
          facebookAdsService.getSavedAdAccounts(),
        ]);

        const custom =
          customResult.status === "fulfilled"
            ? Array.isArray(customResult.value)
              ? customResult.value
              : (customResult.value as any)?.data || []
            : [];
        const lookalike =
          lookalikeResult.status === "fulfilled"
            ? Array.isArray(lookalikeResult.value)
              ? lookalikeResult.value
              : (lookalikeResult.value as any)?.data || []
            : [];
        const remoteAdAccounts =
          adAccountsResult.status === "fulfilled"
            ? Array.isArray(adAccountsResult.value)
              ? adAccountsResult.value
              : (adAccountsResult.value as any)?.data || []
            : [];
        const existingSavedAccounts =
          savedAccountsResult.status === "fulfilled"
            ? Array.isArray(savedAccountsResult.value)
              ? savedAccountsResult.value
              : (savedAccountsResult.value as any)?.data || []
            : [];

        if (isCancelled) {
          return;
        }

        setCustomAudiences(custom);
        setLookalikeAudiences(lookalike);
        setAdAccounts(remoteAdAccounts);
        setSavedAdAccounts(existingSavedAccounts);

        const requestedAccount = requestedAdAccountId
          ? remoteAdAccounts.find(
              (account) =>
                resolveAdAccountId(account) === requestedAdAccountId ||
                account.id === requestedAdAccountId ||
                `act_${resolveAdAccountId(account)}` === requestedAdAccountId
            )
          : null;

        if (requestedAccount) {
          const resolvedId = resolveAdAccountId(requestedAccount);
          setSelectedAdAccountId(resolvedId);
          await loadPagesAndPixels(resolvedId);
          return;
        }

        const activeSavedAccount =
          existingSavedAccounts.find((account) => account.isActive) ||
          existingSavedAccounts[0];

        if (activeSavedAccount) {
          setSelectedAdAccountId(activeSavedAccount.accountId);
          await loadPagesAndPixels(activeSavedAccount.accountId);
          return;
        }

        if (remoteAdAccounts.length === 1) {
          setSelectedAdAccountId("");
          setFormData((prev) => ({ ...prev, pixelId: "" }));
          await loadPagesAndPixels();
          return;
        }
      } catch (error) {
        console.error("Failed to load Facebook Ads wizard data:", error);
        setFacebookPages([]);
        setFacebookPagesMeta(null);
        setFacebookPixels([]);
      } finally {
        if (!isCancelled) {
          setLoadingAudiences(false);
          setLoadingAdAccounts(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [
    loadPagesAndPixels,
    refreshSavedAdAccounts,
    requestedAdAccountId,
    resolveAdAccountId,
    saveAdAccountSelection,
  ]);

  const toggleCustomAudience = (id: string) => {
    setSelectedCustomAudiences((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleLookalikeAudience = (id: string) => {
    setSelectedLookalikeAudiences((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    try {
      setLoading(true);
      setShowPublishConfirm(false);
      const activeAdAccountId = await ensureSelectedAdAccountReady();
      const normalizedBidStrategy = normalizeWizardBidStrategy(
        formData.bidStrategy
      );
      const normalizedAttributionWindow =
        normalizeAttributionWindowForObjective(
          formData.objective,
          formData.attributionWindow
        );
      const usesConversionOptimization =
        formData.objective === "OUTCOME_SALES" ||
        formData.objective === "OUTCOME_LEADS";
      const targeting = buildCreateAdWizardTargetingPayload(formData, {
        selectedInterests,
        selectedCustomAudiences,
        selectedLookalikeAudiences,
        excludedAudiences,
        excludedInterests: formData.excludedInterests,
        narrowInterests: formData.narrowInterests,
        selectedLanguages,
        selectedDevices,
        relationshipStatuses,
        selectedEducation,
      });

      const data: CreateFullAdData = {
        adAccountId: activeAdAccountId,
        clientRequestId: publishRequestId,
        idempotencyKey: publishRequestId,
        ...(formData.status === "ACTIVE" &&
          activePublishConfirmed && {
            allowActivePublish: true,
            activePublishConfirmationToken: "ACTIVE_PUBLISH_CONFIRMED",
          }),

        // Campaign
        campaignName: formData.campaignName,
        objective: formData.objective,
        specialAdCategories: formData.specialAdCategories.filter(
          (c) => c !== "NONE"
        ),
        ...(formData.isSplitTest && {
          isSplitTest: true,
          splitTestVariable: formData.splitTestVariable,
        }),
        ...(formData.spendLimit && {
          spendLimit: formData.spendLimit,
        }),

        // Ad Set Level
        ...(formData.adSetName && { adSetName: formData.adSetName }),
        ...(usesConversionOptimization && {
          performanceGoal: formData.performanceGoal,
          conversionEvent: formData.conversionEvent,
          conversionLocation: formData.conversionLocation,
          pixelId: formData.pixelId,
        }),
        attributionWindow: normalizedAttributionWindow,
        dynamicCreative: formData.dynamicCreative,

        // Budget
        budgetOptimization: formData.budgetOptimization,
        budgetType: formData.budgetType,
        budgetAmount: formData.budgetAmount,
        bidStrategy: normalizedBidStrategy,
        ...(formData.bidValue && { bidValue: formData.bidValue }),
        ...(formData.frequencyCap && { frequencyCap: formData.frequencyCap }),
        ...(formData.frequencyCapInterval && {
          frequencyCapInterval: formData.frequencyCapInterval,
        }),

        // Schedule & Dayparting
        ...(formData.startTime && { startTime: formData.startTime }),
        ...(formData.endTime && { endTime: formData.endTime }),
        ...(formData.adSchedulingEnabled && {
          adSchedulingEnabled: true,
          adScheduleStartHour: formData.adScheduleStartHour,
          adScheduleEndHour: formData.adScheduleEndHour,
          adScheduleDays: formData.adScheduleDays,
        }),
        ...(formData.adSetSpendLimitsEnabled && {
          adSetSpendLimitsEnabled: true,
          adSetMinDailySpend: formData.adSetMinDailySpend,
          adSetMaxDailySpend: formData.adSetMaxDailySpend,
        }),

        // Targeting
        targeting,

        // Placements & Brand Safety
        placementType: formData.placementType,
        ...(formData.inventoryFilter && {
          inventoryFilter: formData.inventoryFilter,
        }),
        ...(formData.placementType === "MANUAL" && {
          ...(formData.placements.length > 0 && {
            placements: formData.placements,
          }),
          ...(formData.devicePlatforms &&
            formData.devicePlatforms.length > 0 && {
              devicePlatforms: formData.devicePlatforms,
            }),
          ...(formData.onlyWifi && { onlyWifi: formData.onlyWifi }),
        }),

        // Creative
        ...(formData.adName && { adName: formData.adName }),
        pageId: formData.pageId,
        creativeType: formData.creativeType,
        ...(formData.postId && {
          postId: (() => {
            const rawPostId = formData.postId.trim();
            const pageIdStr = formData.pageId.trim();
            if (rawPostId.includes("_")) {
              const [p1, p2] = rawPostId.split("_");
              if (p2 === pageIdStr) return `${pageIdStr}_${p1}`;
              if (p1 === pageIdStr) return `${pageIdStr}_${p2}`;
              return `${pageIdStr}_${p2 || p1}`;
            }
            return `${pageIdStr}_${rawPostId}`;
          })(),
        }),
        primaryText: formData.primaryText,
        ...(formData.headline && { headline: formData.headline }),
        ...(formData.description && { description: formData.description }),
        callToAction: formData.callToAction,
        linkUrl: formData.linkUrl,
        ...(formData.productId && { productId: formData.productId }),
        ...(formData.displayLink && { displayLink: formData.displayLink }),
        ...(formData.urlParameters && {
          urlParameters: formData.urlParameters,
        }),
        ...(formData.creativeType === "SINGLE_IMAGE" &&
          formData.imageUrl && { imageUrl: formData.imageUrl }),
        ...(formData.creativeType === "SINGLE_VIDEO" &&
          formData.videoUrl && { videoUrl: formData.videoUrl }),
        ...(formData.customStoriesMedia && {
          customStoriesMedia: true,
        }),
        ...(formData.storyImageUrl && {
          storyImageUrl: formData.storyImageUrl,
        }),
        ...(formData.storyVideoUrl && {
          storyVideoUrl: formData.storyVideoUrl,
        }),
        ...(formData.creativeType === "CAROUSEL" &&
          formData.carouselCards.length > 0 && {
            carouselCards: formData.carouselCards,
          }),
        ...(formData.creativeType === "FLEXIBLE" &&
          formData.flexibleAssets.length > 0 && {
            flexibleAssets: formData.flexibleAssets,
          }),
        ...(formData.textVariations.length > 0 && {
          textVariations: formData.textVariations,
        }),
        ...(formData.headlineVariations.length > 0 && {
          headlineVariations: formData.headlineVariations,
        }),
        ...(formData.whatsappGreeting && {
          whatsappGreeting: formData.whatsappGreeting,
        }),
        ...(formData.whatsappQuickFaqs &&
          formData.whatsappQuickFaqs.length > 0 && {
            whatsappQuickFaqs: formData.whatsappQuickFaqs,
          }),
        ...(formData.useLeadForm &&
          formData.leadFormId && { leadFormId: formData.leadFormId }),

        advantageCreative:
          formData.creativeType === "EXISTING_POST"
            ? false
            : formData.advantageCreative,
        textGeneration:
          formData.creativeType === "EXISTING_POST"
            ? false
            : formData.textGeneration,
        imageEnhancement:
          formData.creativeType === "EXISTING_POST"
            ? false
            : formData.imageEnhancement,
        expandImage:
          formData.creativeType === "EXISTING_POST"
            ? false
            : formData.expandImage,
        visualTouchups:
          formData.creativeType === "EXISTING_POST"
            ? false
            : formData.visualTouchups,
        relevantComments:
          formData.creativeType === "EXISTING_POST"
            ? false
            : formData.relevantComments,
        priceOverlay:
          formData.creativeType === "EXISTING_POST"
            ? false
            : formData.priceOverlay,
        existingCustomerBudgetPercentage:
          formData.existingCustomerBudgetPercentage,
        ...(formData.instagramActorId && {
          instagramActorId: formData.instagramActorId,
        }),
        multiAdvertiserAds: formData.multiAdvertiserAds !== false,

        // Status
        status: formData.status,
      };

      const result = await facebookAdsService.createFullAd(data);

      if (result.success) {
        const facebookIds = result.data?.facebookIds || result.facebookIds;
        const campaignId = result.campaignId || facebookIds?.campaignId;
        const adSetId = result.adSetId || facebookIds?.adSetId;
        const adId = result.adId || facebookIds?.adId;
        const localCampaignId = getResultEntityId(result.data?.campaign);
        const localAdSetId = getResultEntityId(result.data?.adSet);
        const localAdId = getResultEntityId(result.data?.ad);
        const idSummary = [
          campaignId && `Campaign ${campaignId}`,
          adSetId && `Ad Set ${adSetId}`,
          adId && `Ad ${adId}`,
        ]
          .filter(Boolean)
          .join(" • ");

        toast.success(
          result.partialSuccess
            ? isEn
              ? `Ad created on Meta with local save warning. ${idSummary}`
              : `تم إنشاء الإعلان على Meta مع تحذير حفظ محلي. ${idSummary}`
            : isEn
              ? `Ad created successfully. ${idSummary}`
              : `تم إنشاء الإعلان بنجاح. ${idSummary}`,
          { duration: 8000 }
        );
        setCreatedFullAd({
          localCampaignId,
          localAdSetId,
          localAdId,
          facebookCampaignId: campaignId,
          facebookAdSetId: adSetId,
          facebookAdId: adId,
          creativeId: result.creativeId || facebookIds?.creativeId,
          status: formData.status,
          adAccountId: activeAdAccountId,
        });
        setCurrentStep(6);
      } else {
        toast.error(
          result.error || (isEn ? "Failed to create ad" : "فشل في إنشاء الإعلان")
        );
      }
    } catch (error: unknown) {
      console.error("Error creating ad:", error);
      const responseData =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object"
          ? (error.response.data as {
              error?: string;
              errorCode?: string;
              retryableWithNewRequestId?: boolean;
              status?: string;
            })
          : null;
      const shouldRotatePublishRequest =
        responseData?.retryableWithNewRequestId === true ||
        [
          "FACEBOOK_AD_PUBLISH_PAYLOAD_MISMATCH",
          "FACEBOOK_AD_PUBLISH_PRE_META_FAILED",
          "FACEBOOK_AD_PUBLISH_REQUEST_STALE",
        ].includes(responseData?.errorCode || "") ||
        (responseData?.errorCode === "FACEBOOK_AD_PUBLISH_REQUEST_LOCKED" &&
          ["FAILED", "STALE", "STALE_IN_PROGRESS"].includes(
            responseData?.status || ""
          ));

      if (shouldRotatePublishRequest) {
        setPublishRequestId(createClientRequestId("fb-full-ad"));
      }
      const errorMessage =
        responseData?.error ||
        (error instanceof Error ? error.message : null) ||
        (isEn
          ? "An error occurred while creating the ad"
          : "حدث خطأ أثناء إنشاء الإعلان");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const activeSavedAdAccountId =
    savedAdAccounts.find((account) => account.isActive)?.accountId || "";
  const selectedAdAccountIsActive =
    Boolean(selectedAdAccountId) &&
    activeSavedAdAccountId === selectedAdAccountId;

  const getAdAccountBusinessName = useCallback(
    (account: FacebookAdAccount) =>
      account.business?.name ||
      account.billingHealth?.business?.name ||
      (isEn
        ? "Accounts without distinct Business"
        : "حسابات بدون Business واضح"),
    [isEn]
  );
  const selectedBusinessName = selectedRemoteAdAccount
    ? getAdAccountBusinessName(selectedRemoteAdAccount)
    : isEn
      ? "Unspecified"
      : "غير محدد";
  const selectedAdAccountName =
    selectedSavedAdAccount?.name ||
    selectedRemoteAdAccount?.name ||
    selectedAdAccountId ||
    (isEn ? "Unspecified" : "غير محدد");
  const selectedAccountHealthLabel =
    selectedRemoteAdAccount?.billingHealth?.accountStatusLabel ||
    (selectedAdAccountIsActive
      ? isEn
        ? "Active in MaxP"
        : "مفعل داخل MaxP"
      : isEn
        ? "Needs Activation"
        : "يحتاج تفعيل");
  const selectedObjectiveLabel =
    objectives.find((objective) => objective.value === formData.objective)
      ?.label ||
    formData.objective ||
    (isEn ? "Unspecified" : "غير محدد");
  const selectedCreativeSummary = buildWizardCreativeSummary(formData, isEn);
  const publishConfirmDisabled =
    loading ||
    !publishAccountConfirmed ||
    (formData.status === "ACTIVE" && !activePublishConfirmed);
  const selectedGeoSummary = buildWizardGeoSummary(
    formData,
    isEn,
    isEn ? getCountries(true) : COUNTRIES
  );
  const compatibleAttributionWindows = getCompatibleAttributionWindows(
    formData.objective,
    ATTRIBUTION_WINDOWS
  );
  const selectedAttributionWindowLabel =
    compatibleAttributionWindows.find(
      (window) => window.value === formData.attributionWindow
    )?.label ||
    ATTRIBUTION_WINDOWS.find(
      (window) => window.value === formData.attributionWindow
    )?.label ||
    normalizeAttributionWindowForObjective(
      formData.objective,
      formData.attributionWindow
    );
  const selectedTargetingSignalCount =
    (selectedInterests?.length || 0) +
    (selectedCustomAudiences?.length || 0) +
    (selectedLookalikeAudiences?.length || 0) +
    (excludedAudiences?.length || 0) +
    (selectedLanguages?.length || 0) +
    (selectedDevices?.length || 0) +
    (relationshipStatuses?.length || 0) +
    (selectedEducation?.length || 0);

  const handleRequestPublishConfirmation = async () => {
    const errorHolder: { current?: CreateAdWizardErrors } = {};
    if (!validateStep(6, errorHolder)) {
      const stepErrorKeys: Record<number, string[]> = {
        1: ["campaignName", "objective"],
        2: ["adAccountId", "budgetAmount", "bidValue", "pixelId"],
        3: ["locations", "age"],
        4: ["placements"],
        5: [
          "pageId",
          "postId",
          "primaryText",
          "linkUrl",
          "creativeType",
          "imageUrl",
          "videoUrl",
          "carouselCards",
        ],
      };
      const foundErrors = errorHolder.current || {};
      let firstErrorStep = 1;
      let firstErrorMessage = "";
      for (const [stepNum, keys] of Object.entries(stepErrorKeys)) {
        const foundKey = keys.find((k) => foundErrors[k]);
        if (foundKey) {
          firstErrorStep = Number(stepNum);
          firstErrorMessage = foundErrors[foundKey] || "";
          break;
        }
      }
      setShowFullWizard(true);
      setCurrentStep(firstErrorStep);
      toast.error(
        firstErrorMessage ||
          (isEn
            ? "Please complete all required fields before reviewing"
            : "يرجى استكمال الحقول المطلوبة قبل مراجعة الإعلان")
      );
      return;
    }

    if (!selectedAdAccountIsActive && selectedAdAccountId) {
      try {
        await activateSelectedAdAccount();
      } catch (activateError) {
        console.warn("Auto-activation notice:", activateError);
        setShowFullWizard(true);
        setCurrentStep(2);
        const errMsg =
          activateError instanceof Error
            ? activateError.message
            : isEn
              ? "Activate the selected ad account before creating the ad."
              : "فعّل الحساب الإعلاني المختار قبل إنشاء الإعلان.";
        setErrors((prev) => ({
          ...prev,
          adAccountId: errMsg,
        }));
        toast.error(errMsg);
        return;
      }
    }

    restorePublishFocusRef.current = document.activeElement as HTMLElement | null;
    setPublishAccountConfirmed(false);
    setActivePublishConfirmed(false);
    setShowPublishConfirm(true);
  };

  const closePublishConfirmation = useCallback(() => {
    if (loading) return;
    setShowPublishConfirm(false);
  }, [loading]);

  return {
    isEn,
    navigate,
    wizardSteps,
    objectives,
    isAiDraftPrefill,
    showFullWizard,
    setShowFullWizard,
    isStorefrontProductLaunch,
    launchPrefillProductTitle,
    productLaunchUrl,
    prefillProductTitle,
    requestedAdAccountId,
    currentStep,
    setCurrentStep,
    loading,
    errors,
    getError,
    showPublishConfirm,
    publishAccountConfirmed,
    setPublishAccountConfirmed,
    activePublishConfirmed,
    setActivePublishConfirmed,
    createdFullAd,
    publishDialogRef,
    restorePublishFocusRef,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    selectedInterests,
    relationshipStatuses,
    selectedLanguages,
    selectedDevices,
    showAdvancedTargeting,
    setShowAdvancedTargeting,
    customAudiences,
    lookalikeAudiences,
    selectedCustomAudiences,
    selectedLookalikeAudiences,
    loadingAudiences,
    selectedEducation,
    excludedAudiences,
    setExcludedAudiences,
    adAccounts,
    savedAdAccounts,
    selectedAdAccountId,
    setSelectedAdAccountId,
    loadingAdAccounts,
    syncingAdAccount,
    facebookPages,
    facebookPagesMeta,
    facebookPixels,
    loadingPages,
    loadingPixels,
    formData,
    setFormData,
    selectedFacebookPage,
    selectedFacebookPixel,
    selectedAdAccount,
    selectedAdAccountCurrency,
    selectedAdAccountIsActive,
    selectedBusinessName,
    selectedAdAccountName,
    selectedAccountHealthLabel,
    selectedObjectiveLabel,
    selectedCreativeSummary,
    publishConfirmDisabled,
    formatSelectedAdAccountCurrency,
    selectedGeoSummary,
    selectedAttributionWindowLabel,
    selectedTargetingSignalCount,
    compatibleAttributionWindows,
    handleNext,
    handleBack,
    handleChange,
    toggleArrayValue,
    handleSearchInterests,
    addInterest,
    removeInterest,
    toggleRelationshipStatus,
    toggleLanguage,
    toggleDevice,
    loadPagesAndPixels,
    handleActivateSelectedAdAccount,
    toggleCustomAudience,
    toggleLookalikeAudience,
    handleSubmit,
    handleRequestPublishConfirmation,
    closePublishConfirmation,
    setFacebookPixels,
  };
}

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import {
  storeSettingsService,
  Branch,
  ShippingZone,
  CanonicalGovernorate,
} from "../../../services/storeSettingsService";
import {
  footerSettingsService,
  FooterSettings,
} from "../../../services/footerSettingsService";
import { EGYPT_GOVERNORATES } from "../../../constants/egyptGovernorates";
import {
  DEFAULT_SHIPPING_CLASSES,
  ShippingClassOption,
  buildDefaultClassFees,
  ensureShippingClassesForKeys,
  mergeShippingClasses,
  normalizeFeesMap,
  normalizeShippingClassKey,
} from "../../../constants/shippingClasses";
import {
  StorefrontSettings,
  storefrontSettingsService,
} from "../../../services/storefrontSettingsService";
import {
  DEFAULT_CHECKOUT_FORM_SETTINGS,
  useCheckoutFormSettings,
} from "../../../hooks/useCheckoutFormSettings";
import { useAuth } from "../../../hooks/useAuthSimple";
import {
  resolveStorefrontThemeId,
  getErrorMessage,
} from "../../../utils/storefrontSettingsHelpers";
import { checkoutFormSettingsService } from "../../../services/checkoutFormSettingsService";
import {
  DEFAULT_PDP_QUICK_ORDER_SETTINGS,
  getPdpQuickOrderSettingsFromDesignTokens,
  PdpQuickOrderSettings,
} from "../../../storefront/utils/pdpQuickOrderSettings";
import {
  GOVERNORATE_CODE_ALIASES,
  PromotionSettingsState,
  StoreSettingsTab,
  applyPdpCheckoutVisibilityToStorefrontSettings,
  applyPdpQuickOrderSettingsToStorefrontSettings,
  isExpectedOptionalLoadError,
  resolvePdpCheckoutEnabled,
  resolveRequestedTab,
} from "./types";

export function useStoreSettingsController(forcedTab?: StoreSettingsTab) {
  const { isLoading: isAuthLoading, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<StoreSettingsTab>(() =>
    forcedTab || resolveRequestedTab(searchParams.get("tab")),
  );
  const [branches, setBranches] = useState<Branch[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [canonicalGovernorates, setCanonicalGovernorates] = useState<CanonicalGovernorate[]>([]);
  const [footerSettings, setFooterSettings] = useState<Partial<FooterSettings>>({});
  const [storefrontSettings, setStorefrontSettings] = useState<StorefrontSettings>({} as StorefrontSettings);
  const [promotionSettings, setPromotionSettings] = useState<PromotionSettingsState>({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingShipping, setEditingShipping] = useState<ShippingZone | null>(null);

  // Shipping classes
  const [shippingClassMode, setShippingClassMode] = useState<"max" | "per_item">("max");
  const [shippingClassFees, setShippingClassFees] = useState<Record<string, number>>({
    ...buildDefaultClassFees(DEFAULT_SHIPPING_CLASSES),
  });
  const [shippingClasses, setShippingClasses] = useState<ShippingClassOption[]>(DEFAULT_SHIPPING_CLASSES);
  const [savingShippingClassFees, setSavingShippingClassFees] = useState(false);
  const [newShippingClassLabel, setNewShippingClassLabel] = useState("");
  const [newShippingClassKey, setNewShippingClassKey] = useState("");

  // Checkout tab processing
  const [processingCheckoutTab, setProcessingCheckoutTab] = useState(false);
  const checkoutSettingsEnabled = activeTab === "checkout" && isAuthenticated && Boolean(user?.companyId);

  const {
    settings: checkoutFormSettings,
    loading: checkoutFormSettingsLoading,
    saving: checkoutFormSettingsSaving,
    applySettings: applyCheckoutFormSettings,
    handleSave: handleSaveCheckoutFormSettings,
    loadSettings: reloadCheckoutFormSettings,
  } = useCheckoutFormSettings({
    enabled: checkoutSettingsEnabled,
  });

  // Branch form state
  const [branchForm, setBranchForm] = useState<Partial<Branch>>({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    workingHours: "",
    isActive: true,
  });

  // Shipping form state
  const [shippingForm, setShippingForm] = useState<Partial<ShippingZone>>({
    name: "",
    governorateIds: [],
    governorates: [],
    pricingType: "flat",
    price: 0,
    deliveryTime: "",
    deliveryTimeType: "1-2",
    isActive: true,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        branchesRes,
        zonesRes,
        canonicalGovernoratesRes,
        storefrontRes,
        settingsRes,
      ] = await Promise.allSettled([
        storeSettingsService.getBranches(),
        storeSettingsService.getShippingZones(),
        storeSettingsService.getCanonicalGovernorates(),
        storefrontSettingsService.getSettings(undefined, {
          allowFallback: false,
        }),
        apiClient.get("/settings/company"),
      ]);

      if (branchesRes.status === "fulfilled") {
        setBranches(branchesRes.value.data.data || []);
      }

      if (zonesRes.status === "fulfilled") {
        setShippingZones(zonesRes.value.data.data || []);
      }

      if (canonicalGovernoratesRes.status === "fulfilled") {
        setCanonicalGovernorates(canonicalGovernoratesRes.value.data.data || []);
      }

      if (storefrontRes.status === "fulfilled") {
        const nextStorefrontSettings = (storefrontRes.value.data || {}) as StorefrontSettings;
        setStorefrontSettings(nextStorefrontSettings);
      }

      const companySettings =
        settingsRes.status === "fulfilled"
          ? settingsRes.value?.data?.data?.settings || {}
          : {};
      const feesFromSettings = normalizeFeesMap(
        companySettings.shippingClassFees || companySettings.classFees || {},
      );
      const modeFromSettings =
        companySettings.shippingClassMode || companySettings.classMode || "max";
      const storedClasses =
        companySettings.shippingClasses ||
        companySettings.shippingClassOptions ||
        companySettings.classOptions ||
        [];
      let mergedClasses = mergeShippingClasses(storedClasses);
      mergedClasses = ensureShippingClassesForKeys(
        mergedClasses,
        Object.keys(feesFromSettings),
      );
      setShippingClasses(mergedClasses);

      const baseFees = buildDefaultClassFees(mergedClasses);
      setShippingClassFees({ ...baseFees, ...feesFromSettings });
      setShippingClassMode(modeFromSettings === "per_item" ? "per_item" : "max");

      const hasBlockingFailures = [
        branchesRes,
        zonesRes,
        canonicalGovernoratesRes,
        storefrontRes,
        settingsRes,
      ].some((result) => result.status === "rejected");

      if (hasBlockingFailures) {
        toast.error(t("storeSettings.dataLoadedPartial"));
      }
    } catch (error) {
      toast.error(t("storeSettings.failedToLoadData"));
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadOptionalTabData = useCallback(
    async (tab: StoreSettingsTab) => {
      if (tab === "footer") {
        try {
          const footerRes = await footerSettingsService.getSettings({
            _skipErrorToast: true,
          });
          setFooterSettings(footerRes.data.data || {});
        } catch (error) {
          if (!isExpectedOptionalLoadError(error)) {
            console.error("Error loading footer settings:", error);
          }
        }
        return;
      }

      if (tab === "promotion" || tab === "shipping") {
        try {
          const promotionRes = await apiClient.get("/promotion-settings", {
            _skipErrorToast: true,
          });
          setPromotionSettings(promotionRes.data.data || {});
        } catch (error) {
          if (!isExpectedOptionalLoadError(error)) {
            console.error("Error loading promotion settings:", error);
          }
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated || !user?.companyId) {
      setLoading(false);
      return;
    }

    loadData();
  }, [isAuthLoading, isAuthenticated, user?.companyId, loadData]);

  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
      return;
    }

    if (searchParams.get("tab")) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", "branches");
    setSearchParams(nextSearchParams, { replace: true });
  }, [forcedTab, searchParams, setSearchParams]);

  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
      return;
    }

    const requestedTab = resolveRequestedTab(searchParams.get("tab"));
    if (requestedTab === "storefront") {
      navigate("/settings/storefront/editor", { replace: true });
      return;
    }
    setActiveTab((currentTab) =>
      currentTab === requestedTab ? currentTab : requestedTab,
    );
  }, [forcedTab, navigate, searchParams]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void loadOptionalTabData(activeTab);
  }, [activeTab, isAuthLoading, isAuthenticated, user?.companyId, loadOptionalTabData]);

  const handleTabChange = (nextTab: StoreSettingsTab) => {
    if (forcedTab) {
      return;
    }

    setActiveTab(nextTab);
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", nextTab);
    setSearchParams(nextSearchParams, { replace: true });
  };

  // Branch operations
  const handleAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      workingHours: "",
      isActive: true,
    });
    setShowBranchModal(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm(branch);
    setShowBranchModal(true);
  };

  const handleSaveBranch = async () => {
    try {
      if (!branchForm.name || !branchForm.phone) {
        toast.error(t("storeSettings.requiredFieldsMissing"));
        return;
      }

      if (editingBranch) {
        await storeSettingsService.updateBranch(editingBranch.id, branchForm);
        toast.success(t("storeSettings.branchUpdated"));
      } else {
        await storeSettingsService.createBranch(branchForm);
        toast.success(t("storeSettings.branchAdded"));
      }

      setShowBranchModal(false);
      loadData();
    } catch (error) {
      toast.error(t("storeSettings.branchSaveFailed"));
      console.error("Error saving branch:", error);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm(t("storeSettings.deleteBranchConfirm"))) return;

    try {
      await storeSettingsService.deleteBranch(id);
      toast.success(t("storeSettings.branchDeleted"));
      loadData();
    } catch (error) {
      toast.error(t("storeSettings.branchDeleteFailed"));
      console.error("Error deleting branch:", error);
    }
  };

  // Shipping operations
  const normalizeGovernorateCode = useCallback((value: string) => {
    const raw = String(value || "").trim();
    return GOVERNORATE_CODE_ALIASES[raw] || raw;
  }, []);

  const resolveZoneGovernorateIds = useCallback(
    (zone: ShippingZone): string[] => {
      const ids = new Set<string>();
      const governorateNameToId = new Map(
        EGYPT_GOVERNORATES.map((gov) => [gov.nameAr, gov.id]),
      );

      (zone.governorateIds || []).forEach((id) => {
        const normalizedId = normalizeGovernorateCode(id);
        if (normalizedId) ids.add(normalizedId);
      });

      (zone.canonicalGovernorates || []).forEach((gov) => {
        const normalizedCode = normalizeGovernorateCode(gov?.code || "");
        if (normalizedCode) ids.add(normalizedCode);
      });

      const zoneGovernorates = Array.isArray(zone.governorates)
        ? zone.governorates
        : [];

      zoneGovernorates.forEach((name) => {
        const normalized = String(name || "").trim();
        if (!normalized) return;

        const directUiId = governorateNameToId.get(normalized);
        if (directUiId) {
          ids.add(directUiId);
        }

        const canonical = canonicalGovernorates.find((gov) => {
          const normalizedCode = normalizeGovernorateCode(gov.code);
          if (
            gov.nameAr === normalized ||
            gov.nameEn === normalized ||
            normalizedCode === normalized ||
            gov.code === normalized
          ) {
            return true;
          }

          return (gov.aliases || []).some((alias) => alias.alias === normalized);
        });

        if (canonical?.code) {
          ids.add(normalizeGovernorateCode(canonical.code));
        }
      });

      return [...ids];
    },
    [canonicalGovernorates, normalizeGovernorateCode],
  );

  const handleAddShipping = () => {
    setEditingShipping(null);
    setShippingForm({
      name: "",
      governorateIds: [],
      governorates: [],
      pricingType: "flat",
      price: 0,
      deliveryTime: "1-2 يوم",
      deliveryTimeType: "1-2",
      isActive: true,
    });
    setShowShippingModal(true);
  };

  const handleEditShipping = (zone: ShippingZone) => {
    setEditingShipping(zone);
    setShippingForm({
      ...zone,
      governorateIds: resolveZoneGovernorateIds(zone),
      pricingType: zone.pricingType || "flat",
      deliveryTimeType: zone.deliveryTimeType || "custom",
    });
    setShowShippingModal(true);
  };

  const handleSaveShipping = async () => {
    try {
      if (!shippingForm.governorateIds?.length || !shippingForm.deliveryTime) {
        toast.error(t("storeSettings.shippingRequiredFields"));
        return;
      }

      if (
        shippingForm.pricingType === "flat" &&
        (!shippingForm.price || shippingForm.price <= 0)
      ) {
        toast.error(t("storeSettings.enterValidPrice"));
        return;
      }

      if (
        shippingForm.pricingType === "tiered" &&
        (!shippingForm.pricingTiers?.length ||
          shippingForm.pricingTiers.some((pt) => !pt.price || pt.price <= 0))
      ) {
        toast.error(t("storeSettings.enterValidTieredPrices"));
        return;
      }

      const governorateNames = shippingForm.governorateIds
        ?.map((id) => {
          const canonical = canonicalGovernorates.find((g) => g.code === id);
          if (canonical?.nameAr) return canonical.nameAr;
          const gov = EGYPT_GOVERNORATES.find((g) => g.id === id);
          return gov?.nameAr;
        })
        .filter(Boolean) as string[];

      const fallbackVariations: string[] = [];
      governorateNames.forEach((name) => {
        const variations = storeSettingsService.generateGovernorateVariations(name);
        fallbackVariations.push(...variations);
      });

      const dataToSave = {
        ...shippingForm,
        governorates: governorateNames.length > 0 ? governorateNames : fallbackVariations,
      };

      if (editingShipping) {
        await storeSettingsService.updateShippingZone(editingShipping.id, dataToSave);
        toast.success(t("storeSettings.shippingUpdated"));
      } else {
        await storeSettingsService.createShippingZone(dataToSave);
        toast.success(t("storeSettings.shippingAdded"));
      }

      setShowShippingModal(false);
      loadData();
    } catch (error) {
      toast.error(t("storeSettings.shippingSaveFailed"));
      console.error("Error saving shipping zone:", error);
    }
  };

  const handleDeleteShipping = async (id: string) => {
    if (!confirm(t("storeSettings.deleteShippingConfirm"))) return;

    try {
      await storeSettingsService.deleteShippingZone(id);
      toast.success(t("storeSettings.shippingDeleted"));
      loadData();
    } catch (error) {
      toast.error(t("storeSettings.shippingDeleteFailed"));
      console.error("Error deleting shipping zone:", error);
    }
  };

  const handleUpdatePromotionSettings = async (data: PromotionSettingsState) => {
    try {
      setLoading(true);
      await apiClient.post("/promotion-settings", data);
      setPromotionSettings(data);
      toast.success(t("storeSettings.promotionUpdated"));
    } catch (error) {
      toast.error(t("storeSettings.promotionUpdateFailed"));
      console.error("Error updating promotion settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShippingClass = async () => {
    const rawLabel = newShippingClassLabel.trim();
    const rawKey = newShippingClassKey.trim() || rawLabel;
    if (!rawLabel && !rawKey) {
      toast.error(t("storeSettings.shippingClassNameRequired"));
      return;
    }

    const normalizedKey = normalizeShippingClassKey(rawKey) || `class-${Date.now()}`;
    const exists = shippingClasses.some(
      (option) => normalizeShippingClassKey(option.key) === normalizedKey,
    );
    if (exists) {
      toast.error(t("storeSettings.shippingClassExists"));
      return;
    }

    const nextLabel = rawLabel || normalizedKey;
    const newClass = { key: normalizedKey, label: nextLabel };

    const prevClasses = [...shippingClasses];
    const prevFees = { ...shippingClassFees };

    const nextClasses = [...shippingClasses, newClass];
    const nextFees = {
      ...shippingClassFees,
      [normalizedKey]: shippingClassFees[normalizedKey] ?? 0,
    };

    setShippingClasses(nextClasses);
    setShippingClassFees(nextFees);
    setNewShippingClassLabel("");
    setNewShippingClassKey("");

    try {
      const classesToSave = nextClasses.length > 0 ? nextClasses : DEFAULT_SHIPPING_CLASSES;
      const normalizedClasses = classesToSave
        .map((option) => ({
          key: normalizeShippingClassKey(option.key),
          label: option.label?.trim() || option.key,
        }))
        .filter((option) => option.key);
      const normalizedFees = normalizeFeesMap(nextFees);
      const baseFees = buildDefaultClassFees(normalizedClasses);
      const mergedFees = { ...baseFees, ...normalizedFees };
      normalizedClasses.forEach((option) => {
        if (mergedFees[option.key] === undefined) {
          mergedFees[option.key] = 0;
        }
      });

      await apiClient.put("/settings/company", {
        settings: {
          shippingClassFees: mergedFees,
          shippingClassMode,
          shippingClasses: normalizedClasses,
        },
      });

      toast.success(t("storeSettings.classAdded"));
    } catch (error) {
      setShippingClasses(prevClasses);
      setShippingClassFees(prevFees);
      setNewShippingClassLabel(rawLabel);
      setNewShippingClassKey(rawKey !== rawLabel ? rawKey : "");

      toast.error(t("storeSettings.classSaveFailed"));
      console.error("Error saving shipping class:", error);
    }
  };

  const handleUpdateShippingClassLabel = (key: string, label: string) => {
    setShippingClasses((prev) =>
      prev.map((option) =>
        normalizeShippingClassKey(option.key) === normalizeShippingClassKey(key)
          ? { ...option, label }
          : option,
      ),
    );
  };

  const handleRemoveShippingClass = (key: string) => {
    const defaultKeys = new Set(
      DEFAULT_SHIPPING_CLASSES.map((option) => normalizeShippingClassKey(option.key)),
    );
    const normalizedKey = normalizeShippingClassKey(key);
    if (defaultKeys.has(normalizedKey)) {
      toast.error(t("storeSettings.defaultClassesNotDeletable"));
      return;
    }

    setShippingClasses((prev) =>
      prev.filter((option) => normalizeShippingClassKey(option.key) !== normalizedKey),
    );
    setShippingClassFees((prev) => {
      const next = { ...prev };
      delete next[normalizedKey];
      return next;
    });
  };

  const handleSaveShippingClassFees = async () => {
    try {
      setSavingShippingClassFees(true);
      const classesToSave =
        shippingClasses.length > 0 ? shippingClasses : DEFAULT_SHIPPING_CLASSES;
      const normalizedClasses = classesToSave
        .map((option) => ({
          key: normalizeShippingClassKey(option.key),
          label: option.label?.trim() || option.key,
        }))
        .filter((option) => option.key);
      const normalizedFees = normalizeFeesMap(shippingClassFees);
      const baseFees = buildDefaultClassFees(normalizedClasses);
      const mergedFees = { ...baseFees, ...normalizedFees };
      normalizedClasses.forEach((option) => {
        if (mergedFees[option.key] === undefined) {
          mergedFees[option.key] = 0;
        }
      });
      await apiClient.put("/settings/company", {
        settings: {
          shippingClassFees: mergedFees,
          shippingClassMode,
          shippingClasses: normalizedClasses,
        },
      });
      setShippingClassFees(mergedFees);
      setShippingClasses(normalizedClasses);
      toast.success(t("storeSettings.classFeesSaved"));
    } catch (error) {
      toast.error(t("storeSettings.classFeesSaveFailed"));
      console.error("Error saving shipping class fees:", error);
    } finally {
      setSavingShippingClassFees(false);
    }
  };

  // Footer operations
  const handleSaveFooter = async () => {
    try {
      setLoading(true);
      await footerSettingsService.updateSettings(footerSettings);
      const storefrontResponse = await storefrontSettingsService.updateSettings({
        themeId: resolveStorefrontThemeId(storefrontSettings),
        designTokens: storefrontSettings.designTokens || {},
      });
      setStorefrontSettings(storefrontResponse.data);
      toast.success(t("storeSettings.footerSaved"));
      loadData();
    } catch (error) {
      toast.error(t("storeSettings.footerSaveFailed"));
      console.error("Error saving footer settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFooter = async () => {
    if (!confirm(t("storeSettings.resetFooterConfirm"))) return;

    try {
      setLoading(true);
      await footerSettingsService.resetSettings();
      toast.success(t("storeSettings.footerReset"));
      loadData();
    } catch (error) {
      toast.error(t("storeSettings.footerResetFailed"));
      console.error("Error resetting footer settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Checkout tab operations
  const handleToggleProductPageCheckout = (enabled: boolean) => {
    setStorefrontSettings((current) =>
      applyPdpCheckoutVisibilityToStorefrontSettings(current, enabled),
    );
  };

  const handleChangePdpQuickOrderSettings = (
    nextPdpQuickOrderSettings: PdpQuickOrderSettings,
  ) => {
    setStorefrontSettings((current) =>
      applyPdpQuickOrderSettingsToStorefrontSettings(
        current,
        nextPdpQuickOrderSettings,
      ),
    );
  };

  const handleSaveCheckoutTabSettings = async () => {
    const checkoutFieldsSaved = await handleSaveCheckoutFormSettings(undefined, {
      silent: true,
    });

    if (!checkoutFieldsSaved) {
      toast.error(t("storeSettings.checkoutSaveFailed"));
      return false;
    }

    try {
      setProcessingCheckoutTab(true);
      const nextStorefrontDraft = applyPdpQuickOrderSettingsToStorefrontSettings(
        applyPdpCheckoutVisibilityToStorefrontSettings(
          storefrontSettings,
          resolvePdpCheckoutEnabled(storefrontSettings),
        ),
        getPdpQuickOrderSettingsFromDesignTokens(storefrontSettings.designTokens),
      );
      const storefrontResponse = await storefrontSettingsService.updateSettings({
        themeId: resolveStorefrontThemeId(nextStorefrontDraft),
        productPageShowCheckoutForm: nextStorefrontDraft.productPageShowCheckoutForm,
        designTokens: nextStorefrontDraft.designTokens || {},
      });

      setStorefrontSettings(storefrontResponse.data);
      toast.success(t("storeSettings.checkoutSaved"));
      return true;
    } catch (error) {
      console.error("Error saving product page checkout settings:", error);
      toast.error(getErrorMessage(error, t("storeSettings.checkoutPartialSave")));
      return false;
    } finally {
      setProcessingCheckoutTab(false);
    }
  };

  const handleResetCheckoutTabSettings = async () => {
    if (!window.confirm(t("storeSettings.resetCheckoutConfirm"))) {
      return;
    }

    try {
      setProcessingCheckoutTab(true);
      await checkoutFormSettingsService.resetSettings();
      await reloadCheckoutFormSettings();

      const nextStorefrontDraft = applyPdpQuickOrderSettingsToStorefrontSettings(
        applyPdpCheckoutVisibilityToStorefrontSettings(storefrontSettings, true),
        DEFAULT_PDP_QUICK_ORDER_SETTINGS,
      );
      const storefrontResponse = await storefrontSettingsService.updateSettings({
        themeId: resolveStorefrontThemeId(nextStorefrontDraft),
        productPageShowCheckoutForm: true,
        designTokens: nextStorefrontDraft.designTokens || {},
      });

      setStorefrontSettings(storefrontResponse.data);
      toast.success(t("storeSettings.checkoutReset"));
    } catch (error) {
      console.error("Error resetting checkout tab settings:", error);
      toast.error(getErrorMessage(error, t("storeSettings.checkoutResetFailed")));
    } finally {
      setProcessingCheckoutTab(false);
    }
  };

  const handleToggleWishlist = async (enabled: boolean) => {
    try {
      const updated = {
        ...storefrontSettings,
        wishlistEnabled: enabled,
      };
      setStorefrontSettings(updated);
      await storefrontSettingsService.updateSettings({
        wishlistEnabled: enabled,
      });
      toast.success(
        enabled
          ? t("storeSettings.wishlistEnabledSuccess", "تم تفعيل زر المفضلة")
          : t("storeSettings.wishlistDisabledSuccess", "تم إيقاف زر المفضلة"),
      );
    } catch (error) {
      toast.error(t("storeSettings.saveFailed", "تعذر حفظ التغيير"));
    }
  };

  const handleToggleComparison = async (enabled: boolean) => {
    try {
      const updated = {
        ...storefrontSettings,
        comparisonEnabled: enabled,
      };
      setStorefrontSettings(updated);
      await storefrontSettingsService.updateSettings({
        comparisonEnabled: enabled,
      });
      toast.success(
        enabled
          ? t("storeSettings.comparisonEnabledSuccess", "تم تفعيل زر المقارنة")
          : t("storeSettings.comparisonDisabledSuccess", "تم إيقاف زر المقارنة"),
      );
    } catch (error) {
      toast.error(t("storeSettings.saveFailed", "تعذر حفظ التغيير"));
    }
  };

  const handleChangeStorefrontSocialLinks = (socialLinks: Record<string, string>) => {
    setStorefrontSettings((current) => ({
      ...current,
      designTokens: {
        ...(current.designTokens || {}),
        socialLinks,
      },
    }));
  };

  return {
    t,
    navigate,
    activeTab,
    handleTabChange,
    branches,
    shippingZones,
    canonicalGovernorates,
    footerSettings,
    setFooterSettings,
    storefrontSettings,
    setStorefrontSettings,
    promotionSettings,
    loading,
    showBranchModal,
    setShowBranchModal,
    showShippingModal,
    setShowShippingModal,
    editingBranch,
    editingShipping,
    shippingClassMode,
    setShippingClassMode,
    shippingClassFees,
    setShippingClassFees,
    shippingClasses,
    savingShippingClassFees,
    newShippingClassLabel,
    setNewShippingClassLabel,
    newShippingClassKey,
    setNewShippingClassKey,
    branchForm,
    setBranchForm,
    shippingForm,
    setShippingForm,
    checkoutFormSettings: checkoutFormSettings || DEFAULT_CHECKOUT_FORM_SETTINGS,
    checkoutFormSettingsLoading,
    checkoutFormSettingsSaving,
    processingCheckoutTab,
    applyCheckoutFormSettings,
    handleAddBranch,
    handleEditBranch,
    handleSaveBranch,
    handleDeleteBranch,
    handleAddShipping,
    handleEditShipping,
    handleSaveShipping,
    handleDeleteShipping,
    handleUpdatePromotionSettings,
    handleAddShippingClass,
    handleUpdateShippingClassLabel,
    handleRemoveShippingClass,
    handleSaveShippingClassFees,
    handleSaveFooter,
    handleResetFooter,
    handleToggleProductPageCheckout,
    handleChangePdpQuickOrderSettings,
    handleSaveCheckoutTabSettings,
    handleResetCheckoutTabSettings,
    handleToggleWishlist,
    handleToggleComparison,
    handleChangeStorefrontSocialLinks,
  };
}

export type StoreSettingsController = ReturnType<typeof useStoreSettingsController>;

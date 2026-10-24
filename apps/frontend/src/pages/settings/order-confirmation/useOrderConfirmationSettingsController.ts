import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import orderConfirmationService, {
  type OrderConfirmationSettings as OrderConfirmationSettingsType,
  type OrderConfirmationProduct,
  type OrderConfirmationUser,
} from "../../../services/orderConfirmationService";
import { EGYPT_GOVERNORATES } from "../../../constants/egyptGovernorates";
import type { MultiRuleEntry, ValueRuleEntry, MultiSelectOption } from "./types";
import {
  formatUserLabel,
  formatRoleLabel,
  formatAvailabilityLabel,
} from "./types";

export function useOrderConfirmationSettingsController() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<OrderConfirmationSettingsType | null>(null);
  const [eligibleUsers, setEligibleUsers] = useState<OrderConfirmationUser[]>([]);
  const [products, setProducts] = useState<OrderConfirmationProduct[]>([]);
  const [eligibleUserSearch, setEligibleUserSearch] = useState("");
  const [regionRules, setRegionRules] = useState<MultiRuleEntry[]>([]);
  const [productRules, setProductRules] = useState<MultiRuleEntry[]>([]);
  const [orderValueRules, setOrderValueRules] = useState<ValueRuleEntry[]>([]);

  const toRuleEntries = (rules: Record<string, string[]>): MultiRuleEntry[] =>
    Object.entries(rules || {}).map(([key, userIds]) => ({
      keys: [key],
      userIds: Array.isArray(userIds) ? userIds : [],
    }));

  const toValueRuleEntries = (rules: OrderConfirmationSettingsType["orderValueRules"] = []): ValueRuleEntry[] =>
    (Array.isArray(rules) ? rules : []).map((rule) => ({
      minTotal: rule.minTotal === null || rule.minTotal === undefined ? "" : String(rule.minTotal),
      maxTotal: rule.maxTotal === null || rule.maxTotal === undefined ? "" : String(rule.maxTotal),
      userIds: Array.isArray(rule.userIds) ? rule.userIds : [],
    }));

  const buildRulesPayload = (rules: MultiRuleEntry[]) =>
    rules.reduce<Record<string, string[]>>((acc, rule) => {
      const ids = Array.from(new Set(rule.userIds.filter(Boolean)));
      if (!ids.length) return acc;
      Array.from(new Set(rule.keys.map((key) => key.trim()).filter(Boolean))).forEach((key) => {
        acc[key] = ids;
      });
      return acc;
    }, {});

  const buildValueRulesPayload = (rules: ValueRuleEntry[]) =>
    rules
      .map((rule) => {
        const minTotal = rule.minTotal.trim() === "" ? null : Number(rule.minTotal);
        const maxTotal = rule.maxTotal.trim() === "" ? null : Number(rule.maxTotal);
        return {
          minTotal: Number.isFinite(minTotal) ? minTotal : null,
          maxTotal: Number.isFinite(maxTotal) ? maxTotal : null,
          userIds: Array.from(new Set(rule.userIds.filter(Boolean))),
        };
      })
      .filter((rule) => rule.userIds.length && (rule.minTotal !== null || rule.maxTotal !== null));

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await orderConfirmationService.getSettings();
      setSettings(res.data);
      setRegionRules(toRuleEntries(res.data.regionRules || {}));
      setProductRules(toRuleEntries(res.data.specialtyRules || {}));
      setOrderValueRules(toValueRuleEntries(res.data.orderValueRules || []));
    } catch (error: any) {
      toast.error(error?.message || "تعذر تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleUsers = async () => {
    try {
      const res = await orderConfirmationService.getEligibleUsers({ includeAll: true });
      setEligibleUsers(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || "تعذر تحميل مستخدمي التوزيع");
    }
  };

  const loadProducts = async () => {
    try {
      const res = await orderConfirmationService.getProducts({ limit: 200, sortBy: "name", sortOrder: "asc" });
      setProducts(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || "تعذر تحميل المنتجات لقواعد التخصيص");
    }
  };

  useEffect(() => {
    loadSettings();
    loadEligibleUsers();
    loadProducts();
  }, []);

  const toggleArrayValue = (key: keyof OrderConfirmationSettingsType, value: string) => {
    if (!settings) return;
    const list = new Set(settings[key] as string[]);
    if (list.has(value)) list.delete(value);
    else list.add(value);
    setSettings({ ...settings, [key]: Array.from(list) } as OrderConfirmationSettingsType);
  };

  const applyEligibleUserIds = (userIds: string[]) => {
    if (!settings) return;
    const nextUserIds = Array.from(new Set(userIds));
    setSettings({ ...settings, eligibleUserIds: nextUserIds });

    if (!nextUserIds.length) return;

    const allowedIds = new Set(nextUserIds);
    setRegionRules((prev) =>
      prev.map((rule) => ({ ...rule, userIds: rule.userIds.filter((id) => allowedIds.has(id)) }))
    );
    setProductRules((prev) =>
      prev.map((rule) => ({ ...rule, userIds: rule.userIds.filter((id) => allowedIds.has(id)) }))
    );
    setOrderValueRules((prev) =>
      prev.map((rule) => ({ ...rule, userIds: rule.userIds.filter((id) => allowedIds.has(id)) }))
    );
  };

  const toggleEligibleUser = (userId: string) => {
    if (!settings) return;
    const nextIds = new Set(settings.eligibleUserIds || []);
    if (!nextIds.size) {
      applyEligibleUserIds(eligibleUsers.map((user) => user.id).filter((id) => id !== userId));
      return;
    }

    if (nextIds.has(userId)) {
      nextIds.delete(userId);
    } else {
      nextIds.add(userId);
    }

    applyEligibleUserIds(Array.from(nextIds));
  };

  const selectFilteredEligibleUsers = () => {
    const filteredIds = filteredEligibleUsers.map((user) => user.id);
    applyEligibleUserIds(Array.from(new Set([...(settings?.eligibleUserIds || []), ...filteredIds])));
  };

  const allowAllEligibleUsers = () => {
    applyEligibleUserIds([]);
  };

  const removeHiddenEligibleUsers = () => {
    const visibleIds = new Set(eligibleUsers.map((user) => user.id));
    applyEligibleUserIds((settings?.eligibleUserIds || []).filter((id) => visibleIds.has(id)));
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const payload: Partial<OrderConfirmationSettingsType> = {
        ...settings,
        regionRules: buildRulesPayload(regionRules),
        specialtyRules: buildRulesPayload(productRules),
        orderValueRules: buildValueRulesPayload(orderValueRules),
      };
      const res = await orderConfirmationService.updateSettings(payload);
      setSettings(res.data);
      await loadEligibleUsers();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("order-confirmation-settings-updated", { detail: res.data }));
        try {
          window.localStorage.setItem("order-confirmation-settings-updated-at", Date.now().toString());
        } catch {}
      }
      tToast.success("OrderConfirmationSettings.success_save_8804");
    } catch (error: any) {
      toast.error(error?.message || "فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const updateRegionRule = (index: number, patch: Partial<MultiRuleEntry>) => {
    setRegionRules((prev) => prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  };

  const removeRegionRule = (index: number) => {
    setRegionRules((prev) => prev.filter((_, i) => i !== index));
  };

  const addRegionRule = () => {
    setRegionRules((prev) => [...prev, { keys: [], userIds: [] }]);
  };

  const updateProductRule = (index: number, patch: Partial<MultiRuleEntry>) => {
    setProductRules((prev) => prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  };

  const removeProductRule = (index: number) => {
    setProductRules((prev) => prev.filter((_, i) => i !== index));
  };

  const addProductRule = () => {
    setProductRules((prev) => [...prev, { keys: [], userIds: [] }]);
  };

  const updateValueRule = (index: number, patch: Partial<ValueRuleEntry>) => {
    setOrderValueRules((prev) => prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  };

  const removeValueRule = (index: number) => {
    setOrderValueRules((prev) => prev.filter((_, i) => i !== index));
  };

  const addValueRule = () => {
    setOrderValueRules((prev) => [...prev, { minTotal: "", maxTotal: "", userIds: [] }]);
  };

  // Computed states
  const selectedEligibleIds = useMemo(
    () => new Set(settings?.eligibleUserIds || []),
    [settings?.eligibleUserIds]
  );
  const visibleEligibleIds = useMemo(
    () => new Set(eligibleUsers.map((user) => user.id)),
    [eligibleUsers]
  );
  const hiddenEligibleUserIds = useMemo(
    () => (settings?.eligibleUserIds || []).filter((id) => !visibleEligibleIds.has(id)),
    [settings?.eligibleUserIds, visibleEligibleIds]
  );
  const selectedDistributionUsers = useMemo(
    () => eligibleUsers.filter((user) => selectedEligibleIds.has(user.id)),
    [eligibleUsers, selectedEligibleIds]
  );
  const isRestrictedToSpecificUsers = (settings?.eligibleUserIds.length || 0) > 0;
  const ruleUserOptions = isRestrictedToSpecificUsers ? selectedDistributionUsers : eligibleUsers;

  const searchTerm = eligibleUserSearch.trim().toLowerCase();
  const filteredEligibleUsers = useMemo(() => {
    if (!searchTerm) return eligibleUsers;
    return eligibleUsers.filter((user) =>
      [
        formatUserLabel(user),
        user.email || "",
        formatRoleLabel(user.role),
        formatAvailabilityLabel(user.availability),
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm)
    );
  }, [eligibleUsers, searchTerm]);

  const visuallyIncludedUserIds = useMemo(
    () =>
      new Set(
        isRestrictedToSpecificUsers ? settings?.eligibleUserIds : eligibleUsers.map((user) => user.id)
      ),
    [isRestrictedToSpecificUsers, settings?.eligibleUserIds, eligibleUsers]
  );

  const userOptions: MultiSelectOption[] = useMemo(
    () =>
      ruleUserOptions.map((user) => ({
        value: user.id,
        label: formatUserLabel(user),
        description: `${formatRoleLabel(user.role)} • ${formatAvailabilityLabel(user.availability)}`,
      })),
    [ruleUserOptions]
  );

  const baseRegionOptions: MultiSelectOption[] = useMemo(
    () =>
      EGYPT_GOVERNORATES.map((gov) => ({
        value: gov.nameAr,
        label: gov.nameAr,
        description: gov.regionNameAr,
      })),
    []
  );

  const regionOptions = useMemo(() => {
    const customKeys = regionRules
      .flatMap((rule) => rule.keys)
      .filter((key) => key && !baseRegionOptions.some((opt) => opt.value === key));
    return [
      ...baseRegionOptions,
      ...Array.from(new Set(customKeys)).map((key) => ({
        value: key,
        label: key,
        description: "قيمة محفوظة",
      })),
    ];
  }, [baseRegionOptions, regionRules]);

  const baseProductOptions: MultiSelectOption[] = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: product.name,
        description: product.sku ? `SKU: ${product.sku}` : undefined,
      })),
    [products]
  );

  const productOptions = useMemo(() => {
    const customKeys = productRules
      .flatMap((rule) => rule.keys)
      .filter((key) => key && !baseProductOptions.some((opt) => opt.value === key));
    return [
      ...baseProductOptions,
      ...Array.from(new Set(customKeys)).map((key) => ({
        value: key,
        label: key,
        description: "قيمة محفوظة أو كود منتج",
      })),
    ];
  }, [baseProductOptions, productRules]);

  return {
    loading,
    saving,
    settings,
    setSettings,
    eligibleUsers,
    products,
    eligibleUserSearch,
    setEligibleUserSearch,
    regionRules,
    productRules,
    orderValueRules,
    toggleArrayValue,
    toggleEligibleUser,
    selectFilteredEligibleUsers,
    allowAllEligibleUsers,
    removeHiddenEligibleUsers,
    handleSave,
    updateRegionRule,
    removeRegionRule,
    addRegionRule,
    updateProductRule,
    removeProductRule,
    addProductRule,
    updateValueRule,
    removeValueRule,
    addValueRule,
    selectedEligibleIds,
    hiddenEligibleUserIds,
    selectedDistributionUsers,
    isRestrictedToSpecificUsers,
    filteredEligibleUsers,
    visuallyIncludedUserIds,
    userOptions,
    regionOptions,
    productOptions,
  };
}
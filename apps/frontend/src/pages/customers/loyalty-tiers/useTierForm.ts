import { useState } from "react";
import { apiClient } from "../../../services/apiClient";
import { type CustomerLoyaltyTier, type LoyaltyProgram } from "./types";

interface UseTierFormParams {
  programs: LoyaltyProgram[];
  fetchTiers: () => Promise<void>;
}

export function useTierForm({ programs, fetchTiers }: UseTierFormParams) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Partial<CustomerLoyaltyTier> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Preset modal state
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetProgramId, setPresetProgramId] = useState("");
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(null);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);

  const handleOpenModal = (tier: CustomerLoyaltyTier | null = null) => {
    if (tier) {
      setEditingTier({
        ...tier,
        discountPercent: tier.discountPercent ?? 0,
        freeShipping: Boolean(tier.freeShipping),
        targetGovernorates: Array.isArray(tier.targetGovernorates)
          ? [...tier.targetGovernorates]
          : [],
        conditions: tier.conditions
          ? { ...tier.conditions }
          : { minOrders: undefined, minSpent: undefined },
      });
    } else {
      setEditingTier({
        name: "",
        nameAr: "",
        minPoints: 0,
        maxPoints: 0,
        discountPercent: 0,
        freeShipping: false,
        benefits: [],
        targetGovernorates: [],
        conditions: { minOrders: undefined, minSpent: undefined },
        color: "#6366f1",
        icon: "crown",
        programId: programs.length > 0 ? programs[0].id : "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;
    try {
      setIsSaving(true);
      const discount = Math.max(
        0,
        Math.min(100, Number(editingTier.discountPercent || 0))
      );
      const freeShip = Boolean(editingTier.freeShipping);
      const hasConditions =
        editingTier.conditions &&
        (editingTier.conditions.minOrders || editingTier.conditions.minSpent);

      const benefitsObj: any = {
        discountPercent: discount,
        freeShipping: freeShip,
      };

      const payload: any = {
        ...editingTier,
        discountPercent: discount,
        freeShipping: freeShip,
        benefits: benefitsObj,
        targetGovernorates: Array.isArray(editingTier.targetGovernorates)
          ? editingTier.targetGovernorates
          : [],
        conditions: hasConditions
          ? {
              minOrders: editingTier.conditions?.minOrders
                ? Number(editingTier.conditions.minOrders)
                : undefined,
              minSpent: editingTier.conditions?.minSpent
                ? Number(editingTier.conditions.minSpent)
                : undefined,
            }
          : null,
      };

      if (editingTier.maxPoints === 0 || !editingTier.maxPoints) {
        delete payload.maxPoints;
      }

      if (editingTier.id) {
        await apiClient.put(
          `/hr/customer-loyalty/tiers/${editingTier.id}`,
          payload
        );
      } else {
        await apiClient.post("/hr/customer-loyalty/tiers", payload);
      }
      setIsModalOpen(false);
      await fetchTiers();
    } catch (error: any) {
      console.error("Error saving tier:", error);
      alert(error.response?.data?.error || "حدث خطأ أثناء حفظ المستوى");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetProgramId || !selectedPresetKey) return;
    try {
      setIsApplyingPreset(true);
      const res = await apiClient.post<{ message?: string }>(
        "/hr/customer-loyalty/tiers/preset",
        {
          programId: presetProgramId,
          presetKey: selectedPresetKey,
        }
      );
      alert(res.data?.message || "تم إنشاء المستويات بنجاح");
      setIsPresetModalOpen(false);
      setPresetProgramId("");
      setSelectedPresetKey(null);
      await fetchTiers();
    } catch (error) {
      console.error("Error applying preset:", error);
      const err = error as { response?: { data?: { error?: string } } };
      alert(err?.response?.data?.error || "حدث خطأ أثناء إنشاء المستويات");
    } finally {
      setIsApplyingPreset(false);
    }
  };

  const openPresetModal = () => {
    setPresetProgramId(programs.length > 0 ? programs[0].id : "");
    setSelectedPresetKey(null);
    setIsPresetModalOpen(true);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    editingTier,
    setEditingTier,
    isSaving,
    handleOpenModal,
    handleSave,
    isPresetModalOpen,
    setIsPresetModalOpen,
    presetProgramId,
    setPresetProgramId,
    selectedPresetKey,
    setSelectedPresetKey,
    isApplyingPreset,
    handleApplyPreset,
    openPresetModal,
  };
}

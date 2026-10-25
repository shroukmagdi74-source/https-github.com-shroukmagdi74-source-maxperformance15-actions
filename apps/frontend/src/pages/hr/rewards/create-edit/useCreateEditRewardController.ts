import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import i18n from "../../../../i18n";
import { apiClient } from "../../../../services/apiClient";
import { RewardEmployee, RewardType, RewardFormData } from "./types";
import { createInitialRewardFormData, validateRewardForm } from "./helpers";

export const useCreateEditRewardController = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<RewardEmployee[]>([]);
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [selectedRewardType, setSelectedRewardType] =
    useState<RewardType | null>(null);

  const [formData, setFormData] = useState<RewardFormData>(
    createInitialRewardFormData,
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await apiClient.get(`/hr/employees`);
      if (response.data.success) {
        setEmployees(response.data.employees || []);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  }, []);

  const fetchRewardTypes = useCallback(async () => {
    try {
      const response = await apiClient.get(`/hr/rewards/types`);
      if (response.data.success) {
        setRewardTypes(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching reward types:", err);
    }
  }, []);

  const fetchRewardDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/hr/rewards/records/${id}`);
      if (response.data.success) {
        const reward = response.data.data;
        setFormData({
          userId: reward.userId,
          rewardTypeId: reward.rewardTypeId,
          calculatedValue: reward.calculatedValue.toString(),
          periodStart: reward.periodStart.split("T")[0],
          periodEnd: reward.periodEnd.split("T")[0],
          appliedMonth: reward.appliedMonth.toString(),
          appliedYear: reward.appliedYear.toString(),
          reason: reward.reason || "",
          rewardName: reward.rewardName || "",
          rewardCategory: reward.rewardCategory || "OTHER",
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "فشل في تحميل بيانات المكافأة");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployees();
    fetchRewardTypes();
    if (isEdit) {
      fetchRewardDetails();
    }
  }, [isEdit, fetchEmployees, fetchRewardTypes, fetchRewardDetails]);

  useEffect(() => {
    if (formData.rewardTypeId) {
      const type = rewardTypes.find((t) => t.id === formData.rewardTypeId);
      setSelectedRewardType(type || null);
      if (type && !formData.calculatedValue) {
        if (type.calculationMethod === "FIXED_AMOUNT") {
          setFormData((prev) => ({
            ...prev,
            calculatedValue: type.value.toString(),
          }));
        } else {
          setFormData((prev) => ({ ...prev, calculatedValue: "" }));
        }
      }
    } else {
      setSelectedRewardType(null);
    }
  }, [formData.rewardTypeId, rewardTypes]);

  const seedDefaults = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/hr/rewards/types/seed`);
      if (response.data.success) {
        await fetchRewardTypes();
      }
    } catch (err) {
      console.error("Error seeding defaults:", err);
      setError("فشل في تجهيز القوالب. يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RewardFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateRewardForm(formData);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...formData,
        calculatedValue: parseFloat(formData.calculatedValue),
        appliedMonth: parseInt(formData.appliedMonth, 10),
        appliedYear: parseInt(formData.appliedYear, 10),
      };

      if (isEdit) {
        await apiClient.put(`/hr/rewards/records/${id}`, payload);
        alert(i18n.t("CreateEditReward.success_update_6490"));
      } else {
        await apiClient.post(`/hr/rewards/records`, payload);
        alert(i18n.t("CreateEditReward.success_add_ab3d"));
      }

      navigate("/hr/rewards");
    } catch (err: any) {
      console.error("Error saving reward:", err);
      setError(err.response?.data?.message || "فشل في حفظ المكافأة");

      if (err.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        err.response.data.errors.forEach((errorItem: any) => {
          backendErrors[errorItem.field] = errorItem.message;
        });
        setValidationErrors(backendErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    isEdit,
    navigate,
    loading,
    saving,
    error,
    employees,
    rewardTypes,
    selectedRewardType,
    formData,
    validationErrors,
    seedDefaults,
    handleChange,
    handleSubmit,
  };
};

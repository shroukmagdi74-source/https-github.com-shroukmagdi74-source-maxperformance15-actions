import React, { useEffect, useState } from "react";
import { companyAwareApi } from "../../../../services/companyAwareApi";
import {
  AssetFormCategoryOption,
  AssetFormData,
  AssetFormEmployeeOption,
  AssetFormSupplierOption,
} from "./types";
import {
  buildAssetSubmitPayload,
  createInitialAssetFormData,
  mapInitialAssetToFormData,
} from "./helpers";

export const useAssetFormController = (
  initialData: any,
  onSuccess: () => void,
  usePortal: boolean,
) => {
  const [formData, setFormData] = useState<AssetFormData>(() =>
    createInitialAssetFormData(),
  );
  const [categories, setCategories] = useState<AssetFormCategoryOption[]>([]);
  const [suppliers, setSuppliers] = useState<AssetFormSupplierOption[]>([]);
  const [employees, setEmployees] = useState<AssetFormEmployeeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchCategories();
    void fetchSuppliers();
    void fetchEmployees();
    if (initialData) {
      setFormData(mapInitialAssetToFormData(initialData));
    }
  }, [initialData]);

  useEffect(() => {
    if (!usePortal) return;
    if (typeof document === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [usePortal]);

  const fetchCategories = async () => {
    try {
      const response = await companyAwareApi.get("/hr/assets/categories");
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await companyAwareApi.get("/procurement/suppliers");
      if (response.data.suppliers) {
        setSuppliers(response.data.suppliers);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await companyAwareApi.get("/hr/employees");
      if (response.data.success) {
        setEmployees(response.data.employees || response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = buildAssetSubmitPayload(formData);
      if (initialData) {
        await companyAwareApi.put(`/hr/assets/${initialData.id}`, payload);
      } else {
        await companyAwareApi.post("/hr/assets", payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    categories,
    suppliers,
    employees,
    loading,
    loadingEmployees,
    error,
    handleSubmit,
  };
};

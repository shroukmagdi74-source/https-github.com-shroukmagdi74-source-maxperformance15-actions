import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import { tToast } from "../../../utils/i18n-toast";
import { Policy, PolicyFormData } from "./types";

export function useCompanyPolicyController() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);

  // Form states
  const [formData, setFormData] = useState<PolicyFormData>({
    title: "",
    content: "",
    category: "general",
    isActive: true,
  });

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/hr/policies", {
        params: {
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          search: searchQuery,
        },
      });
      if (data?.success) {
        setPolicies(data.policies || []);
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPolicies();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchPolicies]);

  const handleCreate = useCallback(async () => {
    if (!formData.title || !formData.content) {
      tToast.error("CompanyPolicy.msg_e09d");
      return;
    }

    try {
      const { data } = await api.post("/hr/policies", formData);
      if (data?.success) {
        tToast.success("CompanyPolicy.success_create_6d9e");
        setPolicies((prev) => [data.policy, ...prev]);
        setIsAddDialogOpen(false);
        setFormData({
          title: "",
          content: "",
          category: "general",
          isActive: true,
        });
      }
    } catch (error) {
      tToast.error("CompanyPolicy.failed_create_b4c3");
    }
  }, [formData]);

  const handleUpdate = useCallback(async () => {
    if (!editingPolicy) return;

    try {
      const { data } = await api.put(`/hr/policies/${editingPolicy.id}`, {
        title: editingPolicy.title,
        content: editingPolicy.content,
        category: editingPolicy.category,
        isActive: editingPolicy.isActive,
      });

      if (data?.success) {
        tToast.success("CompanyPolicy.success_update_c338");
        setPolicies((prev) =>
          prev.map((p) => (p.id === editingPolicy.id ? data.policy : p)),
        );
        setEditingPolicy(null);
      }
    } catch (error) {
      tToast.error("CompanyPolicy.failed_update_7a20");
    }
  }, [editingPolicy]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه السياسة؟")) return;

    try {
      await api.delete(`/hr/policies/${id}`);
      setPolicies((prev) => prev.filter((p) => p.id !== id));
      tToast.success("CompanyPolicy.success_delete_e3d8");
    } catch (error) {
      tToast.error("CompanyPolicy.failed_delete_5065");
    }
  }, []);

  return {
    policies,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingPolicy,
    setEditingPolicy,
    viewingPolicy,
    setViewingPolicy,
    formData,
    setFormData,
    handleCreate,
    handleUpdate,
    handleDelete,
    refetchPolicies: fetchPolicies,
  };
}

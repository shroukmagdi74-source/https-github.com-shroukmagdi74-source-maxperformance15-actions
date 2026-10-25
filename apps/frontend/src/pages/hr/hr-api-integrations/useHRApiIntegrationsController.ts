import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "../../../services/api";
import { ApiKeyItem, HRApiTab, WebhookItem } from "./types";

export const useHRApiIntegrationsController = () => {
  const [activeTab, setActiveTab] = useState<HRApiTab>("keys");
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(false);

  // New key form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["*"]);
  const [newlyCreatedRawKey, setNewlyCreatedRawKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // New webhook form state
  const [newHookName, setNewHookName] = useState("");
  const [newHookUrl, setNewHookUrl] = useState("");
  const [isSubmittingHook, setIsSubmittingHook] = useState(false);
  const [isDownloadingSpec, setIsDownloadingSpec] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/hr/external-api/keys");
      if (res.data?.success) {
        setKeys(res.data.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "فشل تحميل مفاتيح الـ API");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await api.get("/hr/external-api/webhooks");
      if (res.data?.success) {
        setWebhooks(res.data.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load webhooks:", err);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
    fetchWebhooks();
  }, [fetchKeys, fetchWebhooks]);

  const handleDownloadOpenApi = async () => {
    setIsDownloadingSpec(true);
    try {
      const response = await fetch("https://api.maxp.online/api/v1/external/hr/openapi.json");
      if (!response.ok) throw new Error("Failed to fetch spec");
      const json = await response.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "openapi-hr.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("تم تحميل مواصفات OpenAPI بنجاح");
    } catch {
      window.open("/docs/api/openapi-hr.json", "_blank");
    } finally {
      setIsDownloadingSpec(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error("يرجى كتابة اسم تعريفي للمفتاح");
      return;
    }

    try {
      const res = await api.post("/hr/external-api/keys", {
        name: newKeyName.trim(),
        scopes: selectedScopes,
      });

      if (res.data?.success) {
        setNewlyCreatedRawKey(res.data.data.rawKey);
        toast.success("تم إنشاء مفتاح API بنجاح");
        fetchKeys();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "فشل إنشاء المفتاح");
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (
      !window.confirm(
        "هل أنت متأكد من إلغاء وتجميد هذا المفتاح؟ لن تتمكن أي أداة من استخدامه مجدداً."
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/hr/external-api/keys/${id}`);
      if (res.data?.success) {
        toast.success("تم إلغاء المفتاح بنجاح");
        fetchKeys();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "فشل إلغاء المفتاح");
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHookName.trim() || !newHookUrl.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setIsSubmittingHook(true);
      const res = await api.post("/hr/external-api/webhooks", {
        name: newHookName.trim(),
        targetUrl: newHookUrl.trim(),
        subscribedEvents: ["*"],
      });

      if (res.data?.success) {
        toast.success("تم إضافة اشتراك الـ Webhook بنجاح");
        setNewHookName("");
        setNewHookUrl("");
        fetchWebhooks();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "فشل تسجيل الـ Webhook");
    } finally {
      setIsSubmittingHook(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast.success("تم نسخ المفتاح إلى الحافظة");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const openCreateModal = () => {
    setNewlyCreatedRawKey(null);
    setNewKeyName("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewlyCreatedRawKey(null);
  };

  return {
    activeTab,
    setActiveTab,
    keys,
    webhooks,
    loading,
    showCreateModal,
    setShowCreateModal,
    newKeyName,
    setNewKeyName,
    selectedScopes,
    setSelectedScopes,
    newlyCreatedRawKey,
    copiedKey,
    newHookName,
    setNewHookName,
    newHookUrl,
    setNewHookUrl,
    isSubmittingHook,
    isDownloadingSpec,
    handleDownloadOpenApi,
    handleCreateKey,
    handleRevokeKey,
    handleCreateWebhook,
    copyToClipboard,
    openCreateModal,
    closeCreateModal,
  };
};

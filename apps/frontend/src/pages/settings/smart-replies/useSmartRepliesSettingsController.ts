import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import {
  ALL_CHANNELS,
  DEFAULT_CHANNELS,
  type AutoReplyTemplate,
  type SmartRepliesSettingsData,
  type SmartReplyChannel,
} from "./types";

const defaultTemplates: AutoReplyTemplate[] = [];

export function useSmartRepliesSettingsController() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SmartRepliesSettingsData>({
    enabled: false,
    channels: DEFAULT_CHANNELS,
    templates: defaultTemplates,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] =
    useState<AutoReplyTemplate | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [expandedResponses, setExpandedResponses] = useState<
    Record<string, boolean>
  >({});

  const templatesContainerRef = useRef<HTMLDivElement>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/smart-replies/rule-responses");
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setSettings({
          enabled: data.enableRuleResponses === true,
          channels:
            Array.isArray(data.channels) && data.channels.length > 0
              ? data.channels
              : DEFAULT_CHANNELS,
          templates: data.customRuleResponses?.templates || defaultTemplates,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error(t("smartReplies.loadFailed") || "فشل تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const persistSettings = useCallback(
    async (
      newTemplates: AutoReplyTemplate[],
      enabledState: boolean = settings.enabled,
      channelsState: SmartReplyChannel[] = settings.channels
    ) => {
      try {
        setSaving(true);
        await apiClient.put("/smart-replies/rule-responses", {
          enableRuleResponses: enabledState,
          channels: channelsState,
          customRuleResponses: {
            templates: newTemplates,
          },
        });
        return true;
      } catch (error: unknown) {
        console.error("Error saving smart replies:", error);
        const apiError = error as { response?: { data?: { error?: string } } };
        const msg =
          apiError?.response?.data?.error ||
          t("smartReplies.saveFailed") ||
          "فشل الحفظ";
        toast.error(msg);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [settings.channels, settings.enabled, t]
  );

  const handleSave = useCallback(async () => {
    const success = await persistSettings(
      settings.templates,
      settings.enabled,
      settings.channels
    );
    if (success) {
      toast.success(t("smartReplies.ruleSaved") || "تم الحفظ بنجاح");
    }
  }, [persistSettings, settings.channels, settings.enabled, settings.templates, t]);

  const handleToggleEnable = useCallback(async () => {
    const nextEnabled = !settings.enabled;
    setSettings((prev) => ({ ...prev, enabled: nextEnabled }));
    const success = await persistSettings(
      settings.templates,
      nextEnabled,
      settings.channels
    );
    if (success) {
      toast.success(
        nextEnabled
          ? "تم تفعيل الردود التلقائية بنجاح"
          : "تم إيقاف الردود التلقائية"
      );
    }
  }, [persistSettings, settings.channels, settings.enabled, settings.templates]);

  const handleToggleGlobalChannel = useCallback(
    async (channelId: SmartReplyChannel) => {
      const current = settings.channels || DEFAULT_CHANNELS;
      const exists = current.includes(channelId);
      const nextChannels = exists
        ? current.filter((c) => c !== channelId)
        : [...current, channelId];

      if (nextChannels.length === 0) {
        toast.error(
          "يجب تفعيل قناة واحدة على الأقل أو إيقاف الردود التلقائية بالكامل من المفتاح الرئيسي"
        );
        return;
      }

      setSettings((prev) => ({ ...prev, channels: nextChannels }));
      const success = await persistSettings(
        settings.templates,
        settings.enabled,
        nextChannels
      );
      if (success) {
        const channelLabel =
          ALL_CHANNELS.find((c) => c.id === channelId)?.shortLabel || channelId;
        toast.success(
          exists
            ? `تم إيقاف الردود التلقائية على ${channelLabel}`
            : `تم تشغيل الردود التلقائية على ${channelLabel}`
        );
      }
    },
    [persistSettings, settings.channels, settings.enabled, settings.templates]
  );

  const handleToggleTemplateChannel = useCallback(
    (channelId: SmartReplyChannel) => {
      if (!editingTemplate) return;
      const current =
        Array.isArray(editingTemplate.channels) &&
        editingTemplate.channels.length > 0
          ? editingTemplate.channels
          : DEFAULT_CHANNELS;
      const exists = current.includes(channelId);
      const next = exists
        ? current.filter((c) => c !== channelId)
        : [...current, channelId];

      if (next.length === 0) {
        toast.error("يجب اختيار قناة واحدة على الأقل لهذا القالب");
        return;
      }

      setEditingTemplate({
        ...editingTemplate,
        channels: next,
      });
    },
    [editingTemplate]
  );

  const handleEditStart = useCallback((template: AutoReplyTemplate) => {
    setEditingId(template.id);
    setEditingTemplate({
      ...template,
      channels:
        Array.isArray(template.channels) && template.channels.length > 0
          ? [...template.channels]
          : DEFAULT_CHANNELS,
      keywords: Array.isArray(template.keywords) ? [...template.keywords] : [],
      responses:
        Array.isArray(template.responses) && template.responses.length > 0
          ? [...template.responses]
          : [""],
    });
    setNewKeyword("");
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditingTemplate(null);
    setNewKeyword("");
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingTemplate) return;

    const trimmedName = editingTemplate.name.trim();
    if (!trimmedName) {
      toast.error(t("smartReplies.nameRequired") || "اسم القاعدة مطلوب");
      return;
    }

    const keywordsPool = [...editingTemplate.keywords];
    if (newKeyword.trim()) {
      const parts = newKeyword
        .split(/[,،\n]+/)
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      keywordsPool.push(...parts);
      setNewKeyword("");
    }

    const cleanKeywords = Array.from(
      new Set(keywordsPool.map((k) => k.trim()))
    ).filter(Boolean);

    if (cleanKeywords.length === 0) {
      toast.error("يرجى إضافة كلمة مفتاحية واحدة على الأقل");
      return;
    }

    const cleanResponses = editingTemplate.responses
      .map((r) => r.trim())
      .filter(Boolean);

    if (cleanResponses.length === 0) {
      toast.error(t("smartReplies.templateRequired") || "قالب الرد مطلوب");
      return;
    }

    const targetChannels =
      Array.isArray(editingTemplate.channels) &&
      editingTemplate.channels.length > 0
        ? editingTemplate.channels
        : DEFAULT_CHANNELS;

    const updatedTemplate: AutoReplyTemplate = {
      ...editingTemplate,
      name: trimmedName,
      channels: targetChannels,
      keywords: cleanKeywords,
      responses: cleanResponses,
    };

    const isNew = !settings.templates.some((item) => item.id === editingId);
    const updatedTemplates = isNew
      ? [updatedTemplate, ...settings.templates]
      : settings.templates.map((item) =>
          item.id === editingId ? updatedTemplate : item
        );

    const success = await persistSettings(updatedTemplates);
    if (success) {
      setSettings((prev) => ({
        ...prev,
        templates: updatedTemplates,
      }));
      setEditingId(null);
      setEditingTemplate(null);
      toast.success(t("smartReplies.ruleSaved") || "تم حفظ القالب بنجاح");
    }
  }, [editingId, editingTemplate, newKeyword, persistSettings, settings.templates, t]);

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmMsg =
        t("smartReplies.ruleDeleteConfirm") || "هل أنت متأكد من حذف هذا القالب؟";
      if (!window.confirm(confirmMsg)) return;

      const updatedTemplates = settings.templates.filter((item) => item.id !== id);
      setSettings((prev) => ({
        ...prev,
        templates: updatedTemplates,
      }));

      if (editingId === id) {
        setEditingId(null);
        setEditingTemplate(null);
      }

      const success = await persistSettings(updatedTemplates);
      if (success) {
        toast.success(t("smartReplies.ruleDeleted") || "تم حذف القالب بنجاح");
      }
    },
    [editingId, persistSettings, settings.templates, t]
  );

  const handleAddTemplate = useCallback(() => {
    const newTemplate: AutoReplyTemplate = {
      id: `custom_${Date.now()}`,
      name: "",
      type: "custom",
      channels: DEFAULT_CHANNELS,
      keywords: [],
      responses: [""],
    };
    handleEditStart(newTemplate);
    setTimeout(() => {
      templatesContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  }, [handleEditStart]);

  const handleAddKeyword = useCallback(() => {
    if (!newKeyword.trim() || !editingTemplate) return;
    const parts = newKeyword
      .split(/[,،\n]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const existing = new Set(
      editingTemplate.keywords.map((k) => k.toLowerCase())
    );
    const toAdd = parts.filter((k) => !existing.has(k.toLowerCase()));

    if (toAdd.length > 0) {
      setEditingTemplate({
        ...editingTemplate,
        keywords: [...editingTemplate.keywords, ...toAdd],
      });
    }
    setNewKeyword("");
  }, [editingTemplate, newKeyword]);

  const handleRemoveKeyword = useCallback(
    (index: number) => {
      if (!editingTemplate) return;
      setEditingTemplate({
        ...editingTemplate,
        keywords: editingTemplate.keywords.filter((_, i) => i !== index),
      });
    },
    [editingTemplate]
  );

  const handleResponseChange = useCallback(
    (index: number, value: string) => {
      if (!editingTemplate) return;
      const newResponses = [...editingTemplate.responses];
      newResponses[index] = value;
      setEditingTemplate({ ...editingTemplate, responses: newResponses });
    },
    [editingTemplate]
  );

  const handleAddResponse = useCallback(() => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      responses: [...editingTemplate.responses, ""],
    });
  }, [editingTemplate]);

  const handleRemoveResponse = useCallback(
    (index: number) => {
      if (!editingTemplate) return;
      if (editingTemplate.responses.length <= 1) {
        toast.error("يجب إبقاء رد واحد على الأقل للقالب");
        return;
      }
      setEditingTemplate({
        ...editingTemplate,
        responses: editingTemplate.responses.filter((_, i) => i !== index),
      });
    },
    [editingTemplate]
  );

  const toggleExpand = useCallback((templateId: string, idx: number) => {
    const key = `${templateId}_${idx}`;
    setExpandedResponses((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateEditingTemplate = useCallback(
    (updates: Partial<AutoReplyTemplate>) => {
      setEditingTemplate((prev) => (prev ? { ...prev, ...updates } : null));
    },
    []
  );

  return {
    t,
    loading,
    saving,
    settings,
    editingId,
    editingTemplate,
    newKeyword,
    setNewKeyword,
    expandedResponses,
    templatesContainerRef,
    handleSave,
    handleToggleEnable,
    handleToggleGlobalChannel,
    handleToggleTemplateChannel,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    handleDelete,
    handleAddTemplate,
    handleAddKeyword,
    handleRemoveKeyword,
    handleResponseChange,
    handleAddResponse,
    handleRemoveResponse,
    toggleExpand,
    updateEditingTemplate,
  };
}

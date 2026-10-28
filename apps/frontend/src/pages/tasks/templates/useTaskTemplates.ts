import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import i18n from "../../../i18n";
import tokenManager from "../../../utils/tokenManager";
import { buildApiUrl } from "../../../utils/urlHelper";
import { Category, NewTemplatePayload, Project, TaskTemplate } from "./types";

export function useTaskTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [newTemplate, setNewTemplate] = useState<NewTemplatePayload>({
    name: "",
    description: "",
    taskTitle: "",
    taskDescription: "",
    priority: "medium",
    type: "general",
    estimatedHours: 0,
    tags: [],
    projectId: "",
    categoryId: "",
  });

  const [tagInput, setTagInput] = useState("");
  const getAccessToken = (): string | null => tokenManager.getAccessToken();

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("tasks/templates"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("projects"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("tasks/categories/list"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    void fetchTemplates();
    void fetchProjects();
    void fetchCategories();
  }, [fetchTemplates, fetchProjects, fetchCategories]);

  const resetForm = () => {
    setNewTemplate({
      name: "",
      description: "",
      taskTitle: "",
      taskDescription: "",
      priority: "medium",
      type: "general",
      estimatedHours: 0,
      tags: [],
      projectId: "",
      categoryId: "",
    });
    setTagInput("");
  };

  const createTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.taskTitle.trim()) {
      alert(i18n.t("TaskTemplates.msg_e4d8"));
      return;
    }

    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("tasks/templates"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTemplate),
      });

      const data = await response.json();
      if (data.success) {
        void fetchTemplates();
        setShowCreateModal(false);
        resetForm();
        alert(i18n.t("TaskTemplates.success_create_c37f"));
      } else {
        alert(data.error || i18n.t("TaskTemplates.failed_create_7f8d"));
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert(i18n.t("TaskTemplates.failed_create_7f8d"));
    }
  };

  const updateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`tasks/templates/${editingTemplate.id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingTemplate),
        },
      );

      const data = await response.json();
      if (data.success) {
        void fetchTemplates();
        setShowEditModal(false);
        setEditingTemplate(null);
        alert(i18n.t("TaskTemplates.success_update_85c7"));
      } else {
        alert(data.error || i18n.t("TaskTemplates.failed_update_bf44"));
      }
    } catch (error) {
      console.error("Error updating template:", error);
      alert(i18n.t("TaskTemplates.failed_update_bf44"));
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القالب؟")) return;

    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`tasks/templates/${templateId}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      if (data.success) {
        void fetchTemplates();
        alert(i18n.t("TaskTemplates.success_delete_746e"));
      } else {
        alert(data.error || i18n.t("TaskTemplates.failed_delete_3434"));
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert(i18n.t("TaskTemplates.failed_delete_3434"));
    }
  };

  const useTemplate = (template: TaskTemplate) => {
    navigate("/tasks", {
      state: {
        openCreateModal: true,
        templateData: {
          title: template.taskTitle,
          description: template.taskDescription,
          priority: template.priority,
          type: template.type,
          estimatedHours: template.estimatedHours,
          tags: template.tags,
          projectId: template.projectId,
          categoryId: template.categoryId,
        },
      },
    });
  };

  const addTag = (tagsArray: string[], setTags: (tags: string[]) => void) => {
    if (tagInput.trim() && !tagsArray.includes(tagInput.trim())) {
      setTags([...tagsArray, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (
    tag: string,
    tagsArray: string[],
    setTags: (tags: string[]) => void,
  ) => {
    setTags(tagsArray.filter((t) => t !== tag));
  };

  return {
    templates,
    loading,
    projects,
    categories,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingTemplate,
    setEditingTemplate,
    newTemplate,
    setNewTemplate,
    tagInput,
    setTagInput,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    resetForm,
    addTag,
    removeTag,
  };
}

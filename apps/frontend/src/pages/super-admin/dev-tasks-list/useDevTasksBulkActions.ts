import { useState } from "react";
import tokenManager from "../../../utils/tokenManager";
import { buildApiUrl } from "../../../utils/urlHelper";
import { ConfirmModalState, DevTasksFilters, Task } from "./types";

const getAccessToken = (): string | null => tokenManager.getAccessToken();

export function useDevTasksBulkActions() {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const toggleSelectAll = (tasks: Task[]) => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map((t) => t.id));
    }
  };

  const toggleSelectTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const executeBulkAction = async (
    onSuccess: () => void,
    onError: (msg: string) => void,
  ) => {
    try {
      const token = getAccessToken();

      if (bulkAction === "delete") {
        for (let i = 0; i < selectedTasks.length; i += 5) {
          const batch = selectedTasks.slice(i, i + 5);
          await Promise.all(
            batch.map((id) =>
              fetch(buildApiUrl(`super-admin/dev/tasks/${id}`), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }),
            ),
          );
        }
      } else if (bulkAction.startsWith("status:")) {
        const status = bulkAction.split(":")[1];
        for (let i = 0; i < selectedTasks.length; i += 5) {
          const batch = selectedTasks.slice(i, i + 5);
          await Promise.all(
            batch.map((id) =>
              fetch(buildApiUrl(`super-admin/dev/tasks/${id}`), {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
              }),
            ),
          );
        }
      } else if (bulkAction.startsWith("assignee:")) {
        const assigneeId = bulkAction.split(":")[1];
        for (let i = 0; i < selectedTasks.length; i += 5) {
          const batch = selectedTasks.slice(i, i + 5);
          await Promise.all(
            batch.map((id) =>
              fetch(buildApiUrl(`super-admin/dev/tasks/${id}`), {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ assigneeId }),
              }),
            ),
          );
        }
      }

      setSelectedTasks([]);
      setBulkAction("");
      onSuccess();
    } catch (err) {
      console.error("Error performing bulk action:", err);
      onError("حدث خطأ أثناء تنفيذ العملية الجماعية");
    }
  };

  const handleBulkAction = (
    onSuccess: () => void,
    onError: (msg: string) => void,
  ) => {
    if (selectedTasks.length === 0 || !bulkAction) return;

    if (bulkAction === "delete") {
      setConfirmModal({
        show: true,
        title: "حذف مهام",
        message: `هل أنت متأكد من حذف ${selectedTasks.length} مهمة؟ لا يمكن التراجع عن هذا الإجراء.`,
        onConfirm: () => {
          setConfirmModal((prev) => ({ ...prev, show: false }));
          executeBulkAction(onSuccess, onError);
        },
      });
    } else {
      executeBulkAction(onSuccess, onError);
    }
  };

  const executeDeleteTask = async (
    taskId: string,
    onSuccess: () => void,
    onError: (msg: string) => void,
  ) => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/${taskId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        onError(data.message || "فشل حذف المهمة");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      onError("حدث خطأ أثناء حذف المهمة");
    }
  };

  const handleDeleteTask = (
    taskId: string,
    onSuccess: () => void,
    onError: (msg: string) => void,
  ) => {
    setConfirmModal({
      show: true,
      title: "حذف مهمة",
      message:
        "هل أنت متأكد من حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء.",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        executeDeleteTask(taskId, onSuccess, onError);
      },
    });
  };

  const handleExport = async (
    format: "csv" | "json",
    filters: DevTasksFilters,
  ) => {
    try {
      const token = getAccessToken();
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(
        buildApiUrl(
          `super-admin/dev/tasks/export?format=${format}&${params.toString()}`,
        ),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting tasks:", err);
    }
  };

  return {
    selectedTasks,
    setSelectedTasks,
    bulkAction,
    setBulkAction,
    confirmModal,
    setConfirmModal,
    toggleSelectAll,
    toggleSelectTask,
    handleBulkAction,
    handleDeleteTask,
    handleExport,
  };
}

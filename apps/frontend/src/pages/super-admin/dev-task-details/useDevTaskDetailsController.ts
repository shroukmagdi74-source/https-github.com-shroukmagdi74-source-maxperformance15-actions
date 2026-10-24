import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import tokenManager from "../../../utils/tokenManager";
import { buildApiUrl } from "../../../utils/urlHelper";
import { useTimer } from "../../../contexts/TimerContext";
import type { Task } from "../../../types/tasks";
import type {
  DevTaskTab,
  SubtaskFormData,
  DuplicateFormData,
  ToastState,
  ConfirmModalState,
  EditingTimeLogState,
} from "./types";
import { formatTime } from "./types";

const getAccessToken = (): string | null => tokenManager.getAccessToken();

export function useDevTaskDetailsController() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DevTaskTab>("details");
  const [newComment, setNewComment] = useState("");

  // Checklists State
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Timer Context
  const {
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    getTimerForTask,
    getElapsedSecondsForTask,
  } = useTimer();
  const currentTaskTimer = id ? getTimerForTask(id) : null;
  const isCurrentTaskTimerActive = Boolean(
    currentTaskTimer?.isRunning || currentTaskTimer?.isPaused
  );
  const isCurrentTaskTimerPaused = Boolean(currentTaskTimer?.isPaused);
  const currentTaskElapsedSeconds = id ? getElapsedSecondsForTask(id) : 0;

  // Enhancement States
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false,
    message: "",
    onConfirm: () => {},
  });
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [editingTimeLog, setEditingTimeLog] =
    useState<EditingTimeLogState | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [showTestingModal, setShowTestingModal] = useState(false);
  const [selectedTesterId, setSelectedTesterId] = useState("");
  const [subtaskForm, setSubtaskForm] = useState<SubtaskFormData>({
    title: "",
    description: "",
    department: "",
    assigneeId: "",
    type: "FEATURE",
    priority: "MEDIUM",
  });

  // Duplicate Task States
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateForm, setDuplicateForm] = useState<DuplicateFormData>({
    newAssigneeId: "",
    includeChecklists: true,
    includeAttachments: false,
  });
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Export/Import States
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTeamMembers = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("super-admin/dev/team"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl("super-admin/user/permissions"),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUserPermissions(data.data.permissions);
      }
    } catch (err) {
      console.error("Error fetching user permissions:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("super-admin/dev/settings"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const fetchTask = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = getAccessToken();
      const response = await fetch(
        `${buildApiUrl(`super-admin/dev/tasks/${id}`)}?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        const rawTask = data.data;
        const mappedTask: Task = {
          ...rawTask,
          businessValue: rawTask.businessValue || null,
          acceptanceCriteria: rawTask.acceptanceCriteria || null,
          assigneeName: rawTask.assignee?.user
            ? `${rawTask.assignee.user.firstName} ${rawTask.assignee.user.lastName}`
            : null,
          assigneeAvatar: rawTask.assignee?.user?.avatar || null,
          assigneeId: rawTask.assignee?.user?.id || null,
          reporterName: rawTask.reporter?.user
            ? `${rawTask.reporter.user.firstName} ${rawTask.reporter.user.lastName}`
            : "Unknown",
          projectName: rawTask.project?.name || null,
          projectColor: rawTask.project?.color || null,
          tags: rawTask.tags || [],
          subtasks: rawTask.subtasks || [],
          attachments: rawTask.attachments || [],
          checklists: rawTask.checklists || [],
          timeLogs: (rawTask.timeLogs || []).map((t: any) => ({
            ...t,
            memberName: t.member?.user
              ? `${t.member.user.firstName} ${t.member.user.lastName}`
              : "Unknown",
            memberId: t.memberId,
          })),
          activities: rawTask.activities || [],
          comments: (rawTask.comments || []).map((c: any) => ({
            ...c,
            authorName: c.author?.user
              ? `${c.author.user.firstName} ${c.author.user.lastName}`
              : "Unknown",
            authorAvatar: c.author?.user?.avatar || null,
            replies: c.replies || [],
          })),
          relatedLinks: rawTask.relatedLinks || [],
          nextTaskId: rawTask.nextTaskId || null,
          previousTaskId: rawTask.previousTaskId || null,
        };
        setTask(mappedTask);
      } else {
        setError(data.error || "فشل في جلب المهمة");
      }
    } catch (err) {
      setError("فشل في الاتصال بالخادم");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTask();
      fetchSettings();
      fetchUserPermissions();
      fetchTeamMembers();
    } else {
      setLoading(false);
      setError("معرف المهمة غير محدد");
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartTimer = async () => {
    if (!id || !task) return;
    try {
      await startTimer(id, task.title, task.projectName || undefined);
      fetchTask(false);
    } catch (err) {
      showToast("فشل بدء المؤقت", "error");
    }
  };

  const handleStopTimer = async () => {
    if (!id) return;
    try {
      await stopTimer(id);
      fetchTask(false);
    } catch (err) {
      showToast("فشل إيقاف المؤقت", "error");
    }
  };

  const handlePauseTimer = async () => {
    if (!id) return;
    try {
      await pauseTimer(id);
      fetchTask(false);
    } catch (err) {
      showToast("فشل إيقاف المؤقت", "error");
    }
  };

  const handleResumeTimer = async () => {
    if (!id) return;
    try {
      await resumeTimer(id);
      fetchTask(false);
    } catch (err) {
      showToast("فشل استئناف المؤقت", "error");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;

    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/${id}/comments`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setNewComment("");
        fetchTask(false);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDuplicateTask = async () => {
    if (!id) return;

    try {
      setIsDuplicating(true);
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/${id}/duplicate`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(duplicateForm),
        }
      );

      const data = await response.json();
      if (data.success) {
        showToast("تم تكرار المهمة بنجاح", "success");
        setShowDuplicateModal(false);
        if (data.data?.id) {
          setTimeout(() => {
            navigate(`/super-admin/dev-tasks/${data.data.id}`);
          }, 1000);
        }
      } else {
        showToast(data.message || "فشل في تكرار المهمة", "error");
      }
    } catch (err) {
      console.error("Error duplicating task:", err);
      showToast("حدث خطأ في تكرار المهمة", "error");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;

    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl(`super-admin/dev/tasks/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        navigate("/super-admin/dev-tasks");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleCreateChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/${id}/checklists`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newChecklistTitle }),
        }
      );
      if (response.ok) {
        setNewChecklistTitle("");
        fetchTask(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (checklistId: string) => {
    const content = newItemInputs[checklistId];
    if (!content?.trim()) return;
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/checklists/${checklistId}/items`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );
      if (response.ok) {
        setNewItemInputs((prev) => ({ ...prev, [checklistId]: "" }));
        fetchTask(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleItem = async (itemId: string, currentStatus: boolean) => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/checklist-items/${itemId}`),
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isCompleted: !currentStatus }),
        }
      );
      if (response.ok) fetchTask(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubtask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subtaskForm.title.trim()) return;

    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/${id}/subtasks`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subtaskForm),
        }
      );

      if (response.ok) {
        showToast("تم إنشاء المهمة الفرعية بنجاح", "success");
        setSubtaskForm({
          title: "",
          description: "",
          department: "",
          assigneeId: "",
          type: "FEATURE",
          priority: "MEDIUM",
        });
        setShowSubtaskModal(false);
        fetchTask(false);
      } else {
        showToast("فشل في إنشاء المهمة الفرعية", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ في الاتصال بالسيرفر", "error");
    }
  };

  const handleDepartmentChange = (dept: string) => {
    const memberInDept = teamMembers.find(
      (m) => m.department === dept && m.availability === "available"
    );
    setSubtaskForm((prev) => ({
      ...prev,
      department: dept,
      assigneeId: memberInDept ? memberInDept.userId || memberInDept.id : "",
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      setIsUploading(true);
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/${id}/attachments`),
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        showToast(
          data.message || `تم رفع ${files.length} ملف بنجاح`,
          "success"
        );
        fetchTask(false);
      } else {
        showToast("فشل في رفع الملفات", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ في رفع الملفات", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCreateTestingSubtask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTesterId) {
      showToast("يرجى اختيار مختبر", "error");
      return;
    }

    try {
      const token = getAccessToken();
      const payload = {
        title: `Testing: ${task?.title}`,
        description: `Verification required for: ${task?.title}`,
        department: task?.department || "Quality Assurance",
        assigneeId: selectedTesterId,
        type: "TESTING",
        priority: task?.priority || "MEDIUM",
      };

      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/${id}/subtasks`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        showToast("تم إرسال طلب الاختبار بنجاح", "success");
        setSelectedTesterId("");
        setShowTestingModal(false);
        fetchTask(false);
      } else {
        showToast("فشل في إرسال طلب الاختبار", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ في الاتصال بالسيرفر", "error");
    }
  };

  const handleDeleteTimeLog = async (logId: string) => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/time-logs/${logId}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        showToast("تم حذف سجل الوقت", "success");
        fetchTask(false);
      } else {
        showToast("فشل في حذف السجل", "error");
      }
    } catch (err) {
      showToast("حدث خطأ", "error");
    }
    setConfirmModal({ open: false, message: "", onConfirm: () => {} });
  };

  const handleEditTimeLog = async () => {
    if (!editingTimeLog) return;
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/time-logs/${editingTimeLog.id}`),
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            duration: editingTimeLog.duration,
            description: editingTimeLog.description,
          }),
        }
      );
      if (response.ok) {
        showToast("تم تحديث السجل", "success");
        fetchTask(false);
        setEditingTimeLog(null);
      } else {
        showToast("فشل في التحديث", "error");
      }
    } catch (err) {
      showToast("حدث خطأ", "error");
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/checklist-items/${itemId}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        showToast("تم حذف العنصر", "success");
        fetchTask(false);
      } else {
        showToast("فشل في حذف العنصر", "error");
      }
    } catch (err) {
      showToast("حدث خطأ", "error");
    }
    setConfirmModal({ open: false, message: "", onConfirm: () => {} });
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/attachments/${attachmentId}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        showToast("تم حذف المرفق", "success");
        fetchTask(false);
      } else {
        showToast("فشل في حذف المرفق", "error");
      }
    } catch (err) {
      showToast("حدث خطأ", "error");
    }
    setConfirmModal({ open: false, message: "", onConfirm: () => {} });
  };

  const handleExportChecklists = () => {
    if (!task?.checklists?.length) {
      showToast("لا توجد قوائم للتصدير", "error");
      return;
    }

    let content = "";
    task.checklists.forEach((list) => {
      content += `# ${list.title}\n`;
      list.items?.forEach((item) => {
        content += `- [${item.isCompleted ? "x" : " "}] ${item.content}\n`;
      });
      content += "\n";
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `task-${task.id}-checklists.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportChecklists = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      setIsImporting(true);
      try {
        const lines = text.split("\n");
        let currentChecklistId: string | null = null;
        let createdCount = 0;

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith("#")) {
            const title = trimmedLine.replace(/^#+\s*/, "").trim();
            if (title) {
              const token = getAccessToken();
              const response = await fetch(
                buildApiUrl(`super-admin/dev/tasks/${id}/checklists`),
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ title }),
                }
              );

              if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                  currentChecklistId = data.data.id;
                  createdCount++;
                }
              }
            }
          } else if (trimmedLine.startsWith("-") && currentChecklistId) {
            let content = trimmedLine.replace(/^-/, "").trim();
            if (content.startsWith("[x]")) {
              content = content.substring(3).trim();
            } else if (content.startsWith("[ ]")) {
              content = content.substring(3).trim();
            }

            if (content) {
              const token = getAccessToken();
              await fetch(
                buildApiUrl(
                  `super-admin/dev/tasks/checklists/${currentChecklistId}/items`
                ),
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ content }),
                }
              );
            }
          }
        }

        showToast(`تم استيراد ${createdCount} قائمة بنجاح`, "success");
        fetchTask(false);
      } catch (err) {
        console.error(err);
        showToast("حدث خطأ أثناء الاستيراد", "error");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks/${id}/status`),
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (response.ok) {
        showToast("تم تحديث الحالة", "success");
        if (newStatus === "DONE" && task?.nextTaskId) {
          navigate(`/super-admin/dev-tasks/${task.nextTaskId}`);
        } else {
          fetchTask(false);
        }
      } else {
        const data = await response.json();
        showToast(data.message || "فشل في تحديث الحالة", "error");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("حدث خطأ في تحديث الحالة", "error");
    }
    setStatusDropdownOpen(false);
  };

  const handleUpdateAssignee = async (newAssigneeId: string) => {
    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl(`super-admin/dev/tasks/${id}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assigneeId: newAssigneeId === "unassigned" ? null : newAssigneeId,
        }),
      });
      if (response.ok) {
        showToast("تم تحديث المسؤول بنجاح", "success");
        fetchTask(false);
      } else {
        const data = await response.json();
        showToast(data.message || "فشل في تحديث المسؤول", "error");
      }
    } catch (err) {
      console.error("Error updating assignee:", err);
      showToast("حدث خطأ في تحديث المسؤول", "error");
    }
  };

  return {
    id,
    navigate,
    task,
    settings,
    userPermissions,
    loading,
    error,
    activeTab,
    setActiveTab,
    newComment,
    setNewComment,
    newChecklistTitle,
    setNewChecklistTitle,
    newItemInputs,
    setNewItemInputs,
    isUploading,
    toast,
    confirmModal,
    setConfirmModal,
    statusDropdownOpen,
    setStatusDropdownOpen,
    editingTimeLog,
    setEditingTimeLog,
    teamMembers,
    showSubtaskModal,
    setShowSubtaskModal,
    showTestingModal,
    setShowTestingModal,
    selectedTesterId,
    setSelectedTesterId,
    subtaskForm,
    setSubtaskForm,
    showDuplicateModal,
    setShowDuplicateModal,
    duplicateForm,
    setDuplicateForm,
    isDuplicating,
    isImporting,
    fileInputRef,
    isCurrentTaskTimerActive,
    isCurrentTaskTimerPaused,
    currentTaskElapsedSeconds,
    formatTime,
    showToast,
    fetchTask,
    handleStartTimer,
    handleStopTimer,
    handlePauseTimer,
    handleResumeTimer,
    handleAddComment,
    handleDuplicateTask,
    handleDeleteTask,
    handleCreateChecklist,
    handleAddItem,
    handleToggleItem,
    handleCreateSubtask,
    handleDepartmentChange,
    handleFileUpload,
    handleCreateTestingSubtask,
    handleDeleteTimeLog,
    handleEditTimeLog,
    handleDeleteChecklistItem,
    handleDeleteAttachment,
    handleExportChecklists,
    handleImportChecklists,
    handleUpdateStatus,
    handleUpdateAssignee,
  };
}

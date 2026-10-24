import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import tokenManager from "@/utils/tokenManager";
import { buildApiUrl } from "@/utils/urlHelper";
import {
  type AvailabilityValue,
  type FiltersState,
  type SettingsResponse,
  type UserFormErrors,
  type UserFormState,
  type UserMutationResponse,
  type UserRecord,
  type UsersListResponse,
  FALLBACK_ROLES,
  createInitialForm,
  getAuthHeaders,
  getErrorMessage,
  normalizeSkillsValue,
} from "./types";

export const useSuperAdminUsersController = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>(FALLBACK_ROLES);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    isActive: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [detailsUser, setDetailsUser] = useState<UserRecord | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<UserRecord | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormState>(createInitialForm);
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});

  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const redirectToLogin = (message?: string) => {
    setError(message || "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى");
    tokenManager.clearTokens();
    window.location.href = "/auth/login";
  };

  const fetchUsers = useCallback(async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (filters.search.trim()) {
        params.set("search", filters.search.trim());
      }
      if (filters.isActive) {
        params.set("isActive", filters.isActive);
      }

      const response = await fetch(
        buildApiUrl(`super-admin/users?${params.toString()}`),
        {
          headers: getAuthHeaders(),
        },
      );

      let payload: UsersListResponse = {};
      try {
        payload = (await response.json()) as UsersListResponse;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin(payload.message);
          return;
        }
        throw new Error(payload.message || `HTTP ${response.status}`);
      }

      if (!mountedRef.current || requestId !== requestRef.current) {
        return;
      }

      if (payload.success) {
        const nextUsers = Array.isArray(payload.data) ? payload.data : [];
        setUsers(nextUsers);
        setTotalPages(payload.pagination?.pages || 0);
        setTotalCount(payload.pagination?.total || nextUsers.length);
        setError(null);
      } else {
        setUsers([]);
        setTotalPages(0);
        setTotalCount(0);
        setError(payload.message || "فشل في تحميل مستخدمي السوبر أدمن");
      }
    } catch (fetchError: unknown) {
      if (!mountedRef.current || requestId !== requestRef.current) {
        return;
      }

      setUsers([]);
      setTotalPages(0);
      setTotalCount(0);
      setError(getErrorMessage(fetchError, "فشل في تحميل مستخدمي السوبر أدمن"));
    } finally {
      if (mountedRef.current && requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [filters.isActive, filters.search, limit, page]);

  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const response = await fetch(buildApiUrl("super-admin/dev/settings"), {
        headers: getAuthHeaders(),
      });

      let payload: SettingsResponse = {};
      try {
        payload = (await response.json()) as SettingsResponse;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin(payload.message);
          return;
        }
        throw new Error(payload.message || `HTTP ${response.status}`);
      }

      const nextRoles = Object.keys(payload.data?.permissions || {});
      setAvailableRoles(nextRoles.length > 0 ? nextRoles : FALLBACK_ROLES);
    } catch {
      setAvailableRoles(FALLBACK_ROLES);
    } finally {
      if (mountedRef.current) {
        setRolesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  const resetForm = () => {
    setFormData(createInitialForm());
    setFormErrors({});
  };

  const closeEditor = () => {
    setEditorMode(null);
    setEditingUser(null);
    resetForm();
  };

  const updateForm = <Key extends keyof UserFormState>(
    field: Key,
    value: UserFormState[Key],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setFormErrors((current) =>
      current[field]
        ? {
            ...current,
            [field]: "",
          }
        : current,
    );
  };

  const openCreateDialog = () => {
    const nextForm = createInitialForm();
    nextForm.role = availableRoles.includes("SUPER_ADMIN")
      ? "SUPER_ADMIN"
      : (availableRoles[0] ?? "");
    setFormData(nextForm);
    setFormErrors({});
    setEditingUser(null);
    setEditorMode("create");
  };

  const openEditDialog = (userItem: UserRecord) => {
    setFormData({
      firstName: userItem.firstName || "",
      lastName: userItem.lastName || "",
      email: userItem.email || "",
      password: "",
      phone: userItem.phone || "",
      role: userItem.role || "",
      skills: normalizeSkillsValue(userItem.skills),
      department: userItem.department || "",
      availability:
        (userItem.availability as AvailabilityValue | undefined) || "available",
      isActive: userItem.isActive ?? true,
    });
    setFormErrors({});
    setEditingUser(userItem);
    setEditorMode("edit");
  };

  const validateForm = () => {
    const nextErrors: UserFormErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "الاسم الأول مطلوب";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "الاسم الأخير مطلوب";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (editorMode !== "edit" && !formData.password.trim()) {
      nextErrors.password = "كلمة المرور مطلوبة";
    } else if (
      formData.password.trim() &&
      formData.password.trim().length < 8
    ) {
      nextErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    }

    if (formData.phone.trim() && !/^[+0-9\\s()\\-]{6,20}$/.test(formData.phone.trim())) {
      nextErrors.phone = "تنسيق رقم الهاتف غير صحيح";
    }

    if (!formData.role) {
      nextErrors.role = "اختيار الدور مطلوب";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const applySearch = () => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      search: searchInput.trim(),
    }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      isActive: "",
    });
    setPage(1);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: Record<string, unknown> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        skills: formData.skills.trim() || undefined,
        department: formData.department.trim() || undefined,
        availability: formData.availability,
        isActive: formData.isActive,
      };

      if (formData.password.trim()) {
        payload["password"] = formData.password.trim();
      }

      const isEditing = editorMode === "edit" && editingUser;
      const response = await fetch(
        buildApiUrl(
          isEditing
            ? `super-admin/users/${editingUser.id}`
            : "super-admin/users",
        ),
        {
          method: isEditing ? "PUT" : "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        },
      );

      let result: UserMutationResponse = {};
      try {
        result = (await response.json()) as UserMutationResponse;
      } catch {
        result = {};
      }

      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin(result.message);
          return;
        }
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      if (result.success) {
        closeEditor();
        void fetchUsers();
      } else {
        setError(result.message || "فشل في حفظ المستخدم");
      }
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, "فشل في حفظ المستخدم"));
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteUser) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError(null);

      const response = await fetch(
        buildApiUrl(`super-admin/users/${pendingDeleteUser.id}`),
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      let result: UserMutationResponse = {};
      try {
        result = (await response.json()) as UserMutationResponse;
      } catch {
        result = {};
      }

      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin(result.message);
          return;
        }
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      if (result.success) {
        setPendingDeleteUser(null);

        if (users.length === 1 && page > 1) {
          setPage((current) => current - 1);
        } else {
          void fetchUsers();
        }
      } else {
        setError(result.message || "فشل في حذف المستخدم");
      }
    } catch (deleteError: unknown) {
      setError(getErrorMessage(deleteError, "فشل في حذف المستخدم"));
    } finally {
      if (mountedRef.current) {
        setDeleteLoading(false);
      }
    }
  };

  const filterCount = Number(Boolean(filters.search)) + Number(Boolean(filters.isActive));

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (filters.search) {
      labels.push(`بحث: ${filters.search}`);
    }
    if (filters.isActive === "true") {
      labels.push("الحسابات النشطة");
    }
    if (filters.isActive === "false") {
      labels.push("الحسابات غير النشطة");
    }
    return labels;
  }, [filters.isActive, filters.search]);

  const visibleFrom = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const visibleTo = totalCount === 0 ? 0 : Math.min(page * limit, totalCount);

  const userStats = useMemo(() => {
    const active = users.filter((u) => u.isActive).length;
    const superAdmins = users.filter((u) => u.role === "SUPER_ADMIN").length;
    return { active, superAdmins };
  }, [users]);

  return {
    users,
    availableRoles,
    loading,
    rolesLoading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalCount,
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    filterSheetOpen,
    setFilterSheetOpen,
    editorMode,
    editingUser,
    detailsUser,
    setDetailsUser,
    pendingDeleteUser,
    setPendingDeleteUser,
    submitting,
    deleteLoading,
    formData,
    formErrors,
    filterCount,
    activeFilterLabels,
    visibleFrom,
    visibleTo,
    userStats,
    fetchUsers,
    fetchRoles,
    updateForm,
    openCreateDialog,
    openEditDialog,
    closeEditor,
    applySearch,
    clearFilters,
    handleSubmit,
    handleDelete,
  };
};

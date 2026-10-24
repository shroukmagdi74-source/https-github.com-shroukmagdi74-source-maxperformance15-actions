import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuthSimple";
import api from "../../services/api";
import { buildAppUrl } from "../../utils/urlHelper";
import { CompanyLink, INITIAL_FORM, LinkFormState, getApiErrorMessage } from "./types";

export const useCompanyLinksController = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const canManage = useMemo(
    () =>
      user?.role === "OWNER" ||
      user?.role === "COMPANY_ADMIN" ||
      user?.role === "SUPER_ADMIN",
    [user?.role],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<CompanyLink[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyLink | null>(null);
  const [form, setForm] = useState<LinkFormState>(INITIAL_FORM);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [shownPassword, setShownPassword] = useState("");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [linkPendingDelete, setLinkPendingDelete] = useState<CompanyLink | null>(null);

  const shareUrl = shareToken ? buildAppUrl(`/company-links/${shareToken}`) : "";

  const resetForm = useCallback(() => {
    setEditing(null);
    setForm(INITIAL_FORM);
  }, []);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("company/links");
      setLinks(response?.data?.data || []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t("companyLinks.fetchError")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchShareToken = useCallback(async () => {
    try {
      if (!canManage) {
        return;
      }

      const response = await api.get("company/links/share-token");
      setShareToken(response?.data?.data?.token || null);
    } catch {
      setShareToken(null);
    }
  }, [canManage]);

  useEffect(() => {
    void fetchLinks();
    void fetchShareToken();
  }, [user?.companyId, fetchLinks, fetchShareToken]);

  const copyText = useCallback(
    async (text: string, successMessage: string) => {
      try {
        await navigator.clipboard.writeText(text || "");
        toast.success(successMessage);
      } catch {
        toast.error(t("common.error"));
      }
    },
    [t],
  );

  const openLink = useCallback((link: CompanyLink) => {
    if (!link.url) {
      return;
    }

    window.open(link.url, "_blank", "noopener,noreferrer");
  }, []);

  const saveLink = useCallback(async () => {
    try {
      if (!canManage) {
        return;
      }

      const payload: {
        name: string;
        url: string;
        username: string;
        openMode: "new_tab" | "in_app";
        password?: string;
      } = {
        name: form.name,
        url: form.url,
        username: form.username,
        openMode: form.openMode,
      };

      if (form.password !== "") {
        payload.password = form.password;
      }

      if (editing?.id) {
        await api.put(`company/links/${editing.id}`, payload);
        toast.success(t("companyLinks.updateSuccess"));
      } else {
        await api.post("company/links", payload);
        toast.success(t("companyLinks.addSuccess"));
      }

      setDialogOpen(false);
      resetForm();
      void fetchLinks();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("companyLinks.saveError")));
    }
  }, [canManage, form, editing?.id, t, resetForm, fetchLinks]);

  const deleteLink = useCallback(async () => {
    try {
      if (!canManage || !linkPendingDelete) {
        return;
      }

      await api.delete(`company/links/${linkPendingDelete.id}`);
      toast.success(t("companyLinks.deleteSuccess"));
      setLinkPendingDelete(null);
      void fetchLinks();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("companyLinks.deleteError")));
    }
  }, [canManage, linkPendingDelete, t, fetchLinks]);

  const showPassword = useCallback(
    async (link: CompanyLink) => {
      try {
        if (!canManage) {
          return;
        }

        const response = await api.get(`company/links/${link.id}/password`);
        const password = response?.data?.data?.password || "";
        setShownPassword(password);
        setPasswordDialogOpen(true);
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, t("companyLinks.fetchPasswordError")));
      }
    },
    [canManage, t],
  );

  const copyPassword = useCallback(
    async (link: CompanyLink) => {
      try {
        if (!canManage) {
          return;
        }

        const response = await api.get(`company/links/${link.id}/password`);
        const password = response?.data?.data?.password || "";
        await copyText(password, t("companyLinks.passwordCopied"));
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, t("companyLinks.copyPasswordError")));
      }
    },
    [canManage, copyText, t],
  );

  const generateShareLink = useCallback(async () => {
    try {
      if (!canManage) {
        return;
      }

      const response = await api.post("company/links/share-token", {});
      const token = response?.data?.data?.token || null;
      setShareToken(token);

      if (token) {
        await copyText(
          buildAppUrl(`/company-links/${token}`),
          t("companyLinks.shareLinkCopied"),
        );
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("companyLinks.createShareLinkError")));
    }
  }, [canManage, copyText, t]);

  const revokeShareLink = useCallback(async () => {
    try {
      if (!canManage) {
        return;
      }

      await api.delete("company/links/share-token");
      setShareToken(null);
      toast.success(t("companyLinks.shareLinkRevoked"));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("companyLinks.revokeShareLinkError")));
    }
  }, [canManage, t]);

  const startEditing = useCallback((link: CompanyLink) => {
    setEditing(link);
    setForm({
      name: link.name || "",
      url: link.url || "",
      username: link.username || "",
      password: "",
      openMode: link.openMode || "new_tab",
    });
    setDialogOpen(true);
  }, []);

  const openModeLabel = useCallback(
    (mode?: CompanyLink["openMode"]) =>
      mode === "in_app" ? t("companyLinks.inApp") : t("companyLinks.newTab"),
    [t],
  );

  return {
    canManage,
    loading,
    error,
    links,
    dialogOpen,
    setDialogOpen,
    editing,
    form,
    setForm,
    passwordDialogOpen,
    setPasswordDialogOpen,
    shownPassword,
    setShownPassword,
    shareToken,
    shareUrl,
    linkPendingDelete,
    setLinkPendingDelete,
    resetForm,
    fetchLinks,
    copyText,
    openLink,
    saveLink,
    deleteLink,
    showPassword,
    copyPassword,
    generateShareLink,
    revokeShareLink,
    startEditing,
    openModeLabel,
    t,
  };
};

export type CompanyLinksController = ReturnType<typeof useCompanyLinksController>;

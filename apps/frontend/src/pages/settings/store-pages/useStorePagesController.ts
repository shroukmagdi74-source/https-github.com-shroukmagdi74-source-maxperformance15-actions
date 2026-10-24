import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiClient } from '../../../services/apiClient';
import { useAuth } from '../../../hooks/useAuthSimple';
import { buildStorefrontPreviewPath } from '../../../storefront/utils/paths';
import type { PageFormData, PageTypeKey, StorePage } from './types';

export const INITIAL_FORM_DATA: PageFormData = {
  title: '',
  slug: '',
  content: '',
  pageType: 'CUSTOM',
  isActive: true,
  showInFooter: true,
  showInMenu: false,
  order: 0,
  metaTitle: '',
  metaDescription: '',
};

export function useStorePagesController() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [pages, setPages] = useState<StorePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<StorePage | null>(null);
  const [formData, setFormData] = useState<PageFormData>(INITIAL_FORM_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const getPageUrl = useCallback(
    (slug: string): string => {
      const company = user?.company;
      if (!company) return '';
      return buildStorefrontPreviewPath(`/${slug}`, {
        companyId: user?.companyId ?? undefined,
        companySlug: company.slug ?? undefined,
        customDomain: company.customDomain ?? undefined,
      });
    },
    [user],
  );

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.post<{ success: boolean; data: StorePage[] }>(
        '/store-pages/list?includeInactive=true',
        { companyId: user?.companyId },
      );
      if (response?.data?.success) {
        setPages(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error(t('storePages.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  const initializeDefaultPages = async () => {
    const toastId = toast.loading(t('storePages.initializeLoading'));
    try {
      const response = await apiClient.post<{ success: boolean; error?: string }>(
        '/store-pages/initialize',
        { companyId: user?.companyId },
      );
      if (response?.data?.success) {
        toast.success(t('storePages.initSuccess'), { id: toastId });
        await fetchPages();
      } else {
        toast.error(response?.data?.error || t('storePages.initFailed'), { id: toastId });
      }
    } catch (error) {
      console.error('Error initializing pages:', error);
      toast.error(t('storePages.initError'), { id: toastId });
    }
  };

  const handleEdit = (page: StorePage) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      pageType: page.pageType,
      isActive: page.isActive,
      showInFooter: page.showInFooter,
      showInMenu: page.showInMenu,
      order: page.order,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingPage(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error(t('storePages.formTitleRequired'));
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      editingPage ? t('storePages.formUpdating') : t('storePages.formSaving'),
    );

    try {
      const url = editingPage
        ? `/store-pages/page/${editingPage.id}`
        : `/store-pages/`;

      const method = editingPage ? 'put' : 'post';
      const response = await apiClient[method]<{ success: boolean; error?: string }>(url, {
        ...formData,
        companyId: user?.companyId,
      });

      if (response?.data?.success) {
        toast.success(
          editingPage ? t('storePages.formUpdated') : t('storePages.formSaved'),
          { id: toastId },
        );
        closeModal();
        await fetchPages();
      } else {
        toast.error(response?.data?.error || t('storePages.formSaveFailed'), { id: toastId });
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error(t('storePages.formSaveError'), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!window.confirm(t('storePages.deleteConfirm'))) return;

    const toastId = toast.loading(t('storePages.deleteLoading'));
    try {
      const response = await apiClient.delete<{ success: boolean; error?: string }>(
        `/store-pages/page/${pageId}`,
        {
          data: { companyId: user?.companyId },
        },
      );

      if (response?.data?.success) {
        toast.success(t('storePages.deleteSuccess'), { id: toastId });
        await fetchPages();
      } else {
        toast.error(response?.data?.error || t('storePages.deleteFailed'), { id: toastId });
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error(t('storePages.deleteError'), { id: toastId });
    }
  };

  const toggleStatus = async (pageId: string) => {
    try {
      const response = await apiClient.patch<{ success: boolean; error?: string }>(
        `/store-pages/page/${pageId}/toggle`,
        { companyId: user?.companyId },
      );

      if (response?.data?.success) {
        toast.success(t('storePages.toggleSuccess'));
        await fetchPages();
      } else {
        toast.error(response?.data?.error || t('storePages.toggleFailed'));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(t('storePages.toggleError'));
    }
  };

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch =
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'ALL' || page.pageType === filterType;
      return matchesSearch && matchesType;
    });
  }, [filterType, pages, searchQuery]);

  const metrics = useMemo(() => {
    const total = pages.length;
    const active = pages.filter((p) => p.isActive).length;
    const inFooter = pages.filter((p) => p.showInFooter).length;
    const inMenu = pages.filter((p) => p.showInMenu).length;
    return { total, active, inFooter, inMenu };
  }, [pages]);

  return {
    t,
    pages,
    filteredPages,
    loading,
    saving,
    showModal,
    editingPage,
    formData,
    setFormData,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    metrics,
    getPageUrl,
    openCreateModal,
    closeModal,
    handleEdit,
    handleDelete,
    toggleStatus,
    handleSubmit,
    initializeDefaultPages,
    fetchPages,
  };
}

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../services/apiClient';
import {
  INITIAL_SUPPLIER_FORM_DATA,
  parseTags,
  type Supplier,
  type SupplierFormData,
} from './types';

export const useSuppliersController = () => {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => String(t(key as any));
  const isRtl = i18n.language === 'ar';
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    supplierId: string | null;
  }>({ open: false, supplierId: null });

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState<SupplierFormData>(INITIAL_SUPPLIER_FORM_DATA);
  const [newTagInput, setNewTagInput] = useState('');

  const [quickTagSupplier, setQuickTagSupplier] = useState<Supplier | null>(null);
  const [quickTagInput, setQuickTagInput] = useState('');
  const [savingQuickTag, setSavingQuickTag] = useState(false);

  const [recalculatingAll, setRecalculatingAll] = useState(false);
  const [recalculatingId, setRecalculatingId] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{
        suppliers: Supplier[];
        pagination: { totalPages: number };
      }>('/procurement/suppliers', {
        params: { page, limit: 20, search: searchTerm },
      });
      setSuppliers(response.data.suppliers || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setError(
        err?.response?.data?.message ||
          t('procurement.suppliers.fetchError', 'تعذر تحميل قائمة الموردين'),
      );
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, t]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenDialog = (supplier?: Supplier) => {
    setNewTagInput('');
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        mobile: supplier.mobile || '',
        tags: parseTags(supplier.tags),
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || 'Egypt',
        taxNumber: supplier.taxNumber || '',
        commercialRegister: supplier.commercialRegister || '',
        paymentTerms: supplier.paymentTerms || '',
        creditLimit: supplier.creditLimit?.toString() || '',
        rating: supplier.rating || 0,
        notes: supplier.notes || '',
        isActive: supplier.isActive,
      });
    } else {
      setSelectedSupplier(null);
      setFormData(INITIAL_SUPPLIER_FORM_DATA);
    }
    setOpenDialog(true);
  };

  const handleAddFormTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setNewTagInput('');
    }
  };

  const handleRemoveFormTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleOpenQuickTagDialog = (supplier: Supplier) => {
    setQuickTagSupplier(supplier);
    setQuickTagInput('');
  };

  const handleSaveQuickTag = async () => {
    if (!quickTagSupplier) return;
    const trimmed = quickTagInput.trim();
    if (!trimmed) return;
    const currentTags = parseTags(quickTagSupplier.tags);
    const updatedTags = currentTags.includes(trimmed)
      ? currentTags
      : [...currentTags, trimmed];
    try {
      setSavingQuickTag(true);
      await apiClient.put(`/procurement/suppliers/${quickTagSupplier.id}`, {
        tags: updatedTags,
      });
      setQuickTagSupplier(null);
      setQuickTagInput('');
      fetchSuppliers();
    } catch (err: any) {
      console.error('Error saving quick tag:', err);
      setError(err?.response?.data?.message || 'تعذر حفظ الوسم');
    } finally {
      setSavingQuickTag(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSupplier(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedSupplier) {
        await apiClient.put(`/procurement/suppliers/${selectedSupplier.id}`, formData);
      } else {
        await apiClient.post('/procurement/suppliers', formData);
      }
      fetchSuppliers();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving supplier:', err);
      setError(err?.response?.data?.message || 'تعذر حفظ بيانات المورد');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmDialog({ open: true, supplierId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmDialog.supplierId) return;
    try {
      await apiClient.delete(`/procurement/suppliers/${deleteConfirmDialog.supplierId}`);
      fetchSuppliers();
    } catch (err: any) {
      console.error('Error deleting supplier:', err);
      setError(err?.response?.data?.message || 'تعذر حذف المورد');
    } finally {
      setDeleteConfirmDialog({ open: false, supplierId: null });
    }
  };

  const handleRecalculateAll = async () => {
    try {
      setRecalculatingAll(true);
      const res = await apiClient.post<{ success: boolean; message: string; updatedCount: number }>(
        '/procurement/suppliers/recalculate-all',
      );
      toast.success(res.data.message || 'تم تدقيق ومزامنة أرصدة الموردين بنجاح');
      await fetchSuppliers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'تعذر تدقيق أرصدة الموردين');
    } finally {
      setRecalculatingAll(false);
    }
  };

  const handleRecalculateSingle = async (supplierId: string, supplierName: string) => {
    try {
      setRecalculatingId(supplierId);
      await apiClient.post<{ success: boolean; message: string; currentBalance: number }>(
        `/procurement/suppliers/${supplierId}/recalculate-balance`,
      );
      toast.success(`تم تدقيق وتحديث رصيد المورد (${supplierName}) بنجاح`);
      await fetchSuppliers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'تعذر تدقيق رصيد المورد');
    } finally {
      setRecalculatingId(null);
    }
  };

  const handleViewDetails = (supplier: Supplier) => {
    navigate(`/procurement/suppliers/${supplier.id}`);
  };

  return {
    t,
    tr,
    i18n,
    isRtl,
    suppliers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    openDialog,
    setOpenDialog,
    openViewDialog,
    setOpenViewDialog,
    selectedSupplier,
    deleteConfirmDialog,
    setDeleteConfirmDialog,
    formData,
    setFormData,
    newTagInput,
    setNewTagInput,
    quickTagSupplier,
    setQuickTagSupplier,
    quickTagInput,
    setQuickTagInput,
    savingQuickTag,
    recalculatingAll,
    recalculatingId,
    fetchSuppliers,
    handleOpenDialog,
    handleCloseDialog,
    handleAddFormTag,
    handleRemoveFormTag,
    handleOpenQuickTagDialog,
    handleSaveQuickTag,
    handleSubmit,
    handleDelete,
    confirmDelete,
    handleRecalculateAll,
    handleRecalculateSingle,
    handleViewDetails,
  };
};

export type SuppliersController = ReturnType<typeof useSuppliersController>;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../../services/apiClient';
import { getApiErrorMessage, getNumericValue } from '../components/settingsPageUtils';
import type { DeliveryMessageState, DeliveryOption, DeliveryOptionFormState } from './types';

export const createDefaultFormData = (sortOrder = 0): DeliveryOptionFormState => ({
  name: '',
  description: '',
  deliveryTime: '',
  price: 0,
  isDefault: false,
  isActive: true,
  sortOrder,
});

export function useDeliveryOptionsController() {
  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DeliveryOption | null>(null);
  const [message, setMessage] = useState<DeliveryMessageState | null>(null);
  const [formData, setFormData] = useState<DeliveryOptionFormState>(createDefaultFormData());

  const sortedOptions = useMemo(
    () =>
      [...options].sort((firstOption, secondOption) => {
        const sortDifference = firstOption.sortOrder - secondOption.sortOrder;
        if (sortDifference !== 0) {
          return sortDifference;
        }

        return firstOption.name.localeCompare(secondOption.name, 'ar');
      }),
    [options],
  );

  const activeCount = useMemo(
    () => options.filter((option) => option.isActive).length,
    [options],
  );

  const defaultCount = useMemo(
    () => options.filter((option) => option.isDefault).length,
    [options],
  );

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/delivery-options');

      if (response?.data?.success) {
        setOptions(Array.isArray(response.data.data) ? response.data.data : []);
      }
    } catch (error) {
      console.error('Error fetching delivery options:', error);
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'فشل في جلب خيارات التوصيل'),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const openCreateDialog = useCallback(() => {
    setEditingOption(null);
    setFormData(createDefaultFormData(options.length));
    setDialogOpen(true);
  }, [options.length]);

  const openEditDialog = useCallback((option: DeliveryOption) => {
    setEditingOption(option);
    setFormData({
      name: option.name,
      description: option.description || '',
      deliveryTime: option.deliveryTime,
      price: getNumericValue(option.price),
      isDefault: option.isDefault,
      isActive: option.isActive,
      sortOrder: option.sortOrder,
    });
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingOption(null);
    setFormData(createDefaultFormData(options.length));
  }, [options.length]);

  const handleSave = useCallback(async () => {
    if (!formData.name.trim() || !formData.deliveryTime.trim()) {
      setMessage({
        type: 'error',
        text: 'اسم الخيار ووقت التوصيل مطلوبان قبل الحفظ.',
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      if (editingOption) {
        await apiClient.put(`/delivery-options/${editingOption.id}`, formData);
        setMessage({
          type: 'success',
          text: 'تم تحديث خيار التوصيل بنجاح',
        });
      } else {
        await apiClient.post('/delivery-options', formData);
        setMessage({
          type: 'success',
          text: 'تمت إضافة خيار التوصيل بنجاح',
        });
      }

      handleCloseDialog();
      await loadOptions();
    } catch (error) {
      console.error('Error saving delivery option:', error);
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'فشل في حفظ خيار التوصيل'),
      });
    } finally {
      setSaving(false);
    }
  }, [editingOption, formData, handleCloseDialog, loadOptions]);

  const handleToggle = useCallback(
    async (optionId: string) => {
      try {
        setTogglingId(optionId);
        setMessage(null);
        await apiClient.patch(`/delivery-options/${optionId}/toggle`, {});
        await loadOptions();
      } catch (error) {
        console.error('Error toggling delivery option:', error);
        setMessage({
          type: 'error',
          text: getApiErrorMessage(error, 'فشل في تغيير حالة خيار التوصيل'),
        });
      } finally {
        setTogglingId(null);
      }
    },
    [loadOptions],
  );

  const handleDelete = useCallback(
    async (optionId: string) => {
      if (!window.confirm('هل أنت متأكد من حذف خيار التوصيل هذا؟')) {
        return;
      }

      try {
        setMessage(null);
        await apiClient.delete(`/delivery-options/${optionId}`);
        setMessage({
          type: 'success',
          text: 'تم حذف خيار التوصيل بنجاح',
        });
        await loadOptions();
      } catch (error) {
        console.error('Error deleting delivery option:', error);
        setMessage({
          type: 'error',
          text: getApiErrorMessage(error, 'فشل في حذف خيار التوصيل'),
        });
      }
    },
    [loadOptions],
  );

  return {
    options,
    sortedOptions,
    loading,
    saving,
    togglingId,
    dialogOpen,
    editingOption,
    message,
    formData,
    setFormData,
    activeCount,
    defaultCount,
    openCreateDialog,
    openEditDialog,
    handleCloseDialog,
    handleSave,
    handleToggle,
    handleDelete,
  };
}

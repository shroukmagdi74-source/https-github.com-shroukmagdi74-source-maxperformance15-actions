import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../../services/apiClient';
import { uploadService } from '../../../services/uploadService';
import {
  type ProductFormData,
  type ProductRecord,
  type ProductVariant,
  EMPTY_FORM,
} from './types';

interface UseProductFormParams {
  fetchProducts: () => void;
  t: (key: string) => string;
}

export function useProductForm({ fetchProducts, t }: UseProductFormParams) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAddForm = () => {
    setFormData({ ...EMPTY_FORM });
    setDrawerOpen(true);
  };

  const openEditForm = (product: ProductRecord) => {
    let parsedImages: string[] = [];
    if (product.images) {
      try {
        parsedImages = JSON.parse(product.images);
      } catch {
        /* empty */
      }
    }
    const variants: ProductVariant[] = (product.variants || []).map(v => {
      let img = '';
      if (v.images) {
        try {
          const vImgs = JSON.parse(v.images);
          img = Array.isArray(vImgs) ? vImgs[0] || '' : '';
        } catch {
          /* empty */
        }
      }
      return { id: v.id, color: v.color || v.name || '', imageUrl: img };
    });

    setFormData({
      id: product.id,
      name: product.name || '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? 0),
      sku: product.sku || '',
      description: product.description || '',
      mainImage: product.mainImage || parsedImages[0] || '',
      variants,
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let mainImageUrl = formData.mainImage || '';
      if (formData._mainImageFile) {
        const uploadRes = await uploadService.uploadProductImage(formData._mainImageFile);
        if (uploadRes.success && uploadRes.data?.url) {
          mainImageUrl = uploadRes.data.url;
        }
      }

      const processedVariants: Array<{
        id?: string;
        color: string;
        imageUrl: string;
      }> = [];
      for (const v of formData.variants) {
        let variantImg = v.imageUrl || '';
        if (v._localFile) {
          const vUpload = await uploadService.uploadProductImage(v._localFile);
          if (vUpload.success && vUpload.data?.url) {
            variantImg = vUpload.data.url;
          }
        }
        processedVariants.push({
          id: v.id,
          color: v.color,
          imageUrl: variantImg,
        });
      }

      const body: Record<string, unknown> = {
        name: formData.name.trim(),
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku.trim() || undefined,
        description: formData.description.trim() || undefined,
        mainImage: mainImageUrl || undefined,
        images: mainImageUrl ? [mainImageUrl] : [],
        isActive: true,
      };

      if (formData.id) {
        await apiClient.patch(`/products/${formData.id}`, body);

        for (const v of processedVariants) {
          const variantBody: Record<string, unknown> = {
            name: v.color,
            type: 'color',
            images: v.imageUrl ? JSON.stringify([v.imageUrl]) : undefined,
          };
          if (v.id) {
            await apiClient.put(`/products/${formData.id}/variants/${v.id}`, variantBody);
          } else {
            await apiClient.post(`/products/${formData.id}/variants`, variantBody);
          }
        }
      } else {
        const createRes = await apiClient.post<{
          success: boolean;
          data: ProductRecord;
        }>('/products', body);

        const newId = createRes.data?.data?.id;
        if (newId && processedVariants.length > 0) {
          for (const v of processedVariants) {
            await apiClient.post(`/products/${newId}/variants`, {
              name: v.color,
              type: 'color',
              images: v.imageUrl ? JSON.stringify([v.imageUrl]) : undefined,
            });
          }
        }
      }

      if (formData._mainImagePreview) URL.revokeObjectURL(formData._mainImagePreview);
      formData.variants.forEach(v => {
        if (v._localPreview) URL.revokeObjectURL(v._localPreview);
      });

      setDrawerOpen(false);
      setFormData({ ...EMPTY_FORM });
      fetchProducts();
      toast.success(
        formData.id ? t('aiCatalog.editProduct') + ' ✓' : t('aiCatalog.addProduct') + ' ✓'
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/products/${deleteTarget.id}`);
      toast.success(t('aiCatalog.successDelete'));
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (product: ProductRecord) => {
    try {
      await apiClient.post(`/products/${product.id}/duplicate`);
      toast.success(t('aiCatalog.successDuplicate'));
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

  const closeDrawer = () => {
    if (formData._mainImagePreview) URL.revokeObjectURL(formData._mainImagePreview);
    formData.variants.forEach(v => {
      if (v._localPreview) URL.revokeObjectURL(v._localPreview);
    });
    setDrawerOpen(false);
  };

  return {
    drawerOpen,
    setDrawerOpen,
    formData,
    setFormData,
    saving,
    openAddForm,
    openEditForm,
    handleSave,
    closeDrawer,
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleDelete,
    handleDuplicate,
  };
}

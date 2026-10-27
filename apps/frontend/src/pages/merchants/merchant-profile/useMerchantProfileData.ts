import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../../services/apiClient";
import { useTheme } from "../../../hooks/useTheme";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import {
  ApiSuccess,
  MerchantLinkFormState,
  MerchantProduct,
  MerchantProfileFormData,
  MerchantRecord,
  ProductListResponse,
  ProductOption,
  ShippingCompanyOption,
  SyncInventoryResult,
  WarehouseOption,
} from "./types";
import { getApiErrorMessage } from "./helpers";

const initialFormData: MerchantProfileFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  commissionRate: 10,
  autoFulfill: false,
  fulfillmentMode: "MERCHANT",
  defaultWarehouseId: "",
  defaultShippingCompanyId: "",
  webhookUrl: "",
  isActive: true,
};

const initialLinkForm: MerchantLinkFormState = {
  productId: "",
  merchantSku: "",
  merchantPrice: "",
  stock: "0",
  syncEnabled: true,
};

export const useMerchantProfileData = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const isEditMode = location.pathname.endsWith("/edit");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [linkingProduct, setLinkingProduct] = useState(false);
  const [syncingInventory, setSyncingInventory] = useState(false);
  const [merchant, setMerchant] = useState<MerchantRecord | null>(null);
  const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [shippingCompanies, setShippingCompanies] = useState<
    ShippingCompanyOption[]
  >([]);
  const [lastSyncSummary, setLastSyncSummary] = useState<SyncInventoryResult | null>(
    null,
  );
  const [formData, setFormData] = useState<MerchantProfileFormData>(initialFormData);
  const [linkForm, setLinkForm] = useState<MerchantLinkFormState>(initialLinkForm);

  const loadAvailableProducts = useCallback(async (silent = false) => {
    try {
      setProductsLoading(true);
      const response = await apiClient.get<ProductListResponse>("/products", {
        params: {
          page: 1,
          limit: 200,
          sortBy: "name",
          sortOrder: "asc",
        },
      });

      if (response.data.success) {
        setAvailableProducts(response.data.data || []);
      }
    } catch (error: unknown) {
      if (!silent) {
        toast.error(
          getApiErrorMessage(error, "تعذر تحميل قائمة المنتجات المتاحة"),
        );
      }
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadFulfillmentOptions = useCallback(async (silent = false) => {
    try {
      setOptionsLoading(true);
      const [warehousesRes, shippingCompaniesRes] = await Promise.all([
        apiClient.get<ApiSuccess<WarehouseOption[]>>("/warehouses"),
        apiClient.get<ApiSuccess<ShippingCompanyOption[]>>(
          "/shipping-companies",
        ),
      ]);

      if (warehousesRes.data.success) {
        setWarehouses(
          (warehousesRes.data.data || []).filter(
            (warehouse) => warehouse.isActive !== false,
          ),
        );
      }

      if (shippingCompaniesRes.data.success) {
        setShippingCompanies(
          (shippingCompaniesRes.data.data || []).filter(
            (company) => company.isActive !== false,
          ),
        );
      }
    } catch (error: unknown) {
      if (!silent) {
        toast.error(
          getApiErrorMessage(
            error,
            "تعذر تحميل المخازن أو شركات الشحن المتاحة",
          ),
        );
      }
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const loadMerchant = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<ApiSuccess<MerchantRecord>>(
        `/merchants/${id}`,
      );

      if (response.data.success) {
        const nextMerchant = response.data.data as MerchantRecord;
        setMerchant(nextMerchant);
        setFormData({
          name: nextMerchant.name || "",
          email: nextMerchant.email || "",
          phone: nextMerchant.phone || "",
          address: nextMerchant.address || "",
          commissionRate: Number(nextMerchant.commissionRate || 0),
          autoFulfill: Boolean(nextMerchant.autoFulfill),
          fulfillmentMode: nextMerchant.fulfillmentMode || "MERCHANT",
          defaultWarehouseId: nextMerchant.defaultWarehouseId || "",
          defaultShippingCompanyId: nextMerchant.defaultShippingCompanyId || "",
          webhookUrl: nextMerchant.webhookUrl || "",
          isActive: nextMerchant.isActive ?? true,
        });
        setLastSyncSummary(null);
      }

      await Promise.all([
        loadAvailableProducts(true),
        loadFulfillmentOptions(true),
      ]);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "تعذر تحميل بيانات التاجر"));
      navigate("/merchants");
    } finally {
      setLoading(false);
    }
  }, [id, loadAvailableProducts, loadFulfillmentOptions, navigate]);

  useEffect(() => {
    if (!id) {
      tToast.error("MerchantProfile.msg_5068");
      navigate("/merchants");
      return;
    }

    loadMerchant();
  }, [id, loadMerchant, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put<
        ApiSuccess<MerchantRecord>,
        typeof formData
      >(`/merchants/${id}`, formData);

      if (response.data.success) {
        tToast.success("MerchantProfile.success_update_a91e");
        navigate(`/merchants/${id}`);
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "تعذر تحديث بيانات التاجر"));
    } finally {
      setSaving(false);
    }
  };

  const handleLinkProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      return;
    }

    if (!linkForm.productId) {
      tToast.error("MerchantProfile.msg_f1ca");
      return;
    }

    const merchantPrice = Number(linkForm.merchantPrice);
    const stock = Number(linkForm.stock || "0");

    if (!Number.isFinite(merchantPrice) || merchantPrice <= 0) {
      tToast.error("MerchantProfile.msg_39bc");
      return;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      tToast.error("MerchantProfile.msg_c969");
      return;
    }

    try {
      setLinkingProduct(true);
      const response = await apiClient.post<ApiSuccess<MerchantProduct>>(
        `/merchants/${id}/products`,
        {
          productId: linkForm.productId,
          merchantSku: linkForm.merchantSku.trim() || undefined,
          merchantPrice,
          stock,
          syncEnabled: linkForm.syncEnabled,
        },
      );

      if (response.data.success) {
        tToast.success("MerchantProfile.msg_2366");
        setLinkForm(initialLinkForm);
        await loadMerchant();
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "تعذر ربط المنتج بالتاجر"));
    } finally {
      setLinkingProduct(false);
    }
  };

  const handleSyncInventory = async () => {
    if (!id) {
      return;
    }

    try {
      setSyncingInventory(true);
      const response = await apiClient.post<ApiSuccess<SyncInventoryResult>>(
        `/merchants/${id}/sync`,
      );

      if (response.data.success) {
        setLastSyncSummary(response.data.data || null);
        toast.success(
          `تمت مزامنة ${response.data.data?.synced ?? 0} منتج بنجاح`,
        );
        await loadMerchant();
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "تعذر مزامنة المخزون"));
    } finally {
      setSyncingInventory(false);
    }
  };

  return {
    id,
    isDark,
    isEditMode,
    loading,
    saving,
    productsLoading,
    optionsLoading,
    linkingProduct,
    syncingInventory,
    merchant,
    availableProducts,
    warehouses,
    shippingCompanies,
    lastSyncSummary,
    formData,
    linkForm,
    setFormData,
    setLinkForm,
    loadMerchant,
    handleSubmit,
    handleLinkProduct,
    handleSyncInventory,
    navigate,
  };
};

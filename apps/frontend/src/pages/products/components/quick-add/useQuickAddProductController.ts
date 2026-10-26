import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "../../../../services/apiClient";
import { uploadFiles, productApi } from "../../../../utils/apiHelpers";
import { normalizeImagePath } from "../../../../utils/imageUrl";
import {
  QuickAddProductModalProps,
  CategoryOption,
  WarehouseOption,
  QuickGeneratedVariant,
  QuickProductAttribute,
} from "./types";

interface UseQuickAddProductControllerProps extends QuickAddProductModalProps {
  hasOptions: boolean;
  validAttributes: QuickProductAttribute[];
  variants: QuickGeneratedVariant[];
  attributes: QuickProductAttribute[];
  computeCombinations: (
    currentAttributes: QuickProductAttribute[],
    basePrice: string,
    existingVariants?: QuickGeneratedVariant[]
  ) => QuickGeneratedVariant[];
  setVariants: React.Dispatch<React.SetStateAction<QuickGeneratedVariant[]>>;
  resetVariants: () => void;
}

export function useQuickAddProductController({
  open,
  onClose,
  onSuccess,
  warehouses,
  defaultWarehouseId,
  showWarehouseSelect = false,
  initialName,
  hasOptions,
  validAttributes,
  variants,
  attributes,
  computeCombinations,
  setVariants,
  resetVariants,
}: UseQuickAddProductControllerProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState(initialName || "");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("10");
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Categories list & add modal
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isQuickAddingCategory, setIsQuickAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategoryLoading, setAddingCategoryLoading] = useState(false);

  // Loading & submission state
  const [submitting, setSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"publish" | "advance">("publish");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Warehouse Selection
  const [internalWarehouses, setInternalWarehouses] = useState<WarehouseOption[]>(warehouses || []);
  const [warehouseId, setWarehouseId] = useState<string>(
    defaultWarehouseId || (warehouses && warehouses.length > 0 ? warehouses[0].id : "")
  );
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  useEffect(() => {
    if (open && initialName) {
      setName(initialName);
    }
  }, [open, initialName]);

  // Sync warehouses prop and fetch if needed
  useEffect(() => {
    if (!open) return;
    if (warehouses && warehouses.length > 0) {
      setInternalWarehouses(warehouses);
      setWarehouseId((prev) => prev || defaultWarehouseId || warehouses[0].id);
      return;
    }
    if (showWarehouseSelect) {
      setLoadingWarehouses(true);
      apiClient
        .get("/warehouses")
        .then((res) => {
          const resData: any = res.data;
          const list = resData?.data || (Array.isArray(resData) ? resData : []);
          const validList: WarehouseOption[] = Array.isArray(list)
            ? list.filter((w: any) => w && typeof w === "object" && w.id && w.name)
            : [];
          setInternalWarehouses(validList);
          setWarehouseId((prev) => prev || defaultWarehouseId || validList[0]?.id || "");
        })
        .catch((err) => {
          console.error("Failed to load warehouses:", err);
        })
        .finally(() => {
          setLoadingWarehouses(false);
        });
    }
  }, [open, warehouses, showWarehouseSelect, defaultWarehouseId]);

  useEffect(() => {
    if (defaultWarehouseId) {
      setWarehouseId(defaultWarehouseId);
    }
  }, [defaultWarehouseId]);

  // Always load categories from API on open
  useEffect(() => {
    if (!open) return;
    setLoadingCategories(true);
    apiClient
      .get("/products/categories")
      .then((res) => {
        const resData: any = res.data;
        const list = resData?.data || (Array.isArray(resData) ? resData : []);
        const validList = Array.isArray(list)
          ? list.filter((c: any) => c && typeof c === "object" && c.id && (c.name || c.title))
          : [];
        setCategories(validList);
        if (validList.length > 0 && !categoryId) {
          setCategoryId(validList[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
      })
      .finally(() => {
        setLoadingCategories(false);
      });
  }, [open]);

  const handleQuickAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setAddingCategoryLoading(true);
    try {
      const response = await apiClient.post("/products/categories", {
        name: trimmed,
        isActive: true,
      });
      const resData: any = response.data;
      const createdCategory = resData?.data;
      if (createdCategory?.id) {
        setCategories((prev) => [createdCategory, ...prev]);
        setCategoryId(createdCategory.id);
        setNewCategoryName("");
        setIsQuickAddingCategory(false);
        setFieldErrors((p) => ({ ...p, category: "" }));
        toast.success(`تمت إضافة القسم "${trimmed}" بنجاح`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || "فشل إضافة القسم");
    } finally {
      setAddingCategoryLoading(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files) as File[];
    setUploadingImage(true);
    try {
      const fileUrls: any = await uploadFiles(files, "upload/multiple");
      const urls = Array.isArray(fileUrls) ? fileUrls : (fileUrls?.data || []);
      const urlList = urls
        .map((u: any) => {
          if (typeof u === "string") return u;
          if (u && typeof u === "object") return u.fullUrl || u.url || u.path;
          return null;
        })
        .filter((u: any): u is string => typeof u === "string" && u.length > 0)
        .map((u: string) => normalizeImagePath(u) || u)
        .filter(Boolean) as string[];

      if (urlList.length > 0) {
        setImages((prev) => [...prev, ...urlList]);
      }
    } catch {
      toast.error("تعذر رفع الصورة، يرجى المحاولة مجدداً");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setComparePrice("");
    setStock("10");
    setImages([]);
    setWarehouseId(defaultWarehouseId || (internalWarehouses[0]?.id || ""));
    setFieldErrors({});
    setSubmitting(false);
    resetVariants();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = "يرجى كتابة اسم المنتج";
    if (!price || Number(price) <= 0) errors.price = "يرجى إدخال سعر صحيح";
    if (!categoryId) errors.category = "يرجى اختيار قسم للمنتج";
    if (showWarehouseSelect && !warehouseId) errors.warehouse = "يرجى اختيار المخزن";
    if (comparePrice && Number(comparePrice) <= Number(price)) {
      errors.comparePrice = "السعر قبل الخصم يجب أن يكون أكبر من سعر البيع";
    }
    if (hasOptions) {
      if (validAttributes.length === 0) {
        errors.options = "لقد قمت بتفعيل المتغيرات، يرجى إضافة خاصية واحدة على الأقل وبها قيم (مثل المقاس أو اللون)";
      } else if (variants.length === 0) {
        errors.options = "يرجى إضافة قيم للمتغيرات ثم الضغط على توليد المتغيرات";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (advanceToFullEditor: boolean) => {
    if (!validate()) return;
    setSubmitting(true);
    setActionType(advanceToFullEditor ? "advance" : "publish");

    try {
      let finalVariants = variants;
      if (hasOptions && finalVariants.length === 0 && validAttributes.length > 0) {
        finalVariants = computeCombinations(attributes, price, []);
        setVariants(finalVariants);
      }

      const productAttributes = hasOptions && validAttributes.length > 0
        ? validAttributes.map((attr) => ({
            id: attr.slug || attr.id,
            name: attr.name,
            slug: attr.slug || attr.name.toLowerCase().replace(/\s+/g, "_"),
            values: attr.values,
            visible: true,
            forVariations: true,
            requiredForOrder: true,
          }))
        : [];

      const totalCalculatedStock = hasOptions && finalVariants.length > 0
        ? finalVariants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)
        : parseInt(stock, 10) || 0;

      const attributeStyles: Record<string, string> = {};
      const requiredAttrKeys: string[] = [];
      const attributeLabelsMap: Record<string, string> = {};

      productAttributes.forEach((attr) => {
        attributeStyles[attr.name] = "buttons";
        requiredAttrKeys.push(attr.name);
        attributeLabelsMap[attr.slug] = attr.name;
      });

      const productPayload = {
        name: name.trim(),
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        category: categoryId,
        stock: totalCalculatedStock,
        trackInventory: true,
        isActive: true,
        enableCheckoutForm: true,
        showAddToCartButton: true,
        images,
        mainImage: images[0] || null,
        warehouseId: warehouseId || undefined,
        metadata: JSON.stringify({
          attributes: productAttributes,
          shippingClass: "standard",
          enableCheckoutForm: true,
          warehouseId: warehouseId || undefined,
          variantSettings: hasOptions && validAttributes.length > 0 ? {
            styles: attributeStyles,
          } : undefined,
          aiOrderOptions: {
            requiredAttributes: requiredAttrKeys,
            attributeLabels: attributeLabelsMap,
          },
        }),
      };

      const response = await apiClient.post("/products", productPayload, {
        timeout: 60000,
      });
      const resData: any = response.data;
      const createdProduct = resData?.data;
      const createdProductId = createdProduct?.id;

      if (!createdProductId) {
        throw new Error(resData?.message || "تعذر حفظ المنتج");
      }

      if (hasOptions && finalVariants.length > 0) {
        await Promise.all(
          finalVariants.map(async (v, idx) => {
            const variantPayload = {
              name: v.name,
              type: "combination",
              price: v.price ? parseFloat(v.price) : parseFloat(price),
              comparePrice: comparePrice ? parseFloat(comparePrice) : null,
              stock: parseInt(v.stock, 10) || 0,
              trackInventory: true,
              isActive: true,
              sortOrder: idx,
              warehouseId: warehouseId || undefined,
              metadata: JSON.stringify({
                attributeValues: v.attributeValues,
                shippingClass: "standard",
                warehouseId: warehouseId || undefined,
              }),
            };
            try {
              await productApi.createVariant(createdProductId, variantPayload);
            } catch (vErr) {
              console.error("فشل إنشاء المتغير:", v.name, vErr);
            }
          })
        );
      }

      toast.success("تمت إضافة المنتج بنجاح");
      if (onSuccess) onSuccess(createdProduct);
      handleClose();

      if (advanceToFullEditor) {
        navigate(`/products/${createdProductId}/edit`);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "حدث خطأ أثناء حفظ المنتج";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    name,
    setName,
    price,
    setPrice,
    comparePrice,
    setComparePrice,
    categoryId,
    setCategoryId,
    stock,
    setStock,
    images,
    setImages,
    warehouseId,
    setWarehouseId,
    fieldErrors,
    setFieldErrors,
    fileInputRef,
    uploadingImage,
    categories,
    setCategories,
    loadingCategories,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    isQuickAddingCategory,
    setIsQuickAddingCategory,
    newCategoryName,
    setNewCategoryName,
    addingCategoryLoading,
    submitting,
    actionType,
    internalWarehouses,
    loadingWarehouses,
    handleQuickAddCategory,
    handleImageFileChange,
    handleClose,
    handleSubmit,
  };
}

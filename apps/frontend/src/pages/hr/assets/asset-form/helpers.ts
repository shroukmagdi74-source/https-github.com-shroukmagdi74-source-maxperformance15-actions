import { AssetFormData } from "./types";

export const createInitialAssetFormData = (): AssetFormData => ({
  name: "",
  categoryId: "",
  code: "",
  serialNumber: "",
  model: "",
  brand: "",
  status: "AVAILABLE",
  condition: "NEW",
  purchaseDate: "",
  purchaseValue: "",
  location: "",
  notes: "",
  warrantyStartDate: "",
  warrantyEndDate: "",
  warrantyMonths: "",
  warrantyProvider: "",
  supplierName: "",
  supplierMobile: "",
  supplierAddress: "",
  assignedToId: "",
});

const toInputDate = (val?: string | Date | null): string => {
  if (!val) return "";
  try {
    return new Date(val).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const mapInitialAssetToFormData = (initialData: any): AssetFormData => ({
  name: (initialData?.name as string) || "",
  categoryId: (initialData?.categoryId as string) || "",
  code: (initialData?.code as string) || "",
  serialNumber: (initialData?.serialNumber as string) || "",
  model: (initialData?.model as string) || "",
  brand: (initialData?.brand as string) || "",
  status: (initialData?.status as string) || "AVAILABLE",
  condition: (initialData?.condition as string) || "NEW",
  purchaseDate: toInputDate(initialData?.purchaseDate),
  purchaseValue: initialData?.purchaseValue || "",
  location: initialData?.location || "",
  notes: initialData?.notes || "",
  warrantyStartDate: toInputDate(initialData?.warrantyStartDate),
  warrantyEndDate: toInputDate(initialData?.warrantyEndDate),
  warrantyMonths: (initialData?.warrantyMonths as string) || "",
  warrantyProvider: (initialData?.warrantyProvider as string) || "",
  supplierName: (initialData?.supplierName as string) || "",
  supplierMobile: (initialData?.supplierMobile as string) || "",
  supplierAddress: (initialData?.supplierAddress as string) || "",
  assignedToId: (initialData?.assignedToId as string) || "",
});

export const buildAssetSubmitPayload = (formData: AssetFormData) => ({
  ...formData,
  purchaseValue: formData.purchaseValue ? Number(formData.purchaseValue) : null,
  warrantyMonths: formData.warrantyMonths
    ? parseInt(formData.warrantyMonths.toString(), 10)
    : null,
  purchaseDate: formData.purchaseDate || null,
  warrantyStartDate: formData.warrantyStartDate || null,
  warrantyEndDate: formData.warrantyEndDate || null,
  assignedToId: formData.assignedToId || null,
});

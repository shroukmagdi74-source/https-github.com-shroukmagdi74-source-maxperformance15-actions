export interface AssetFormProps {
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
  usePortal?: boolean;
}

export interface AssetFormData {
  name: string;
  categoryId: string;
  code: string;
  serialNumber: string;
  model: string;
  brand: string;
  status: string;
  condition: string;
  purchaseDate: string;
  purchaseValue: string | number;
  location: string;
  notes: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  warrantyMonths: string | number;
  warrantyProvider: string;
  supplierName: string;
  supplierMobile: string;
  supplierAddress: string;
  assignedToId: string;
}

export interface AssetFormCategoryOption {
  id: string;
  name: string;
}

export interface AssetFormSupplierOption {
  id: string;
  name: string;
  mobile?: string;
  address?: string;
}

export interface AssetFormEmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string;
}

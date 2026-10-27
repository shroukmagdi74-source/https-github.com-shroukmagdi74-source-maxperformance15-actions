export interface ProductVariant {
  id?: string;
  color: string;
  imageUrl?: string;
  _localFile?: File;
  _localPreview?: string;
}

export interface ProductFormData {
  id?: string;
  name: string;
  price: string;
  stock: string;
  sku: string;
  description: string;
  mainImage: string;
  _mainImageFile?: File;
  _mainImagePreview?: string;
  variants: ProductVariant[];
}

export interface ProductRecord {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string | null;
  description?: string | null;
  mainImage?: string | null;
  images?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string } | null;
  variants?: Array<{
    id: string;
    name?: string | null;
    color?: string | null;
    size?: string | null;
    images?: string | null;
    sku?: string | null;
    price?: number | null;
    stock?: number | null;
  }>;
}

export const EMPTY_FORM: ProductFormData = {
  name: '',
  price: '',
  stock: '0',
  sku: '',
  description: '',
  mainImage: '',
  variants: [],
};

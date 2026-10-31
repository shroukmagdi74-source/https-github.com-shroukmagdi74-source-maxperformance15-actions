export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  phoneNormalized?: string;
  tags?: string | string[];
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  commercialRegister?: string;
  paymentTerms?: string;
  creditLimit?: number;
  currentBalance: number;
  rating?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    purchaseOrders: number;
    purchaseInvoices: number;
  };
}

export interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  mobile: string;
  tags: string[];
  address: string;
  city: string;
  country: string;
  taxNumber: string;
  commercialRegister: string;
  paymentTerms: string;
  creditLimit: string;
  rating: number;
  notes: string;
  isActive: boolean;
}

export const INITIAL_SUPPLIER_FORM_DATA: SupplierFormData = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  mobile: '',
  tags: [],
  address: '',
  city: '',
  country: 'Egypt',
  taxNumber: '',
  commercialRegister: '',
  paymentTerms: '',
  creditLimit: '',
  rating: 0,
  notes: '',
  isActive: true,
};

export const parseTags = (tags: unknown): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === 'string') {
    const trimmed = tags.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        // fallback to split
      }
    }
    return trimmed.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
};

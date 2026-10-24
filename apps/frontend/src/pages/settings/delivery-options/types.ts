export interface DeliveryOption {
  id: string;
  name: string;
  description: string | null;
  deliveryTime: string;
  price: number;
  isDefault: boolean;
  isActive: boolean;
  icon: string | null;
  sortOrder: number;
}

export type DeliveryOptionFormState = {
  name: string;
  description: string;
  deliveryTime: string;
  price: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type DeliveryMessageState = {
  type: 'success' | 'error';
  text: string;
};

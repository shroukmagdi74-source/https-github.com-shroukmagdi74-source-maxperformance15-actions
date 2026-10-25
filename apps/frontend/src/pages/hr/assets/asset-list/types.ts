export interface AssetListProps {
  refreshTrigger: number;
}

export interface AssetCategoryOption {
  id: string;
  name: string;
}

export interface AssetCurrentHolder {
  id?: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string;
}

export interface AssetItemRecord {
  id: string;
  name: string;
  code?: string;
  model?: string;
  status: string;
  purchaseValue?: number | string | null;
  category?: {
    id?: string;
    name: string;
  } | null;
  currentHolder?: AssetCurrentHolder | null;
  [key: string]: any;
}

export interface AssetListFiltersState {
  status: string;
  categoryId: string;
}

export interface AssigningAssetState extends AssetItemRecord {
  type: "assign" | "return";
}

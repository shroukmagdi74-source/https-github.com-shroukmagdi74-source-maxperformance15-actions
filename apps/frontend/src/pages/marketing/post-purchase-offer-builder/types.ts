export interface CatalogItem {
  id: string;
  name: string;
  price: number | null;
  comparePrice?: number | null;
  imageUrl?: string;
  sku?: string;
  categoryName?: string;
}

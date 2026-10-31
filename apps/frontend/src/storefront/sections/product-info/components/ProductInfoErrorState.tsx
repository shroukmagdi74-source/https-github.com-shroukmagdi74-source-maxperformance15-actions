import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/Button';

export interface ProductInfoErrorStateProps {
  error: Error | null;
  prefersArabicCopy: boolean;
  shopPath: string;
  refetch: () => void;
}

export const ProductInfoErrorState: React.FC<ProductInfoErrorStateProps> = ({
  error,
  prefersArabicCopy,
  shopPath,
  refetch,
}) => {
  const errorTitle = prefersArabicCopy ? 'المنتج غير متاح' : 'Product Not Available';
  const errorMessage =
    error?.message ||
    (prefersArabicCopy
      ? 'لم نتمكن من العثور على المنتج الذي تبحث عنه.'
      : "We couldn't find the product you're looking for.");

  return (
    <div className="p-12 border-2 border-dashed border-border rounded-[var(--radius)] text-center bg-muted/10">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-bold text-foreground mb-2">{errorTitle}</h3>
      <p className="text-muted-foreground mb-6">{errorMessage}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={refetch} variant="outline">
          {prefersArabicCopy ? 'حاول مرة أخرى' : 'Try Again'}
        </Button>
        <Link to={shopPath}>
          <Button>{prefersArabicCopy ? 'العودة إلى المتجر' : 'Back to Shop'}</Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductInfoErrorState;

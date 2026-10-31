import React from 'react';

export const ProductInfoLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex gap-2">
        <div className="h-4 bg-muted w-12 rounded" />
        <div className="h-4 bg-muted w-4 rounded" />
        <div className="h-4 bg-muted w-24 rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-10 bg-muted w-3/4 rounded" />
        <div className="h-8 bg-muted w-1/4 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted w-full rounded" />
        <div className="h-4 bg-muted w-full rounded" />
        <div className="h-4 bg-muted w-2/3 rounded" />
      </div>
      <div className="h-12 bg-muted w-1/3 rounded" />
      <div className="flex gap-4">
        <div className="h-12 bg-muted w-24 rounded" />
        <div className="h-12 bg-muted flex-1 rounded" />
      </div>
    </div>
  );
};

export default ProductInfoLoadingSkeleton;

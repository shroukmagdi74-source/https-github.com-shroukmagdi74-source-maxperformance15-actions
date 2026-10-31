import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStorefrontTheme } from '../../../engine/ThemeProvider';
import {
  getStorefrontProductRouteKey,
  buildStorefrontPreviewAdminPath,
} from '../../../utils/paths';
import { useProduct } from '../../../hooks/useProduct';
import type { StorefrontProductPreviewBannerProps } from './previewBannerTypes';

export const StorefrontProductPreviewBanner: React.FC<StorefrontProductPreviewBannerProps> = ({
  previewProductId,
}) => {
  const { theme } = useStorefrontTheme();
  const location = useLocation();
  const isSoleaFemme = theme.id === 'solea-femme';
  const isVelaFashion = theme.id === 'vela-fashion-eg';

  const productRouteKey = getStorefrontProductRouteKey(location.pathname);
  const { product } = useProduct(productRouteKey || undefined, {
    enabled: Boolean(productRouteKey) && !previewProductId,
  });

  const effectiveProductId = previewProductId || product?.id;

  const editLink = effectiveProductId
    ? `/products/${encodeURIComponent(effectiveProductId)}/edit`
    : '/products';
  const editUrl = buildStorefrontPreviewAdminPath(editLink, location.search);
  const productsUrl = buildStorefrontPreviewAdminPath(
    '/products',
    location.search,
  );

  if (theme.id === 'dental-lab-elite' || (!productRouteKey && !previewProductId)) {
    return null;
  }

  if (isVelaFashion) {
    return (
      <div className="pointer-events-none fixed bottom-3 end-3 z-[75]">
        <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-[#edd5cc] bg-white/92 p-1 shadow-[0_18px_48px_-34px_rgba(60,43,46,0.16)] backdrop-blur-xl">
          <Link
            to={editUrl}
            aria-label="تعديل المنتج"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#d05d4b] text-white transition-transform hover:-translate-y-0.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </Link>
          <Link
            to={productsUrl}
            aria-label="قائمة المنتجات"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#edd5cc] bg-[#fff7f2] text-[#7a5d63] transition-transform hover:-translate-y-0.5 hover:border-[#d05d4b] hover:text-[#d05d4b]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  const previewShellClassName = isSoleaFemme
    ? 'pointer-events-auto inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white/95 p-1 text-rose-950 shadow-[0_18px_48px_-30px_rgba(190,18,60,0.28)] backdrop-blur-xl'
    : 'pointer-events-auto inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 p-1 text-slate-800 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.22)] backdrop-blur-xl';
  const editActionClassName = isSoleaFemme
    ? 'inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white transition-transform hover:-translate-y-0.5'
    : 'inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition-transform hover:-translate-y-0.5';
  const productsActionClassName = isSoleaFemme
    ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-900 transition-transform hover:-translate-y-0.5'
    : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-transform hover:-translate-y-0.5';

  return (
    <div className="pointer-events-none fixed bottom-3 end-3 z-[75] max-w-[calc(100vw-1.5rem)]">
      <div className={previewShellClassName} dir={theme.direction}>
        <span className="hidden max-w-[8rem] truncate px-2 text-xs font-bold sm:inline">
          {theme.direction === 'rtl' ? 'معاينة المنتج' : 'Product preview'}
        </span>
        <Link
          to={editUrl}
          aria-label={
            theme.direction === 'rtl' ? 'تعديل المنتج' : 'Edit product'
          }
          className={editActionClassName}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </Link>
        <Link
          to={productsUrl}
          aria-label={
            theme.direction === 'rtl' ? 'قائمة المنتجات' : 'Products list'
          }
          className={productsActionClassName}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default StorefrontProductPreviewBanner;

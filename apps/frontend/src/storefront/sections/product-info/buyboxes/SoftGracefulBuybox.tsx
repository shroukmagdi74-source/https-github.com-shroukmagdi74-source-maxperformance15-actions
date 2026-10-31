import React from 'react';
import type { ProductInfoController } from '../productInfoTypes';
import { getVariantAttributes } from '../../../utils/variants';
import { sanitizeStorefrontHtml } from '../../../utils/html';
import { usePdpSelectionStore } from '../../../store/usePdpSelectionStore';

export interface SoftGracefulBuyboxProps {
  ctrl: ProductInfoController;
}

export const SoftGracefulBuybox: React.FC<SoftGracefulBuyboxProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
    displayPrice,
    originalPrice,
    selectedAttributes,
    setSelectedAttributes,
    quantity,
    setQuantity,
    handleAddToCart,
    handleBuyNow,
    rawSizeGuideHref,
  } = ctrl;

  if (!product) return null;

  const syncPdpSelection = usePdpSelectionStore((state) => state.syncSelection);

  const gracefulOptionGroups = (() => {
    const variants = product.productVariants || [];
    const groups = new Map<string, string[]>();
    variants.forEach((variantOption) => {
      const attributes = getVariantAttributes(variantOption);
      Object.entries(attributes).forEach(([key, value]) => {
        if (!key || !value) return;
        const values = groups.get(key) || [];
        if (!values.includes(value)) values.push(value);
        groups.set(key, values);
      });
    });
    return Array.from(groups.entries()).map(([name, values]) => ({ name, values }));
  })();

  const gracefulSizeGroup = gracefulOptionGroups.find((group) =>
    /size|مقاس/i.test(group.name),
  );
  const gracefulColorGroup = gracefulOptionGroups.find((group) =>
    /color|colour|لون/i.test(group.name),
  );
  const gracefulOtherGroups = gracefulOptionGroups.filter(
    (group) => group !== gracefulSizeGroup && group !== gracefulColorGroup,
  );
  const gracefulPayments = ['VISA', 'Mastercard', 'AMEX', 'PayPal', 'Diners', 'Discover'];
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const gracefulShares = [
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13.5 21v-7.8h2.62l.4-3.03H13.5V8.22c0-.88.24-1.48 1.5-1.48h1.6V4.06c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.41-3.9 4v2.23H7.75v3.03h2.6V21h3.15Z" />
        </svg>
      ),
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`,
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.9 3H21l-6.78 7.74L22.2 21h-6.24l-4.9-6.4L5.46 21H2.34l7.25-8.28L2 3h6.4l4.42 5.85L17.9 3Zm-1.1 16.1h1.72L7.6 4.8H5.75L16.8 19.1Z" />
        </svg>
      ),
    },
    {
      name: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(product.name)}`,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.32-.09-.8-.16-2.02.04-2.9.18-.8 1.16-5.06 1.16-5.06s-.3-.6-.3-1.48c0-1.38.8-2.42 1.8-2.42.86 0 1.26.64 1.26 1.4 0 .86-.54 2.14-.82 3.32-.24 1 .5 1.8 1.48 1.8 1.78 0 3.14-1.88 3.14-4.58 0-2.4-1.72-4.06-4.18-4.06-2.84 0-4.52 2.14-4.52 4.34 0 .86.34 1.78.74 2.28a.3.3 0 0 1 .06.28l-.28 1.14c-.04.18-.14.22-.32.14-1.18-.56-1.92-2.28-1.92-3.68 0-3 2.18-5.74 6.28-5.74 3.3 0 5.86 2.34 5.86 5.48 0 3.28-2.06 5.92-4.94 5.92-.96 0-1.86-.5-2.18-1.1l-.6 2.26c-.22.84-.8 1.88-1.2 2.52.9.28 1.86.44 2.86.44 5.52 0 10-4.48 10-10S17.52 2 12 2Z" />
        </svg>
      ),
    },
  ];

  const gracefulSwatchHex = (value: string): string => {
    const swatchMap: Record<string, string> = {
      ofw: '#f5f1ec', white: '#ffffff', black: '#171412', navy: '#24303e', beige: '#d6c6b2',
      gray: '#8a8a8a', grey: '#8a8a8a', yellow: '#d9a33b', wine: '#6e2438', pink: '#e7a9b8',
      blue: '#4a69a2', brown: '#6b4a35', cream: '#f2ebdf', mint: '#cfe0d6', red: '#b02a33',
      green: '#2e5b42', blush: '#ebc4cb', burgundy: '#7a2236', emerald: '#1f6b5a', rust: '#b4513a',
      olive: '#5c6642', camel: '#b98e5f', natural: '#d9c9a8', sky: '#7eb6d6', sage: '#a7b79a',
    };
    return swatchMap[value.toLowerCase()] || '#d8d8d8';
  };

  const renderGracefulOptionGroup = (group: { name: string; values: string[] }) => (
    <div key={group.name} className="mt-6">
      <p className="text-[15px] font-medium text-[#171717]">
        {group.name}: <span className="font-normal text-[#575757]">{selectedAttributes[group.name] || group.values[0]}</span>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        {group.values.map((value) => {
          const isActive = (selectedAttributes[group.name] || group.values[0]) === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                const nextAttributes = { ...selectedAttributes, [group.name]: value };
                setSelectedAttributes(nextAttributes);
                syncPdpSelection({ productId: product.id, attributes: nextAttributes });
              }}
              className={`min-w-[56px] rounded-[8px] border px-5 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'border-[#e36745] bg-[#e36745] text-white'
                  : 'border-black/[0.12] bg-white text-[#171717] hover:border-[#171717]'
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full" dir={prefersArabicCopy ? 'rtl' : 'ltr'}>
      <h1 className="font-heading text-[1.9rem] font-semibold leading-tight text-[#171717] md:text-[2.4rem]">
        {product.name}
      </h1>
      <div className="mt-4 h-px w-full bg-[#171717]/25" />

      <div className="mt-5 flex items-baseline gap-3">
        <span className="font-heading text-[1.7rem] font-semibold text-[#171717]">{displayPrice}</span>
        {originalPrice ? (
          <span className="text-[15px] text-[#9a9a9a] line-through">{originalPrice}</span>
        ) : null}
      </div>
      <p className="mt-1.5 text-xs text-[#8a8a8a]">
        Taxes included.{' '}
        <a href="./shipping" className="underline underline-offset-2 hover:text-[#171717]">
          Shipping
        </a>{' '}
        calculated at checkout.
      </p>

      {gracefulOtherGroups.map(renderGracefulOptionGroup)}
      {gracefulColorGroup ? (
        <div className="mt-6">
          <p className="text-[15px] font-medium text-[#171717]">
            {gracefulColorGroup.name}: <span className="font-normal text-[#575757]">{selectedAttributes[gracefulColorGroup.name] || gracefulColorGroup.values[0]}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {gracefulColorGroup.values.map((value) => {
              const isActive = (selectedAttributes[gracefulColorGroup.name] || gracefulColorGroup.values[0]) === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={value}
                  title={value}
                  onClick={() => {
                    const nextAttributes = { ...selectedAttributes, [gracefulColorGroup.name]: value };
                    setSelectedAttributes(nextAttributes);
                    syncPdpSelection({ productId: product.id, attributes: nextAttributes });
                  }}
                  className={`h-9 w-9 rounded-md border transition-all duration-200 ${
                    isActive
                      ? 'border-[#171717] shadow-[0_0_0_2px_#fff_inset,0_0_0_1.5px_#171717]'
                      : 'border-black/[0.14] hover:border-black/40'
                  }`}
                  style={{ backgroundColor: gracefulSwatchHex(value) }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
      {gracefulSizeGroup ? renderGracefulOptionGroup(gracefulSizeGroup) : null}

      <div className="mt-6">
        <a
          href={rawSizeGuideHref || '/size-guide'}
          className="inline-flex items-center gap-2 text-sm text-[#171717] underline-offset-4 hover:underline"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
            <path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M3 12h18" />
          </svg>
          Size chart
        </a>
      </div>

      <div className="mt-7">
        <p className="text-[15px] font-medium text-[#171717]">Quantity:</p>
        <div className="mt-3 inline-flex items-center rounded-[10px] bg-[#eeeeee]">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-5 py-3.5 text-lg text-[#575757] transition-colors hover:text-[#171717]"
          >
            −
          </button>
          <span className="min-w-[64px] text-center text-sm font-semibold text-[#171717]">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity(quantity + 1)}
            className="px-5 py-3.5 text-lg text-[#575757] transition-colors hover:text-[#171717]"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="inline-flex h-[52px] items-center justify-center rounded-[6px] bg-[#111111] text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-black"
        >
          Add to cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="inline-flex h-[52px] items-center justify-center rounded-[6px] bg-[#1e9de7] text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#0f8ad2]"
        >
          Buy it now
        </button>
      </div>

      <div className="mt-7">
        <p className="text-[15px] font-medium text-[#171717]">Payments Methods:</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {gracefulPayments.map((label) => (
            <span
              key={label}
              className="inline-flex h-7 min-w-[46px] items-center justify-center rounded-[5px] border border-black/[0.08] bg-white px-2 text-[9px] font-black uppercase italic tracking-tight text-[#1a1a6e]"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {product.description ? (
        <div className="mt-7">
          <div
            className="text-[15px] leading-8 text-[#3f3f3f]"
            dangerouslySetInnerHTML={{ __html: sanitizeStorefrontHtml(product.description) }}
          />
        </div>
      ) : null}

      <div className="mt-7 flex items-center gap-4 border-t border-black/[0.06] pt-5">
        <span className="text-[15px] font-medium text-[#171717]">Share:</span>
        {gracefulShares.map((share) => (
          <a
            key={share.name}
            href={share.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Share on ${share.name}`}
            className="text-[#575757] transition-colors hover:text-[#171717]"
          >
            {share.icon}
          </a>
        ))}
      </div>
    </div>
  );
};

export default SoftGracefulBuybox;

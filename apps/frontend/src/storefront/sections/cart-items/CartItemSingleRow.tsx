import React from 'react';
import QuantitySelector from '../../components/QuantitySelector';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import { formatStorefrontCurrency } from '../../utils/currency';
import { getCartItemImageCandidates } from '../../utils/productImages';
import type { getCartDisplayEntries } from '../../utils/cartQuantityOffers';

type SingleCartEntry = Extract<ReturnType<typeof getCartDisplayEntries>[number], { type: 'single' }>;

export interface CartItemSingleRowProps {
  entry: SingleCartEntry;
  rowClassName: string;
  isWomenFashionCart: boolean;
  isWardrobeKhemet: boolean;
  imageWrapperClassName: string;
  hasServiceCartTone: boolean;
  isButcherCart: boolean;
  themeDirection?: string;
  isMarketCart: boolean;
  isNatureCart: boolean;
  priceLabel: string;
  totalLabel: string;
  removeLabel: string;
  currency: string;
  removeButtonClassName: string;
  getItemName: (item: { name?: string; productId?: string; id?: string }) => string;
  getAttributeEntries: (attributes?: Record<string, string>) => [string, string][];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}

export const CartItemSingleRow: React.FC<CartItemSingleRowProps> = ({
  entry,
  rowClassName,
  isWomenFashionCart,
  isWardrobeKhemet,
  imageWrapperClassName,
  hasServiceCartTone,
  isButcherCart,
  themeDirection,
  isMarketCart,
  isNatureCart,
  priceLabel,
  totalLabel,
  removeLabel,
  currency,
  removeButtonClassName,
  getItemName,
  getAttributeEntries,
  updateQuantity,
  removeItem,
}) => {
  const itemName = getItemName(entry.item);
  const attributeEntries = getAttributeEntries(entry.item.attributes);

  return (
    <div key={entry.key} className={rowClassName}>
      <div
        className={`flex ${
          isWomenFashionCart
            ? 'items-start gap-3.5'
            : isWardrobeKhemet
            ? 'items-start gap-5'
            : 'items-center gap-4'
        }`}
      >
        <div className={imageWrapperClassName}>
          <StorefrontProductImage
            candidates={getCartItemImageCandidates(entry.item)}
            alt={itemName}
            loading="lazy"
            width={isWardrobeKhemet ? '140' : '80'}
            height={isWardrobeKhemet ? '140' : '80'}
            className="h-full w-full object-cover"
            fallback="IMG"
          />
        </div>
        <div className={isWomenFashionCart ? 'space-y-0.5' : isWardrobeKhemet ? 'space-y-1' : undefined}>
          <h3
            className={`font-heading text-sm text-foreground ${
              isWomenFashionCart ? 'font-bold leading-5' : 'font-semibold'
            } ${isWardrobeKhemet ? 'text-lg font-bold leading-7' : ''}`}
          >
            {itemName}
          </h3>
          {hasServiceCartTone ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                  isButcherCart
                    ? 'border-[#c5a059]/40 bg-[#3f0c0d] text-[#c5a059]'
                    : isMarketCart
                    ? 'border-[#f0d4b0] bg-[#fff2df] text-[#8b6037]'
                    : isNatureCart
                    ? 'border-[#dbe3d4] bg-[#edf5e8] text-[#4a6843]'
                    : 'border-[#ead8b1] bg-[#fff8ea] text-[#6d5527]'
                }`}
              >
                {isButcherCart
                  ? themeDirection === 'rtl'
                    ? 'درجة الأتيليه'
                    : 'ATELIER GRADE'
                  : isMarketCart
                  ? 'تجهيز واضح'
                  : isNatureCart
                  ? 'متابعة هادئة'
                  : 'فحص قبل الشحن'}
              </span>
              <span
                className={`inline-flex rounded-full border bg-white px-2.5 py-1 text-[10px] font-semibold ${
                  isButcherCart
                    ? 'border-[#c5a059]/40 text-[#3f0c0d]'
                    : isMarketCart
                    ? 'border-[#f0d4b0] text-[#9a6c41]'
                    : isNatureCart
                    ? 'border-[#dbe3d4] text-[#5b7c54]'
                    : 'border-[#efdfbe] text-[#7c6430]'
                }`}
              >
                {isButcherCart
                  ? themeDirection === 'rtl'
                    ? 'مقطع يدويًا'
                    : 'HAND-CUT SELECTION'
                  : isNatureCart
                  ? 'تغليف مناسب'
                  : 'تغليف محمي'}
              </span>
            </div>
          ) : null}
          {attributeEntries.map(([key, value]) => (
            <p
              key={key}
              className={`text-xs text-muted-foreground ${
                isWomenFashionCart ? 'mt-0 leading-5' : 'mt-0.5'
              } ${isWardrobeKhemet ? 'text-[13px] leading-6' : ''}`}
            >
              {key}: {value}
            </p>
          ))}
          {entry.pricing.totalDiscount > 0 ? (
            <p className="mt-1 text-xs font-medium text-emerald-600">
              تم تطبيق خصم الكمية
            </p>
          ) : null}
        </div>
      </div>

      <div className={`text-foreground ${isWomenFashionCart ? 'text-[13px]' : 'text-sm'}`}>
        <span className="mr-2 text-xs text-muted-foreground md:hidden">
          {priceLabel}:
        </span>
        <span>{formatStorefrontCurrency(entry.pricing.effectiveUnitPrice, currency)}</span>
        {entry.pricing.totalDiscount > 0 ? (
          <span className="ml-2 text-xs text-muted-foreground line-through">
            {formatStorefrontCurrency(entry.pricing.baseUnitPrice, currency)}
          </span>
        ) : null}
      </div>

      <div>
        <QuantitySelector
          value={entry.item.quantity}
          onChange={(quantity) => updateQuantity(entry.item.id, quantity)}
        />
      </div>

      <div className={`font-semibold text-foreground ${isWomenFashionCart ? 'text-[13px]' : 'text-sm'}`}>
        <span className="mr-2 text-xs font-normal text-muted-foreground md:hidden">
          {totalLabel}:
        </span>
        {formatStorefrontCurrency(entry.pricing.lineSubtotal, currency)}
      </div>

      <button
        onClick={() => removeItem(entry.item.id)}
        className={removeButtonClassName}
        aria-label={`${removeLabel} ${itemName}`}
        title={removeLabel}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
};

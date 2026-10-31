import React from 'react';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import { formatStorefrontCurrency } from '../../utils/currency';
import { getCartItemImageCandidates } from '../../utils/productImages';
import type { getCartDisplayEntries } from '../../utils/cartQuantityOffers';

type BundleCartEntry = Extract<ReturnType<typeof getCartDisplayEntries>[number], { type: 'bundle' }>;

export interface CartItemOfferGroupRowProps {
  entry: BundleCartEntry;
  rowClassName: string;
  isBiteRush: boolean;
  isPharmacy: boolean;
  isWomenFashionCart: boolean;
  variant: string;
  priceLabel: string;
  quantityLabel: string;
  totalLabel: string;
  currency: string;
  removeButtonClassName: string;
  removeLabel: string;
  getItemName: (item: { name?: string; productId?: string; id?: string }) => string;
  getAttributeEntries: (attributes?: Record<string, string>) => [string, string][];
  removeQuantityOfferGroup: (groupId: string) => void;
}

export const CartItemOfferGroupRow: React.FC<CartItemOfferGroupRowProps> = ({
  entry,
  rowClassName,
  isBiteRush,
  isPharmacy,
  isWomenFashionCart,
  variant,
  priceLabel,
  quantityLabel,
  totalLabel,
  currency,
  removeButtonClassName,
  removeLabel,
  getItemName,
  getAttributeEntries,
  removeQuantityOfferGroup,
}) => {
  return (
    <div key={entry.key} className={rowClassName}>
      <div className="space-y-3 md:col-span-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
              isBiteRush
                ? 'bg-[#111111] text-white'
                : isPharmacy
                ? 'bg-[#0f766e] text-white'
                : isWomenFashionCart
                ? 'border border-[#f3c8c1] bg-[#fff2ee] text-[#8b3d33]'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {isPharmacy ? 'عرض موفّر' : 'عرض الكمية'}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              isBiteRush
                ? 'border border-[#f8c08c] bg-[#fff1e2] text-[#8a4b1f]'
                : isPharmacy
                ? 'border border-[#99f6e4] bg-[#e6fffa] text-[#115e59]'
                : isWomenFashionCart
                ? 'border border-[#f1dfdc] bg-white text-[#8b5f59]'
                : 'bg-secondary text-foreground'
            }`}
          >
            {entry.group.selectedPieces} قطعة
          </span>
          {entry.group.freeShipping ? (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black text-emerald-600">
              شحن مجاني
            </span>
          ) : null}
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold text-foreground">
            {entry.group.offerLabel}
          </h3>
          <div className={`mt-3 ${isWomenFashionCart ? 'space-y-2.5' : 'space-y-3'}`}>
            {entry.group.items.map(({ item }, index) => {
              const itemName = getItemName(item);
              const attributeEntries = getAttributeEntries(item.attributes);

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-[1rem] ${
                    isWomenFashionCart ? 'p-2.5' : 'p-3'
                  } ${
                    isBiteRush
                      ? 'border border-[#f8c08c] bg-white/80'
                      : isPharmacy
                      ? 'border border-[#99f6e4] bg-white/90'
                      : isWomenFashionCart
                      ? 'border border-[#f1dfdc] bg-[#fffaf8]'
                      : 'border border-border/60 bg-background/60'
                  }`}
                >
                  <div
                    className={`${
                      variant === 'compact' ? 'h-12 w-12' : 'h-14 w-14'
                    } flex shrink-0 items-center justify-center overflow-hidden rounded-[0.85rem] ${
                      isBiteRush
                        ? 'bg-[#fff1e2] text-[#a14a14]'
                        : isPharmacy
                        ? 'bg-[#e6fffa] text-[#115e59]'
                        : 'bg-muted text-xs text-muted-foreground'
                    }`}
                  >
                    <StorefrontProductImage
                      candidates={getCartItemImageCandidates(item)}
                      alt={itemName}
                      loading="lazy"
                      width="56"
                      height="56"
                      className="h-full w-full object-cover"
                      fallback="IMG"
                    />
                  </div>
                  <div className={isWomenFashionCart ? 'space-y-0.5' : 'space-y-1'}>
                    <p className="text-xs font-black text-foreground">
                      القطعة {item.quantityOffer?.slotIndex || index + 1}
                    </p>
                    {attributeEntries.map(([key, value]) => (
                      <p key={key} className="text-xs text-muted-foreground">
                        {key}: {value}
                      </p>
                    ))}
                    {item.quantity > 1 ? (
                      <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-sm text-foreground">
        <span className="mr-2 text-xs text-muted-foreground md:hidden">
          {priceLabel}:
        </span>
        <span>عرض خاص</span>
      </div>

      <div className="text-sm text-foreground">
        <span className="mr-2 text-xs text-muted-foreground md:hidden">
          {quantityLabel}:
        </span>
        <span>{entry.group.selectedPieces}</span>
      </div>

      <div className="text-sm font-semibold text-foreground">
        <span className="mr-2 text-xs font-normal text-muted-foreground md:hidden">
          {totalLabel}:
        </span>
        <span>{formatStorefrontCurrency(entry.group.subtotal, currency)}</span>
        {entry.group.totalDiscount > 0 ? (
          <p className="mt-1 text-xs font-medium text-emerald-600">
            وفرت {formatStorefrontCurrency(entry.group.totalDiscount, currency)}
          </p>
        ) : null}
      </div>

      <button
        onClick={() => removeQuantityOfferGroup(entry.group.groupId)}
        className={removeButtonClassName}
        aria-label={`${removeLabel} ${entry.group.offerLabel}`}
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

import React from 'react';

export interface CartItemsHeaderProps {
  headerWrapperClassName: string;
  isBiteRush: boolean;
  isSproutRoom: boolean;
  isPharmacy: boolean;
  isMarketCart: boolean;
  isNatureCart: boolean;
  isCommandCart: boolean;
  isWomenFashionCart: boolean;
  variant: string;
  headerBadge?: string;
  pharmacyBrandName: string;
  title: string;
  subtitle: string;
  hasServiceCartTone: boolean;
  serviceHighlights: string[];
  countBadgeClassName: string;
  displayEntriesCount: number;
  serviceNoteLabel: string;
  serviceNote: string;
}

export const CartItemsHeader: React.FC<CartItemsHeaderProps> = ({
  headerWrapperClassName,
  isBiteRush,
  isSproutRoom,
  isPharmacy,
  isMarketCart,
  isNatureCart,
  isCommandCart,
  isWomenFashionCart,
  variant,
  headerBadge,
  pharmacyBrandName,
  title,
  subtitle,
  hasServiceCartTone,
  serviceHighlights,
  countBadgeClassName,
  displayEntriesCount,
  serviceNoteLabel,
  serviceNote,
}) => {
  return (
    <div className={headerWrapperClassName}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          {isBiteRush ? (
            <span className="inline-flex rounded-full bg-[#111111] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              سلة BiteRush
            </span>
          ) : isSproutRoom ? (
            <span className="inline-flex rounded-full border border-[#d8e6d8] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#43604b]">
              {headerBadge}
            </span>
          ) : isPharmacy ? (
            <span className="inline-flex rounded-full bg-[#0f766e] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {`سلة ${pharmacyBrandName}`}
            </span>
          ) : isMarketCart ? (
            <span className="inline-flex rounded-full border border-[#f0d4b0] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b6037]">
              {headerBadge}
            </span>
          ) : isNatureCart ? (
            <span className="inline-flex rounded-full border border-[#dbe3d4] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#4a6843]">
              {headerBadge}
            </span>
          ) : isCommandCart ? (
            <span className="inline-flex rounded-full border border-[#e7d7b6] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#6d5527]">
              {headerBadge}
            </span>
          ) : isWomenFashionCart ? (
            <span className="inline-flex rounded-full border border-[#f3c8c1] bg-[#fff2ee] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#8b3d33]">
              مراجعة السلة
            </span>
          ) : variant === 'wardrobe-cart' ? (
            <span className="inline-flex rounded-full border border-[#f3c8c1] bg-[#fff2ee] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b3d33]">
              مراجعة السلة
            </span>
          ) : null}

          <h2
            className={`font-heading font-black tracking-tight text-foreground ${
              isWomenFashionCart ? 'text-xl sm:text-[1.65rem]' : 'text-2xl'
            }`}
          >
            {title}
          </h2>

          <p
            className={`max-w-2xl text-sm text-muted-foreground ${
              isWomenFashionCart ? 'leading-6' : 'leading-7'
            }`}
          >
            {subtitle}
          </p>

          {hasServiceCartTone && serviceHighlights.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {serviceHighlights.map((item) => (
                <span
                  key={item}
                  className={`inline-flex rounded-full border bg-white/95 px-3 py-1 text-[11px] font-semibold ${
                    isMarketCart
                      ? 'border-[#f0d4b0] text-[#8b6037]'
                      : isNatureCart
                        ? 'border-[#dbe3d4] text-[#4a6843]'
                        : 'border-[#ead8b1] text-[#6d5527]'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <span className={countBadgeClassName}>
          {displayEntriesCount}{' '}
          {isPharmacy
            ? 'عناصر جاهزة'
            : isMarketCart
              ? 'عناصر للمراجعة'
              : isNatureCart
                ? 'اختيارات جاهزة'
                : isCommandCart
                  ? 'وحدات للمراجعة'
                  : 'منتجات'}
        </span>
      </div>

      {hasServiceCartTone ? (
        <div
          className={`mt-4 rounded-[1.4rem] bg-white/88 p-4 text-sm shadow-[0_18px_50px_-42px_rgba(90,62,24,0.16)] ${
            isMarketCart
              ? 'border border-[#f0d4b0] text-[#7b5531] shadow-[0_18px_50px_-42px_rgba(154,93,34,0.12)]'
              : isNatureCart
                ? 'border border-[#dbe3d4] text-[#4a6843] shadow-[0_18px_50px_-42px_rgba(26,51,40,0.12)]'
                : 'border border-[#ecdcbf] text-[#5b4a28]'
          }`}
        >
          <p
            className={`text-[11px] font-black uppercase tracking-[0.18em] ${
              isMarketCart
                ? 'text-[#a36a34]'
                : isNatureCart
                  ? 'text-[#5b7c54]'
                  : 'text-[#8d6a2c]'
            }`}
          >
            {serviceNoteLabel}
          </p>
          <p className="mt-1 leading-7">{serviceNote}</p>
        </div>
      ) : null}
    </div>
  );
};

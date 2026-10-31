import React from 'react';
import { formatStorefrontCurrency } from '../../utils/currency';
import { getVariantAttributeLabel } from '../../utils/variants';
import type { OrderQuantityOfferItem } from '../../utils/orderQuantityOffers';

interface OrderGroup {
  groupId: string;
  offerLabel: string;
  selectedPieces: number;
  freeShipping?: boolean;
  total: number;
  items: OrderQuantityOfferItem[];
}

interface QuantityOfferSummary {
  groups: OrderGroup[];
  singles: OrderQuantityOfferItem[];
}

interface OrderConfirmationItemsRecapProps {
  recapPanelClassName: string;
  accentOverlineClassName: string;
  isSoftAftercare: boolean;
  recapGridClassName: string;
  quantityOfferSummary: QuantityOfferSummary;
  singleSummaryCardClassName: string;
  offerPrimaryChipClassName: string;
  offerSecondaryChipClassName: string;
  offerFreeShippingChipClassName: string;
  currency: string;
  orderItemCardClassName: string;
  orderAttributeChipClassName: string;
  prefersArabicCopy: boolean;
  getDisplayItemName: (item: OrderQuantityOfferItem) => string;
  getDisplayItemAttributes: (item: OrderQuantityOfferItem) => Record<string, string>;
}

export const OrderConfirmationItemsRecap: React.FC<OrderConfirmationItemsRecapProps> = ({
  recapPanelClassName,
  accentOverlineClassName,
  isSoftAftercare,
  recapGridClassName,
  quantityOfferSummary,
  singleSummaryCardClassName,
  offerPrimaryChipClassName,
  offerSecondaryChipClassName,
  offerFreeShippingChipClassName,
  currency,
  orderItemCardClassName,
  orderAttributeChipClassName,
  prefersArabicCopy,
  getDisplayItemName,
  getDisplayItemAttributes,
}) => {
  return (
    <div className={recapPanelClassName}>
      <div className="space-y-2">
        <p className={`text-xs font-black uppercase tracking-[0.22em] ${accentOverlineClassName}`}>
          {isSoftAftercare ? 'القطع المختارة' : 'ملخص الطلب'}
        </p>
        <h2 className="font-heading text-2xl font-black tracking-tight text-foreground">
          {isSoftAftercare ? 'تفاصيل الطلب والاختيارات' : 'ملخص المنتجات والعروض'}
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          {isSoftAftercare
            ? 'نراجع هنا القطع التي ثبتت في الطلب حتى تبقى الصورة كاملة وواضحة قبل التوصيل.'
            : 'كل عرض كميات يظهر هنا كباقة واحدة، مع القطع التي تم اختيارها داخل العرض.'}
        </p>
      </div>

      <div className={recapGridClassName}>
        {quantityOfferSummary.groups.map((group) => (
          <div key={group.groupId} className={singleSummaryCardClassName}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={offerPrimaryChipClassName}>عرض كميات</span>
                  <span className={offerSecondaryChipClassName}>
                    <span className="tabular-nums">{group.selectedPieces}</span> قطعة
                  </span>
                  {group.freeShipping ? (
                    <span className={offerFreeShippingChipClassName}>شحن مجاني</span>
                  ) : null}
                </div>
                <h3 className="text-base font-black text-foreground">{group.offerLabel}</h3>
              </div>
              <div className="text-end">
                <p className="text-xs text-muted-foreground">إجمالي العرض</p>
                <p className="text-lg font-black text-foreground tabular-nums">
                  {formatStorefrontCurrency(group.total, currency)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {group.items.map((item, index) => (
                <div
                  key={`${group.groupId}-${item.id}-${index}`}
                  className={orderItemCardClassName}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        القطعة <span className="tabular-nums">{item.quantityOffer?.slotIndex || index + 1}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{getDisplayItemName(item)}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {formatStorefrontCurrency(
                        Number(item.price || 0) * Number(item.quantity || 0),
                        currency,
                      )}
                    </p>
                  </div>
                  {Object.entries(getDisplayItemAttributes(item)).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(getDisplayItemAttributes(item)).map(([key, value]) => (
                        <span
                          key={`${group.groupId}-${item.id}-${key}`}
                          className={orderAttributeChipClassName}
                        >
                          {getVariantAttributeLabel(key, prefersArabicCopy)}: {value}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}

        {quantityOfferSummary.singles.length > 0 ? (
          <div className={singleSummaryCardClassName}>
            <div className="space-y-1">
              <p className={`text-xs font-black uppercase tracking-[0.22em] ${accentOverlineClassName}`}>
                {isSoftAftercare ? 'كل قطعة على حدة' : 'المنتجات الفردية'}
              </p>
              <h3 className="text-base font-black text-foreground">
                {isSoftAftercare ? 'القطع التي ثبتت في الطلب' : 'القطع التي تم طلبها منفصلة'}
              </h3>
            </div>

            <div className="space-y-3">
              {quantityOfferSummary.singles.map((item, index) => (
                <div key={`single-${item.id}-${index}`} className={orderItemCardClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{getDisplayItemName(item)}</p>
                      <p className="text-xs text-muted-foreground">
                        الكمية: <span className="tabular-nums">{item.quantity}</span>
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {formatStorefrontCurrency(
                        Number(item.price || 0) * Number(item.quantity || 0),
                        currency,
                      )}
                    </p>
                  </div>
                  {Object.entries(getDisplayItemAttributes(item)).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(getDisplayItemAttributes(item)).map(([key, value]) => (
                        <span
                          key={`single-${item.id}-${key}`}
                          className={orderAttributeChipClassName}
                        >
                          {getVariantAttributeLabel(key, prefersArabicCopy)}: {value}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrderConfirmationItemsRecap;

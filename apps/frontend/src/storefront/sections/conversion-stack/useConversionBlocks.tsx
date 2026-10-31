import React from 'react';
import VolumeDiscountBadge from '../../../components/VolumeDiscountBadge';
import BackInStockSignupCard from '../../components/BackInStockSignupCard';
import TrustedBadgePanel from '../../components/TrustedBadgePanel';

import CountdownBlock from '../ConversionBlocks/CountdownBlock';
import LowStockBlock from '../ConversionBlocks/LowStockBlock';
import DeliveryBlock from '../ConversionBlocks/DeliveryBlock';
import FakeVisitorBlock from '../ConversionBlocks/FakeVisitorBlock';
import SoldCounterBlock from '../ConversionBlocks/SoldCounterBlock';
import PurchaseFomoBlock from '../ConversionBlocks/PurchaseFomoBlock';
import PreOrderBlock from '../ConversionBlocks/PreOrderBlock';

import {
  resolveDirectionalCopy,
  type ConversionBlock,
  type ConversionStackVariant,
  type ConversionUrgencyBlock,
  type JsonRecord,
  type StandaloneConversionBlockId,
  type UrgencyBlockId,
} from './types';

export interface UseConversionBlocksParams {
  showEstimatedDelivery: boolean;
  estimatedDeliveryStyle: 'card' | 'timeline' | 'pill';
  estimatedDeliveryLabel: string;
  deliveryRange: string;
  isNovaMobile: boolean;
  showPreOrder: boolean;
  dominantUrgencyId: UrgencyBlockId | null;
  preOrderTitle: string;
  preOrderDescription: string;
  showBackInStock: boolean;
  product: any;
  backInStockStyle: 'panel' | 'inline' | 'accent';
  copy: JsonRecord;
  prefersArabicCopy: boolean;
  variant: ConversionStackVariant;
  showTrustedBadges: boolean;
  trustedBadgeStyle: 'grid' | 'minimal' | 'perfume-minimal' | 'strip';
  trustedBadgeItems: string[];
  trustedBadgeTitle: string;
  trustedBadgeSubtitle: string;
  showCountdown: boolean;
  countdownLabel: string;
  countdownSummary: string;
  showLowStock: boolean;
  lowStockDisplayCount: number | null;
  lowStockLabel: string;
  lowStockStyle: 'alert' | 'meter' | 'minimal';
  lowStockProgress: number;
  showSoldCounter: boolean;
  soldCount: number;
  soldCounterMessage: string;
  showPurchaseFomo: boolean;
  purchaseFomoCount: number;
  purchaseFomoMessage: string;
  showFakeVisitor: boolean;
  viewerCount: number;
  fakeVisitorMessage: string;
  showUrgencyTicker: boolean;
  showPulseRow: boolean;
  showConfidenceGrid: boolean;
  standaloneBlockId: StandaloneConversionBlockId | null;
  bulkSavingsEnabled: boolean;
}

export const useConversionBlocks = (p: UseConversionBlocksParams) => {
  // Primary Blocks Assembly
  const primaryBlocks: ConversionBlock[] = [];
  if (p.showEstimatedDelivery) {
    primaryBlocks.push({
      id: 'delivery',
      node: (
        <DeliveryBlock
          key="delivery"
          style={p.estimatedDeliveryStyle}
          label={p.estimatedDeliveryLabel}
          range={p.deliveryRange}
          headerLabel={p.isNovaMobile ? 'موعد الوصول التقديري' : undefined}
        />
      ),
      wrapperClassName: p.isNovaMobile ? 'col-span-2' : undefined,
    });
  }
  if (p.showPreOrder && p.dominantUrgencyId !== 'pre-order') {
    primaryBlocks.push({
      id: 'pre-order',
      node: (
        <PreOrderBlock
          key="pre-order-primary"
          mode="primary"
          title={p.preOrderTitle}
          description={p.preOrderDescription}
        />
      ),
    });
  }
  if (p.showBackInStock && p.product) {
    primaryBlocks.push({
      id: 'back-in-stock',
      node: (
        <BackInStockSignupCard
          key="back-in-stock"
          className="h-full"
          productId={p.product.id}
          productName={p.product.name}
          variant={p.backInStockStyle}
          title={resolveDirectionalCopy({
            value: p.copy['backInStockTitle'],
            englishFallback: "Notify me when it's back",
            arabicFallback: 'نبهني عند توفره مرة أخرى',
            prefersArabicCopy: p.prefersArabicCopy,
          })}
          description={String(
            p.copy['backInStockDescription'] ||
              (p.prefersArabicCopy
                ? 'اترك اسمك مع البريد أو الهاتف وسنخبرك فور عودة المخزون.'
                : "Leave your name plus email or phone and we'll let you know once inventory returns."),
          )}
          successMessage={String(
            p.copy['backInStockSuccessMessage'] ||
              (p.prefersArabicCopy
                ? 'تم تسجيلك في قائمة الانتظار. سنخبرك عند عودة المنتج للمخزون.'
                : "You're on the waitlist. We'll let you know when this product is back in stock."),
          )}
        />
      ),
      wrapperClassName: p.variant === 'minimal' ? undefined : 'sm:col-span-2',
    });
  }
  if (p.showTrustedBadges) {
    primaryBlocks.push({
      id: 'trusted-badges',
      node: (
        <TrustedBadgePanel
          key="trusted-badges"
          variant={p.trustedBadgeStyle}
          title={p.trustedBadgeTitle}
          subtitle={p.trustedBadgeSubtitle}
          items={p.trustedBadgeItems}
        />
      ),
      wrapperClassName: p.isNovaMobile
        ? 'col-span-2'
        : p.variant === 'minimal'
          ? undefined
          : 'sm:col-span-2',
    });
  }

  // Urgency Blocks Assembly
  const urgencyBlocks: ConversionUrgencyBlock[] = [];
  if (p.showCountdown) {
    urgencyBlocks.push({
      id: 'countdown',
      dominantNode: (
        <CountdownBlock
          key="countdown-dominant"
          label={p.countdownLabel}
          summary={p.countdownSummary}
        />
      ),
      secondaryNode: (
        <CountdownBlock
          key="countdown-secondary"
          label={p.countdownLabel}
          summary={p.countdownSummary}
        />
      ),
    });
  }
  if (p.showLowStock) {
    urgencyBlocks.push({
      id: 'low-stock',
      dominantNode: (
        <LowStockBlock
          key="low-stock-dominant"
          count={p.lowStockDisplayCount || 0}
          label={p.lowStockLabel}
          style={p.lowStockStyle}
          progress={p.lowStockProgress}
        />
      ),
      secondaryNode: (
        <LowStockBlock
          key="low-stock-secondary"
          count={p.lowStockDisplayCount || 0}
          label={p.lowStockLabel}
          style={p.lowStockStyle}
          progress={p.lowStockProgress}
        />
      ),
    });
  }
  if (p.showPreOrder) {
    urgencyBlocks.push({
      id: 'pre-order',
      dominantNode: (
        <PreOrderBlock
          key="pre-order-dominant"
          mode="dominant"
          title={p.preOrderTitle}
          description={p.preOrderDescription}
        />
      ),
      secondaryNode: (
        <PreOrderBlock
          key="pre-order-secondary"
          mode="primary"
          title={p.preOrderTitle}
          description={p.preOrderDescription}
        />
      ),
    });
  }
  if (p.showSoldCounter) {
    urgencyBlocks.push({
      id: 'sold-counter',
      dominantNode: (
        <SoldCounterBlock
          key="sold-counter-dominant"
          count={p.soldCount}
          message={p.soldCounterMessage}
        />
      ),
      secondaryNode: (
        <SoldCounterBlock
          key="sold-counter-secondary"
          count={p.soldCount}
          message={p.soldCounterMessage}
        />
      ),
    });
  }
  if (p.showPurchaseFomo) {
    urgencyBlocks.push({
      id: 'purchase-fomo',
      dominantNode: (
        <PurchaseFomoBlock
          key="purchase-fomo-dominant"
          count={p.purchaseFomoCount}
          message={p.purchaseFomoMessage}
        />
      ),
      secondaryNode: (
        <PurchaseFomoBlock
          key="purchase-fomo-secondary"
          count={p.purchaseFomoCount}
          message={p.purchaseFomoMessage}
        />
      ),
    });
  }
  if (p.showFakeVisitor) {
    urgencyBlocks.push({
      id: 'fake-visitor',
      dominantNode: (
        <FakeVisitorBlock
          key="fake-visitor-dominant"
          count={p.viewerCount}
          message={p.fakeVisitorMessage}
        />
      ),
      secondaryNode: (
        <FakeVisitorBlock
          key="fake-visitor-secondary"
          count={p.viewerCount}
          message={p.fakeVisitorMessage}
        />
      ),
    });
  }

  const dominantUrgency = p.showUrgencyTicker
    ? urgencyBlocks.find((block) => block.id === p.dominantUrgencyId) || null
    : null;

  const secondaryProofBlocks = p.showPulseRow
    ? urgencyBlocks
        .filter((block) => block.id !== p.dominantUrgencyId)
        .map<ConversionBlock>((block) => ({
          id: block.id,
          node: block.secondaryNode,
        }))
    : [];

  const visiblePrimaryBlocks = p.showConfidenceGrid ? primaryBlocks : [];

  const standaloneSectionNode =
    p.standaloneBlockId === 'bulk-savings'
      ? p.bulkSavingsEnabled && p.product?.id
        ? <VolumeDiscountBadge productId={p.product.id} quantity={1} />
        : null
      : primaryBlocks.find((block) => block.id === p.standaloneBlockId)?.node ||
        urgencyBlocks.find((block) => block.id === p.standaloneBlockId)?.dominantNode ||
        null;

  return {
    primaryBlocks,
    urgencyBlocks,
    dominantUrgency,
    secondaryProofBlocks,
    visiblePrimaryBlocks,
    standaloneSectionNode,
  };
};

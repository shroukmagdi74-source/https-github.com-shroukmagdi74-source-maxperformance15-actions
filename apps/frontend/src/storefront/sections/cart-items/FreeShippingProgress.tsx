import React from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { formatStorefrontCurrency } from '../../utils/currency';

export interface FreeShippingProgressProps {
  total: number;
  threshold: number;
  currency: string;
  isBiteRush?: boolean;
  isPharmacy?: boolean;
  isCommandCart?: boolean;
}

export const FreeShippingProgress: React.FC<FreeShippingProgressProps> = ({
  total,
  threshold,
  currency,
  isBiteRush = false,
  isPharmacy = false,
  isCommandCart = false,
}) => {
  const progress = Math.min((total / threshold) * 100, 100);
  const remaining = Math.max(threshold - total, 0);
  const title =
    progress >= 100
      ? isPharmacy
        ? 'مبروك! التوصيل علينا'
        : isCommandCart
          ? 'تم تفعيل الشحن المحمي'
        : 'مبروك! شحنك مجاني'
      : isPharmacy
        ? 'توصيل مجاني للطلبات الأكبر'
        : isCommandCart
          ? 'شحن محمي للأجهزة'
        : 'خدمة الشحن المجاني';
  const description =
    progress >= 100
      ? isPharmacy
        ? 'الطلب الحالي وصل لحد التوصيل المجاني وبدأنا نجهزه براحة أكثر.'
        : isCommandCart
          ? 'الطلب الحالي أصبح مؤهلًا لشحن محمي مع متابعة قبل التسليم.'
        : 'لقد وصلت لحد الشحن المجاني بنجاح'
      : isPharmacy
        ? `أضف ${formatStorefrontCurrency(remaining, currency)} ليصل الطلب مجانًا حتى باب البيت`
        : isCommandCart
          ? `أضف ${formatStorefrontCurrency(remaining, currency)} لتفعيل شحن محمي مجاني للأجهزة والإكسسوارات`
        : `أضف ${formatStorefrontCurrency(remaining, currency)} إضافية للحصول على شحن مجاني`;

  return (
    <div
      className={`mb-8 rounded-[2rem] p-6 backdrop-blur-sm ${
        isBiteRush
          ? 'border border-[#f8c08c] bg-[linear-gradient(135deg,#fffaf4_0%,#fff1e4_100%)] shadow-[0_22px_55px_-42px_rgba(247,115,22,0.3)]'
          : isPharmacy
            ? 'border border-[#99f6e4] bg-[linear-gradient(135deg,#f8fffd_0%,#eafaf6_100%)] shadow-[0_22px_55px_-42px_rgba(20,184,166,0.22)]'
          : isCommandCart
            ? 'border border-[#e7d7b6] bg-[linear-gradient(135deg,#fffdf8_0%,#fff7e7_100%)] shadow-[0_22px_55px_-42px_rgba(90,62,24,0.18)]'
          : 'border border-border/50 bg-secondary/30'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isBiteRush
                ? 'bg-[#111111] text-white'
                : isPharmacy
                  ? 'bg-[#0f766e] text-white'
                  : isCommandCart
                    ? 'bg-[#1f1f1b] text-[#f5d68b]'
                  : 'bg-primary/10 text-primary'
            }`}
          >
            <Truck size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">
              {title}
            </h4>
            <p className="text-[11px] text-muted-foreground font-medium">
              {description}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-black ${
            isPharmacy ? 'text-[#0f766e]' : isCommandCart ? 'text-[#6d5527]' : 'text-primary'
          }`}
        >
          {Math.round(progress)}%
        </span>
      </div>

      <div
        className={`relative h-3 w-full overflow-hidden rounded-full p-[2px] ${
          isBiteRush
            ? 'border border-[#f8c08c] bg-white/90'
            : isPharmacy
              ? 'border border-[#99f6e4] bg-white/90'
              : isCommandCart
                ? 'border border-[#ecdab4] bg-white/90'
              : 'border border-border/50 bg-background'
        }`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isBiteRush
              ? 'bg-[linear-gradient(135deg,#f97316_0%,#ef4444_100%)] shadow-[0_0_15px_rgba(249,115,22,0.45)]'
              : isPharmacy
                ? 'bg-[linear-gradient(135deg,#14b8a6_0%,#0f766e_100%)] shadow-[0_0_15px_rgba(20,184,166,0.35)]'
                : isCommandCart
                  ? 'bg-[linear-gradient(135deg,#2b2a25_0%,#8d6a2c_52%,#f0c56a_100%)] shadow-[0_0_15px_rgba(141,106,44,0.35)]'
              : 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]'
          }`}
        />
      </div>
    </div>
  );
};

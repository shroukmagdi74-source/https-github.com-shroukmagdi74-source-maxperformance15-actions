import React from 'react';
import { Timer } from 'lucide-react';

export interface CartTimerProps {
  isBiteRush?: boolean;
  isPharmacy?: boolean;
  isCommandCart?: boolean;
}

export const CartTimer: React.FC<CartTimerProps> = ({
  isBiteRush = false,
  isPharmacy = false,
  isCommandCart = false,
}) => {
  const [timeLeft, setTimeLeft] = React.useState(600); // 10 minutes

  React.useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div
      className={`mb-6 flex items-center justify-center gap-2 rounded-full px-4 py-3 ${
        isBiteRush
          ? 'border border-[#f8c08c] bg-[linear-gradient(135deg,#fff6ec_0%,#fff0df_100%)]'
          : isPharmacy
            ? 'border border-[#99f6e4] bg-[linear-gradient(135deg,#f5fffd_0%,#ecfbf8_100%)]'
            : isCommandCart
              ? 'border border-[#ead8b1] bg-[linear-gradient(135deg,#fffaf0_0%,#fff3da_100%)]'
          : 'border border-amber-200/50 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-950/20'
      }`}
    >
      <Timer
        size={14}
        className={
          isPharmacy
            ? 'animate-pulse text-[#0f766e]'
            : isCommandCart
              ? 'animate-pulse text-[#8d6a2c]'
              : 'text-amber-600 animate-pulse'
        }
      />
      <span
        className={`text-[11px] font-black uppercase tracking-widest ${
          isBiteRush
            ? 'text-[#8a4b1f]'
            : isPharmacy
              ? 'text-[#115e59]'
              : isCommandCart
                ? 'text-[#6d5527]'
            : 'text-amber-900 dark:text-amber-200'
        }`}
      >
        {isPharmacy
          ? 'محتويات الطلب محفوظة لك لمدة:'
          : isCommandCart
            ? 'حجز المخزون والمراجعة محفوظ لك لمدة:'
            : 'العربة محجوزة لك لمدة:'}{' '}
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PaymentOffersHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center size-10 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors"
          aria-label="رجوع"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            عروض الدفع
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            خصومات تُطبّق تلقائياً على الدفع بالبطاقة أو بالمحفظة الإلكترونية في متجرك بالكامل.
          </p>
        </div>
      </div>
    </div>
  );
};

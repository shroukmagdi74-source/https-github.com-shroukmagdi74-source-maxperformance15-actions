import React from 'react';
import { FileSignature } from 'lucide-react';
import { FactoryPortalAssignment } from '../../manufacturingApi';

interface FactoryAgreementCardProps {
  agreementSummary: NonNullable<FactoryPortalAssignment['agreementSummary']>;
}

export const FactoryAgreementCard: React.FC<FactoryAgreementCardProps> = ({
  agreementSummary,
}) => {
  const statusBadge =
    agreementSummary.status === 'ACTIVE'
      ? { label: 'سارية (ACTIVE)', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
      : agreementSummary.status === 'DRAFT'
      ? { label: 'مسودة', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
      : { label: agreementSummary.status, className: 'bg-muted text-muted-foreground border-border' };

  return (
    <div className="border border-border/70 rounded-xl overflow-hidden bg-card p-3.5 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <FileSignature className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                اتفاقية المصنع ({agreementSummary.code})
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block truncate">
              {agreementSummary.title}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] text-muted-foreground block">
            إجمالي قيمة الاتفاقية:
          </span>
          <strong className="text-sm font-bold text-foreground font-mono tabular-nums">
            {agreementSummary.totalValue?.toLocaleString('en-US')}{' '}
            {agreementSummary.currency}
          </strong>
        </div>
      </div>

      {/* Payment Schedule List */}
      {agreementSummary.payments && agreementSummary.payments.length > 0 ? (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-muted-foreground block">
            جدول دفعات المصنع المستحقة:
          </span>
          <div className="divide-y divide-border/40 border border-border/50 rounded-lg overflow-hidden bg-muted/20">
            {agreementSummary.payments.map((p) => (
              <div
                key={p.id}
                className="p-2.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <span className="font-mono text-muted-foreground text-[10px]">
                      #{p.seq}
                    </span>
                    <span>{p.label}</span>
                    {p.percent && (
                      <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                        ({p.percent}%)
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    {p.dueDate && (
                      <span className="tabular-nums">
                        استحقاق: {new Date(p.dueDate).toLocaleDateString('ar-EG')}
                      </span>
                    )}
                    {p.paidAt && (
                      <span className="text-emerald-600 font-medium tabular-nums">
                        سُددت: {new Date(p.paidAt).toLocaleDateString('ar-EG')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="font-mono font-bold text-foreground text-xs block tabular-nums">
                    {p.amount.toLocaleString('en-US')} {agreementSummary.currency}
                  </span>
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      p.status === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : p.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {p.status === 'PAID'
                      ? 'تم السداد (PAID)'
                      : p.status === 'PENDING'
                      ? 'قيد الانتظار'
                      : 'ملغاة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground italic">
          لم يتم تسجيل دفعات مجدولة حتى الآن
        </p>
      )}
    </div>
  );
};

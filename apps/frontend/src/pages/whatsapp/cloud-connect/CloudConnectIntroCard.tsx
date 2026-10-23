import React from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhatsAppSurfaceCard } from '../components/WhatsAppPageShell';

interface CloudConnectIntroCardProps {
  isRtl: boolean;
}

function RequirementItem({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full',
          checked
            ? 'bg-emerald-500/15 text-emerald-600'
            : 'bg-amber-500/15 text-amber-600',
        )}
      >
        {checked ? (
          <CheckCircle2 className="size-3" />
        ) : (
          <AlertCircle className="size-3" />
        )}
      </div>
      <span className="text-xs text-foreground leading-normal">
        {label}
      </span>
    </div>
  );
}

export const CloudConnectIntroCard: React.FC<CloudConnectIntroCardProps> = ({ isRtl }) => {
  const steps = [
    isRtl ? 'سجل الدخول لحساب Facebook الخاص بك' : 'Log in to your Facebook account',
    isRtl ? 'اختر Business Manager أو أنشئ واحداً جديداً' : 'Select or create a Business Manager',
    isRtl ? 'أدخل رقم الهاتف المستهدف (لاستقبال كود التحقق)' : 'Enter target phone number for OTP',
    isRtl ? 'انتظر إنشاء وربط الحساب تلقائياً' : 'Wait for automatic account creation',
    isRtl ? 'جاهز! الرقم مرتبط وجاهز للإرسال' : 'Done! Number connected and ready',
  ];

  return (
    <WhatsAppSurfaceCard
      title={
        isRtl
          ? 'الربط السحابي المضمن (Embedded Sign-Up)'
          : 'WhatsApp Cloud Embedded Sign-Up'
      }
      description={
        isRtl
          ? 'استخدم حساب Facebook لإنشاء وربط واتساب أعمال رسمي تلقائياً بنقرة واحدة'
          : 'Use your Facebook account to create and link official WhatsApp Business automatically'
      }
    >
      <div className="space-y-5">
        {/* Meta Compliance Banner */}
        <div className="rounded-xl border border-emerald-300/60 bg-emerald-500/5 p-3.5 sm:p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-emerald-600" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                {isRtl
                  ? 'معتمد رسمياً من Meta — أمان كامل بدون مخاطر حظر'
                  : 'Official Meta Partner — 100% Ban-Safe Cloud API'}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                {isRtl
                  ? 'الربط عبر WhatsApp Cloud API المباشر يضمن استقرار الإرسال ووصول الرسائل'
                  : 'Direct official API ensures high delivery rates and reliable communication'}
              </p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-foreground">
            {isRtl ? 'المتطلبات الأساسية' : 'Requirements'}
          </h3>
          <div className="space-y-2 rounded-lg border border-border/40 p-3 bg-muted/20">
            <RequirementItem
              checked
              label={
                isRtl
                  ? 'حساب Facebook (صفحة شخصية أو Business Manager)'
                  : 'Facebook account (personal or Business Manager)'
              }
            />
            <RequirementItem
              checked
              label={
                isRtl
                  ? 'رقم هاتف غير مستخدم في تطبيق واتساب حالياً'
                  : 'Phone number not currently used on standard WhatsApp'
              }
            />
            <RequirementItem
              checked
              label={
                isRtl
                  ? 'الرقم قادر على استقبال SMS أو مكالمة للتحقق (OTP)'
                  : 'Number can receive SMS or voice call for verification'
              }
            />
          </div>
        </div>

        {/* Connection Steps */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-foreground">
            {isRtl ? 'خطوات الربط' : 'Connection Steps'}
          </h3>
          <div className="space-y-2">
            {steps.map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-border/30 p-2.5 bg-card">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-mono font-bold text-primary">
                  {idx + 1}
                </div>
                <p className="text-xs text-foreground font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WhatsAppSurfaceCard>
  );
};

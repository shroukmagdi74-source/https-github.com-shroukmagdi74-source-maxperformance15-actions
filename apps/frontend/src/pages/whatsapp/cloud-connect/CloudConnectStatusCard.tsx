import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectionStep } from './types';
import { WhatsAppSurfaceCard } from '../components/WhatsAppPageShell';

interface CloudConnectStatusCardProps {
  step: ConnectionStep;
  isRtl: boolean;
  sessionName: string;
  errorMessage: string;
  onRetry: () => void;
}

export const CloudConnectStatusCard: React.FC<CloudConnectStatusCardProps> = ({
  step,
  isRtl,
  sessionName,
  errorMessage,
  onRetry,
}) => {
  const navigate = useNavigate();

  if (step === 'connecting') {
    return (
      <WhatsAppSurfaceCard
        title={isRtl ? 'جاري الاتصال بحساب Facebook...' : 'Connecting to Facebook...'}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="mb-4 size-8 animate-spin text-primary" />
          <p className="text-xs font-medium text-foreground">
            {isRtl
              ? 'جاري إنشاء وربط حساب واتساب للأعمال الرسمي...'
              : 'Creating and connecting WhatsApp Business Account...'}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {isRtl
              ? 'قد تستغرق العملية ما بين 30 ثانية ودقيقة واحدة'
              : 'This process typically takes 30-60 seconds'}
          </p>
        </div>
      </WhatsAppSurfaceCard>
    );
  }

  if (step === 'success') {
    return (
      <WhatsAppSurfaceCard
        title={isRtl ? 'تم الربط بنجاح!' : 'Connected Successfully!'}
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="size-6 text-emerald-600" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            {isRtl
              ? 'رقم واتساب الأعمال مرتبط وجاهز للإرسال'
              : 'WhatsApp Business number is connected and ready'}
          </h3>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            {isRtl
              ? 'تم إنشاء وتفعيل الجلسة السحابية بنجاح. يمكنك الآن بدء الرد على المحادثات وإطلاق الحملات.'
              : 'Cloud session created successfully. You can now reply to customers and dispatch campaigns.'}
          </p>
          {sessionName && (
            <Badge
              variant="outline"
              className="mt-3 rounded-full border-emerald-300/70 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-800 dark:border-emerald-500/40 dark:text-emerald-200"
            >
              {sessionName}
            </Badge>
          )}
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            <Button
              size="sm"
              className="h-8 rounded-lg bg-emerald-600 px-4 text-xs text-white hover:bg-emerald-700"
              onClick={() => navigate('/whatsapp/settings')}
            >
              {isRtl ? 'الانتقال إلى الإعدادات' : 'Go to Settings'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg px-4 text-xs"
              onClick={() => navigate('/whatsapp')}
            >
              {isRtl ? 'فتح صندوق المحادثات' : 'Open Inbox'}
            </Button>
          </div>
        </div>
      </WhatsAppSurfaceCard>
    );
  }

  if (step === 'error') {
    return (
      <WhatsAppSurfaceCard
        title={isRtl ? 'فشل الاتصال' : 'Connection Failed'}
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-rose-500/15">
            <AlertCircle className="size-6 text-rose-600" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            {isRtl ? 'تعذر إتمام عملية الربط' : 'Failed to complete connection'}
          </h3>
          <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
            {errorMessage || (isRtl ? 'حدث خطأ غير متوقع أثناء الاتصال' : 'An unexpected error occurred')}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            <Button
              size="sm"
              className="h-8 rounded-lg px-4 text-xs"
              onClick={onRetry}
            >
              {isRtl ? 'إعادة المحاولة' : 'Try Again'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg px-4 text-xs"
              onClick={() => navigate('/whatsapp/settings')}
            >
              {isRtl ? 'العودة للإعدادات' : 'Back to Settings'}
            </Button>
          </div>
        </div>
      </WhatsAppSurfaceCard>
    );
  }

  return null;
};

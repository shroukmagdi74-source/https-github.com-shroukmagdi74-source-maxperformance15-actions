import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, Globe, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WhatsAppPageShell } from './components/WhatsAppPageShell';
import {
  CloudConnectActionPanel,
  CloudConnectIntroCard,
  CloudConnectMethodsCard,
  CloudConnectStatusCard,
  useWhatsAppCloudConnectController,
} from './cloud-connect';

const WhatsAppCloudConnect: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const {
    step,
    sessionName,
    setSessionName,
    errorMessage,
    fbConfig,
    handleStartConnect,
    resetToIntro,
  } = useWhatsAppCloudConnectController();

  return (
    <WhatsAppPageShell
      title={
        isRtl
          ? 'ربط واتساب السحابي عبر Facebook'
          : 'Connect WhatsApp Cloud via Facebook'
      }
      description={
        isRtl
          ? 'اربط رقم واتساب أعمالك بضغطة زر واحدة عبر حساب Facebook — بدون تعبئة بيانات يدوية'
          : 'Connect your WhatsApp Business number with one click via Facebook — no manual setup needed'
      }
      icon={Globe}
      backHref="/whatsapp/settings"
      backLabel={isRtl ? 'العودة للإعدادات' : 'Back to Settings'}
      eyebrow="WhatsApp Cloud"
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="space-y-4 lg:col-span-2">
          {step === 'intro' ? (
            <CloudConnectIntroCard isRtl={isRtl} />
          ) : (
            <CloudConnectStatusCard
              step={step}
              isRtl={isRtl}
              sessionName={sessionName}
              errorMessage={errorMessage}
              onRetry={resetToIntro}
            />
          )}
        </div>

        {/* Action & Comparison Sidebar */}
        <div className="space-y-4">
          {step === 'intro' ? (
            <>
              <CloudConnectActionPanel
                isRtl={isRtl}
                fbConfig={fbConfig}
                sessionName={sessionName}
                setSessionName={setSessionName}
                onStartConnect={handleStartConnect}
              />
              <CloudConnectMethodsCard isRtl={isRtl} />
            </>
          ) : (
            <Card className="rounded-xl border border-border/50 bg-card shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5">
                  {step === 'connecting' ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : step === 'success' ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="size-4 text-rose-600" />
                  )}
                  <p className="text-xs font-medium text-foreground">
                    {step === 'connecting'
                      ? isRtl ? 'جاري الاتصال بالسحابة...' : 'Connecting...'
                      : step === 'success'
                        ? isRtl ? 'تم الاتصال بنجاح' : 'Success'
                        : isRtl ? 'تعذر إتمام الاتصال' : 'Failed'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </WhatsAppPageShell>
  );
};

export default WhatsAppCloudConnect;

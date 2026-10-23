import React from 'react';
import { AlertCircle, Facebook, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FacebookConfig } from './types';

interface CloudConnectActionPanelProps {
  isRtl: boolean;
  fbConfig: FacebookConfig | null;
  sessionName: string;
  setSessionName: (v: string) => void;
  onStartConnect: () => void;
}

export const CloudConnectActionPanel: React.FC<CloudConnectActionPanelProps> = ({
  isRtl,
  fbConfig,
  sessionName,
  setSessionName,
  onStartConnect,
}) => {
  return (
    <div className="space-y-4">
      {/* Alert when FB is not configured */}
      {fbConfig && fbConfig.configured === false && (
        <Alert className="rounded-xl border-amber-300/60 bg-amber-500/10 p-3">
          <AlertCircle className="size-4 text-amber-600" />
          <AlertTitle className="text-xs font-semibold text-amber-800 dark:text-amber-200">
            {isRtl ? 'Facebook غير مهيأ' : 'Facebook Not Configured'}
          </AlertTitle>
          <AlertDescription className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
            {isRtl ? (
              <>
                بيانات اعتماد تطبيق Facebook غير مضبوطة بعد. يرجى ضبطها من{' '}
                <a href="/super-admin/facebook-oauth" className="font-semibold underline underline-offset-2">
                  لوحة السوبر أدمن
                </a>{' '}
                أولاً.
              </>
            ) : (
              <>
                Facebook App credentials not configured. Please configure them in{' '}
                <a href="/super-admin/facebook-oauth" className="font-semibold underline underline-offset-2">
                  Super Admin
                </a>.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Session Name Card */}
      <Card className="rounded-xl border border-border/50 bg-card shadow-none">
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-xs font-semibold text-foreground">
            {isRtl ? 'اسم الجلسة' : 'Session Name'}
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">
            {isRtl
              ? 'اختر اسماً للجلسة لتمييزها في لوحة التحكم'
              : 'Choose a name for this session'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <Label htmlFor="session-name" className="sr-only">
            {isRtl ? 'اسم الجلسة' : 'Session Name'}
          </Label>
          <Input
            id="session-name"
            placeholder={isRtl ? 'مثلاً: واتساب المبيعات الرئيسي' : 'e.g. Sales WhatsApp'}
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="h-8 rounded-lg text-xs"
          />
        </CardContent>
      </Card>

      {/* Connect Trigger Card */}
      <Card className="rounded-xl border border-border/50 bg-card shadow-none">
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-xs font-semibold text-foreground">
            {isRtl ? 'الربط عبر Facebook' : 'Connect via Facebook'}
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">
            {isRtl
              ? 'انقر الزر أدناه لبدء عملية الربط الرسمية عبر ميتا'
              : 'Click below to start official connection'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3 space-y-3">
          <Button
            className="w-full h-10 rounded-lg bg-[#1877F2] text-xs font-semibold text-white hover:bg-[#1877F2]/90 gap-2"
            onClick={onStartConnect}
            disabled={!fbConfig || fbConfig.configured === false}
          >
            {!fbConfig ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {isRtl ? 'جاري التحميل...' : 'Loading...'}
              </>
            ) : (
              <>
                <Facebook className="size-4" />
                <span>{isRtl ? 'المتابعة باستخدام Facebook' : 'Continue with Facebook'}</span>
              </>
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {isRtl
              ? 'سيتم تحويلك إلى صفحة تسجيل الدخول الآمنة في Facebook لمنح أذونات إدارة الأعمال وواتساب للأعمال.'
              : 'You will be securely redirected to Facebook to grant business management permissions.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

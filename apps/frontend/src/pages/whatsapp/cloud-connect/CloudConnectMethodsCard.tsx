import React from 'react';
import { Globe, LogIn, Smartphone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CloudConnectMethodsCardProps {
  isRtl: boolean;
}

export const CloudConnectMethodsCard: React.FC<CloudConnectMethodsCardProps> = ({ isRtl }) => {
  return (
    <Card className="rounded-xl border border-border/50 bg-card shadow-none">
      <CardHeader className="border-b border-border/30 pb-3">
        <CardTitle className="text-xs font-semibold text-foreground">
          {isRtl ? 'مقارنة طرق الربط' : 'Method Comparison'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 pt-3">
        <div className="rounded-lg border border-emerald-300/60 bg-emerald-500/5 p-2.5">
          <div className="flex items-center gap-2">
            <Globe className="size-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
              {isRtl ? 'الربط السحابي (موصى به)' : 'Cloud Connect (Recommended)'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">
            {isRtl
              ? 'ضغطة زر واحدة، بدون إدخال بيانات يدوية، ورسمي 100% من Meta'
              : 'One click, official Meta Cloud API, zero ban risk'}
          </p>
        </div>

        <div className="rounded-lg border border-border/40 bg-muted/30 p-2.5">
          <div className="flex items-center gap-2">
            <Smartphone className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              {isRtl ? 'ربط الويب المباشر (Baileys)' : 'Direct Web Link (Baileys)'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {isRtl
              ? 'مسح كود QR من الهاتف — مفيد للأرقام الشخصية'
              : 'QR code scan directly from phone device'}
          </p>
        </div>

        <div className="rounded-lg border border-border/40 bg-muted/30 p-2.5">
          <div className="flex items-center gap-2">
            <LogIn className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              {isRtl ? 'الربط اليدوي للمطورين (Manual API)' : 'Manual Developer API'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {isRtl
              ? 'إدخال الـ Token و IDs يدوياً للحسابات المتقدمة'
              : 'Manual token and ID entry for developers'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

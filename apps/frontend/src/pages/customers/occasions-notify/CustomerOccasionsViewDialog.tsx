import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import WhatsAppBubblePreview from '../components/WhatsAppBubblePreview';
import { Occasion, RECURRENCE_LABEL } from './types';

interface CustomerOccasionsViewDialogProps {
  occasion: Occasion | null;
  onClose: () => void;
}

export const CustomerOccasionsViewDialog: React.FC<CustomerOccasionsViewDialogProps> = ({
  occasion,
  onClose,
}) => {
  return (
    <Dialog open={!!occasion} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-xl p-5">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Eye className="h-4 w-4 text-primary" />
            {occasion?.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {occasion?.templateName ? `قالب مرتبط: ${occasion.templateName}` : 'رسالة مخصصة مباشرة'}
          </DialogDescription>
        </DialogHeader>

        {occasion && (
          <div className="space-y-4 py-1">
            <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
              <WhatsAppBubblePreview
                content={occasion.message}
                headerLabel="معاينة الرسالة"
                mediaUrl={occasion.mediaUrl || undefined}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-[11px] text-muted-foreground">موعد الإرسال</p>
                <p className="mt-0.5 font-mono font-medium tabular-nums">
                  {new Date(occasion.scheduledAt).toLocaleString('ar-EG', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-[11px] text-muted-foreground">دورية التكرار</p>
                <p className="mt-0.5 font-medium">
                  {RECURRENCE_LABEL[occasion.recurrence] || occasion.recurrence}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-[11px] text-muted-foreground">إجمالي المرسل</p>
                <p className="mt-0.5 font-mono font-medium tabular-nums">
                  {(occasion.totalSent || 0).toLocaleString('ar-EG')} رسالة
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-[11px] text-muted-foreground">آخر موعد إرسال</p>
                <p className="mt-0.5 font-mono font-medium tabular-nums">
                  {occasion.lastSentAt
                    ? new Date(occasion.lastSentAt).toLocaleDateString('ar-EG')
                    : 'لم ترسل بعد'}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

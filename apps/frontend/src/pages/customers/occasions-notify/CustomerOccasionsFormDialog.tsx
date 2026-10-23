import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, FileText, Loader2, Send } from 'lucide-react';
import WhatsAppBubblePreview from '../components/WhatsAppBubblePreview';
import { Occasion, OccasionFormData } from './types';

interface CustomerOccasionsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: OccasionFormData;
  setForm: React.Dispatch<React.SetStateAction<OccasionFormData>>;
  saving: boolean;
  sendingNow: boolean;
  hasBaileys: boolean;
  onSave: () => void;
  onSendNow: () => void;
  onOpenMetaModal: () => void;
}

export const CustomerOccasionsFormDialog: React.FC<CustomerOccasionsFormDialogProps> = ({
  open,
  onOpenChange,
  form,
  setForm,
  saving,
  sendingNow,
  hasBaileys,
  onSave,
  onSendNow,
  onOpenMetaModal,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl p-5">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-base font-bold">
            {form.id ? 'تعديل المناسبة' : 'مناسبة جديدة'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            جدولة رسالة لإرسالها تلقائياً للعملاء في الموعد المحدد أو دورياً
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">اسم المناسبة</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: رمضان، عيد الفطر، رأس السنة..."
                className="h-8 rounded-lg text-xs"
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">موعد الإرسال</Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                className="h-8 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">دورية التكرار</Label>
              <Select
                value={form.recurrence}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, recurrence: v as Occasion['recurrence'] }))
                }
              >
                <SelectTrigger className="h-8 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">مرة واحدة</SelectItem>
                  <SelectItem value="monthly" className="text-xs">شهرياً</SelectItem>
                  <SelectItem value="yearly" className="text-xs">سنوياً (للمناسبات السنوية)</SelectItem>
                </SelectContent>
              </Select>
              {form.recurrence === 'yearly' && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  التكرار السنوي يكرر الإرسال في نفس اليوم والشهر الميلادي
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">حد الإرسال الأقصى (0 = بدون حد)</Label>
              <Input
                type="number"
                min={0}
                value={form.sendLimit}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sendLimit: Number(e.target.value) || 0 }))
                }
                className="h-8 rounded-lg text-xs font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">نص الرسالة</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenMetaModal}
                className="h-7 gap-1 rounded-md text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300"
              >
                <FileText className="h-3 w-3" />
                اختيار قالب معتمد
              </Button>
            </div>
            <Textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              className="rounded-lg text-xs leading-relaxed"
              maxLength={3000}
              placeholder="اكتب نص الرسالة هنا..."
            />
            <p className="text-[11px] text-muted-foreground">
              المتغيرات المتاحة: {'{اسم العميل}'} · {'{اسم المناسبة}'} · {'{customer_link}'}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">رابط صورة أو وسائط (اختياري)</Label>
            <Input
              value={form.mediaUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, mediaUrl: e.target.value }))}
              placeholder="https://..."
              dir="ltr"
              className="h-8 rounded-lg text-xs font-mono"
            />
          </div>

          {/* معاينة حية */}
          <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
            <WhatsAppBubblePreview
              content={form.message}
              headerLabel="معاينة الرسالة"
              mediaUrl={form.mediaUrl || undefined}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 rounded-lg text-xs"
            >
              إلغاء
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSendNow}
              disabled={sendingNow || !hasBaileys || !form.message.trim()}
              className="h-8 gap-1.5 rounded-lg text-xs"
              title={hasBaileys ? 'إرسال فوري الآن' : 'يتطلب جلسة واتساب متصلة'}
            >
              {sendingNow ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              إرسال فوري
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving || !form.name.trim() || !form.message.trim() || !form.scheduledAt}
              className="h-8 gap-1.5 rounded-lg text-xs"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {form.id ? 'حفظ التعديلات' : 'جدولة المناسبة'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

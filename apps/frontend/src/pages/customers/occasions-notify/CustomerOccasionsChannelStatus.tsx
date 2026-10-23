import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessagesSquare, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { OccasionSession } from './types';

interface CustomerOccasionsChannelStatusProps {
  hasBaileys: boolean;
  sessions: OccasionSession[];
  selected: string;
  onSelect: (v: string) => void;
  onRefresh: () => void;
}

export const CustomerOccasionsChannelStatus: React.FC<CustomerOccasionsChannelStatusProps> = ({
  hasBaileys,
  sessions,
  selected,
  onSelect,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            hasBaileys
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          {hasBaileys ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {hasBaileys ? 'جلسة واتساب متصلة — الإرسال الفوري جاهز' : 'لا توجد جلسة واتساب متصلة'}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {hasBaileys ? (
              'المناسبات المجدولة تعمل تلقائياً من الخادم في الموعد المحدد'
            ) : (
              <>
                لا توجد جلسة نشطة —{' '}
                <Link
                  to="/customers/whatsapp-notify"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  اربط جلستك من صفحة إشعارات واتساب
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasBaileys && (
          <Select value={selected} onValueChange={onSelect}>
            <SelectTrigger className="h-8 w-[200px] rounded-lg text-xs font-mono">
              <SelectValue placeholder="اختر الجلسة" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.sessionId} value={s.sessionId} className="text-xs font-mono">
                  {s.phoneNumber || s.sessionId.slice(0, 12)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          className="h-8 w-8 rounded-lg"
          aria-label="تحديث الجلسات"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

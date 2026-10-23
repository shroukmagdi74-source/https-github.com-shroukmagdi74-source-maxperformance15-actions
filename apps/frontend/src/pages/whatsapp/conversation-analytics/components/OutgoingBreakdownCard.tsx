import React from "react";
import { Bot, Megaphone, Send } from "lucide-react";
import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import type { ConversationSummary } from "../types";

interface OutgoingBreakdownCardProps {
  summary: ConversationSummary | undefined;
}

export const OutgoingBreakdownCard: React.FC<OutgoingBreakdownCardProps> = ({ summary }) => {
  const outgoingTotal = Math.max(1, summary?.outgoingMessages ?? 1);
  const manualPct = (((summary?.manualOutgoing ?? 0) / outgoingTotal) * 100).toFixed(1);
  const broadcastPct = (((summary?.broadcastOutgoing ?? 0) / outgoingTotal) * 100).toFixed(1);
  const autoPct = (((summary?.autoOutgoing ?? 0) / outgoingTotal) * 100).toFixed(1);

  return (
    <WhatsAppSurfaceCard
      title="تفصيل الرسائل الصادرة"
      description="يدوي (ردود المودريترز) vs تلقائي (برودكاست + فلو متابعة)"
      className="lg:col-span-1"
    >
      <div className="space-y-4">
        {/* Manual Outgoing */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Send className="size-3.5 text-indigo-500" />
              <span className="text-muted-foreground">يدوي (ردود)</span>
            </div>
            <span className="font-semibold font-mono tabular-nums text-foreground">
              {summary?.manualOutgoing ?? 0}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-[width]"
              style={{ width: `${manualPct}%` }}
            />
          </div>
        </div>

        {/* Broadcast Outgoing */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Megaphone className="size-3.5 text-amber-500" />
              <span className="text-muted-foreground">برودكاست</span>
            </div>
            <span className="font-semibold font-mono tabular-nums text-foreground">
              {summary?.broadcastOutgoing ?? 0}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-2 rounded-full bg-amber-500 transition-[width]"
              style={{ width: `${broadcastPct}%` }}
            />
          </div>
        </div>

        {/* Automated Outgoing */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Bot className="size-3.5 text-violet-400" />
              <span className="text-muted-foreground">تلقائي (فلو + AI)</span>
            </div>
            <span className="font-semibold font-mono tabular-nums text-foreground">
              {summary?.autoOutgoing ?? 0}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-2 rounded-full bg-violet-400 transition-[width]"
              style={{ width: `${autoPct}%` }}
            />
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
          <strong className="font-semibold text-amber-600 dark:text-amber-400">تنبيه:</strong> الأرقام تشمل جميع الرسائل الصادرة المصنفة وفق الحقول الوصفية:
          <ul className="mt-1 list-disc list-inside space-y-0.5 text-[10px]">
            <li><strong>يدوي:</strong> رسائل المودريترز اليدوية المباشرة</li>
            <li><strong>برودكاست:</strong> حملات البث الجماعي المجدولة</li>
            <li><strong>تلقائي:</strong> مسارات المتابعة الآلية والردود الذكية</li>
          </ul>
        </div>

        {/* Operational Counters */}
        <div className="border-t border-border/60 pt-3 space-y-2 font-mono tabular-nums">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-sans">بانتظار رد الفريق</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {summary?.waitingForReply ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-sans">بانتظار رد العميل</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {summary?.awaitingCustomer ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-sans">غير معيّن</span>
            <span className="font-medium text-foreground">
              {summary?.unassignedCount ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-sans">محادثات بها غير مقروء</span>
            <span className="font-medium text-foreground">
              {summary?.conversationsWithUnread ?? 0}
            </span>
          </div>
        </div>
      </div>
    </WhatsAppSurfaceCard>
  );
};

import React from "react";
import { Clock, Inbox, MessageCircle, Send } from "lucide-react";
import { WhatsAppMetricCard } from "../../components/WhatsAppPageShell";
import type { ConversationSummary } from "../types";

interface ConversationAnalyticsHeroCardsProps {
  summary: ConversationSummary | undefined;
}

export const ConversationAnalyticsHeroCards: React.FC<
  ConversationAnalyticsHeroCardsProps
> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <WhatsAppMetricCard
        label="إجمالي المحادثات"
        value={summary?.totalConversations ?? 0}
        hint={`${summary?.totalMessages ?? 0} رسالة`}
        icon={MessageCircle}
        tone="primary"
      />
      <WhatsAppMetricCard
        label="رسائل واردة"
        value={summary?.incomingMessages ?? 0}
        hint="من العميل"
        icon={Inbox}
        tone="info"
      />
      <WhatsAppMetricCard
        label="رسائل صادرة"
        value={summary?.outgoingMessages ?? 0}
        hint={`يدوي ${summary?.manualOutgoing ?? 0} · برودكاست ${summary?.broadcastOutgoing ?? 0} · تلقائي ${summary?.autoOutgoing ?? 0}`}
        icon={Send}
        tone="success"
      />
      <WhatsAppMetricCard
        label="متوسط الرد"
        value={summary?.avgResponseTimeMin != null ? `${summary.avgResponseTimeMin} د` : "—"}
        hint={`${summary?.avgMessagesPerConversation ?? 0} رسالة/محادثة`}
        icon={Clock}
        tone="primary"
      />
    </div>
  );
};

import React from "react";
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export interface OrderHistoryTabProps {
  order: any;
}

export const OrderHistoryTab: React.FC<OrderHistoryTabProps> = ({ order }) => {
  const { t } = useTranslation();

  const handleOpenConversation = () => {
    const isWhatsApp =
      order.conversation?.channel === "whatsapp" ||
      order.extractionMethod?.includes("whatsapp") ||
      order.sourceType === "whatsapp";
    const url = isWhatsApp
      ? `/whatsapp?conversation=${order.conversationId}`
      : `/facebook-inbox?conversation=${order.conversationId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const hasHistory = Boolean(order.conversationId || order.notes);

  return (
    <div className="space-y-3">
      {/* Conversation Link */}
      {order.conversationId && (
        <div>
          <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5 text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
            </span>
            {t("orders.conversation")}
          </h4>
          <div className="bg-card/60 border border-border/60 rounded-2xl p-3 backdrop-blur-sm">
            <button
              type="button"
              onClick={handleOpenConversation}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              {t("orders.viewConversation")}
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div>
          <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5 text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <DocumentTextIcon className="h-3.5 w-3.5" />
            </span>
            {t("orders.notes")}
          </h4>
          <div className="bg-warning/5 border border-warning/20 rounded-2xl p-3 backdrop-blur-sm">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {order.notes}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasHistory && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-card/30 py-10 text-center">
          <ClipboardDocumentListIcon className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            {t("orders.noHistoryItems", { defaultValue: "لا توجد سجلات بعد" })}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryTab;

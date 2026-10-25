import React from "react";
import { Webhook } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { WebhookItem } from "./types";

interface HRApiWebhooksTabProps {
  webhooks: WebhookItem[];
  newHookName: string;
  onNewHookNameChange: (val: string) => void;
  newHookUrl: string;
  onNewHookUrlChange: (val: string) => void;
  isSubmittingHook: boolean;
  onCreateWebhook: (e: React.FormEvent) => void;
}

export const HRApiWebhooksTab: React.FC<HRApiWebhooksTabProps> = ({
  webhooks,
  newHookName,
  onNewHookNameChange,
  newHookUrl,
  onNewHookUrlChange,
  isSubmittingHook,
  onCreateWebhook,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Webhook className="h-4 w-4 text-primary" />
          <span>إضافة رابط استقبال أحداث فوري (Webhook)</span>
        </h3>
        <form onSubmit={onCreateWebhook} className="grid sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="اسم النظام (مثال: n8n HR Automation)"
            value={newHookName}
            onChange={(e) => onNewHookNameChange(e.target.value)}
            className="bg-background border border-input rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
          />
          <input
            type="url"
            placeholder="رابط الـ Webhook (https://...)"
            value={newHookUrl}
            onChange={(e) => onNewHookUrlChange(e.target.value)}
            className="bg-background border border-input rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none font-mono"
          />
          <Button type="submit" disabled={isSubmittingHook} size="sm" className="text-xs">
            {isSubmittingHook ? "جاري الإضافة…" : "حفظ الرابط"}
          </Button>
        </form>
      </div>

      <div className="grid gap-3">
        {webhooks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            لا توجد اشتراكات Webhook مسجلة.
          </p>
        ) : (
          webhooks.map((w) => (
            <div
              key={w.id}
              className="bg-card border border-border/50 rounded-xl p-3 flex justify-between items-center text-xs"
            >
              <div>
                <div className="font-semibold">{w.name}</div>
                <code className="text-muted-foreground font-mono">{w.targetUrl}</code>
              </div>
              <Badge variant="outline">نشط</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

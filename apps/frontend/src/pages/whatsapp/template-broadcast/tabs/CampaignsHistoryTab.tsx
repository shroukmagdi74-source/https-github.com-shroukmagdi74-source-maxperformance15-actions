import React from 'react';
import { Loader2, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Campaign } from '../types';

interface CampaignsHistoryTabProps {
  loadingCampaigns: boolean;
  campaigns: Campaign[];
  expandedCampaignId: string | null;
  setExpandedCampaignId: (id: string | null) => void;
  openRate: (c: Campaign) => number;
  clickRate: (c: Campaign) => number;
  deliveryRate: (c: Campaign) => number;
  replyRate: (c: Campaign) => number;
}

export const CampaignsHistoryTab: React.FC<CampaignsHistoryTabProps> = ({
  loadingCampaigns,
  campaigns,
  expandedCampaignId,
  setExpandedCampaignId,
  openRate,
  clickRate,
  deliveryRate,
  replyRate,
}) => {
  if (loadingCampaigns) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-12 text-center">
        <Megaphone className="size-8 text-muted-foreground/50" />
        <h3 className="mt-3 text-xs font-semibold text-foreground">لا توجد حملات مسجلة بعد</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">أنشئ أول حملة بث قوالب للبدء في تتبع التفاعل</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((c) => {
        const isExpanded = expandedCampaignId === c.id;
        const metrics = [
          { label: 'أُرسل', value: c.sentCount || 0, pct: 100, color: 'bg-blue-500' },
          { label: 'تم التسليم', value: c.deliveredCount || 0, pct: deliveryRate(c), color: 'bg-emerald-500' },
          { label: 'فتح', value: c.openedCount || 0, pct: openRate(c), color: 'bg-violet-500' },
          { label: 'نقر', value: c.clickedCount || 0, pct: clickRate(c), color: 'bg-amber-500' },
          { label: 'رد', value: (c as any).repliedCount || 0, pct: replyRate(c), color: 'bg-rose-500' },
        ];

        return (
          <Card
            key={c.id}
            className={`rounded-xl border border-border/50 bg-card cursor-pointer transition-all hover:border-border ${
              isExpanded ? 'ring-1 ring-primary/40' : ''
            }`}
            onClick={() => setExpandedCampaignId(isExpanded ? null : c.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-foreground truncate">{c.name}</h4>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {c.waTemplateName && <span>قالب: {c.waTemplateName}</span>}
                    {c.sentAt && (
                      <span className="font-mono tabular-nums">
                        {' '}· {new Date(c.sentAt).toLocaleString('ar-EG')}
                      </span>
                    )}
                  </p>
                </div>
                <Badge
                  variant={
                    c.status === 'sent'
                      ? 'default'
                      : c.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className="shrink-0 text-[10px] font-mono px-2 py-0.5"
                >
                  {c.status === 'sent' ? 'تم' : c.status === 'failed' ? 'فشل' : c.status}
                </Badge>
              </div>

              {isExpanded && (
                <div
                  className="mt-4 pt-3 border-t border-border/40 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {metrics.map((m) => (
                      <div key={m.label} className="text-center rounded-lg bg-muted/30 p-2">
                        <div className="h-16 flex items-end justify-center">
                          <div
                            className={`w-full max-w-[20px] rounded-t ${m.color} opacity-85 transition-all`}
                            style={{ height: `${Math.max(m.pct, 6)}%` }}
                          />
                        </div>
                        <p className="text-xs font-bold font-mono tabular-nums mt-1.5 text-foreground">
                          {m.value.toLocaleString('ar-EG')}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

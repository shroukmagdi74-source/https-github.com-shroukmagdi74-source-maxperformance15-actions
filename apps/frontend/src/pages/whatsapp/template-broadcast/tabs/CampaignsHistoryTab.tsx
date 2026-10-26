import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, Loader2, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Campaign, CampaignRun } from '../types';
import { broadcastService } from '@/services/broadcastService';

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

const statusLabelMap: Record<string, string> = {
  sent: 'تم',
  completed: 'مكتمل',
  failed: 'فشل',
  active: 'نشط',
  paused: 'متوقف مؤقتاً',
  stopped: 'تم إيقافه',
  running: 'قيد التشغيل',
  scheduled: 'مجدول',
  draft: 'مسودة',
};

const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
  switch (status) {
    case 'sent':
    case 'completed':
      return 'default';
    case 'failed':
    case 'stopped':
    case 'paused':
      return 'destructive';
    case 'active':
      return 'outline';
    default:
      return 'secondary';
  }
};

const CampaignRunsSection: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const [runs, setRuns] = useState<CampaignRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    broadcastService
      .getCampaignRuns(campaignId, 1, 10)
      .then((res) => {
        if (mounted && res?.data?.runs) {
          setRuns(res.data.runs);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="rounded-lg border border-border/30 bg-muted/10 p-3 text-center text-xs text-muted-foreground">
        لا توجد تشغيلات مسجلة لهذه الحملة بعد
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Clock className="size-3.5 text-muted-foreground" />
        <span>سجل التشغيلات (Run Log)</span>
      </h5>
      <div className="overflow-x-auto rounded-lg border border-border/40">
        <table className="w-full text-[11px] text-right font-sans">
          <thead className="bg-muted/40 text-muted-foreground border-b border-border/40">
            <tr>
              <th className="py-1.5 px-2 font-medium">تاريخ</th>
              <th className="py-1.5 px-2 font-medium">عدد الجمهور</th>
              <th className="py-1.5 px-2 font-medium">اتبعت</th>
              <th className="py-1.5 px-2 font-medium">وصل</th>
              <th className="py-1.5 px-2 font-medium">فشل</th>
              <th className="py-1.5 px-2 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {runs.map((r) => (
              <tr key={r.id} className="hover:bg-muted/10">
                <td className="py-1.5 px-2 font-mono tabular-nums text-muted-foreground">
                  {r.startedAt ? new Date(r.startedAt).toLocaleString('ar-EG') : '—'}
                </td>
                <td className="py-1.5 px-2 font-mono tabular-nums">{r.audienceCount ?? 0}</td>
                <td className="py-1.5 px-2 font-mono tabular-nums text-blue-600 dark:text-blue-400 font-semibold">
                  {r.sentCount ?? 0}
                </td>
                <td className="py-1.5 px-2 font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {r.deliveredCount ?? 0}
                </td>
                <td className="py-1.5 px-2 font-mono tabular-nums text-destructive">
                  {r.failedCount ?? 0}
                </td>
                <td className="py-1.5 px-2">
                  <Badge
                    variant={getStatusBadgeVariant(r.status)}
                    className="text-[9px] px-1.5 py-0 font-mono"
                  >
                    {statusLabelMap[r.status] || r.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

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

        const activeReason = c.pausedReason ?? c.failureReason;

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
                  {c.nextRunAt && (
                    <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                      <Clock className="size-3 text-primary shrink-0" />
                      <span>التشغيل الجاي:</span>
                      <span className="font-mono tabular-nums">
                        {new Date(c.nextRunAt).toLocaleString('ar-EG')} (توقيت القاهرة)
                      </span>
                    </p>
                  )}
                </div>
                <Badge
                  variant={getStatusBadgeVariant(c.status)}
                  className="shrink-0 text-[10px] font-mono px-2 py-0.5"
                >
                  {statusLabelMap[c.status] || c.status}
                </Badge>
              </div>

              {(c.status === 'failed' || c.status === 'paused' || c.status === 'stopped' || c.failedCount > 0) && activeReason && (
                <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold">
                      {c.status === 'paused' || c.status === 'stopped' ? 'سبب الإيقاف: ' : 'سبب الفشل: '}
                    </span>
                    <span className="font-mono text-[11px] break-words">{activeReason}</span>
                  </div>
                </div>
              )}

              {isExpanded && (
                <div
                  className="mt-4 pt-3 border-t border-border/40 space-y-4"
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

                  {/* Run Log Table */}
                  <CampaignRunsSection campaignId={c.id} />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

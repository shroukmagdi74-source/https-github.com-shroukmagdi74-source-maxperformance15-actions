import React from 'react';
import { BarChart, Eye, MousePointerClick, Reply } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Campaign } from '../types';

interface BroadcastAnalyticsTabProps {
  campaigns: Campaign[];
  openRate: (c: Campaign) => number;
  clickRate: (c: Campaign) => number;
  deliveryRate: (c: Campaign) => number;
  replyRate: (c: Campaign) => number;
}

export const BroadcastAnalyticsTab: React.FC<BroadcastAnalyticsTabProps> = ({
  campaigns,
  openRate,
  clickRate,
  deliveryRate,
  replyRate,
}) => {
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-12 text-center">
        <BarChart className="size-8 text-muted-foreground/50" />
        <h3 className="mt-3 text-xs font-semibold text-foreground">لا توجد بيانات إحصائية بعد</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">أرسل حملتك الأولى لعرض نسب التفاعل والفتح</p>
      </div>
    );
  }

  const avgOpen = Math.round(
    campaigns.reduce((s, c) => s + openRate(c), 0) / (campaigns.length || 1)
  );
  const avgClick = Math.round(
    campaigns.reduce((s, c) => s + clickRate(c), 0) / (campaigns.length || 1)
  );
  const avgReply = Math.round(
    campaigns.reduce((s, c) => s + replyRate(c), 0) / (campaigns.length || 1)
  );

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-xl font-bold font-mono tabular-nums text-foreground">{campaigns.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">إجمالي الحملات</p>
        </Card>
        <Card className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-xl font-bold font-mono tabular-nums text-foreground">{avgOpen}%</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Eye className="size-3 text-muted-foreground" />
            <span>متوسط نسبة الفتح</span>
          </p>
        </Card>
        <Card className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-xl font-bold font-mono tabular-nums text-foreground">{avgClick}%</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <MousePointerClick className="size-3 text-muted-foreground" />
            <span>متوسط نسبة النقر</span>
          </p>
        </Card>
        <Card className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-xl font-bold font-mono tabular-nums text-foreground">{avgReply}%</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Reply className="size-3 text-muted-foreground" />
            <span>متوسط نسبة الرد</span>
          </p>
        </Card>
      </div>

      {/* Details Table */}
      <Card className="rounded-xl border border-border/50 bg-card shadow-none">
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-xs font-semibold text-foreground">تفاصيل أداء الحملات</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right text-xs">الحملة</TableHead>
                  <TableHead className="text-right text-xs">المرسل</TableHead>
                  <TableHead className="text-right text-xs">تم التسليم</TableHead>
                  <TableHead className="text-right text-xs">تم الفتح</TableHead>
                  <TableHead className="text-right text-xs">تم النقر</TableHead>
                  <TableHead className="text-right text-xs">تم الرد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-xs">{c.name}</TableCell>
                    <TableCell className="text-xs font-mono tabular-nums">{c.sentCount || 0}</TableCell>
                    <TableCell className="text-xs font-mono tabular-nums">
                      {c.deliveredCount || 0} ({deliveryRate(c)}%)
                    </TableCell>
                    <TableCell className="text-xs font-mono tabular-nums">
                      {c.openedCount || 0} ({openRate(c)}%)
                    </TableCell>
                    <TableCell className="text-xs font-mono tabular-nums">
                      {c.clickedCount || 0} ({clickRate(c)}%)
                    </TableCell>
                    <TableCell className="text-xs font-mono tabular-nums">
                      {(c as any).repliedCount || 0} ({replyRate(c)}%)
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

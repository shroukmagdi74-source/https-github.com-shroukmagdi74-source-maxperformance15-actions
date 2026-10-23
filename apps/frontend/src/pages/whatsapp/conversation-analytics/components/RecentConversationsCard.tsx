import React from "react";
import { Inbox, MessageSquare, Send, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import { STATUS_COLORS, STATUS_LABELS, type RecentConversation } from "../types";

interface RecentConversationsCardProps {
  recentConvs: RecentConversation[];
  userMap: Record<string, string>;
  formatTime: (dateStr: string | null) => string;
  hasTags: boolean;
}

export const RecentConversationsCard: React.FC<RecentConversationsCardProps> = ({
  recentConvs,
  userMap,
  formatTime,
  hasTags,
}) => {
  return (
    <WhatsAppSurfaceCard
      title="آخر المحادثات"
      description="المحادثات الأحدث نشاطاً"
      className={hasTags ? "lg:col-span-2" : "lg:col-span-3"}
    >
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/70 hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground">الحالة</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">آخر رسالة</TableHead>
              <TableHead className="text-center text-xs font-medium text-muted-foreground">الرسائل</TableHead>
              <TableHead className="text-center text-xs font-medium text-muted-foreground">غير مقروءة</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">المُعيّن</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {recentConvs.length > 0 ? (
              recentConvs.map((conv) => (
                <TableRow key={conv.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full text-[10px] text-white border-transparent ${
                        STATUS_COLORS[conv.status] || "bg-slate-500"
                      }`}
                    >
                      {STATUS_LABELS[conv.status] || conv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono tabular-nums">
                      {conv.lastMessageIsFromCustomer ? (
                        <Inbox className="size-3 text-cyan-500 shrink-0" />
                      ) : (
                        <Send className="size-3 text-emerald-500 shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono tabular-nums">
                    <span className="text-xs font-semibold text-foreground">
                      {conv.messageCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-mono tabular-nums">
                    {conv.unreadCount > 0 ? (
                      <Badge className="bg-destructive/15 text-destructive border-transparent text-[10px]">
                        {conv.unreadCount}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {conv.assignedUserId && userMap[conv.assignedUserId] ? (
                      <div className="flex items-center gap-1">
                        <User className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {userMap[conv.assignedUserId]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <div className="space-y-2">
                    <MessageSquare className="mx-auto size-8 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">
                      لا توجد محادثات مسجلة في هذه الفترة
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </WhatsAppSurfaceCard>
  );
};

import React from "react";
import {
  CheckCircle2,
  Copy,
  Eye,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { AgencyApproval, AgencyClient } from "./types";

interface AgencyApprovalsTabProps {
  approvals: AgencyApproval[];
  clients: AgencyClient[];
  onOpenNewApproval: () => void;
  onCopyApprovalLink: (token?: string) => void;
  onShareApprovalWhatsApp: (item: AgencyApproval) => void;
  onDeleteApproval: (id: string) => void;
}

export const AgencyApprovalsTab: React.FC<AgencyApprovalsTabProps> = ({
  approvals,
  clients,
  onOpenNewApproval,
  onCopyApprovalLink,
  onShareApprovalWhatsApp,
  onDeleteApproval,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-foreground">موافقات المحتوى والتصاميم</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            شارك رابطاً عاماً مع العميل لمراجعة بوستات وتصاميم الحملة واعتمادها بنقرة واحدة
          </p>
        </div>
        <Button
          type="button"
          onClick={onOpenNewApproval}
          className="h-10 sm:h-9 text-xs font-bold w-full sm:w-auto"
        >
          <Plus className="size-4 ml-1.5" />
          إنشاء طلب موافقة
        </Button>
      </div>

      {approvals.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed rounded-2xl bg-muted/10 space-y-3">
          <CheckCircle2 className="size-10 mx-auto text-muted-foreground/40" />
          <p className="text-sm font-bold text-foreground">لا توجد طلبات موافقة حالياً</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            أنشئ مسودة تصميم أو إعلان وشارك رابطه مع العميل للاعتماد بنقرة واحدة عبر واتساب.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={onOpenNewApproval}
            className="mt-1 h-10 text-xs font-bold"
          >
            <Plus className="size-4 ml-1.5" />
            إنشاء أول طلب موافقة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {approvals.map((item) => {
            const client = clients.find((c) => c.id === item.clientId);
            const isApproved = item.status === "APPROVED" || item.status === "approved";
            const isChanges =
              item.status === "CHANGES_REQUESTED" || item.status === "changes_requested";
            const token = item.shareToken || item.publicToken;

            return (
              <Card
                key={item.id}
                className="border-border/60 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between"
              >
                <CardHeader className="p-3.5 sm:p-5 pb-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="secondary" className="text-[10px] font-bold mb-1">
                        {client?.name || item.clientName || "عميل"}
                      </Badge>
                      <CardTitle className="text-sm font-black text-foreground">
                        {item.title}
                      </CardTitle>
                    </div>
                    <Badge
                      className={`text-[10px] font-bold shrink-0 ${
                        isApproved
                          ? "bg-emerald-500 text-white"
                          : isChanges
                          ? "bg-rose-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {isApproved ? "معتمد" : isChanges ? "مطلوب تعديلات" : "بانتظار العميل"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 sm:p-5 pt-0 space-y-2.5 text-xs flex-1">
                  {item.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-border/40 max-h-48 bg-muted/20">
                      {item.mediaUrl.match(/\.(mp4|webm|mov|ogg)($|\?)/i) ? (
                        <video
                          src={item.mediaUrl}
                          controls
                          className="w-full h-full max-h-48 object-cover"
                        />
                      ) : (
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="w-full h-full max-h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      )}
                    </div>
                  )}
                  {item.copyText && (
                    <div className="p-2.5 bg-muted/20 rounded-xl text-xs leading-relaxed font-medium">
                      <p className="font-bold text-[10px] text-muted-foreground mb-0.5 uppercase">
                        نص الإعلان (Copy):
                      </p>
                      <p className="line-clamp-3 whitespace-pre-line">{item.copyText}</p>
                    </div>
                  )}
                  {item.clientFeedback && (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-200 text-rose-700 rounded-xl text-xs">
                      <p className="font-bold text-[10px] mb-0.5">ملاحظات العميل:</p>
                      <p>{item.clientFeedback}</p>
                    </div>
                  )}
                </CardContent>
                <div className="p-3 sm:p-4 pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs font-bold flex-1 min-w-[95px]"
                    onClick={() => onCopyApprovalLink(token)}
                  >
                    <Copy className="size-3.5 ml-1" />
                    نسخ الرابط
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    onClick={() => onShareApprovalWhatsApp(item)}
                    title="مشاركة عبر واتساب"
                  >
                    <MessageCircle className="size-3.5 ml-1" />
                    واتساب
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-9 rounded-lg text-primary hover:bg-primary/10"
                    onClick={() => window.open(`/agency/client-portal/${token}`, "_blank")}
                    title="معاينة البوابة"
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-9 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={() => onDeleteApproval(item.id)}
                    title="حذف طلب الموافقة"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

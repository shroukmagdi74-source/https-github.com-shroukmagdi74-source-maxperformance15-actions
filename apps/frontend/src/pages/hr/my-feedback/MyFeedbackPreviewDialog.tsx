import React from "react";
import { TFunction } from "i18next";
import { MessageSquare, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Feedback } from "./types";
import { getFeedbackTypeKey } from "./helpers";
import { renderFeedbackStatusBadge } from "./MyFeedbackListSection";

interface MyFeedbackPreviewDialogProps {
  t: TFunction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewItem: Feedback | null;
}

export const MyFeedbackPreviewDialog: React.FC<
  MyFeedbackPreviewDialogProps
> = ({ t, open, onOpenChange, previewItem }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl" key={previewItem?.id}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t("employee.feedback.quickView")}
          </DialogTitle>
          <DialogDescription>
            {t("employee.feedback.quickViewDesc")}
          </DialogDescription>
        </DialogHeader>
        {previewItem && (
          <div className="space-y-4 mt-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-lg">
                  {previewItem.toUserId
                    ? `${previewItem.toEmployee?.firstName || ""} ${
                        previewItem.toEmployee?.lastName || ""
                      }`.trim() || t("employee.feedback.generalManagement")
                    : t("employee.feedback.generalManagement")}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 font-mono tabular-nums">
                  <Calendar className="h-4 w-4" />
                  {format(
                    new Date(previewItem.createdAt),
                    "dd MMMM yyyy HH:mm",
                    { locale: ar }
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {t(getFeedbackTypeKey(previewItem.type))}
                </Badge>
                {renderFeedbackStatusBadge(previewItem.status, t)}
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap">
              {previewItem.content}
            </div>

            {previewItem.category && (
              <Badge variant="secondary" className="text-[11px] w-fit">
                #{previewItem.category}
              </Badge>
            )}

            {previewItem.adminReply && (
              <div className="border rounded-xl p-3 bg-primary/5 space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1 font-mono tabular-nums">
                  <Clock className="h-4 w-4" />
                  {previewItem.repliedAt
                    ? format(
                        new Date(previewItem.repliedAt),
                        "dd MMMM yyyy HH:mm",
                        { locale: ar }
                      )
                    : t("employee.feedback.statusReplied")}
                </p>
                <p className="text-sm font-medium">{previewItem.adminReply}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

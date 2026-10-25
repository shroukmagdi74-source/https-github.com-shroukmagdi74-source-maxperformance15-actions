import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply } from "lucide-react";
import { FeedbackItem } from "./types";

interface FeedbackReplyDialogProps {
  isOpen: boolean;
  selectedFeedback: FeedbackItem | null;
  replyText: string;
  replyLoading: boolean;
  onReplyTextChange: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const FeedbackReplyDialog: React.FC<FeedbackReplyDialogProps> = ({
  isOpen,
  selectedFeedback,
  replyText,
  replyLoading,
  onReplyTextChange,
  onSubmit,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Reply className="h-5 w-5 text-primary" />
            الرد على التغذية الراجعة
          </DialogTitle>
          <DialogDescription>
            سيتم إرسال هذا الرد إلى الموظف وسيصل له إشعار بذلك.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted/50 rounded-xl border italic text-sm text-foreground/80">
            "{selectedFeedback?.content}"
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">نص الرد</label>
            <Textarea
              placeholder="اكتب ردك هنا..."
              className="min-h-[150px] resize-none"
              value={replyText}
              onChange={(e) => onReplyTextChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-row-reverse gap-4 mt-8 pt-4 border-t w-full">
          <Button
            onClick={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            disabled={replyLoading || !replyText.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-lg"
          >
            {replyLoading ? "جاري الإرسال..." : "إرسال الرد"}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={replyLoading}
            className="px-6 h-12 font-bold"
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React from "react";
import { Upload } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { AgencyClient } from "./types";

interface AgencyApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: AgencyClient[];
  approvalForm: {
    clientId: string;
    title: string;
    mediaUrl: string;
    copyText: string;
    platform: string;
    campaignName: string;
  };
  onFormChange: (data: any) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isUploadingMedia: boolean;
  onUploadMediaFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export const AgencyApprovalDialog: React.FC<AgencyApprovalDialogProps> = ({
  open,
  onOpenChange,
  clients,
  approvalForm,
  onFormChange,
  fileInputRef,
  isUploadingMedia,
  onUploadMediaFile,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[90dvh] flex flex-col p-0 overflow-hidden"
        dir="rtl"
      >
        <DialogHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <DialogTitle className="font-black text-base sm:text-lg text-foreground">
            إنشاء طلب موافقة على محتوى أو تصميم
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto p-4 sm:p-5 flex-1 space-y-3 text-xs">
          <div>
            <Label className="text-xs font-bold">العميل المستهدف *</Label>
            <select
              className="w-full mt-1 h-10 sm:h-9 px-3 rounded-xl border border-border bg-background text-base sm:text-xs font-bold"
              value={approvalForm.clientId}
              onChange={(e) => onFormChange({ ...approvalForm, clientId: e.target.value })}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs font-bold">عنوان المحتوى أو البوست *</Label>
            <Input
              className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl"
              placeholder="مثال: ريلز الجمعة البيضاء - إنستجرام"
              value={approvalForm.title}
              onChange={(e) => onFormChange({ ...approvalForm, title: e.target.value })}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold">صورة أو فيديو التصميم (Media)</Label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                onChange={onUploadMediaFile}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isUploadingMedia}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs font-bold bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary gap-1"
              >
                <Upload className={`size-3.5 ${isUploadingMedia ? "animate-spin" : ""}`} />
                {isUploadingMedia ? "جاري الرفع..." : "رفع من الجهاز"}
              </Button>
            </div>
            <Input
              className="mt-1.5 h-10 sm:h-9 text-base sm:text-xs font-mono rounded-xl"
              dir="ltr"
              placeholder="https://... أو اضغط رفع من الجهاز"
              value={approvalForm.mediaUrl}
              onChange={(e) => onFormChange({ ...approvalForm, mediaUrl: e.target.value })}
            />
            {approvalForm.mediaUrl && (
              <div className="mt-2 p-2 rounded-xl border border-border/60 bg-muted/20 relative group">
                {approvalForm.mediaUrl.match(/\.(mp4|webm|mov|ogg)($|\?)/i) ? (
                  <video
                    src={approvalForm.mediaUrl}
                    controls
                    className="max-h-36 rounded-lg w-full object-cover"
                  />
                ) : (
                  <img
                    src={approvalForm.mediaUrl}
                    alt="معاينة التصميم"
                    className="max-h-36 rounded-lg mx-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-[10px] text-rose-500 hover:text-rose-600 mt-1 h-6 px-2 w-full"
                  onClick={() => onFormChange({ ...approvalForm, mediaUrl: "" })}
                >
                  إزالة الوسائط
                </Button>
              </div>
            )}
          </div>
          <div>
            <Label className="text-xs font-bold">نص الإعلان أو الكابشن (Ad Copy)</Label>
            <Textarea
              className="mt-1 text-base sm:text-xs rounded-xl"
              placeholder="اكتب النص الإعلاني أو الكابشن المقترح ليراجعه العميل..."
              rows={3}
              value={approvalForm.copyText}
              onChange={(e) => onFormChange({ ...approvalForm, copyText: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter className="p-3.5 sm:p-4 border-t border-border/60 bg-background/95 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row gap-2 sm:justify-start">
          <Button
            type="button"
            onClick={onSave}
            className="font-bold h-11 sm:h-9 text-xs w-full sm:w-auto"
          >
            توليد رابط الموافقة وحفظ
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 sm:h-9 text-xs w-full sm:w-auto"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

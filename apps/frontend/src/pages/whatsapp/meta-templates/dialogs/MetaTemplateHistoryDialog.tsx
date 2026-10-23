import React from "react";
import { CheckCircle, History, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateHistoryEntry } from "../types";

interface MetaTemplateHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateHistory: TemplateHistoryEntry[];
  onClearHistory: () => void;
}

export const MetaTemplateHistoryDialog: React.FC<MetaTemplateHistoryDialogProps> = ({
  open,
  onOpenChange,
  templateHistory,
  onClearHistory,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <History className="size-5" />
            </div>
            <div>
              <DialogTitle>سجل التعديلات</DialogTitle>
              <DialogDescription>
                آخر 100 عملية إنشاء وتعديل وحذف للقوالب — مخزنة محلياً في المتصفح
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[400px] space-y-1 overflow-y-auto">
          {templateHistory.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-muted)]">
                <History className="size-6 text-[color:var(--color-muted-foreground)]" />
              </div>
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                لا يوجد سجل بعد
              </p>
              <p className="text-xs text-[color:var(--color-muted-foreground)]">
                أنشئ أو عدّل قالباً ليظهر هنا.
              </p>
            </div>
          ) : (
            templateHistory.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:scale-[1.01] hover:bg-[var(--color-muted)]"
              >
                {entry.action === "created" && (
                  <CheckCircle className="size-4 shrink-0 text-emerald-500" />
                )}
                {entry.action === "edited" && (
                  <Pencil className="size-4 shrink-0 text-amber-500" />
                )}
                {entry.action === "deleted" && (
                  <Trash2 className="size-4 shrink-0 text-red-500" />
                )}
                <span className="font-medium font-mono text-xs">{entry.name}</span>
                {entry.language && (
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {entry.language}
                  </Badge>
                )}
                {entry.category && (
                  <span className="text-[10px] text-[color:var(--color-muted-foreground)]">
                    {entry.category}
                  </span>
                )}
                <span className="mr-auto text-[10px] tabular-nums font-mono text-[color:var(--color-muted-foreground)]">
                  {new Date(entry.timestamp).toLocaleString("ar-SA", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="gap-2">
          {templateHistory.length > 0 && (
            <Button
              variant="outline"
              onClick={onClearHistory}
              className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              مسح السجل
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

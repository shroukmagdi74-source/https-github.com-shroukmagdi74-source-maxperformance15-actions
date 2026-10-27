import React from "react";
import { useTranslation } from "react-i18next";
import { Archive, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AgentActionConfirmModalsProps {
  actionConfirm: "archive" | "delete" | null;
  onClose: () => void;
  deleting: boolean;
  agentName: string;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export const AgentActionConfirmModals: React.FC<AgentActionConfirmModalsProps> = ({
  actionConfirm,
  onClose,
  deleting,
  agentName,
  onArchive,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* ── Archive Dialog ── */}
      <Dialog
        open={actionConfirm === "archive"}
        onOpenChange={(o) => {
          if (!o && !deleting) onClose();
        }}
      >
        <DialogContent className="sm:max-w-sm text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 text-base">
              <Archive className="size-4" />
              {t("agentProfiles.archive.title", "أرشفة الوكيل")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            <p>
              {t(
                "agentProfiles.archive.confirmPrefix",
                "هل أنت متأكد من أرشفة الوكيل",
              )}{" "}
              <strong className="font-semibold text-foreground">
                {agentName}
              </strong>
              {t("agentProfiles.archive.confirmSuffix", "؟")}
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              {t(
                "agentProfiles.archive.note",
                "سيتم نقل الوكيل إلى قائمة المؤرشفين، وتبقى بياناته محفوظة حيث يمكنك استعادته في أي وقت.",
              )}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={deleting}
            >
              {t("common.cancel", "إلغاء")}
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              size="sm"
              onClick={onArchive}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="ml-1 size-3 animate-spin" />
              ) : (
                <Archive className="ml-1 size-3.5" />
              )}
              {deleting
                ? t("agentProfiles.archive.archiving", "جارٍ الأرشفة...")
                : t("agentProfiles.archive.confirmButton", "أرشفة الوكيل")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Agent Dialog ── */}
      <Dialog
        open={actionConfirm === "delete"}
        onOpenChange={(o) => {
          if (!o && !deleting) onClose();
        }}
      >
        <DialogContent className="sm:max-w-sm text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive text-base">
              <Trash2 className="size-4" />
              {t("agentProfiles.delete.title", "حذف الوكيل نهائياً")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            <p>
              {t(
                "agentProfiles.delete.confirmPrefix",
                "هل أنت متأكد من حذف الوكيل",
              )}{" "}
              <strong className="font-semibold text-foreground">
                {agentName}
              </strong>
              {t("agentProfiles.delete.confirmSuffix", " نهائياً؟")}
            </p>
            <p className="text-[11px] text-destructive/80 font-medium">
              {t(
                "agentProfiles.delete.note",
                "سيتم مسح هذا الوكيل وكافة إعداداته وبياناته بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.",
              )}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={deleting}
            >
              {t("common.cancel", "إلغاء")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="ml-1 size-3 animate-spin" />
              ) : (
                <Trash2 className="ml-1 size-3.5" />
              )}
              {deleting
                ? t("agentProfiles.delete.deleting", "جارٍ الحذف...")
                : t("agentProfiles.delete.confirmButton", "حذف نهائي")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

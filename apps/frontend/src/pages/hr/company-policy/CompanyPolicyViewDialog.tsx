import React from "react";
import DOMPurify from "dompurify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Edit } from "lucide-react";
import { Policy } from "./types";
import { getCategoryLabel } from "./helpers";

interface CompanyPolicyViewDialogProps {
  viewingPolicy: Policy | null;
  onClose: () => void;
  onEdit: (policy: Policy) => void;
}

export const CompanyPolicyViewDialog: React.FC<CompanyPolicyViewDialogProps> = ({
  viewingPolicy,
  onClose,
  onEdit,
}) => {
  return (
    <Dialog open={!!viewingPolicy} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">
              {viewingPolicy && getCategoryLabel(viewingPolicy.category)}
            </Badge>
            <span className="text-sm text-gray-500 font-mono tabular-nums">
              النسخة {viewingPolicy?.version}.0
            </span>
          </div>
          <DialogTitle className="text-2xl">{viewingPolicy?.title}</DialogTitle>
          <DialogDescription>
            تم التحديث في{" "}
            {viewingPolicy &&
              new Date(viewingPolicy.updatedAt).toLocaleDateString("ar-EG", {
                dateStyle: "full",
              })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 prose prose-lg dark:prose-invert max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(viewingPolicy?.content || ""),
            }}
          />
        </div>

        <DialogFooter className="mt-8 border-t pt-4">
          <Button onClick={onClose}>إغلاق</Button>
          <Button
            variant="outline"
            onClick={() => {
              if (viewingPolicy) {
                onEdit(viewingPolicy);
                onClose();
              }
            }}
          >
            <Edit className="h-4 w-4 ml-2" />
            تعديل السياسة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

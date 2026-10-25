import React from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AssetsDialogState } from "./types";

interface EmployeeAssetsDialogProps {
  assetsDialog: AssetsDialogState;
  onOpenChange: (open: boolean) => void;
}

export const EmployeeAssetsDialog: React.FC<EmployeeAssetsDialogProps> = ({
  assetsDialog,
  onOpenChange,
}) => {
  return (
    <Dialog open={assetsDialog.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>عهدة {assetsDialog.employeeName}</DialogTitle>
        </DialogHeader>

        {assetsDialog.loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : assetsDialog.error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {assetsDialog.error}
          </div>
        ) : assetsDialog.assets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            لا توجد أصول مسلّمة لهذا الموظف حالياً
          </div>
        ) : (
          <div className="space-y-3">
            {assetsDialog.assets.map((asset: any) => (
              <div
                key={asset.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800/60"
              >
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {asset.name} {asset.code ? `(${asset.code})` : ""}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    الحالة: {asset.status}
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {asset.status === "IN_USE"
                    ? "مسلّمة"
                    : asset.status || "متاحة"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

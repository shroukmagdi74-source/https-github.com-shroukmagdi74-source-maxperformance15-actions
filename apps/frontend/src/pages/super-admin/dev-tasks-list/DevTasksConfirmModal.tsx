import React from "react";
import i18n from "../../../i18n";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ConfirmModalState } from "./types";

interface DevTasksConfirmModalProps {
  modal: ConfirmModalState;
  onCancel: () => void;
}

export const DevTasksConfirmModal: React.FC<DevTasksConfirmModalProps> = ({
  modal,
  onCancel,
}) => {
  if (!modal.show) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      dir={i18n.dir()}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onCancel}
      />
      <div className="relative bg-card rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 size-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <ExclamationTriangleIcon className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {modal.title}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          {modal.message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-foreground text-xs font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={modal.onConfirm}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 text-xs font-medium shadow-xs"
          >
            تأكيد الحذف
          </button>
        </div>
      </div>
    </div>
  );
};

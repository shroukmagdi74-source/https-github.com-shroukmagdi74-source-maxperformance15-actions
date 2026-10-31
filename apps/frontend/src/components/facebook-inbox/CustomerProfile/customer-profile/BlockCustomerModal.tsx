import React from "react";

export interface BlockCustomerModalProps {
  isOpen: boolean;
  blockReason: string;
  blocking: boolean;
  onBlockReasonChange: (reason: string) => void;
  onBlockConfirm: () => void;
  onBlockCancel: () => void;
}

export const BlockCustomerModal: React.FC<BlockCustomerModalProps> = ({
  isOpen,
  blockReason,
  blocking,
  onBlockReasonChange,
  onBlockConfirm,
  onBlockCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="business-modal-surface rounded-lg p-6 w-full max-w-md mx-4">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-foreground)" }}
        >
          حظر العميل على صفحة الفيس بوك
        </h3>
        <p
          className="text-sm mb-4"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          سيتم حظر هذا العميل على صفحة الفيس بوك المحددة ولن يتم استقبال رسائله.
        </p>

        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-foreground)" }}
          >
            سبب الحظر (اختياري)
          </label>
          <textarea
            value={blockReason}
            onChange={(e) => onBlockReasonChange(e.target.value)}
            className="business-chat-input w-full p-2.5 rounded-lg text-sm border"
            rows={3}
            placeholder="أدخل سبب الحظر..."
          />
        </div>

        <div className="flex justify-end space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={onBlockCancel}
            className="business-chip-button px-4 py-2 rounded-lg text-sm font-medium"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onBlockConfirm}
            disabled={blocking}
            className="business-chip-button px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--business-danger)",
              borderColor: "transparent",
              color: "white",
            }}
          >
            {blocking ? "جاري الحظر..." : "تأكيد الحظر"}
          </button>
        </div>
      </div>
    </div>
  );
};

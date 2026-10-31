import React from "react";
import type { Conversation } from "./types";

export interface MessengerDeleteModalProps {
  isOpen: boolean;
  conversation: Conversation | null;
  onClose: () => void;
  onConfirmDelete: (conversation: Conversation) => void;
}

export const MessengerDeleteModal: React.FC<MessengerDeleteModalProps> = ({
  isOpen,
  conversation,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !conversation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">تأكيد الحذف</h3>
        <p className="text-gray-600 mb-6 text-sm">
          هل أنت متأكد من حذف محادثة {conversation.customerName}؟
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => onConfirmDelete(conversation)}
            className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

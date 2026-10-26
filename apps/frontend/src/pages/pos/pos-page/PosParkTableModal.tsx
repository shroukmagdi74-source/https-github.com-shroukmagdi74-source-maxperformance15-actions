import React from "react";
import { X } from "lucide-react";

interface PosParkTableModalProps {
  show: boolean;
  onClose: () => void;
  parkTableName: string;
  setParkTableName: (val: string) => void;
  onParkCart: (e: React.FormEvent) => void;
}

export const PosParkTableModal: React.FC<PosParkTableModalProps> = ({
  show,
  onClose,
  parkTableName,
  setParkTableName,
  onParkCart,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">
            تعليق الطلب (طاولة / شيك مفتوح)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onParkCart} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              رقم الطاولة أو اسم الزبون
            </label>
            <input
              type="text"
              autoFocus
              placeholder="مثال: طاولة 4، صالة 2"
              value={parkTableName}
              onChange={(e) => setParkTableName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-transparent focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-xs transition-colors"
            >
              حفظ وتعليق
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

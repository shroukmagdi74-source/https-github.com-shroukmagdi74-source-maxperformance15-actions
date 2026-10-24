import React from "react";
import {
  CloudArrowDownIcon,
  PaperClipIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { ConfirmModalState } from "./types";

export interface DevTaskAttachmentsTabProps {
  attachments?: any[];
  isUploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalState>>;
  handleDeleteAttachment: (id: string) => void;
}

export const DevTaskAttachmentsTab: React.FC<DevTaskAttachmentsTabProps> = ({
  attachments,
  isUploading,
  handleFileUpload,
  setConfirmModal,
  handleDeleteAttachment,
}) => {
  return (
    <div>
      <div className="mb-6">
        <label className="block w-full cursor-pointer bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl p-8 text-center hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all group">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
            multiple
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <CloudArrowDownIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-gray-700 dark:text-gray-200 font-bold block text-lg mb-1">
            {isUploading ? "جاري الرفع..." : "اضغط لرفع ملفات متعددة"}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">
            يمكنك اختيار أكثر من ملف في نفس الوقت (حتى 10 ملفات)
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 block">
            الحد الأقصى: 20 ميجابايت لكل ملف • الصور، PDF، Word، Excel
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments?.map((file) => {
          const isImage = file.fileType?.startsWith("image/");
          return (
            <div
              key={file.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              {isImage ? (
                <div className="relative">
                  <img
                    src={file.fileUrl || `/uploads/dev-tasks/${file.fileName}`}
                    alt={file.originalName || file.fileName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <a
                      href={
                        file.fileUrl || `/uploads/dev-tasks/${file.fileName}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 shadow-sm"
                    >
                      <CloudArrowDownIcon className="h-5 w-5" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmModal({
                          open: true,
                          message: "هل أنت متأكد من حذف هذا المرفق؟",
                          onConfirm: () => handleDeleteAttachment(file.id),
                        })
                      }
                      className="p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-3 bg-gradient-to-t from-black/50 to-transparent absolute bottom-0 left-0 right-0">
                    <p
                      className="text-sm font-semibold text-white truncate"
                      title={file.originalName || file.fileName}
                    >
                      {file.originalName || file.fileName}
                    </p>
                    <p className="text-xs text-gray-200 mt-0.5 font-mono tabular-nums">
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <PaperClipIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate"
                      title={file.originalName || file.fileName}
                    >
                      {file.originalName || file.fileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <span className="font-mono tabular-nums">
                        {(file.fileSize / 1024).toFixed(1)} KB
                      </span>{" "}
                      •{" "}
                      {new Date(file.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <a
                      href={
                        file.fileUrl || `/uploads/dev-tasks/${file.fileName}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                    >
                      <CloudArrowDownIcon className="h-5 w-5" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmModal({
                          open: true,
                          message: "هل أنت متأكد من حذف هذا المرفق؟",
                          onConfirm: () => handleDeleteAttachment(file.id),
                        })
                      }
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(!attachments || attachments.length === 0) && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 mt-4">
          <PaperClipIcon className="h-9 w-9 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm">لا توجد مرفقات</p>
        </div>
      )}
    </div>
  );
};

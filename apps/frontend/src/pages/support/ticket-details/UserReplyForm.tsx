import React from "react";
import { AlertCircle, Paperclip, Send, X } from "lucide-react";
import { AttachmentFile } from "./types";

interface UserReplyFormProps {
  messageContent: string;
  setMessageContent: (content: string) => void;
  error: string | null;
  sendingMessage: boolean;
  attachments: AttachmentFile[];
  handleSendMessage: (e: React.FormEvent) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (index: number) => void;
}

export const UserReplyForm: React.FC<UserReplyFormProps> = ({
  messageContent,
  setMessageContent,
  error,
  sendingMessage,
  attachments,
  handleSendMessage,
  handleFileUpload,
  removeAttachment,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 flex-shrink-0 border border-slate-200/80 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
        إضافة رد
      </h3>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
          <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="space-y-3">
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="اكتب ردك هنا..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
        />

        {/* File Upload */}
        <div>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="user-message-file-upload"
          />
          <label
            htmlFor="user-message-file-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-sm text-gray-700 dark:text-slate-300"
          >
            <Paperclip className="w-4 h-4 ml-2" />
            إرفاق ملفات
          </label>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/80 rounded-lg p-3 border border-slate-200/60 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  {attachment.preview ? (
                    <img
                      src={attachment.preview}
                      alt="Preview"
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded flex items-center justify-center">
                      <Paperclip className="w-3 h-3 text-gray-500 dark:text-slate-400" />
                    </div>
                  )}
                  <span className="text-sm text-gray-900 dark:text-slate-200 truncate max-w-xs">
                    {attachment.file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              sendingMessage ||
              (!messageContent.trim() && attachments.length === 0)
            }
            className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {sendingMessage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 ml-2" />
                إرسال
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

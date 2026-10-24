import React from "react";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

export interface DevTaskCommentsTabProps {
  comments?: any[];
  newComment: string;
  setNewComment: (comment: string) => void;
  handleAddComment: () => void;
}

export const DevTaskCommentsTab: React.FC<DevTaskCommentsTabProps> = ({
  comments,
  newComment,
  setNewComment,
  handleAddComment,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="اكتب تعليقاً..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-shadow shadow-sm"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all active:scale-95"
          >
            إضافة تعليق
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {comments?.map((comment) => (
          <div
            key={comment.id}
            className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0"
          >
            <div className="flex items-start gap-4">
              {comment.authorAvatar ? (
                <img
                  src={comment.authorAvatar}
                  alt=""
                  className="w-10 h-10 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  {comment.authorName?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl rounded-tr-none">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleString("ar-EG")}
                    {comment.isEdited && (
                      <span className="mr-1">(معدل)</span>
                    )}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        ))}
        {(!comments || comments.length === 0) && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>لا توجد تعليقات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
};

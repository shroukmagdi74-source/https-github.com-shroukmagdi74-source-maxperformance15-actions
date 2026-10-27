import React from "react";
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";

interface ChatMessageInputProps {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  onTypingStart: () => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  newMessage,
  setNewMessage,
  onTypingStart,
  onSendMessage,
  onKeyPress,
}) => {
  return (
    <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-6 shadow-lg">
      <div className="flex items-end space-x-3 space-x-reverse">
        <button
          type="button"
          className="p-3 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 group"
          aria-label="إرفاق ملف"
        >
          <PaperClipIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
        </button>
        <div className="flex-1 relative">
          <label htmlFor="conversation-message-input" className="sr-only">
            اكتب رسالتك هنا
          </label>
          <textarea
            id="conversation-message-input"
            name="message"
            autoComplete="off"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              onTypingStart();
            }}
            onKeyPress={onKeyPress}
            placeholder="اكتب رسالتك هنا..."
            className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md"
            rows={1}
          />
        </div>
        <button
          type="button"
          className="p-3 text-gray-400 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-200 group"
          aria-label="إضافة رموز تعبيرية"
        >
          <FaceSmileIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
        </button>
        <button
          type="button"
          onClick={onSendMessage}
          disabled={!newMessage.trim()}
          className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group"
          aria-label="إرسال الرسالة"
        >
          <PaperAirplaneIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

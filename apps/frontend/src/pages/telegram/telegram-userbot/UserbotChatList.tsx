import React from "react";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { Chat } from "./types";

export interface UserbotChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefreshChats: () => void;
}

export const UserbotChatList: React.FC<UserbotChatListProps> = ({
  chats,
  selectedChat,
  onSelectChat,
  searchTerm,
  onSearchChange,
  onRefreshChats,
}) => {
  return (
    <div className="w-80 border-r dark:border-r-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800">
      <div className="p-4 border-b dark:border-b-gray-700 flex justify-between items-center">
        <h3 className="font-bold dark:text-white">Chats</h3>
        <button
          onClick={onRefreshChats}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded dark:text-gray-300"
          aria-label="Refresh chats"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b dark:border-b-gray-700 bg-white dark:bg-gray-800">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
          />
        </div>
      </div>

      {/* Settings Link */}
      <div className="px-4 pb-2">
        <a
          href="/settings/telegram"
          className="text-xs text-gray-500 hover:underline block pt-2"
        >
          Manage Connections in Settings
        </a>
      </div>

      {/* Chats Scroll List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`p-3 border-b dark:border-b-gray-700 cursor-pointer hover:bg-white dark:hover:bg-gray-750 transition-colors ${
              selectedChat?.id === chat.id
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : ""
            }`}
          >
            <div className="flex justify-between mb-1">
              <span className="font-semibold truncate dark:text-white">
                {chat.name}
              </span>
              <span className="text-xs text-gray-400 tabular-nums">
                {new Date(chat.date * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate w-4/5">
                {chat.lastMessage}
              </div>
              {chat.unreadCount > 0 && (
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full tabular-nums">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

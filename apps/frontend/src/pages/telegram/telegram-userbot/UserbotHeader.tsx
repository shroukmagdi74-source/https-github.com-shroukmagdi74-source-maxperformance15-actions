import React from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

export const UserbotHeader: React.FC = () => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
          <PaperAirplaneIcon className="h-8 w-8 text-blue-500" />
          Telegram Userbot
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Connect your personal Telegram account
        </p>
      </div>
    </div>
  );
};

import React from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import type { UserbotSummary } from "./types";

export interface UserbotSelectStepProps {
  userbots: UserbotSummary[];
  onSelectUserbot: (id: string, isConnected: boolean) => void;
}

export const UserbotSelectStep: React.FC<UserbotSelectStepProps> = ({
  userbots,
  onSelectUserbot,
}) => {
  const connectedBots = Array.isArray(userbots)
    ? userbots.filter((u) => u && u.sessionString)
    : [];

  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          Select Userbot
        </h2>
        {!userbots || userbots.length === 0 ? (
          <div className="py-4">
            <PaperAirplaneIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">
              No Telegram Userbots connected yet.
            </p>
            <a
              href="/settings/telegram"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Settings to Connect
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Select an account to start chatting:
            </p>
            {Array.isArray(userbots) &&
              userbots.map((userbot: UserbotSummary) => {
                if (!userbot || !userbot.id) return null;
                const isConnected = !!userbot.sessionString;

                if (!isConnected) return null; // Only show connected bots

                return (
                  <button
                    key={userbot.id}
                    onClick={() => onSelectUserbot(userbot.id, isConnected)}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                  >
                    <div className="font-semibold flex items-center justify-between dark:text-white">
                      <span>{userbot.label || "Unnamed Userbot"}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Connected
                      </span>
                    </div>
                    {userbot.clientPhone && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
                        {userbot.clientPhone}
                      </div>
                    )}
                  </button>
                );
              })}

            {connectedBots.length === 0 && (
              <div className="py-4">
                <p className="text-amber-600 mb-4">
                  You have added Userbots but none are connected.
                </p>
                <a
                  href="/settings/telegram"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Go to Settings to Complete Setup
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

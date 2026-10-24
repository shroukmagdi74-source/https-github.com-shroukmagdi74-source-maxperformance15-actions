import React from "react";
import { ALL_CHANNELS, DEFAULT_CHANNELS, type SmartReplyChannel } from "./types";

export interface SmartReplyChannelBadgesProps {
  channels?: SmartReplyChannel[];
}

export function SmartReplyChannelBadges({ channels }: SmartReplyChannelBadgesProps) {
  const currentChannels =
    Array.isArray(channels) && channels.length > 0
      ? channels
      : DEFAULT_CHANNELS;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {ALL_CHANNELS.filter((c) => currentChannels.includes(c.id)).map((c) => (
        <span
          key={c.id}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.badgeClass}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
          <span>{c.shortLabel}</span>
        </span>
      ))}
    </div>
  );
}

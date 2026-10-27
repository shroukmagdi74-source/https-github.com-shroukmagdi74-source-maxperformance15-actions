import React from "react";
import { cn } from "@/lib/utils";

export interface MessageReactionsPillProps {
  reactionCounts: Record<string, number>;
  totalReactionCount: number;
  myReaction: string | null;
  reactorDescriptions: string[];
  isFromMe: boolean;
  onPillClick: (e: React.MouseEvent) => void;
  onPillKeyDown: (e: React.KeyboardEvent) => void;
  pillRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageReactionsPill: React.FC<MessageReactionsPillProps> = ({
  reactionCounts,
  totalReactionCount,
  myReaction,
  reactorDescriptions,
  isFromMe,
  onPillClick,
  onPillKeyDown,
  pillRef,
}) => {
  if (totalReactionCount <= 0) return null;

  return (
    <div
      ref={pillRef}
      role="button"
      tabIndex={0}
      onClick={onPillClick}
      onKeyDown={onPillKeyDown}
      title={reactorDescriptions.join(" • ")}
      className={cn(
        "business-reaction-pill absolute -bottom-3 rounded-full shadow-md border flex items-center px-1.5 py-0.5 gap-1 cursor-pointer select-none transition-all active:scale-95 z-10",
        myReaction && "ring-1 ring-primary/40 border-primary/40 bg-primary/10",
        isFromMe ? "start-2" : "end-2"
      )}
      style={{
        background: "var(--business-floating-surface, var(--color-card))",
        borderColor: "var(--business-card-border, var(--color-border))",
      }}
    >
      {Object.entries(reactionCounts).map(([reaction, count]) => (
        <span key={reaction} className="text-xs leading-none flex items-center">
          <span className="text-sm leading-none">{reaction}</span>
          {count > 1 && (
            <span className="text-[10px] ml-0.5 font-medium tabular-nums text-[color:var(--color-muted-foreground)]">
              {count}
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

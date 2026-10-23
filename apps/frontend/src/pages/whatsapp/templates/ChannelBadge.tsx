import React from "react";
import { Cloud, Layers, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChannelBadgeProps {
  channel?: string | null;
  isArabic: boolean;
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({ channel, isArabic }) => {
  const norm = (channel || "AUTO").toUpperCase();
  if (norm === "META_CLOUD") {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-sky-300/80 bg-sky-500/10 text-sky-800 dark:border-sky-500/40 dark:text-sky-200"
      >
        <Cloud className="size-3" />
        {isArabic ? "ميتا كلاود (Meta Cloud)" : "Meta Cloud"}
      </Badge>
    );
  }
  if (norm === "BAILEYS") {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-300/80 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/40 dark:text-emerald-200"
      >
        <Smartphone className="size-3" />
        {isArabic ? "واتساب ويب (Baileys)" : "Baileys"}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1 border-slate-300/80 bg-slate-500/10 text-slate-700 dark:border-slate-500/40 dark:text-slate-300"
    >
      <Layers className="size-3" />
      {isArabic ? "توجيه ذكي (Auto)" : "Smart Auto"}
    </Badge>
  );
};

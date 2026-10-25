import React from "react";
import { PlayCircle } from "lucide-react";
import type { MarketplaceApp as MPA } from "@/types/marketplace";
import { getDirectVideoUrl, getYouTubeEmbedUrl } from "@/utils/explanationVideo";

interface AppDetailsVideoProps {
  app: MPA;
  explanation: { title: string; videoUrl: string | null } | null;
}

/**
 * The explainer sits right under the hero — it is the strongest thing on the
 * page and it should not be buried under a tab.
 */
export const AppDetailsVideo: React.FC<AppDetailsVideoProps> = ({ app, explanation }) => {
  const src = explanation?.videoUrl;
  if (!src) return null;
  const embed = getYouTubeEmbedUrl(src);
  const direct = getDirectVideoUrl(src);

  return (
    <section className="text-right">
      <div className="overflow-hidden rounded-2xl bg-black/95 shadow-[0_24px_60px_-28px_rgba(11,18,32,0.45)]">
        {embed ? (
          <iframe
            src={embed}
            title={explanation?.title || app.name}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <video src={direct || src} controls playsInline preload="metadata" className="aspect-video w-full" />
        )}
      </div>
      <p className="mt-3 flex items-center justify-end gap-1.5 text-[12.5px] text-muted-foreground">
        <PlayCircle size={14} className="text-primary" />
        {explanation?.title || "شرح بالفيديو من الشاشة الحقيقية"}
      </p>
    </section>
  );
};

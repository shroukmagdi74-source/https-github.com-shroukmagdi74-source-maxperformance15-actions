import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

export interface LottieElementSettings {
  url?: string;
  animationData?: Record<string, any>;
  fallbackImage?: string;
  poster?: string;
  image?: string;
  autoplay?: boolean;
  loop?: boolean;
  ratio?: '1:1' | '16:9' | '4:3' | string;
  width?: number | string;
  height?: number | string;
  title?: string;
  message?: string;
  className?: string;
}

export interface LottieElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: LottieElementSettings;
    [key: string]: any;
  };
  settings?: LottieElementSettings;
}

const LottieElement: React.FC<LottieElementProps> = ({ section, settings: directSettings }) => {
  const mergedSettings = { ...section?.settings, ...directSettings };
  const rawUrl = mergedSettings?.url?.trim();
  const fallbackImg = (mergedSettings?.fallbackImage || mergedSettings?.poster || mergedSettings?.image)?.trim();
  const autoplay = mergedSettings?.autoplay !== false;
  const loop = mergedSettings?.loop !== false;
  const rawRatio = String(mergedSettings?.ratio || '1:1').trim().toLowerCase();
  const customClass = mergedSettings?.className || '';
  const message = mergedSettings?.message || mergedSettings?.title || 'أنيميشن Lottie';

  const containerRef = useRef<HTMLDivElement>(null);
  const [hasLottieWeb, setHasLottieWeb] = useState(false);

  // Aspect ratio classes
  let aspectClass = 'aspect-square';
  if (rawRatio === '16:9') {
    aspectClass = 'aspect-[16/9]';
  } else if (rawRatio === '4:3') {
    aspectClass = 'aspect-[4/3]';
  }

  // Safe runtime check for lottie-web without adding a bundle dependency
  useEffect(() => {
    let anim: any = null;
    try {
      if (typeof window !== 'undefined' && (window as any).lottie) {
        setHasLottieWeb(true);
        anim = (window as any).lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop,
          autoplay,
          path: rawUrl,
          animationData: mergedSettings?.animationData,
        });
      }
    } catch {
      // zero throw on any error
      setHasLottieWeb(false);
    }

    return () => {
      try {
        anim?.destroy?.();
      } catch {
        // zero throw
      }
    };
  }, [rawUrl, autoplay, loop, mergedSettings?.animationData]);

  const containerStyle: React.CSSProperties = {
    borderRadius: 'var(--store-radius, 8px)',
    width: mergedSettings?.width,
    height: mergedSettings?.height,
  };

  // If lottie-web is present in runtime, render the animation container
  if (hasLottieWeb) {
    return (
      <div
        data-storefront-element="lottie"
        data-element="lottie"
        className={`storefront-lottie-wrapper relative w-full overflow-hidden ${aspectClass} ${customClass}`.trim()}
        style={containerStyle}
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>
    );
  }

  // Without dependency: render fallback (image or structured placeholder) with ZERO throw
  return (
    <div
      data-storefront-element="lottie"
      data-element="lottie"
      data-fallback="true"
      className={`storefront-lottie-wrapper relative w-full overflow-hidden ${aspectClass} ${customClass}`.trim()}
      style={containerStyle}
    >
      {fallbackImg ? (
        <img
          src={fallbackImg}
          alt={message}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 border border-dashed border-border/70 bg-muted/20 p-6 text-center text-muted-foreground transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <SparklesIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">{message}</p>
            {rawUrl ? (
              <p className="text-[10.5px] font-mono text-muted-foreground truncate max-w-xs px-2">
                {rawUrl.split('/').pop() || rawUrl}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground/75">
                أدخل رابط JSON للأنيميشن أو صورة بديلة
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LottieElement;

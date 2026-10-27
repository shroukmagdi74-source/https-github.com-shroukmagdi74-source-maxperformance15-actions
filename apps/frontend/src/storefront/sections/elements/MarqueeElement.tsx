import React, { useState, useId, useRef, useEffect } from 'react';

export interface MarqueeItem {
  id?: string;
  text?: string;
  icon?: string;
  image?: string;
  url?: string;
  badge?: string;
}

export interface MarqueeLogo {
  id?: string;
  url: string;
  alt?: string;
  link?: string;
  name?: string;
}

export interface MarqueeElementSettings {
  text?: string;
  items?: (string | MarqueeItem)[];
  logos?: (string | MarqueeLogo)[];
  speed?: number | string;
  direction?: 'left' | 'right';
  dir?: 'ltr' | 'rtl';
  pauseOnHover?: boolean;
  gap?: number | string;
  fontSize?: string;
  textColor?: string;
  bgColor?: string;
  gradient?: boolean;
  className?: string;
}

export interface MarqueeElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: MarqueeElementSettings;
    [key: string]: any;
  };
  settings?: MarqueeElementSettings;
  dir?: 'ltr' | 'rtl';
}

const DEFAULT_ITEMS: MarqueeItem[] = [
  { text: 'توصيل سريع لجميع المحافظات', icon: '🚚' },
  { text: 'دفع آمن عند الاستلام', icon: '🛡️' },
  { text: 'استرجاع واستبدال مجاني خلال 14 يوم', icon: '🔄' },
  { text: 'خدمة عملاء ودعم متواصل 24/7', icon: '💬' },
];

const MarqueeElement: React.FC<MarqueeElementProps> = ({
  section,
  settings: directSettings,
  dir: propDir,
}) => {
  const mergedSettings = { ...section?.settings, ...directSettings };
  const rawSpeed = mergedSettings?.speed ?? 30;
  const speedNum = typeof rawSpeed === 'number' ? rawSpeed : parseFloat(String(rawSpeed)) || 30;
  const durationSec = Math.max(1, speedNum);
  const durationCss = `${durationSec}s`;

  const direction = mergedSettings?.direction === 'right' ? 'right' : 'left';
  const pauseOnHover = mergedSettings?.pauseOnHover !== false;
  const customGap = mergedSettings?.gap ?? 32;
  const gapValue = typeof customGap === 'number' ? `${customGap}px` : customGap;
  const customClass = mergedSettings?.className || '';

  const uniqueId = useId().replace(/[:]/g, '');
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [detectedRtl, setDetectedRtl] = useState(false);

  // Determine RTL mode: propDir -> settings.dir -> DOM context
  const declaredDir = propDir || mergedSettings?.dir;
  const isRtl = declaredDir === 'rtl' || detectedRtl;

  useEffect(() => {
    if (declaredDir) {
      setDetectedRtl(declaredDir === 'rtl');
      return;
    }
    if (containerRef.current) {
      const closestRtl = containerRef.current.closest('[dir="rtl"]');
      const docRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
      setDetectedRtl(Boolean(closestRtl || docRtl));
    }
  }, [declaredDir]);

  // Parse items
  let parsedItems: (MarqueeItem | { type: 'logo'; logo: MarqueeLogo })[] = [];

  if (Array.isArray(mergedSettings?.logos) && mergedSettings.logos.length > 0) {
    parsedItems = mergedSettings.logos.map((logo, idx) => {
      if (typeof logo === 'string') {
        return { type: 'logo', logo: { id: `logo-${idx}`, url: logo } };
      }
      return { type: 'logo', logo: { id: logo.id || `logo-${idx}`, ...logo } };
    });
  } else if (Array.isArray(mergedSettings?.items) && mergedSettings.items.length > 0) {
    parsedItems = mergedSettings.items.map((item, idx) => {
      if (typeof item === 'string') {
        return { id: `item-${idx}`, text: item };
      }
      return { id: item.id || `item-${idx}`, ...item };
    });
  } else if (typeof mergedSettings?.text === 'string' && mergedSettings.text.trim()) {
    const rawParts = mergedSettings.text.split(/•|\n/).map((s) => s.trim()).filter(Boolean);
    if (rawParts.length > 0) {
      parsedItems = rawParts.map((t, idx) => ({ id: `text-${idx}`, text: t, icon: '✨' }));
    } else {
      parsedItems = [{ id: 'text-0', text: mergedSettings.text.trim(), icon: '✨' }];
    }
  } else {
    parsedItems = DEFAULT_ITEMS;
  }

  // Duplicate items for seamless continuous looping
  const doubledItems = [...parsedItems, ...parsedItems];

  // In LTR: left is normal, right is reverse.
  // In RTL: direction inverts so left scrolls reverse and right scrolls normal.
  const animationDirection = isRtl
    ? direction === 'right'
      ? 'normal'
      : 'reverse'
    : direction === 'right'
    ? 'reverse'
    : 'normal';

  const scopeClass = `sf-marquee-${uniqueId}`;

  return (
    <div
      ref={containerRef}
      data-storefront-element="marquee"
      data-element="marquee"
      dir={isRtl ? 'rtl' : declaredDir}
      data-speed={durationSec}
      data-direction={direction}
      data-rtl={isRtl ? 'true' : 'false'}
      role="region"
      aria-label="شريط متحرك"
      className={`storefront-marquee-root relative w-full overflow-hidden py-3 text-sm select-none ${scopeClass} ${customClass}`.trim()}
      style={{
        backgroundColor: mergedSettings?.bgColor,
        color: mergedSettings?.textColor,
      }}
      onMouseEnter={() => {
        if (pauseOnHover) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (pauseOnHover) setIsHovered(false);
      }}
    >
      <style>{`
        .${scopeClass} .storefront-marquee-track {
          display: flex;
          width: max-content;
          animation-name: sfMarqueeScroll_${uniqueId};
          animation-duration: ${durationCss};
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .${scopeClass} .storefront-marquee-track.pause-on-hover:hover {
          animation-play-state: paused;
        }
        @keyframes sfMarqueeScroll_${uniqueId} {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .${scopeClass} .storefront-marquee-track,
          .storefront-marquee-track {
            animation: none !important;
          }
        }
        [dir="rtl"] .${scopeClass} .storefront-marquee-track,
        .${scopeClass}[dir="rtl"] .storefront-marquee-track {
          animation-direction: reverse;
        }
      `}</style>

      {/* Track */}
      <div
        data-testid="marquee-track"
        className={`storefront-marquee-track flex items-center shrink-0 ${pauseOnHover ? 'pause-on-hover' : ''}`.trim()}
        style={{
          gap: gapValue,
          animationDuration: durationCss,
          animationDirection,
          animationPlayState: isHovered && pauseOnHover ? 'paused' : undefined,
        }}
      >
        {doubledItems.map((item, index) => {
          if ('type' in item && item.type === 'logo') {
            const logo = item.logo;
            const content = (
              <img
                src={logo.url}
                alt={logo.alt || logo.name || 'شعار'}
                className="h-8 max-h-8 w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
                loading="lazy"
              />
            );
            return (
              <div key={`logo-${index}`} className="flex shrink-0 items-center px-2">
                {logo.link ? (
                  <a
                    href={logo.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          }

          const standardItem = item as MarqueeItem;
          const textContent = (
            <span className="flex items-center gap-2 whitespace-nowrap font-medium">
              {standardItem.icon && <span aria-hidden="true">{standardItem.icon}</span>}
              <span>{standardItem.text}</span>
              {standardItem.badge && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-bold">
                  {standardItem.badge}
                </span>
              )}
            </span>
          );

          return (
            <div key={`item-${index}`} className="flex shrink-0 items-center">
              {standardItem.url ? (
                <a href={standardItem.url} className="hover:underline">
                  {textContent}
                </a>
              ) : (
                textContent
              )}
              <span className="mx-3 text-muted-foreground/40" aria-hidden="true">
                •
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarqueeElement;

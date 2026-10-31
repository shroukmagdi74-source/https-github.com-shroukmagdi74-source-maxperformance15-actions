import React from 'react';
import { Link, type Location } from 'react-router-dom';
import { buildStorefrontPath } from '../../utils/paths';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import {
  resolveOfferSignals,
  TONE_CLASS_MAP,
  type OfferBentoVariant,
  type OfferCard,
} from './types';

export interface StandardBentoViewProps {
  cards: OfferCard[];
  location: Location;
  variant: OfferBentoVariant;
  themeId?: string;
  isBiteRush: boolean;
}

export const StandardBentoView: React.FC<StandardBentoViewProps> = ({
  cards,
  location,
  variant,
  themeId,
  isBiteRush,
}) => {
  return (
    <div
      className={`grid grid-cols-1 ${
        variant === 'daily-picks'
          ? 'gap-4 xl:grid-cols-3'
          : variant === 'combo-deals'
            ? 'gap-4 xl:grid-cols-[1.15fr_1fr_1fr]'
            : 'gap-4 xl:grid-cols-[1.25fr_0.9fr_0.9fr]'
      }`}
    >
      {cards.map((card, index) => {
        const href = buildStorefrontPath(
          location.pathname,
          card.link.startsWith('/') ? card.link : `/${card.link}`,
          location.search,
        );
        const signals = resolveOfferSignals(card, index, themeId);
        const isCutout = Boolean(card.image && card.image.toLowerCase().endsWith('.png'));

        return (
          <Link
            key={`${card.title}-${index}`}
            to={href}
            className={`group relative flex flex-col overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
              variant === 'campaign-stack' ? 'xl:first:col-span-2' : ''
            } ${
              isBiteRush
                ? index === 0
                  ? 'rounded-[2rem] border-[#171717] bg-[#171717] text-white shadow-[0_30px_80px_-42px_rgba(23,23,23,0.75)]'
                  : index === 1
                    ? 'rounded-[2rem] border-[#ff6b2c]/30 bg-[linear-gradient(135deg,#ff6b2c,#ff874f)] text-white shadow-[0_28px_70px_-38px_rgba(255,107,44,0.58)]'
                    : 'rounded-[2rem] border-[#ffd6c4] bg-white text-[#171717] shadow-[0_28px_70px_-42px_rgba(17,17,17,0.18)]'
                : `${
                    TONE_CLASS_MAP[card.tone || 'primary'] || TONE_CLASS_MAP['primary']
                  } hover:shadow-[0_30px_90px_-62px_hsl(var(--primary)/0.48)]`
            } ${card.image ? 'p-0' : 'p-6 min-h-[240px]'}`}
          >
            <div
              className={`absolute -top-10 end-0 h-40 w-40 rounded-full blur-2xl pointer-events-none ${
                isBiteRush
                  ? index === 0
                    ? 'bg-[radial-gradient(circle_at_center,rgba(255,107,44,0.35),transparent_70%)]'
                    : 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_70%)]'
                  : 'bg-[radial-gradient(circle_at_center,hsl(var(--accent)/0.18),transparent_70%)]'
              }`}
            />

            {card.image ? (
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-muted/30 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-card border-b border-border/50">
                <StorefrontProductImage
                  candidates={[card.image]}
                  alt={card.title}
                  loading="lazy"
                  fetchpriority="low"
                  deferUntilVisible
                  deferRootMargin="700px 0px"
                  requestedWidth={480}
                  imageQuality={75}
                  className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 ${
                    isCutout
                      ? 'object-contain p-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)]'
                      : 'object-cover'
                  }`}
                />
                {!isCutout && (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                )}

                <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide shadow-sm backdrop-blur-md ${
                      isBiteRush
                        ? index === 0
                          ? 'border border-white/15 bg-white/10 text-orange-200'
                          : index === 1
                            ? 'border border-white/25 bg-white/10 text-white'
                            : 'border border-[#171717]/10 bg-[#fff7f1] text-[#dc2626]'
                        : 'border border-white/60 bg-background/88 text-primary'
                    }`}
                  >
                    {card.label || `عرض 0${index + 1}`}
                  </span>
                  {card.stat ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide shadow-md ${
                        isBiteRush
                          ? index === 2
                            ? 'bg-[#171717] text-white'
                            : 'bg-white text-[#171717]'
                          : 'bg-foreground text-background'
                      }`}
                    >
                      {card.stat}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div
              className={`relative z-10 flex flex-1 flex-col justify-between gap-6 ${
                card.image ? 'p-5 sm:p-6' : ''
              }`}
            >
              {!card.image && (
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${
                        isBiteRush
                          ? index === 0
                            ? 'border border-white/15 bg-white/10 text-orange-200'
                            : index === 1
                              ? 'border border-white/25 bg-white/10 text-white'
                              : 'border border-[#171717]/10 bg-[#fff7f1] text-[#dc2626]'
                          : 'border border-white/60 bg-background/84 text-primary backdrop-blur'
                      }`}
                    >
                      {card.label || `عرض 0${index + 1}`}
                    </span>
                    <h3
                      className={`max-w-sm font-heading text-2xl font-black tracking-tight ${
                        isBiteRush
                          ? index === 2
                            ? 'text-[#171717]'
                            : 'text-white'
                          : 'text-foreground'
                      }`}
                    >
                      {card.title}
                    </h3>
                  </div>
                  {card.stat ? (
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${
                        isBiteRush
                          ? index === 2
                            ? 'bg-[#171717] text-white'
                            : 'bg-white text-[#171717]'
                          : 'bg-foreground text-background'
                      }`}
                    >
                      {card.stat}
                    </span>
                  ) : null}
                </div>
              )}

              {card.image && (
                <h3
                  className={`max-w-sm font-heading text-xl sm:text-2xl font-black tracking-tight ${
                    isBiteRush
                      ? index === 2
                        ? 'text-[#171717]'
                        : 'text-white'
                      : 'text-foreground'
                  }`}
                >
                  {card.title}
                </h3>
              )}

              <div className="space-y-4">
                <p
                  className={`max-w-md text-sm leading-7 ${
                    isBiteRush
                      ? index === 2
                        ? 'text-[#5f5f5f]'
                        : 'text-white/82'
                      : 'text-muted-foreground'
                  }`}
                >
                  {card.subtitle}
                </p>
                {signals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {signals.map((signal) => (
                      <span
                        key={`${card.title}-${signal}`}
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold shadow-sm ${
                          isBiteRush
                            ? index === 2
                              ? 'border border-[#171717]/10 bg-[#fff7f1] text-[#171717]'
                              : 'border border-white/15 bg-white/10 text-white'
                            : 'border border-primary/10 bg-background/88 text-foreground'
                        }`}
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div
                  className={`inline-flex items-center gap-2 text-sm font-black ${
                    isBiteRush
                      ? index === 2
                        ? 'text-[#dc2626]'
                        : 'text-white'
                      : 'text-primary'
                  }`}
                >
                  {card.ctaText || 'شاهد التفاصيل'}
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:-translate-x-1 ${
                      isBiteRush
                        ? index === 2
                          ? 'border border-[#171717]/10 bg-white'
                          : 'border border-white/15 bg-white/10'
                        : 'border border-primary/15 bg-background/75'
                    }`}
                  >
                    ←
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default StandardBentoView;

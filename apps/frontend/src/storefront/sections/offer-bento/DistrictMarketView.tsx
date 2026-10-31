import React from 'react';
import { Link, type Location } from 'react-router-dom';
import { buildStorefrontPath } from '../../utils/paths';
import {
  resolveDistrictMarketOfferCaption,
  resolveDistrictMarketOfferImage,
  resolveOfferSignals,
  type OfferCard,
} from './types';

export interface DistrictMarketViewProps {
  cards: OfferCard[];
  location: Location;
  themeId?: string;
}

export const DistrictMarketView: React.FC<DistrictMarketViewProps> = ({
  cards,
  location,
  themeId,
}) => {
  return (
    <div className="overflow-hidden rounded-[1.85rem] border border-primary/10 bg-card shadow-[0_24px_80px_-60px_hsl(var(--primary)/0.32)]">
      <div className="grid grid-cols-1 xl:grid-cols-[1.18fr_0.82fr]">
        {cards[0] ? (() => {
          const leadCard = cards[0];
          const href = buildStorefrontPath(
            location.pathname,
            leadCard.link.startsWith('/') ? leadCard.link : `/${leadCard.link}`,
            location.search,
          );
          const signals = resolveOfferSignals(leadCard, 0, themeId);

          return (
            <Link
              to={href}
              className="group relative grid h-full gap-5 border-b border-primary/10 bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),rgba(255,255,255,0.98)_52%,hsl(var(--secondary)/0.96))] px-5 py-6 transition-colors duration-300 hover:bg-[linear-gradient(135deg,hsl(var(--primary)/0.17),rgba(255,255,255,0.99)_48%,hsl(var(--secondary)/0.96))] sm:px-6 sm:py-7 xl:grid-cols-[minmax(0,1fr)_15rem] xl:border-b-0 xl:border-s"
            >
              <div className="flex min-w-0 flex-col gap-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <span className="inline-flex text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                      {leadCard.label || 'المدخل الأسرع'}
                    </span>
                    <h3 className="max-w-xl font-heading text-[1.8rem] font-black tracking-tight text-foreground sm:text-[2rem]">
                      {leadCard.title}
                    </h3>
                  </div>
                  {leadCard.stat ? (
                    <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-background">
                      {leadCard.stat}
                    </span>
                  ) : null}
                </div>

                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
                  {leadCard.subtitle}
                </p>

                <div className="grid gap-2 text-sm text-foreground/78 sm:grid-cols-2">
                  {signals.map((signal) => (
                    <div
                      key={`${leadCard.title}-${signal}`}
                      className="flex items-start gap-2 rounded-2xl bg-background/74 px-3 py-2"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="leading-6">{signal}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full border border-primary/12 bg-background/84 px-3 py-1 text-[11px] font-black tracking-[0.16em] text-primary">
                    {resolveDistrictMarketOfferCaption(leadCard, 0)}
                  </span>
                  <div className="inline-flex items-center gap-2 text-sm font-black text-primary">
                    {leadCard.ctaText || 'شاهد التفاصيل'}
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/15 bg-background/76 transition-transform duration-300 group-hover:-translate-x-1">
                      ←
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[15rem] overflow-hidden rounded-[1.4rem] border border-[#ead8cb] bg-[linear-gradient(180deg,#fffbf6,#f3e6d9)] shadow-[0_18px_42px_-28px_rgba(61,37,25,0.22)]">
                <img
                  src={resolveDistrictMarketOfferImage(leadCard, 0)}
                  alt={leadCard.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(61,37,25,0.14))]" />
                <div className="absolute inset-x-4 bottom-4 rounded-[1rem] border border-white/60 bg-white/88 px-4 py-3 shadow-[0_18px_36px_-28px_rgba(61,37,25,0.32)] backdrop-blur">
                  <span className="inline-flex text-[11px] font-black tracking-[0.18em] text-[#a65a2a]">
                    {leadCard.stat || 'قرار أسرع'}
                  </span>
                  <p className="mt-1 text-sm leading-6 text-[#5f4b3f]">
                    {resolveDistrictMarketOfferCaption(leadCard, 0)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })() : null}

        <div className="divide-y divide-primary/10">
          {cards.slice(1).map((card, index) => {
            const href = buildStorefrontPath(
              location.pathname,
              card.link.startsWith('/') ? card.link : `/${card.link}`,
              location.search,
            );
            const signals = resolveOfferSignals(card, index + 1, themeId).slice(0, 2);

            return (
              <Link
                key={`${card.title}-${index + 1}`}
                to={href}
                className="group grid h-full gap-4 px-5 py-5 transition-colors duration-300 hover:bg-secondary/60 sm:px-6 sm:py-6 md:grid-cols-[minmax(0,1fr)_7.5rem]"
              >
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <span className="inline-flex text-[11px] font-black uppercase tracking-[0.22em] text-primary/78">
                        {card.label || `مسار 0${index + 2}`}
                      </span>
                      <h3 className="max-w-lg font-heading text-[1.25rem] font-black tracking-tight text-foreground">
                        {card.title}
                      </h3>
                    </div>
                    {card.stat ? (
                      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-foreground/62">
                        {card.stat}
                      </span>
                    ) : null}
                  </div>

                  <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                    {card.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {signals.map((signal) => (
                      <span
                        key={`${card.title}-${signal}`}
                        className="inline-flex rounded-full border border-primary/10 bg-background/78 px-3 py-1 text-[11px] font-bold text-foreground/78"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm font-black text-primary">
                    {card.ctaText || 'شاهد التفاصيل'}
                    <span className="transition-transform duration-300 group-hover:-translate-x-1">
                      ←
                    </span>
                  </div>
                </div>

                <div className="relative min-h-[7.5rem] overflow-hidden rounded-[1.15rem] border border-[#ead8cb] bg-[linear-gradient(180deg,#fffbf6,#f3e6d9)] shadow-[0_14px_32px_-26px_rgba(61,37,25,0.2)]">
                  <img
                    src={resolveDistrictMarketOfferImage(card, index + 1)}
                    alt={card.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(61,37,25,0.12))]" />
                  <div className="absolute inset-x-3 bottom-3 rounded-[0.9rem] border border-white/60 bg-white/84 px-3 py-2 text-[11px] font-black leading-5 text-[#6a5648] backdrop-blur">
                    {resolveDistrictMarketOfferCaption(card, index + 1)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DistrictMarketView;

import React from 'react';
import { Link, type Location } from 'react-router-dom';
import { buildStorefrontPath } from '../../utils/paths';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import {
  isFeminineTheme,
  resolveCampaignStackImage,
  resolveOfferSignals,
  type OfferCard,
} from './types';

export interface CampaignStackViewProps {
  cards: OfferCard[];
  location: Location;
  themeId?: string;
}

export const CampaignStackView: React.FC<CampaignStackViewProps> = ({
  cards,
  location,
  themeId,
}) => {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.26fr)_minmax(18rem,0.74fr)]">
      {cards[0] ? (() => {
        const card = cards[0];
        const href = buildStorefrontPath(
          location.pathname,
          card.link.startsWith('/') ? card.link : `/${card.link}`,
          location.search,
        );
        const signals = resolveOfferSignals(card, 0, themeId).slice(0, 3);
        const image = resolveCampaignStackImage(card, 0);

        return (
          <Link
            to={href}
            className="group grid min-h-[28rem] overflow-hidden rounded-lg border border-[#ead8c9] bg-[#fffaf4] text-start shadow-[0_28px_86px_-66px_rgba(47,37,29,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cfaa72] md:grid-cols-[minmax(0,0.92fr)_minmax(20rem,1.08fr)]"
          >
            <div className="flex min-w-0 flex-col justify-between gap-8 p-5 md:p-7">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex rounded-full bg-[#183f31] px-3 py-1.5 text-[11px] font-black text-[#fff8ee]">
                    {card.stat || card.label || 'عرض اليوم'}
                  </span>
                  {card.label ? (
                    <span className="text-xs font-bold text-[#8a6a3c]">
                      {card.label}
                    </span>
                  ) : null}
                </div>
                <h3 className="max-w-[16ch] font-heading text-3xl font-black leading-tight text-[#1f1916] md:text-[2.85rem]">
                  {card.title}
                </h3>
                <p className="max-w-xl text-sm leading-7 text-[#6d5f55] md:text-[15px]">
                  {card.subtitle}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {signals.map((signal) => (
                    <span
                      key={`${card.title}-${signal}`}
                      className="inline-flex rounded-full border border-[#e2cbb3] bg-white/86 px-3 py-1 text-[11px] font-bold text-[#2d241f]"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#79b900] px-4 py-3 text-sm font-black text-white transition-colors group-hover:bg-[#6aa300]">
                  {card.ctaText || 'تسوقي الآن'}
                  <span
                    aria-hidden="true"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/18 transition-transform duration-300 group-hover:-translate-x-1"
                  >
                    ←
                  </span>
                </div>
              </div>
            </div>

            <div className="relative min-h-[18rem] overflow-hidden bg-[#efe5db] md:min-h-full">
              <StorefrontProductImage
                candidates={[image]}
                alt={card.title}
                loading="lazy"
                fetchpriority="low"
                deferUntilVisible
                deferRootMargin="700px 0px"
                requestedWidth={720}
                imageQuality={72}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,25,22,0.02),rgba(31,25,22,0.18))]" />
              <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[#1f1916] shadow-[0_16px_38px_-26px_rgba(31,25,22,0.55)]">
                {card.label || 'جاهز للطلب'}
              </div>
            </div>
          </Link>
        );
      })() : null}

      <div className="grid gap-3">
        {cards.slice(1).map((card, index) => {
          const cardIndex = index + 1;
          const href = buildStorefrontPath(
            location.pathname,
            card.link.startsWith('/') ? card.link : `/${card.link}`,
            location.search,
          );
          const signals = resolveOfferSignals(card, cardIndex, themeId).slice(0, 2);
          const image = resolveCampaignStackImage(card, cardIndex);

          return (
            <Link
              key={`${card.title}-${cardIndex}`}
              to={href}
              className="group grid min-h-[14rem] overflow-hidden rounded-lg border border-[#ead8c9] bg-white text-start shadow-[0_22px_62px_-54px_rgba(47,37,29,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cfaa72] sm:grid-cols-[minmax(0,1fr)_11.25rem]"
            >
              <div className="flex min-w-0 flex-col justify-between gap-4 p-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex rounded-full bg-[#f4eee7] px-3 py-1 text-[11px] font-black text-[#7d6146]">
                      {card.stat || card.label || `اختيار ${cardIndex + 1}`}
                    </span>
                    {card.label ? (
                      <span className="text-[11px] font-bold text-[#8a6a3c]">
                        {card.label}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-heading text-[1.45rem] font-black leading-tight text-[#1f1916]">
                    {card.title}
                  </h3>
                  <p className="line-clamp-2 text-xs leading-6 text-[#74665f]">
                    {card.subtitle}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {signals.map((signal) => (
                      <span
                        key={`${card.title}-${signal}`}
                        className="inline-flex rounded-full border border-[#ead8c9] bg-[#fffaf4] px-2.5 py-1 text-[10px] font-bold text-[#3a2d25]"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-black text-[#183f31]">
                    {card.ctaText ||
                      (isFeminineTheme(themeId)
                        ? 'شاهدي الاختيارات'
                        : 'شاهد الاختيارات')}
                    <span
                      aria-hidden="true"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#cdb79f] bg-[#fffaf4] transition-transform duration-300 group-hover:-translate-x-1"
                    >
                      ←
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[12rem] overflow-hidden bg-[#f2e9df] sm:min-h-full">
                <StorefrontProductImage
                  candidates={[image]}
                  alt={card.title}
                  loading="lazy"
                  fetchpriority="low"
                  deferUntilVisible
                  deferRootMargin="700px 0px"
                  requestedWidth={360}
                  imageQuality={72}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(31,25,22,0.2))]" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignStackView;

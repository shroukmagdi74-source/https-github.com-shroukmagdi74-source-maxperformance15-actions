import React from 'react';
import { Link, type Location } from 'react-router-dom';
import { buildStorefrontPath } from '../../utils/paths';
import { isFeminineTheme, type OfferCard } from './types';

export interface BoutiqueDuoViewProps {
  cards: OfferCard[];
  location: Location;
  themeId?: string;
}

export const BoutiqueDuoView: React.FC<BoutiqueDuoViewProps> = ({
  cards,
  location,
  themeId,
}) => {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {cards.slice(0, 2).map((card, index) => {
        const href = buildStorefrontPath(
          location.pathname,
          card.link.startsWith('/') ? card.link : `/${card.link}`,
          location.search,
        );
        const toneClass =
          card.tone === 'ivory'
            ? 'bg-[linear-gradient(135deg,#ffffff,#f6efea)] border-[#ead8d2]'
            : 'bg-[linear-gradient(135deg,#fff7f8,#f4eeea)] border-[#ead8d2]';

        return (
          <Link
            key={`${card.title}-${index}`}
            to={href}
            className={`group overflow-hidden rounded-[1.6rem] border ${toneClass} shadow-[0_30px_72px_-54px_rgba(59,33,28,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_82px_-52px_rgba(59,33,28,0.26)]`}
          >
            <div className="grid min-h-[15rem] gap-4 p-5 md:grid-cols-[minmax(0,1fr)_15rem] md:items-center md:p-6">
              <div className="space-y-4 text-start">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    {card.label ? (
                      <span className="inline-flex text-[11px] font-black tracking-[0.2em] text-[#b06767]">
                        {card.label}
                      </span>
                    ) : null}
                    <h3 className="max-w-[18rem] font-heading text-[1.7rem] font-semibold leading-tight text-[#201915]">
                      {card.title}
                    </h3>
                  </div>
                  {card.stat ? (
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#201915] shadow-[0_12px_24px_-18px_rgba(59,33,28,0.16)]">
                      {card.stat}
                    </span>
                  ) : null}
                </div>
                <p className="max-w-md text-sm leading-7 text-[#756762]">
                  {card.subtitle}
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#201915]">
                  {card.ctaText ||
                    (isFeminineTheme(themeId)
                      ? 'شاهدي التفاصيل'
                      : 'شاهد التفاصيل')}
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ead8d2] bg-white transition-transform duration-300 group-hover:-translate-x-1">
                    ←
                  </span>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-[1.35rem] bg-[#efe7e2]">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="aspect-[5/4] w-full bg-[linear-gradient(135deg,#f5eeea,#ebe2dd)]" />
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default BoutiqueDuoView;

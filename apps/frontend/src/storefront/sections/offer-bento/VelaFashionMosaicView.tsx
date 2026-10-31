import React from 'react';
import { Link, type Location } from 'react-router-dom';
import { buildStorefrontPath } from '../../utils/paths';
import type { OfferCard } from './types';

export interface VelaFashionMosaicViewProps {
  cards: OfferCard[];
  location: Location;
}

export const VelaFashionMosaicView: React.FC<VelaFashionMosaicViewProps> = ({
  cards,
  location,
}) => {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        {cards[0] ? (() => {
          const leadCard = cards[0];
          const href = buildStorefrontPath(
            location.pathname,
            leadCard.link.startsWith('/') ? leadCard.link : `/${leadCard.link}`,
            location.search,
          );

          return (
            <Link
              to={href}
              className="group relative block min-h-[17rem] overflow-hidden rounded-[1.35rem] border border-[#ece4df] bg-[#f3ede8] shadow-[0_30px_78px_-58px_rgba(23,23,23,0.28)] lg:min-h-[27rem]"
            >
              {leadCard.image ? (
                <img
                  src={leadCard.image}
                  alt={leadCard.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : null}
            </Link>
          );
        })() : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.slice(1, 5).map((card, index) => {
            const href = buildStorefrontPath(
              location.pathname,
              card.link.startsWith('/') ? card.link : `/${card.link}`,
              location.search,
            );
            const tallCard = index === 0 || index === 3;

            return (
              <Link
                key={`${card.title}-${index}`}
                to={href}
                className={`group relative overflow-hidden rounded-[1.35rem] border border-[#ece4df] bg-[#f3ede8] shadow-[0_26px_62px_-54px_rgba(23,23,23,0.24)] ${
                  tallCard ? 'min-h-[14rem] lg:min-h-[13rem]' : 'min-h-[14rem] lg:min-h-[13rem]'
                }`}
              >
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VelaFashionMosaicView;

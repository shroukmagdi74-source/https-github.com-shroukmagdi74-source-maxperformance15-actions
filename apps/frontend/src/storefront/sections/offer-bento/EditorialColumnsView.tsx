import React from 'react';
import { Link, type Location } from 'react-router-dom';
import { buildStorefrontPath } from '../../utils/paths';
import { isKhemetLuxeTheme } from '../../utils/navigationGuards';
import { isFeminineTheme, resolveOfferSignals, type OfferCard } from './types';

export interface EditorialColumnsViewProps {
  cards: OfferCard[];
  location: Location;
  themeId?: string;
}

export const EditorialColumnsView: React.FC<EditorialColumnsViewProps> = ({
  cards,
  location,
  themeId,
}) => {
  const isKhemet = isKhemetLuxeTheme(themeId);
  const borderColor = isKhemet ? 'border-[#e7d8c8]' : 'border-border';
  const hoverBg = isKhemet ? 'hover:bg-[#fbf5ef]/72' : 'hover:bg-muted/40';
  const labelStyle = isKhemet
    ? 'border-[#c8a66d] text-[#8a6d45]'
    : 'border-primary/50 text-primary';
  const titleColor = isKhemet ? 'text-[#1f1916]' : 'text-foreground';
  const subtitleColor = isKhemet ? 'text-[#695c53]' : 'text-muted-foreground';
  const statColor = isKhemet ? 'text-[#7a6446]' : 'text-primary font-bold';
  const signalColor = isKhemet ? 'text-[#4f453f]' : 'text-foreground/80';
  const bulletColor = isKhemet ? 'bg-[#b89154]' : 'bg-primary';
  const ctaBorder = isKhemet
    ? 'border-[#1f1916] text-[#1f1916] group-hover:border-[#8a6a3c] group-hover:text-[#8a6a3c]'
    : 'border-primary text-primary group-hover:border-primary/80 group-hover:text-primary/80';

  return (
    <div className={`grid grid-cols-1 border-y ${borderColor} md:grid-cols-[1.14fr_0.93fr_0.93fr]`}>
      {cards.map((card, index) => {
        const href = buildStorefrontPath(
          location.pathname,
          card.link.startsWith('/') ? card.link : `/${card.link}`,
          location.search,
        );
        const signals = resolveOfferSignals(card, index, themeId).slice(
          0,
          index === 0 ? 3 : 2,
        );

        return (
          <Link
            key={`${card.title}-${index}`}
            to={href}
            className={`group relative px-0 py-8 transition-colors duration-300 ${hoverBg} md:px-8 md:py-10 ${
              index > 0 ? `border-t ${borderColor} md:border-t-0` : ''
            } ${index < cards.length - 1 ? `md:border-s md:${borderColor}` : ''}`}
          >
            <div className={`${index === 0 ? 'max-w-xl' : 'max-w-sm'} space-y-4 text-start`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-3">
                  <span className={`inline-flex border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.28em] ${labelStyle}`}>
                    {card.label || `Angle 0${index + 1}`}
                  </span>
                  <h3
                    className={`font-heading font-semibold leading-tight tracking-tight ${titleColor} ${
                      index === 0 ? 'text-[2.2rem] md:text-[2.5rem]' : 'text-[1.6rem] md:text-[1.85rem]'
                    }`}
                  >
                    {card.title}
                  </h3>
                </div>
                {card.stat ? (
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${statColor}`}>
                    {card.stat}
                  </span>
                ) : null}
              </div>

              <p className={`text-sm leading-7 ${subtitleColor} md:text-[15px]`}>
                {card.subtitle}
              </p>

              <div className={`flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium ${signalColor}`}>
                {signals.map((signal) => (
                  <span
                    key={`${card.title}-${signal}`}
                    className="inline-flex items-center gap-2"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${bulletColor}`} />
                    {signal}
                  </span>
                ))}
              </div>

              <span className={`inline-flex items-center gap-2 border-b pb-1 text-sm font-semibold transition-colors ${ctaBorder}`}>
                {card.ctaText ||
                  (isFeminineTheme(themeId)
                    ? 'شاهدي التفاصيل'
                    : 'شاهد التفاصيل')}
                <span aria-hidden="true">←</span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default EditorialColumnsView;

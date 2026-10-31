import React from 'react';
import { Link, type Location } from 'react-router-dom';
import { buildStorefrontPath } from '../../utils/paths';
import { resolveTechBundleMeta, type OfferCard } from './types';

export interface BundleMatrixViewProps {
  cards: OfferCard[];
  location: Location;
}

export const BundleMatrixView: React.FC<BundleMatrixViewProps> = ({
  cards,
  location,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.24fr_0.94fr_0.94fr]">
      {cards.map((card, index) => {
        const href = buildStorefrontPath(
          location.pathname,
          card.link.startsWith('/') ? card.link : `/${card.link}`,
          location.search,
        );
        const meta = resolveTechBundleMeta(card, index);
        const isLead = index === 0;
        const toneClass =
          card.tone === 'accent'
            ? 'bg-[linear-gradient(180deg,#fff6d6,#fffdf3)] border-[#efcf67]'
            : card.tone === 'slate'
              ? 'bg-[linear-gradient(180deg,#edf0f4,#ffffff)] border-[#cfd5df]'
              : 'bg-[linear-gradient(180deg,#f7f1df,#fffdf6)] border-[#d7c89e]';

        return (
          <Link
            key={`${card.title}-${index}`}
            to={href}
            className={`group overflow-hidden rounded-[1.9rem] border p-5 shadow-[0_28px_90px_-66px_rgba(31,36,44,0.24)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_110px_-70px_rgba(31,36,44,0.3)] ${
              isLead ? 'bg-[#1f242c] text-[#fff4d1] xl:col-span-1' : toneClass
            }`}
          >
            <div className={`grid h-full gap-4 ${isLead ? 'lg:grid-cols-[minmax(0,1fr)_15rem]' : ''}`}>
              <div className="flex h-full min-w-0 flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] ${
                        isLead
                          ? 'border border-white/10 bg-white/8 text-[#ffd400]'
                          : 'border border-[#1f242c]/10 bg-white/82 text-[#1f242c]'
                      }`}
                    >
                      {meta.eyebrow}
                    </span>
                    <h3
                      className={`max-w-[16ch] font-heading text-[1.6rem] font-black tracking-tight ${
                        isLead ? 'text-white' : 'text-[#1f242c]'
                      }`}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${
                      isLead
                        ? 'bg-[#ffd400] text-[#1f242c]'
                        : 'bg-[#1f242c] text-[#fff4d1]'
                    }`}
                  >
                    {card.stat || meta.packageTitle}
                  </span>
                </div>

                <p
                  className={`max-w-xl text-sm leading-7 ${
                    isLead ? 'text-white/76' : 'text-[#49505c]'
                  }`}
                >
                  {card.subtitle}
                </p>

                <div className="grid gap-2 sm:grid-cols-3">
                  {meta.items.map((item) => (
                    <div
                      key={`${card.title}-${item}`}
                      className={`rounded-[1.1rem] px-3 py-3 text-[11px] font-black uppercase tracking-[0.16em] ${
                        isLead
                          ? 'border border-white/10 bg-white/[0.05] text-white/84'
                          : 'border border-[#1f242c]/8 bg-white/84 text-[#1f242c]'
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div
                  className={`rounded-[1.25rem] border px-4 py-3 ${
                    isLead
                      ? 'border-white/10 bg-black/20 text-[#fff4d1]'
                      : 'border-[#1f242c]/8 bg-white/86 text-[#1f242c]'
                  }`}
                >
                  <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${isLead ? 'text-[#ffd400]' : 'text-[#6b7280]'}`}>
                    Bundle logic
                  </p>
                  <p className={`mt-2 text-sm leading-6 ${isLead ? 'text-white/76' : 'text-[#4b5563]'}`}>
                    {meta.note}
                  </p>
                </div>

                <div className={`mt-auto inline-flex items-center gap-2 text-sm font-black ${isLead ? 'text-[#ffd400]' : 'text-[#1f242c]'}`}>
                  {card.ctaText || 'شاهد التفاصيل'}
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:-translate-x-1 ${
                      isLead
                        ? 'border border-white/10 bg-white/[0.06] text-white'
                        : 'border border-[#1f242c]/12 bg-white/88 text-[#1f242c]'
                    }`}
                  >
                    ←
                  </span>
                </div>
              </div>

              {isLead ? (
                <div className="grid gap-3">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.06] px-4 py-4 shadow-[0_24px_70px_-56px_rgba(255,212,0,0.45)]">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ffd400]">
                      Package
                    </p>
                    <p className="mt-3 text-xl font-black text-white">
                      {meta.packageTitle}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-black/24 px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/58">
                      Why this path
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/76">
                      {meta.note}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default BundleMatrixView;

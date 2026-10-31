import React from 'react';
import { Link } from 'react-router-dom';
import { FeaturedCollectionsController } from '../useFeaturedCollectionsController';

export const ButcherCutMapVariant: React.FC<{
  ctrl: FeaturedCollectionsController;
}> = ({ ctrl }) => {
  const {
    collectionCards,
    title,
    subtitle,
    hideSubtitle,
    hideCardDescriptions,
    hideCardCtas,
    ctaText,
  } = ctrl;

  const leadCollection = collectionCards[0];
  const sideCollections = collectionCards.slice(1, 4);

  return (
    <section className="relative overflow-hidden bg-[#0b0908] py-12 text-[#f4ead8] md:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(135deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_22px)]" />
      <div className="container relative z-10 px-4 md:px-6">
        <div className="mb-8 grid gap-5 border-y border-[#37312c] py-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end">
          <div>
            <span className="inline-flex border border-[#8b6b3e] bg-[#15110f] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#d7b674]">
              CUT MAP
            </span>
            <h2 className="mt-4 font-heading text-[2rem] font-black leading-tight text-[#fff7e8] md:text-[3.25rem]">
              {title}
            </h2>
          </div>
          {!hideSubtitle ? (
            <p className="max-w-2xl text-sm leading-7 text-[#b7ab9c] md:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
          {leadCollection ? (
            <Link
              to={leadCollection.href}
              className="group relative min-h-[30rem] overflow-hidden border border-[#37312c] bg-[#15110f]"
            >
              <img
                src={leadCollection.image}
                alt={leadCollection.name}
                loading="eager"
                width="900"
                height="760"
                className="absolute inset-0 h-full w-full object-cover opacity-[0.88] transition duration-700 group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,7,6,0.86),rgba(8,7,6,0.28)_58%,rgba(8,7,6,0.72))]" />
              <div className="absolute inset-0 opacity-[0.2] [background-image:linear-gradient(90deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_120px)]" />
              <div className="relative z-10 flex min-h-[30rem] flex-col justify-end p-6 md:p-8">
                <span className="mb-5 w-fit border border-[#8b6b3e] bg-[#080706]/76 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#d7b674]">
                  Master cut 01
                </span>
                <h3 className="max-w-[11ch] font-heading text-[3rem] font-black leading-[0.98] text-[#fff7e8] md:text-[4.8rem]">
                  {leadCollection.name}
                </h3>
                {!hideCardDescriptions ? (
                  <p className="mt-5 max-w-xl text-sm leading-7 text-[#d6cbbb] md:text-base">
                    {leadCollection.description}
                  </p>
                ) : null}
                {!hideCardCtas ? (
                  <span className="mt-6 w-fit border border-[#8f1d2b] bg-[#7a131d] px-5 py-3 text-sm font-black text-[#fff4dc] transition-colors group-hover:bg-[#9a1d2a]">
                    {ctaText || 'ادخل القسم'}
                  </span>
                ) : null}
              </div>
            </Link>
          ) : null}

          <div className="grid gap-4">
            {sideCollections.map((collection, index) => (
              <Link
                key={collection.id}
                to={collection.href}
                className="group grid min-h-[10rem] grid-cols-[8rem_minmax(0,1fr)] overflow-hidden border border-[#37312c] bg-[#0f0d0c] transition-colors hover:border-[#8b6b3e] sm:grid-cols-[11rem_minmax(0,1fr)]"
              >
                <div className="relative overflow-hidden border-e border-[#37312c] bg-[#15110f]">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    loading="eager"
                    width="360"
                    height="320"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,7,6,0.38))]" />
                </div>
                <div className="flex flex-col justify-between p-4 md:p-5">
                  <span className="text-[10px] font-black uppercase tracking-[0.26em] text-[#8b6b3e]">
                    CUT 0{index + 2}
                  </span>
                  <div>
                    <h3 className="font-heading text-xl font-black text-[#fff7e8] md:text-2xl">
                      {collection.name}
                    </h3>
                    {!hideCardDescriptions ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#b7ab9c]">
                        {collection.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

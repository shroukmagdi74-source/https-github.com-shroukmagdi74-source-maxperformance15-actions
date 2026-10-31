import React from 'react';
import { Link } from 'react-router-dom';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import { renderHeroAction } from './heroActions';
import { HeroVariantProps } from './heroTypes';

export const RunwayGridHero: React.FC<HeroVariantProps> = (props) => (
  <section className="py-24 bg-secondary/30">
    <div className="container grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">
        <h1 className="text-6xl font-black tracking-tight">{props.title}</h1>
        <p className="text-xl text-muted-foreground">{props.subtitle}</p>
        <Link
          to={props.primaryHref}
          className="bg-primary text-primary-foreground px-12 py-4 rounded-full font-black"
        >
          SHOP THE COLLECTION
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-[3/4] bg-muted rounded-2xl overflow-hidden">
          {props.backgroundImage && (
            <img
              src={props.backgroundImage}
              className="w-full h-full object-cover"
              alt=""
            />
          )}
        </div>
        <div className="aspect-[3/4] bg-muted rounded-2xl overflow-hidden mt-12">
          {props.panel.image && (
            <img
              src={props.panel.image}
              className="w-full h-full object-cover"
              alt=""
            />
          )}
        </div>
      </div>
    </div>
  </section>
);

export const WardrobePlannerHero: React.FC<HeroVariantProps> = (props) => (
  <section className="bg-primary py-24 text-primary-foreground">
    <div className="container grid lg:grid-cols-2 gap-16 items-center">
      <div className="space-y-8">
        <h1 className="text-7xl font-black leading-none">{props.title}</h1>
        <p className="text-xl opacity-80">{props.subtitle}</p>
        <Link
          to={props.primaryHref}
          className="bg-accent text-accent-foreground px-10 py-4 rounded-full font-bold"
        >
          PLAN NOW
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {props.floatingCards.slice(0, 4).map((card, i) => (
          <div key={i} className="bg-white/10 p-6 rounded-3xl backdrop-blur-md">
            <div className="text-accent font-black uppercase tracking-widest text-xs">
              {card.badge || 'DAY ' + (i + 1)}
            </div>
            <div className="text-2xl font-black mt-2">
              {card.title || card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const ModestCascadeHero: React.FC<HeroVariantProps> = (props) => {
  const leadImage = props.backgroundImage || props.panel.image;
  const supportImage = props.panel.image || props.backgroundImage;
  const routeHighlights = props.highlights.slice(0, 3);
  const layerCards = props.floatingCards.slice(0, 3);

  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#fcf8f1_0%,#f7efe4_100%)] py-8 md:py-10 lg:py-14">
      <div className="container px-4 md:px-6">
        <div className="overflow-hidden rounded-[2.2rem] border border-[#e7dccf] bg-[radial-gradient(circle_at_top,rgba(191,154,120,0.12),transparent_36%),linear-gradient(135deg,#fffdf9_0%,#f7efe4_100%)] shadow-[0_36px_90px_-62px_rgba(71,47,34,0.24)]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div className="px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
              <div className="space-y-6">
                {props.eyebrow ? (
                  <span className="inline-flex rounded-full border border-[#d8c3b5] bg-white/92 px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#866252] shadow-[0_16px_34px_-28px_rgba(71,47,34,0.18)]">
                    {props.eyebrow}
                  </span>
                ) : null}

                <div className="space-y-4">
                  <h1 className="font-heading text-[2.45rem] font-semibold leading-[1.04] tracking-tight text-[#2d221d] md:text-[4.1rem]">
                    {props.title}
                  </h1>
                  <p className="max-w-[34rem] text-sm leading-8 text-[#6f6159] md:text-base">
                    {props.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {renderHeroAction(
                    props.primaryHref,
                    props.ctaText,
                    'inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#2d221d] px-7 py-3 text-sm font-black text-white transition-colors hover:bg-[#191310]',
                  )}
                  {renderHeroAction(
                    props.secondaryHref || props.primaryHref,
                    props.secondaryCtaText,
                    'inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#dac8ba] bg-white px-7 py-3 text-sm font-black text-[#5f4c42] transition-colors hover:border-[#b88b72] hover:text-[#2d221d]',
                  )}
                </div>

                {routeHighlights.length ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {routeHighlights.map((item) => (
                      <div
                        key={`${item.label}-${item.value}`}
                        className="rounded-[1.1rem] border border-[#eadfd4] bg-white/88 px-4 py-3 shadow-[0_18px_40px_-34px_rgba(71,47,34,0.12)]"
                      >
                        <p className="text-[10px] font-black tracking-[0.2em] text-[#9b7764]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#2d221d]">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="relative min-h-[24rem] border-t border-[#e7dccf] bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(244,233,222,0.96))] px-5 py-6 md:px-8 md:py-8 lg:min-h-[34rem] lg:border-s lg:border-t-0 lg:px-10 lg:py-10">
              <div className="absolute inset-x-[18%] top-[12%] h-[44%] rounded-full bg-[radial-gradient(circle_at_center,rgba(212,181,152,0.34),rgba(255,255,255,0)_74%)]" />
              <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,0.82fr)]">
                <div className="relative overflow-hidden rounded-[1.8rem] border border-white/80 bg-[#efe4d8] shadow-[0_24px_62px_-42px_rgba(71,47,34,0.24)]">
                  {leadImage ? (
                    <img
                      src={leadImage}
                      alt={props.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(45,34,29,0.08)_100%)]" />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1.2rem] border border-white/70 bg-white/86 px-4 py-4 backdrop-blur">
                    <p className="text-[10px] font-black tracking-[0.2em] text-[#9b7764]">
                      {props.panel.eyebrow || 'Layer one'}
                    </p>
                    <p className="mt-2 font-heading text-[1.1rem] font-semibold text-[#2d221d]">
                      {props.panel.title || props.title}
                    </p>
                    {props.panel.subtitle ? (
                      <p className="mt-2 text-xs leading-6 text-[#6f6159]">
                        {props.panel.subtitle}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {layerCards.map((card, index) => (
                    <div
                      key={`${card.title || card.value}-${index}`}
                      className={`rounded-[1.45rem] border px-4 py-4 shadow-[0_22px_52px_-40px_rgba(71,47,34,0.18)] ${
                        index === 0
                          ? 'border-[#ead7ca] bg-white/90'
                          : index === 1
                            ? 'border-[#e4d3c7] bg-[#fbf5ee]'
                            : 'border-[#decdbf] bg-[#f1e5d8]'
                      }`}
                    >
                      {card.badge ? (
                        <p className="text-[10px] font-black tracking-[0.2em] text-[#9b7764]">
                          {card.badge}
                        </p>
                      ) : null}
                      <p className="mt-2 font-heading text-[1.05rem] font-semibold text-[#2d221d]">
                        {card.title || card.value}
                      </p>
                      {card.value || card.description ? (
                        <p className="mt-2 text-xs leading-6 text-[#6f6159]">
                          {card.value && card.description
                            ? `${card.value} - ${card.description}`
                            : card.value || card.description}
                        </p>
                      ) : null}
                    </div>
                  ))}

                  {supportImage ? (
                    <div className="relative flex-1 overflow-hidden rounded-[1.55rem] border border-white/80 bg-[#ecdfd2] shadow-[0_20px_48px_-38px_rgba(71,47,34,0.16)]">
                      <img
                        src={supportImage}
                        alt={props.panel.title || props.title}
                        className="h-full min-h-[10rem] w-full object-cover"
                      />
                      {props.panel.metricValue ? (
                        <div className="absolute bottom-4 left-4 rounded-[1rem] border border-white/70 bg-white/88 px-4 py-3 backdrop-blur">
                          <p className="text-[10px] font-black tracking-[0.2em] text-[#9b7764]">
                            {props.panel.metricLabel || 'Coverage note'}
                          </p>
                          <p className="mt-1 text-lg font-black text-[#2d221d]">
                            {props.panel.metricValue}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SoftShowcaseHero: React.FC<HeroVariantProps> = (props) => (
  <section className="py-20 bg-[#f8fafc]">
    <div className="container bg-white rounded-[3rem] p-12 shadow-sm grid lg:grid-cols-2 items-center gap-12">
      <div className="space-y-8">
        <h1 className="text-5xl font-semibold text-slate-900">{props.title}</h1>
        <p className="text-xl text-slate-500">{props.subtitle}</p>
        <div className="text-4xl font-bold text-red-500">
          {props.panel.metricValue || 'EGP 0.00'}
        </div>
        {renderHeroAction(
          props.primaryHref,
          props.ctaText || 'تسوّق الآن',
          'bg-[#facc15] text-black px-10 py-4 rounded-full font-bold inline-block',
        )}
      </div>
      <div className="flex justify-center">
        {props.panel.image && (
          <img
            src={props.panel.image}
            className="h-96 w-96 object-contain"
            alt=""
          />
        )}
      </div>
    </div>
  </section>
);

export const BoutiqueMuseHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image;
  const callouts = (props.highlights || []).slice(0, 3);
  const notes = (props.floatingCards || []).slice(0, 2);

  return (
    <section className="bg-[#fbf7f3] py-8 md:py-10 lg:py-14">
      <div className="container px-4 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,31rem)]">
          <div className="space-y-6 text-start">
            {props.eyebrow ? (
              <span className="inline-flex rounded-full border border-[#ead7d2] bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-[#a47a72] shadow-[0_18px_36px_-30px_rgba(59,33,28,0.18)]">
                {props.eyebrow}
              </span>
            ) : null}
            <div className="space-y-4">
              <h1 className="font-heading text-[2.8rem] font-semibold leading-[1.05] tracking-tight text-[#201915] md:text-[4.15rem]">
                {props.title}
              </h1>
              <p className="max-w-[34rem] text-base leading-8 text-[#736863] md:text-lg">
                {props.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {renderHeroAction(
                props.primaryHref,
                props.ctaText,
                'inline-flex min-h-[46px] items-center justify-center border border-[#201915] bg-white px-6 py-3 text-sm font-semibold tracking-[0.08em] text-[#201915] transition-colors hover:bg-[#201915] hover:text-white',
              )}
              {renderHeroAction(
                props.secondaryHref,
                props.secondaryCtaText,
                'inline-flex min-h-[46px] items-center justify-center border border-[#ead7d2] bg-transparent px-6 py-3 text-sm font-medium text-[#7f706b] transition-colors hover:border-[#201915] hover:text-[#201915]',
              )}
            </div>

            {callouts.length ? (
              <div className="flex flex-wrap gap-3 pt-2">
                {callouts.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="min-w-[8.75rem] rounded-[1rem] border border-[#eadfd7] bg-white/92 px-4 py-3 shadow-[0_18px_38px_-32px_rgba(59,33,28,0.12)]"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-[#a77d75]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#201915]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative mx-auto flex w-full max-w-[31rem] items-center justify-center">
            <div className="absolute inset-x-[8%] top-[7%] aspect-square rounded-full bg-[radial-gradient(circle_at_center,rgba(229,184,197,0.95),rgba(245,227,233,0.72)_55%,rgba(251,247,243,0)_76%)]" />
            <div className="absolute inset-0 opacity-70">
              <div className="absolute start-6 top-12 h-3 w-3 border border-[#edd8d2]" />
              <div className="absolute end-8 top-8 h-4 w-4 border border-[#edd8d2]" />
              <div className="absolute end-10 top-28 h-2.5 w-2.5 border border-[#edd8d2]" />
              <div className="absolute start-12 bottom-24 h-2.5 w-2.5 border border-[#edd8d2]" />
              <div className="absolute end-16 bottom-20 h-3 w-3 border border-[#edd8d2]" />
            </div>
            {heroImage ? (
              <img
                src={heroImage}
                alt={props.title}
                className="relative z-10 max-h-[34rem] w-full object-contain drop-shadow-[0_34px_60px_rgba(118,80,83,0.18)]"
              />
            ) : null}
            {notes.length ? (
              <div className="absolute inset-y-6 end-0 hidden w-40 flex-col justify-between lg:flex">
                {notes.map((note, index) => (
                  <div
                    key={`${note.title || note.value}-${index}`}
                    className="rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-4 shadow-[0_20px_44px_-34px_rgba(59,33,28,0.18)] backdrop-blur"
                  >
                    {note.badge ? (
                      <p className="text-[10px] font-semibold tracking-[0.2em] text-[#b06767]">
                        {note.badge}
                      </p>
                    ) : null}
                    <p className="mt-2 font-heading text-[1.1rem] font-semibold text-[#201915]">
                      {note.title || note.value}
                    </p>
                    {note.description ? (
                      <p className="mt-2 text-xs leading-6 text-[#7b6d68]">
                        {note.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export const FashionBillboardHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image;
  const quickTags = (props.highlights || []).slice(0, 3);
  const titleWordmark = props.title || 'Vela Fashion';

  return (
    <section className="bg-[#f0f0f0] py-4 md:py-5">
      <div className="container px-4 md:px-6">
        <div className="rounded-[1rem] bg-[#efefef] px-4 py-5 shadow-[0_20px_46px_-42px_rgba(17,17,17,0.16)] sm:px-6 sm:py-6">
          <div className="grid items-center gap-5 sm:grid-cols-[11.5rem_minmax(0,1fr)] sm:gap-6">
            <div className="justify-self-center">
              <div className="space-y-3 text-center text-[0.7rem] font-black uppercase tracking-[0.34em] text-white/92">
                <div>NEW</div>
                <div className="mx-auto w-full max-w-[11.5rem] overflow-hidden rounded-[0.9rem] border-[6px] border-white bg-[#f5ddd7] shadow-[0_20px_44px_-34px_rgba(0,0,0,0.24)]">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={props.title}
                      className="h-[13.5rem] w-full object-cover"
                    />
                  ) : null}
                  <div className="flex items-center justify-between bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#cb5d57]">
                    <span>{props.eyebrow || 'new drop'}</span>
                    <span>sale</span>
                  </div>
                </div>
                <div>COLLECTION</div>
              </div>
            </div>

            <div className="space-y-4 text-right">
              <div className="flex flex-wrap items-center justify-end gap-2">
                {quickTags.slice(0, 2).map((item) => (
                  <span
                    key={`${item.label}-${item.value}`}
                    className="inline-flex rounded-full border border-[#dfd2cb] bg-white px-3 py-1 text-[10px] font-black text-[#7a5d63]"
                  >
                    {item.value}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <h1 className="font-heading text-[2.05rem] font-black leading-[0.96] tracking-tight text-[#2c2426] sm:text-[2.5rem]">
                  {titleWordmark}
                </h1>
                <p className="max-w-[24rem] text-sm leading-7 text-[#69575d]">
                  {props.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2.5">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex items-center justify-center rounded-[0.85rem] bg-[#2c2426] px-5 py-3 text-sm font-black text-white',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex items-center justify-center rounded-[0.85rem] border border-[#ddd2ca] bg-white px-5 py-3 text-sm font-black text-[#2c2426]',
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const StyleLedgerHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image;
  const panelImage = props.panel.image || props.backgroundImage;
  const notes = (props.floatingCards || []).slice(0, 2);

  return (
    <section className="bg-background py-8 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-4 rounded-[calc(var(--radius)+0.8rem)] border border-border/65 bg-card p-4 shadow-[0_34px_100px_-70px_rgba(76,42,44,0.2)] lg:grid-cols-[0.94fr_1.06fr] lg:gap-5 lg:p-7">
          <div className="order-2 grid gap-3 lg:order-1 lg:gap-4">
            <div className="relative overflow-hidden rounded-[calc(var(--radius)+0.3rem)] bg-secondary">
              {heroImage ? (
                <StorefrontProductImage
                  candidates={[heroImage]}
                  alt={props.title}
                  loading="eager"
                  fetchpriority="high"
                  requestedWidth={1440}
                  responsiveWidths={[640, 960, 1280, 1600]}
                  responsiveSizes="(max-width: 1023px) 100vw, 44vw"
                  imageQuality={74}
                  className="h-[18rem] w-full object-cover md:h-[26rem]"
                />
              ) : null}
              <div className="absolute inset-x-4 bottom-4 rounded-[calc(var(--radius)-0.1rem)] bg-card/94 px-4 py-4 shadow-[0_24px_60px_-44px_rgba(76,42,44,0.32)] backdrop-blur">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                  {props.panel.eyebrow || 'جاهزة للحسم'}
                </p>
                <p className="mt-2 text-xl font-black text-foreground">
                  {props.panel.title || 'ابدئي من اللبس أو الحذاء أو العرض'}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {props.panel.subtitle ||
                    'قرار أسرع لأن الصور والعروض والطلب السريع على نفس المسار.'}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {notes.map((card, index) => (
                <div
                  key={`${card.title}-${index}`}
                  className={`${index > 0 ? 'hidden sm:block' : ''} rounded-[var(--radius)] border border-border/70 bg-background px-4 py-3.5 sm:px-4 sm:py-4`}
                >
                  {card.badge ? (
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                      {card.badge}
                    </p>
                  ) : null}
                  <p className="mt-2 text-base font-black text-foreground">
                    {card.title || card.value}
                  </p>
                  {card.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {card.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 flex flex-col justify-between gap-4 lg:order-2 lg:gap-6">
            <div className="space-y-4 lg:space-y-5">
              {props.eyebrow ? (
                <span className="inline-flex rounded-[calc(var(--button-radius)-0.15rem)] border border-border bg-secondary px-3 py-1 text-[11px] font-black tracking-[0.22em] text-primary">
                  {props.eyebrow}
                </span>
              ) : null}
              <div className="space-y-3">
                <h1 className="font-heading text-[2.6rem] font-black leading-[1.02] tracking-tight text-foreground md:text-[4.1rem]">
                  {props.title}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  {props.subtitle}
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(props.highlights || []).slice(0, 4).map((item) => (
                  <span
                    key={`${item.label}-${item.value}`}
                    className="inline-flex items-center gap-2 rounded-[calc(var(--button-radius)-0.15rem)] border border-border bg-background px-3 py-2 text-xs font-bold text-foreground"
                  >
                    <span className="text-primary">{item.label}</span>
                    <span className="font-black">{item.value}</span>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 lg:hidden">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex min-h-[46px] items-center justify-center rounded-[var(--button-radius)] bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-[0_24px_60px_-42px_rgba(76,42,44,0.34)]',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex min-h-[46px] items-center justify-center rounded-[var(--button-radius)] border border-border bg-card px-5 py-3 text-sm font-black text-foreground',
                )}
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-4">
              <div className="hidden overflow-hidden rounded-[var(--radius)] border border-border/70 bg-secondary lg:block">
                {panelImage ? (
                  <StorefrontProductImage
                    candidates={[panelImage]}
                    alt={props.panel.title || props.title}
                    loading="lazy"
                    fetchpriority="low"
                    requestedWidth={960}
                    responsiveWidths={[480, 720, 960, 1200]}
                    responsiveSizes="(max-width: 1023px) 100vw, 28vw"
                    imageQuality={72}
                    className="h-full min-h-[13rem] w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-4 rounded-[var(--radius)] border border-border/70 bg-background px-4 py-5">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                  {props.panel.metricValue || 'قبل أول click'}
                </p>
                <p className="text-lg font-black text-foreground">
                  {props.panel.note ||
                    'مسار واضح يقودك من القطعة الأساسية إلى ما يكملها بدون لف طويل.'}
                </p>
                <div className="hidden flex-wrap gap-3 lg:flex">
                  {renderHeroAction(
                    props.primaryHref,
                    props.ctaText,
                    'inline-flex items-center justify-center rounded-[var(--button-radius)] bg-primary px-6 py-3 text-sm font-black text-primary-foreground shadow-[0_24px_60px_-42px_rgba(76,42,44,0.34)]',
                  )}
                  {renderHeroAction(
                    props.secondaryHref || props.primaryHref,
                    props.secondaryCtaText,
                    'inline-flex items-center justify-center rounded-[var(--button-radius)] border border-border bg-card px-6 py-3 text-sm font-black text-foreground',
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

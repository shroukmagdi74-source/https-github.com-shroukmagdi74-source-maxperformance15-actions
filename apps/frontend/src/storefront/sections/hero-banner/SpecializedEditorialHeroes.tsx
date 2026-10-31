import React from 'react';
import { Link } from 'react-router-dom';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import { HeroVariantProps } from './heroTypes';
import { renderHeroAction } from './heroActions';

export const DropBoardHero: React.FC<HeroVariantProps> = (props) => {
  const leadImage = props.backgroundImage || props.panel.image || '';

  return (
    <section className="relative overflow-hidden bg-background py-16">
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-6">
            {props.eyebrow && (
              <span className="inline-block text-accent font-black uppercase tracking-widest">
                {props.eyebrow}
              </span>
            )}
            <h1 className="text-5xl font-black md:text-6xl">{props.title}</h1>
            <p className="text-muted-foreground text-lg">{props.subtitle}</p>
            <div className="flex gap-4">
              {renderHeroAction(
                props.primaryHref,
                props.ctaText,
                'bg-primary text-primary-foreground px-8 py-3 rounded-md font-bold',
              )}
              {renderHeroAction(
                props.secondaryHref,
                props.secondaryCtaText,
                'border border-border px-8 py-3 rounded-md font-bold',
              )}
            </div>
          </div>
          <div className="relative aspect-video">
            {leadImage && (
              <img
                src={leadImage}
                className="rounded-2xl object-cover w-full h-full"
                alt=""
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const LayeredParallaxSkyHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.panel.image || props.backgroundImage;
  const highlightItems =
    props.highlights.length > 0
      ? props.highlights.slice(0, 3)
      : [
          { label: 'اختيار أسرع', value: 'صور حقيقية' },
          { label: 'أعمار مناسبة', value: '3+ سنوات' },
          { label: 'لعب يومي', value: 'تعلم + حركة' },
        ];

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#e8f8ff_0%,#fef8d6_100%)] py-12 md:py-16 lg:py-20">
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0))]" />
      <div className="absolute -left-12 top-20 h-32 w-32 rounded-full bg-white/70 blur-2xl" />
      <div className="absolute right-10 top-12 h-20 w-20 rounded-full bg-[#ffd768]/50 blur-xl" />
      <div className="absolute left-1/3 top-8 h-14 w-36 rounded-full bg-white/80 blur-sm" />
      <div className="absolute right-1/4 top-28 h-12 w-28 rounded-full bg-white/65 blur-sm" />

      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,30rem)] lg:gap-12">
          <div className="space-y-6 text-start">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-black tracking-[0.18em] text-[#0f6d88] shadow-[0_18px_36px_-28px_rgba(15,109,136,0.3)] backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff9f43]" />
              {props.eyebrow || props.panel.eyebrow || 'عالم اللعب الآمن'}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-[15ch] font-heading text-4xl font-black leading-[1.02] tracking-tight text-[#123047] md:text-6xl">
                {props.title}
              </h1>
              <p className="max-w-[34rem] text-base leading-8 text-[#335163] md:text-lg">
                {props.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {renderHeroAction(
                props.primaryHref,
                props.ctaText,
                'inline-flex items-center justify-center rounded-full bg-[#ffb703] px-7 py-3.5 text-sm font-black text-[#1e1b15] shadow-[0_20px_40px_-24px_rgba(255,183,3,0.7)] transition hover:-translate-y-0.5 hover:bg-[#ffa800]',
              )}
              {renderHeroAction(
                props.secondaryHref,
                props.secondaryCtaText,
                'inline-flex items-center justify-center rounded-full border border-[#85c8dd] bg-white/75 px-7 py-3.5 text-sm font-bold text-[#16435a] backdrop-blur transition hover:border-[#59b3d0] hover:bg-white',
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlightItems.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className="rounded-[1.35rem] border border-white/70 bg-white/80 px-4 py-4 shadow-[0_18px_40px_-32px_rgba(18,48,71,0.28)] backdrop-blur"
                >
                  <p className="text-[11px] font-black tracking-[0.16em] text-[#0f6d88]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-black text-[#163142]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-8 hidden h-24 w-24 rounded-full border-4 border-white/80 bg-[#ff8fab]/40 md:block" />
            <div className="absolute -right-4 bottom-6 hidden h-20 w-20 rounded-full border-4 border-white/80 bg-[#90e0ef]/50 md:block" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-3 shadow-[0_30px_70px_-38px_rgba(18,48,71,0.32)] backdrop-blur">
              <div className="overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#fffdf7_0%,#e5f7ff_100%)]">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={props.panel.title || props.title}
                    className="h-[21rem] w-full object-cover md:h-[28rem]"
                  />
                ) : (
                  <div className="flex h-[21rem] items-center justify-center bg-[radial-gradient(circle_at_top,#ffffff_0%,#fef3c7_38%,#d9f4ff_100%)] md:h-[28rem]">
                    <div className="rounded-full bg-white/85 px-6 py-4 text-center shadow-[0_20px_48px_-30px_rgba(18,48,71,0.28)]">
                      <p className="text-sm font-black text-[#0f6d88]">
                        لعب + تعلم + أمان
                      </p>
                      <p className="mt-2 text-2xl font-black text-[#163142]">
                        اختيارات جاهزة لكل يوم
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {props.panel.title ||
              props.panel.note ||
              props.panel.metricValue ? (
                <div className="absolute inset-x-5 bottom-5 rounded-[1.4rem] border border-white/80 bg-white/92 px-4 py-4 shadow-[0_20px_44px_-28px_rgba(18,48,71,0.28)] backdrop-blur">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-[#183547]">
                        {props.panel.title || 'صور واضحة تساعدك على الاختيار'}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#496474]">
                        {props.panel.note ||
                          'منتجات مناسبة للبيت، الهدية، والنشاط اليومي بدون صور مفبركة.'}
                      </p>
                    </div>
                    {props.panel.metricValue ? (
                      <div className="rounded-full bg-[#fff3b8] px-4 py-2 text-center text-sm font-black text-[#7a5400]">
                        <span className="block text-[10px] tracking-[0.16em] text-[#a17300]">
                          {props.panel.metricLabel || 'مختارات'}
                        </span>
                        <span>{props.panel.metricValue}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SplitPanelHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.panel.image || props.backgroundImage;
  const panelNotes = [
    props.panel.note,
    props.panel.metricValue,
    props.panel.metricLabel,
  ]
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 3);
  const fallbackPanelNotes = ['صور أقرب للحقيقة', 'دفع مرن', 'توصيل أوضح'];
  const resolvedPanelNotes = panelNotes.length
    ? panelNotes
    : fallbackPanelNotes;
  const isCompact = props.compact;
  const visibleCompactNotes = resolvedPanelNotes.slice(0, 2);

  return (
    <section
      className={`bg-background ${isCompact ? 'py-4 md:py-5' : 'py-12 md:py-16'}`}
    >
      <div className="container px-4 md:px-6">
        <div
          className={`grid rounded-[calc(var(--radius)+0.65rem)] border border-border/70 bg-card shadow-[0_28px_100px_-70px_rgba(15,23,42,0.3)] lg:items-stretch ${
            isCompact
              ? 'gap-3 p-3 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:p-4'
              : 'gap-5 p-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:p-7'
          }`}
        >
          <div
            className={`flex flex-col justify-between ${
              isCompact ? 'gap-3.5' : 'gap-6'
            }`}
          >
            <div className={isCompact ? 'space-y-3' : 'space-y-5'}>
              {props.eyebrow ? (
                <span className="inline-flex rounded-[calc(var(--button-radius)-0.1rem)] border border-border bg-secondary px-2.5 py-1 text-[10px] font-black tracking-[0.18em] text-primary">
                  {props.eyebrow}
                </span>
              ) : null}
              <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
                <h1
                  className={`font-heading font-black leading-[0.95] tracking-[0.02em] text-foreground ${
                    isCompact
                      ? 'text-[1.7rem] sm:text-[2rem] md:text-[2.7rem]'
                      : 'text-[2.3rem] uppercase sm:text-[2.8rem] md:text-[4.4rem]'
                  }`}
                >
                  {props.title}
                </h1>
                <p
                  className={`max-w-2xl text-muted-foreground ${
                    isCompact
                      ? 'text-[13px] leading-5 md:text-[0.92rem]'
                      : 'text-sm leading-7 md:text-base'
                  }`}
                >
                  {props.subtitle}
                </p>
              </div>
            </div>

            {isCompact ? (
              visibleCompactNotes.length ? (
                <div className="flex flex-wrap gap-2">
                  {visibleCompactNotes.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className={`inline-flex items-center rounded-[var(--button-radius)] px-3 py-1.5 text-[11px] font-bold ${
                        index === 0
                          ? 'border border-primary/12 bg-primary/8 text-primary'
                          : 'border border-border/70 bg-background text-foreground'
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {(props.highlights || []).slice(0, 3).map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="rounded-[var(--radius)] border border-border/70 bg-background px-4 py-4"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-black text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div
              className={
                isCompact
                  ? 'flex flex-wrap gap-2'
                  : 'flex flex-col gap-3 sm:flex-row sm:flex-wrap'
              }
            >
              {renderHeroAction(
                props.primaryHref,
                props.ctaText,
                'inline-flex min-h-[42px] w-full items-center justify-center rounded-[var(--button-radius)] bg-primary px-5 py-2.5 text-[13px] font-black text-primary-foreground shadow-[0_22px_52px_-38px_rgba(15,23,42,0.58)] sm:w-auto',
              )}
              {renderHeroAction(
                props.secondaryHref || props.primaryHref,
                props.secondaryCtaText,
                'inline-flex min-h-[42px] w-full items-center justify-center rounded-[var(--button-radius)] border border-border bg-background px-5 py-2.5 text-[13px] font-black text-foreground sm:w-auto',
              )}
            </div>
          </div>

          <div
            className={
              isCompact
                ? 'grid gap-3'
                : 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]'
            }
          >
            <div className="relative overflow-hidden rounded-[calc(var(--radius)+0.35rem)] bg-secondary">
              {heroImage ? (
                <StorefrontProductImage
                  candidates={[heroImage]}
                  alt={props.title}
                  loading="eager"
                  fetchpriority="high"
                  requestedWidth={1400}
                  responsiveWidths={[640, 960, 1280, 1600]}
                  responsiveSizes="(max-width: 1023px) 100vw, 46vw"
                  imageQuality={76}
                  className={`h-full w-full object-cover ${
                    isCompact
                      ? 'min-h-[12rem] md:min-h-[14.5rem]'
                      : 'min-h-[22rem]'
                  }`}
                />
              ) : null}
              <div
                className={`absolute inset-x-3 bottom-3 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.82)] text-primary-foreground backdrop-blur ${
                  isCompact ? 'px-3.5 py-2.5' : 'px-4 py-4'
                }`}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary-foreground/70">
                  {props.panel.eyebrow || 'المسار العملي'}
                </p>
                <p
                  className={`mt-2 font-black ${
                    isCompact ? 'text-base md:text-lg' : 'text-xl'
                  }`}
                >
                  {props.panel.title || 'ابدأ من الفئة الأقرب لاحتياجك'}
                </p>
                <p
                  className={`mt-2 text-primary-foreground/78 ${
                    isCompact ? 'text-xs leading-5' : 'text-sm leading-6'
                  }`}
                >
                  {props.panel.subtitle ||
                    'صور أوضح ورسائل مباشرة تساعد على الحسم بسرعة من غير تشتيت.'}
                </p>
              </div>
            </div>

            {!isCompact ? (
              <div className="grid gap-3">
                {resolvedPanelNotes.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={`rounded-[var(--radius)] border px-4 py-4 text-sm font-bold ${
                      index === resolvedPanelNotes.length - 1
                        ? 'border-primary/20 bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground'
                    }`}
                  >
                    {item}
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

export const ScentPortraitHero: React.FC<HeroVariantProps> = (props) => (
  <section className="overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--secondary))_48%,hsl(var(--background))_100%)] py-12 md:py-16">
    <div className="container px-4 md:px-6">
      <div className="grid gap-6 overflow-hidden rounded-[calc(var(--radius)+0.9rem)] border border-border/75 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--secondary)/0.65)_100%)] p-5 shadow-[0_36px_110px_-76px_rgba(15,23,42,0.22)] lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:p-8">
        <div className="space-y-5">
          <span className="inline-flex rounded-[var(--button-radius)] border border-border bg-card/92 px-3 py-1 text-[11px] font-black tracking-[0.22em] text-primary">
            {props.eyebrow || 'برفنات أصلية'}
          </span>
          <div className="space-y-3">
            <h1 className="font-heading text-[2.2rem] font-black leading-[1.05] tracking-tight text-foreground md:text-[3.5rem]">
              {props.title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              {props.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(props.highlights || []).slice(0, 3).map((item) => (
              <span
                key={`${item.label}-${item.value}`}
                className="inline-flex items-center gap-2 rounded-[var(--button-radius)] border border-border bg-card px-3 py-2 text-xs font-bold text-foreground shadow-[0_16px_40px_-34px_rgba(15,23,42,0.16)]"
              >
                <span className="text-primary">{item.label}</span>
                <span className="font-black text-foreground">{item.value}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {renderHeroAction(
              props.primaryHref,
              props.ctaText || 'اكتشفي العطور',
              'inline-flex items-center justify-center rounded-[var(--button-radius)] bg-primary px-6 py-3 text-sm font-black text-primary-foreground shadow-[0_22px_70px_-40px_rgba(15,23,42,0.34)] transition-all hover:-translate-y-0.5',
            )}
            {renderHeroAction(
              props.secondaryHref || props.primaryHref,
              props.secondaryCtaText,
              'inline-flex items-center justify-center rounded-[var(--button-radius)] border border-border bg-card px-6 py-3 text-sm font-black text-foreground transition-colors hover:border-primary/30 hover:bg-background',
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_11rem]">
          <div className="relative overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border/75 bg-[linear-gradient(180deg,hsl(var(--secondary)/0.86),hsl(var(--background)))] shadow-[0_30px_90px_-64px_rgba(15,23,42,0.24)]">
            <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3">
              <span className="inline-flex rounded-[var(--button-radius)] border border-border bg-card/88 px-3 py-1 text-[11px] font-black text-primary backdrop-blur">
                {props.panel.metricValue || '50 مل و100 مل'}
              </span>
              <span className="inline-flex rounded-[var(--button-radius)] bg-accent px-3 py-1 text-[11px] font-black text-accent-foreground">
                صور حقيقية
              </span>
            </div>
            <div className="grid min-h-[22rem] gap-6 p-5 md:min-h-[26rem] md:grid-cols-[0.92fr_1.08fr] md:p-7">
              <div className="space-y-3 self-end">
                <span className="inline-flex rounded-[var(--button-radius)] border border-border bg-card/92 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-primary">
                  {props.panel.metricValue || 'قرار أوضح'}
                </span>
                <h2 className="font-heading text-[1.55rem] font-black leading-tight text-foreground md:text-[2rem]">
                  {props.panel.title || 'حجم أوضح وهدايا أسهل'}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {props.panel.subtitle ||
                    'زجاجة واحدة أو مجموعة هدية مع فرق السعر والحجم ظاهرين من أول نظرة.'}
                </p>
              </div>
              <div className="relative flex items-center justify-center">
                {props.panel.image ? (
                  <img
                    src={props.panel.image}
                    alt={props.title}
                    className="h-[18rem] w-full rounded-[1.6rem] object-cover shadow-[0_30px_90px_-58px_rgba(61,41,44,0.36)] md:h-[22rem]"
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              props.panel.note || 'أحجام واضحة',
              props.panel.eyebrow || 'تغليف هدايا',
              'أصالة موضحة',
            ].map((note) => (
              <div
                key={note}
                className="rounded-[var(--radius)] border border-border bg-card/92 px-4 py-4 text-sm font-bold text-foreground shadow-[0_18px_50px_-42px_rgba(15,23,42,0.16)]"
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const NatureBreezeHero: React.FC<HeroVariantProps> = (props) => (
  <section className="relative py-32 overflow-hidden">
    <div className="absolute inset-0 bg-green-50/50 -z-10" />
    <div className="container grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">
        <span className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-bold">
          🌿 {props.eyebrow || 'Pure Living'}
        </span>
        <h1 className="text-7xl font-black text-slate-900">{props.title}</h1>
        <p className="text-xl text-slate-600">{props.subtitle}</p>
        <Link
          to={props.primaryHref}
          className="bg-green-600 text-white px-12 py-5 rounded-full font-bold shadow-xl shadow-green-200 inline-block"
        >
          EXPLORE NATURE
        </Link>
      </div>
      <div className="relative aspect-square bg-green-200 rounded-full flex items-center justify-center text-9xl">
        🪴
      </div>
    </div>
  </section>
);

export const CinematicPlinthHero: React.FC<HeroVariantProps> = (props) => {
  const { theme } = useStorefrontTheme();
  const isRedLine =
    theme.id === 'redline-auto' ||
    Boolean(theme.tokens?.colors?.primary?.startsWith('0 84%'));
  const heroImage = props.backgroundImage || props.panel.image || '';
  const leadHighlights = props.highlights.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-[#07080a] text-white">
      <div className="absolute inset-0">
        {heroImage ? (
          <StorefrontProductImage
            candidates={[heroImage]}
            alt={props.title}
            loading="eager"
            fetchpriority="high"
            decoding="async"
            requestedWidth={1280}
            responsiveWidths={[640, 960, 1280, 1600]}
            responsiveSizes="100vw"
            imageQuality={85}
            className="h-full w-full object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,10,0.35)_0%,rgba(7,8,10,0.65)_40%,rgba(7,8,10,0.94)_100%)]" />
        {isRedLine ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(225,29,72,0.14),transparent_44%),radial-gradient(circle_at_bottom,rgba(225,29,72,0.22),transparent_54%)]" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_45%)]" />
        )}
      </div>

      {/* Main Asymmetric Hero Stage */}
      <div className="relative z-10 flex min-h-[32rem] sm:min-h-[38rem] lg:min-h-[44rem] items-center px-4 py-12 md:px-8 lg:px-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Editorial Text Content (Start / Right in RTL) */}
            <div className="lg:col-span-7 text-start space-y-6">
              {(props.eyebrow || props.panel.eyebrow) && (
                <span
                  className={`inline-flex border-b pb-1.5 text-[11px] font-bold uppercase tracking-[0.28em] ${
                    isRedLine
                      ? 'border-primary/60 text-primary drop-shadow-[0_2px_8px_rgba(225,29,72,0.4)]'
                      : 'border-white/30 text-white/80'
                  }`}
                >
                  {props.eyebrow || props.panel.eyebrow}
                </span>
              )}

              <h1 className="font-heading text-4xl sm:text-6xl lg:text-[4.25rem] font-black leading-[1.06] tracking-tight text-white drop-shadow-[0_16px_36px_rgba(0,0,0,0.6)] text-balance">
                {props.title}
              </h1>

              <p className="max-w-xl text-base sm:text-lg leading-relaxed text-white/85 text-pretty drop-shadow-sm">
                {props.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  isRedLine
                    ? 'inline-flex items-center justify-center rounded-full border border-primary/50 bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-[0_14px_32px_-8px_rgba(225,29,72,0.7)] transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.97]'
                    : 'inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black shadow-[0_16px_36px_-8px_rgba(255,255,255,0.3)] transition-all hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.97]',
                )}
                {renderHeroAction(
                  props.secondaryHref,
                  props.secondaryCtaText,
                  'inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40 active:scale-[0.97]',
                )}
              </div>
            </div>

            {/* Architectural Specimen Showcase Tile (Desktop End / Left in RTL) */}
            <div className="lg:col-span-5 hidden lg:flex flex-col justify-end items-end">
              <div className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md p-6 max-w-sm text-start space-y-3 shadow-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/60 block">
                  كولكشن 2026 الحصري
                </span>
                <p className="text-lg font-bold text-white tracking-tight">
                  شياكة وراحة لكل يوم
                </p>
                <p className="text-xs text-white/80 leading-relaxed">
                  خامات ممتازة وتقفيل مصري متقن يجمع بين أناقة المناسبات وعملية الاستخدام اليومي.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Docked Architectural Trust Bar */}
      {leadHighlights.length > 0 ? (
        <div className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md py-4">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-start divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-white/10">
              {leadHighlights.map((item, idx) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className={`flex items-center gap-3 ${idx > 0 ? 'pt-3 sm:pt-0 sm:pe-6' : ''}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">
                      {item.label}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export const GroomingProHero: React.FC<HeroVariantProps> = (props) => {
  const bg = props.backgroundImage || props.panel.image;
  return (
    <section
      className="relative flex min-h-[360px] items-center justify-center overflow-hidden px-4 py-16 text-center"
      style={
        bg
          ? {
              backgroundColor: '#19212B',
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { backgroundColor: '#19212B' }
      }
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,20,35,.72)_0%,rgba(10,20,35,.60)_50%,rgba(10,20,35,.75)_100%)]" />
      <div className="relative z-10 mx-auto w-full max-w-[700px]">
        {props.eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {props.eyebrow}
          </p>
        ) : null}
        <h1 className="font-heading text-[2.4rem] font-extrabold leading-[1.2] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,.65)]">
          {props.title}
        </h1>
        {props.subtitle ? (
          <p className="mx-auto mt-3 max-w-[580px] text-[17px] leading-[1.6] text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,.55)]">
            {props.subtitle}
          </p>
        ) : null}
        {props.ctaText ? (
          <div className="mt-6">
            {renderHeroAction(
              props.primaryHref,
              props.ctaText,
              'inline-block rounded-[6px] bg-white px-7 py-3 text-[15px] font-bold text-[#19212B] shadow-[0_4px_14px_rgba(0,0,0,.2)] transition-transform hover:-translate-y-0.5',
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

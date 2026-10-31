import React from 'react';
import { HeroVariantProps } from './heroTypes';
import { renderHeroAction } from './heroActions';

export const ElessiDigitalLaunchHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image;
  const detailImage = props.panel.image || props.backgroundImage;
  const leadHighlights = props.highlights.slice(0, 3);

  return (
    <section className="overflow-hidden bg-white py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="overflow-hidden border border-[#e4e9f0] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col justify-center gap-6 px-6 py-8 text-start md:px-10 md:py-12">
              {props.eyebrow ? (
                <span className="inline-flex w-fit text-[11px] font-black uppercase tracking-[0.28em] text-[#7a8595]">
                  {props.eyebrow}
                </span>
              ) : null}

              <div className="space-y-4">
                <h1 className="font-heading text-[2.8rem] font-semibold leading-[0.98] tracking-tight text-[#161c26] md:text-[4.65rem]">
                  {props.title}
                </h1>
                <p className="max-w-[34rem] text-sm leading-8 text-[#536172] md:text-base">
                  {props.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex min-h-[48px] items-center justify-center bg-[#161c26] px-7 py-3 text-sm font-black text-white transition-colors hover:bg-[#0d1219]',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex min-h-[48px] items-center justify-center border border-[#d8dee8] bg-white px-7 py-3 text-sm font-black text-[#243042] transition-colors hover:border-[#f59e0b] hover:text-[#b45309]',
                )}
              </div>

              {leadHighlights.length ? (
                <div className="space-y-3 border-t border-[#e4e9f0] pt-4">
                  {leadHighlights.map((item) => (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="flex items-center gap-3 text-sm font-semibold text-[#516170]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                      {item.value}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative min-h-[21rem] overflow-hidden border-t border-[#e4e9f0] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(241,245,249,0.92)_56%,rgba(226,232,240,0.78))] lg:min-h-[34rem] lg:border-s lg:border-t-0">
              <div className="absolute inset-0">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={props.title}
                    className="h-full w-full object-cover opacity-[0.14]"
                  />
                ) : null}
              </div>
              <div className="absolute inset-x-[16%] top-[10%] h-[58%] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.98),rgba(255,255,255,0.76)_52%,rgba(255,255,255,0)_78%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0)_0%,rgba(148,163,184,0.08)_100%)]" />
              <div className="relative z-10 flex h-full items-end justify-center px-6 py-8 md:px-10 md:py-12">
                {detailImage ? (
                  <img
                    src={detailImage}
                    alt={props.panel.title || props.title}
                    className="max-h-[18rem] w-full max-w-[30rem] object-contain drop-shadow-[0_28px_56px_rgba(15,23,42,0.18)] md:max-h-[27rem]"
                  />
                ) : null}
              </div>
              <div className="absolute right-5 top-5 hidden max-w-[14rem] border-l border-[#dce3ec] ps-5 text-right md:block md:right-8 md:top-8">
                <p className="text-sm font-semibold text-[#243042]">
                  {props.panel.title || props.title}
                </p>
                {props.panel.subtitle ? (
                  <p className="mt-2 text-sm leading-6 text-[#607184]">
                    {props.panel.subtitle}
                  </p>
                ) : null}
              </div>
              <div className="absolute bottom-5 right-5 border border-[#dce3ec] bg-white/94 px-4 py-3 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.14)] md:bottom-8 md:right-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a8595]">
                  {props.panel.metricLabel || 'Ready to ship'}
                </p>
                <p className="mt-2 text-lg font-black text-[#161c26]">
                  {props.panel.metricValue || '48H'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiBagHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image;
  const detailImage = props.panel.image || props.backgroundImage;
  const routeChips = props.highlights.slice(0, 3);

  return (
    <section className="bg-[#f7f5f2] py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="overflow-hidden border border-[#d9d2ca] bg-[#fcfbf8] shadow-[0_32px_96px_-82px_rgba(40,32,26,0.14)]">
          <div className="grid lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
            <div className="order-2 flex flex-col justify-center gap-5 px-5 py-6 text-start md:px-8 md:py-8 lg:order-2 lg:gap-6 lg:px-10 lg:py-12">
              {props.eyebrow ? (
                <span className="inline-flex w-fit text-[11px] font-black uppercase tracking-[0.24em] text-[#927256]">
                  {props.eyebrow}
                </span>
              ) : null}

              <div className="space-y-4">
                <h1 className="font-heading text-[2.2rem] font-semibold leading-[0.94] tracking-tight text-[#18110d] sm:text-[2.5rem] md:text-[3.2rem] lg:text-[4.65rem]">
                  {props.title}
                </h1>
                <p className="max-w-[32rem] text-sm leading-7 text-[#65544b] md:text-base md:leading-8">
                  {props.subtitle}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex min-h-[48px] w-full items-center justify-center rounded-[0.55rem] bg-[#18110d] px-7 py-3 text-sm font-black text-white transition-colors hover:bg-[#090705]',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex min-h-[48px] w-full items-center justify-center rounded-[0.55rem] border border-[#d7cbc0] bg-transparent px-7 py-3 text-sm font-black text-[#3a2a23] transition-colors hover:border-[#b68a69] hover:text-[#7a5335]',
                )}
              </div>

              {routeChips.length ? (
                <div className="hidden border-t border-[#e3d7cd] pt-4 md:grid md:gap-3 lg:grid-cols-3">
                  {routeChips.map((item) => (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="space-y-2 border-s border-[#d8ccc1] pe-3 text-sm text-[#5f4c43]"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a755b]">
                        {item.label}
                      </p>
                      <p className="font-semibold leading-6 text-[#1f1713]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="order-1 relative min-h-[15rem] overflow-hidden border-b border-[#e3d7cd] bg-[linear-gradient(180deg,#fbfaf7_0%,#f3efe9_100%)] md:min-h-[18rem] lg:order-1 lg:min-h-[34rem] lg:border-b-0 lg:border-e">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_24%,rgba(255,255,255,0.98),rgba(255,255,255,0)_40%)]" />
              <div className="absolute inset-x-[10%] top-[12%] h-[56%] rounded-[999px] border border-[#d8ccc1] md:inset-x-[14%] md:top-[14%]" />
              <div className="absolute left-[17%] top-[25%] hidden h-[28%] w-[18%] rounded-[999px] border border-[#e4d8ce] bg-white/30 lg:block" />
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={props.title}
                  className="absolute bottom-0 left-[1%] hidden h-[56%] w-auto max-w-[38%] object-contain opacity-22 mix-blend-multiply md:block md:h-[62%]"
                />
              ) : null}
              <div className="absolute right-5 top-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#ab7f5f] md:right-8 md:top-8">
                {props.panel.eyebrow || 'Selected accessories'}
              </div>
              <div className="relative z-10 flex h-full items-center justify-center px-6 py-7 md:px-10 md:py-12">
                {detailImage ? (
                  <img
                    src={detailImage}
                    alt={props.panel.title || props.title}
                    className="max-h-[11rem] w-full max-w-[11rem] object-contain drop-shadow-[0_36px_82px_rgba(61,44,34,0.2)] mix-blend-multiply md:max-h-[16rem] md:max-w-[16rem] lg:max-h-[28rem] lg:max-w-[24rem]"
                  />
                ) : null}
              </div>
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 border-t border-[#d7c9be] pt-2 text-right md:inset-x-8 md:bottom-8 md:gap-5 md:pt-3">
                <div className="max-w-[12rem] md:max-w-[14rem]">
                  <p className="font-heading text-[1rem] font-semibold leading-tight text-[#18110d] md:text-[1.2rem]">
                    {props.panel.title || props.title}
                  </p>
                  {props.panel.subtitle ? (
                    <p className="mt-1 hidden text-xs leading-6 text-[#6a5850] md:block">
                      {props.panel.subtitle}
                    </p>
                  ) : null}
                </div>
                {props.panel.metricValue ? (
                  <div className="shrink-0 text-left">
                    <span className="text-[1.15rem] font-black text-[#18110d] md:text-[1.4rem]">
                      {props.panel.metricValue}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8c6a53]">
                      {props.panel.metricLabel}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiBeautyRitualHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image || '';
  const detailImage = props.panel.image || props.backgroundImage || '';
  const ritualSteps = props.highlights.slice(0, 3);

  return (
    <section className="bg-[linear-gradient(180deg,#fffafb_0%,#fcf4f7_50%,#fffafb_100%)] py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="overflow-hidden border border-[#ead7df] bg-[linear-gradient(180deg,#fffdfd_0%,#fff7fa_58%,#fffdfd_100%)] shadow-[0_30px_96px_-82px_rgba(109,66,85,0.12)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
            <div className="order-1 relative min-h-[16rem] overflow-hidden border-b border-[#ecd8df] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(252,240,245,0.94)_58%,rgba(244,223,231,0.86))] md:min-h-[18rem] lg:min-h-[34rem] lg:border-b-0 lg:border-s">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_22%,rgba(255,255,255,0.98),rgba(255,255,255,0)_42%)]" />
              <div className="absolute left-[10%] top-[10%] h-[62%] w-[78%] rounded-[2.4rem] border border-[#ead6de] bg-white/18" />
              <div className="absolute left-[12%] top-[18%] h-[24%] w-[18%] rounded-[999px] border border-[#efdbe4] bg-white/26" />
              <div className="absolute right-[8%] top-[6%] text-[6.5rem] font-semibold leading-none text-[#f5d5e3]/72 md:text-[8rem] lg:text-[11rem]">
                G
              </div>
              {heroImage ? (
                <div className="absolute bottom-5 right-5 hidden w-[10rem] overflow-hidden rounded-[1.55rem] border border-white/78 bg-white/90 shadow-[0_22px_48px_-34px_rgba(104,62,83,0.16)] md:block md:bottom-8 md:right-8">
                  <img
                    src={heroImage}
                    alt={props.panel.title || props.title}
                    className="aspect-[4/5] h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="relative z-10 flex h-full items-center justify-center px-6 py-7 md:px-8 md:py-10">
                {detailImage ? (
                  <img
                    src={detailImage}
                    alt={props.panel.title || props.title}
                    className="max-h-[12rem] w-full max-w-[9rem] object-contain drop-shadow-[0_34px_72px_rgba(96,59,78,0.18)] mix-blend-multiply md:max-h-[18rem] md:max-w-[12rem] lg:max-h-[27rem] lg:max-w-[15rem]"
                  />
                ) : null}
              </div>
              <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-4 border-t border-[#e6d3dc] pt-3 md:inset-x-8 md:bottom-8">
                <div className="max-w-[12rem] md:max-w-[14rem]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b15f85]">
                    {props.panel.eyebrow || 'Glow picks'}
                  </p>
                  <p className="mt-2 font-heading text-[1rem] font-semibold leading-tight text-[#341f2b] md:text-[1.2rem]">
                    {props.panel.title || 'درجة اليوم أو الهدية على رف واحد'}
                  </p>
                  {props.panel.subtitle ? (
                    <p className="mt-2 hidden text-xs leading-6 text-[#7b6570] md:block">
                      {props.panel.subtitle}
                    </p>
                  ) : null}
                </div>
                {props.panel.metricValue ? (
                  <div className="shrink-0 rounded-full border border-[#eed9e3] bg-white/84 px-4 py-2 text-sm font-black text-[#8f496d]">
                    {props.panel.metricValue}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="order-2 flex flex-col justify-center gap-5 px-5 py-6 md:px-8 md:py-8 lg:gap-6 lg:px-10 lg:py-12">
              {props.eyebrow ? (
                <span className="inline-flex w-fit text-[11px] font-black uppercase tracking-[0.24em] text-[#b15f85]">
                  {props.eyebrow}
                </span>
              ) : null}

              <div className="space-y-4">
                <h1 className="font-heading text-[2.2rem] font-semibold leading-[0.95] tracking-tight text-[#341f2b] sm:text-[2.5rem] md:text-[3.3rem] lg:text-[4.55rem]">
                  {props.title}
                </h1>
                <p className="max-w-[30rem] text-sm leading-7 text-[#725f69] md:text-base md:leading-8">
                  {props.subtitle}
                </p>
              </div>

              {ritualSteps.length ? (
                <div className="hidden flex-wrap gap-2 border-t border-[#ead8df] pt-4 md:flex">
                  {ritualSteps.map((item, index) => (
                    <span
                      key={`${item.label}-${item.value}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#ecd7df] bg-white/84 px-4 py-2 text-[11px] font-black tracking-[0.14em] text-[#7f5c6d]"
                    >
                      <span className="text-[#c45f8b]">{index + 1}</span>
                      <span>{item.value}</span>
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#341f2b] px-7 py-3 text-sm font-black text-white transition-colors hover:bg-[#21131b]',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-[#e1ced7] bg-white px-7 py-3 text-sm font-black text-[#5a3d4b] transition-colors hover:border-[#d06f98] hover:text-[#9f4d75]',
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiGarageCommandHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image || '';
  const quickRoutes = props.highlights.slice(0, 3);

  return (
    <section className="bg-[linear-gradient(180deg,#fbf7f2_0%,#f3ece5_46%,#fbf7f2_100%)] py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="overflow-hidden border border-[#ddcfc3] bg-white">
          <div className="grid lg:grid-cols-[minmax(0,1.14fr)_minmax(0,0.86fr)]">
            <div className="relative min-h-[20rem] overflow-hidden border-b border-[#e6dad0] bg-[#f3ece5] lg:min-h-[34rem] lg:border-b-0 lg:border-e">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={props.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,18,18,0.08)_0%,rgba(18,18,18,0)_42%,rgba(18,18,18,0.22)_100%)]" />
              <div className="absolute bottom-5 left-5 rounded-full bg-[#f97316] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_38px_-24px_rgba(249,115,22,0.72)] md:bottom-8 md:left-8">
                {props.panel.eyebrow || 'Fitment first'}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-6 px-6 py-8 md:px-10 md:py-12">
              {props.eyebrow ? (
                <span className="inline-flex w-fit text-[11px] font-black uppercase tracking-[0.28em] text-[#9c6540]">
                  {props.eyebrow}
                </span>
              ) : null}

              <div className="space-y-4">
                <h1 className="font-heading text-[2.65rem] font-semibold leading-[1.01] tracking-tight text-[#241814] md:text-[4.35rem]">
                  {props.title}
                </h1>
                <p className="max-w-[30rem] text-sm leading-8 text-[#6a5950] md:text-base">
                  {props.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#241814] px-7 py-3 text-sm font-black text-white transition-colors hover:bg-[#130d0b]',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#ddcfc3] bg-white px-7 py-3 text-sm font-black text-[#3c2a22] transition-colors hover:border-[#f97316] hover:text-[#c25e18]',
                )}
              </div>

              {quickRoutes.length ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {quickRoutes.map((item) => (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="rounded-[1rem] border border-[#e6dad0] bg-[#faf5ef] px-4 py-3"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a36d47]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-black text-[#241814]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {props.panel.title || props.panel.subtitle ? (
                <div className="border-t border-[#e6dad0] pt-4">
                  <p className="text-sm font-black text-[#241814]">
                    {props.panel.title ||
                      'ابدأ من نوع القطعة ثم ضيّق التوافق قبل الإضافة'}
                  </p>
                  {props.panel.subtitle ? (
                    <p className="mt-2 text-sm leading-7 text-[#6a5950]">
                      {props.panel.subtitle}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiJewelSalonHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.panel.image || props.backgroundImage || '';
  const supportImage = props.backgroundImage || props.panel.image || '';
  const routeHighlights = props.highlights.slice(0, 3);
  const sideCards = [
    {
      label: props.panel.metricLabel || 'التوصيل',
      value: props.panel.metricValue || '48 ساعة',
      description: props.panel.subtitle || 'مسار بيع أهدأ لكن أوضح للحسم.',
    },
    {
      label: routeHighlights[0]?.label || 'الأقسام',
      value: routeHighlights[0]?.value || '4',
      description: 'ابدئي من خاتم، طقم، أو هدية جاهزة.',
    },
    {
      label: routeHighlights[1]?.label || 'الإهداء',
      value: routeHighlights[1]?.value || 'سريع',
      description:
        props.panel.title || 'قطعة توقيع أو هدية لا تبعدك عن القرار.',
    },
  ];

  return (
    <section className="bg-[linear-gradient(180deg,#fffdfa_0%,#f8f1e9_42%,#fffdfa_100%)] py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="overflow-hidden rounded-[2.25rem] border border-[#eadfd4] bg-white/96 shadow-[0_36px_96px_-70px_rgba(58,39,33,0.18)]">
          <div className="grid gap-5 px-5 py-5 lg:grid-cols-[11rem_minmax(0,0.82fr)_minmax(0,1fr)] lg:px-7 lg:py-7">
            <div className="order-3 grid gap-3 lg:order-1 lg:auto-rows-fr">
              {sideCards.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className={`rounded-[1.45rem] border px-4 py-4 ${
                    index === 0
                      ? 'border-[#3b2722] bg-[#2b1b17] text-white'
                      : 'border-[#eadfd4] bg-[#fffaf5] text-[#32231f]'
                  }`}
                >
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.22em] ${index === 0 ? 'text-[#f3cb98]' : 'text-[#a37b67]'}`}
                  >
                    {item.label}
                  </p>
                  <p className="mt-3 text-[1.65rem] font-black leading-none">
                    {item.value}
                  </p>
                  <p
                    className={`mt-3 text-xs leading-6 ${index === 0 ? 'text-white/76' : 'text-[#7a6760]'}`}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="order-2 relative overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#f6eee6_0%,#fffdfa_100%)] lg:order-2">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={props.title}
                  className="h-full min-h-[16rem] w-full object-cover md:min-h-[23rem]"
                />
              ) : null}
              <div className="absolute inset-x-4 bottom-4 rounded-[1.2rem] border border-white/75 bg-white/88 px-4 py-4 shadow-[0_20px_40px_-28px_rgba(58,39,33,0.18)] backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#a37b67]">
                  {props.panel.eyebrow || 'مختارات التوقيع'}
                </p>
                <p className="mt-2 text-sm font-black text-[#32231f] md:text-base">
                  {props.panel.title || 'ابدئي من خاتم توقيع أو هدية جاهزة'}
                </p>
              </div>
            </div>

            <div className="order-1 flex flex-col justify-center gap-5 px-1 lg:order-3 lg:px-2">
              {props.eyebrow ? (
                <span className="inline-flex w-fit rounded-full border border-[#eadfd4] bg-[#fffaf5] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[#a37b67]">
                  {props.eyebrow}
                </span>
              ) : null}
              <h1 className="font-heading text-[2.8rem] font-semibold leading-[0.95] tracking-tight text-[#32231f] md:text-[4.55rem]">
                {props.title}
              </h1>
              <p className="max-w-[34rem] text-sm leading-8 text-[#7a6760] md:text-base">
                {props.subtitle}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {routeHighlights.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="rounded-[1.2rem] border border-[#eadfd4] bg-[#fffaf5] px-4 py-3"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a37b67]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-black text-[#32231f]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#32231f] px-7 py-3 text-sm font-black text-white transition-colors hover:bg-[#1e1411]',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#d8c9bd] bg-white px-7 py-3 text-sm font-black text-[#4d3931] transition-colors hover:border-[#caa27b] hover:text-[#8e6241]',
                )}
              </div>
              {supportImage ? (
                <div className="hidden overflow-hidden rounded-[1.4rem] border border-[#eadfd4] bg-[#fffaf5] lg:block">
                  <img
                    src={supportImage}
                    alt={props.panel.title || props.title}
                    className="h-28 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiPetSunroomHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image || '';
  const supportImage = props.panel.image || props.backgroundImage || '';
  const routeHighlights = props.highlights.slice(0, 3);

  return (
    <section className="bg-[linear-gradient(180deg,#fffdf9_0%,#f6efe3_38%,#fffdf9_100%)] py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="overflow-hidden rounded-[2.25rem] border border-[#e4d5c4] bg-white shadow-[0_36px_96px_-72px_rgba(71,47,34,0.2)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
            <div className="order-2 relative min-h-[16rem] overflow-hidden bg-[linear-gradient(180deg,#f5e8d7_0%,#fffaf4_100%)] md:min-h-[22rem] lg:order-1 lg:min-h-[22rem]">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={props.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,244,0.18)_0%,rgba(255,250,244,0)_34%,rgba(28,20,15,0.18)_100%)]" />
              <div className="absolute bottom-5 left-5 max-w-[18rem] rounded-[1.35rem] border border-white/75 bg-white/90 px-4 py-4 shadow-[0_18px_42px_-28px_rgba(71,47,34,0.18)] backdrop-blur md:bottom-8 md:left-8">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#a8734e]">
                  {props.panel.eyebrow || 'طلبات تتكرر'}
                </p>
                <p className="mt-2 text-sm font-black text-[#2f241e] md:text-base">
                  {props.panel.title ||
                    'ابدأ من الطعام أو اللعب أو العناية اليومية'}
                </p>
                {props.panel.subtitle ? (
                  <p className="mt-2 text-xs leading-6 text-[#6d5a4f] md:text-sm">
                    {props.panel.subtitle}
                  </p>
                ) : null}
              </div>
              {supportImage ? (
                <div className="absolute bottom-5 right-5 hidden w-[11rem] overflow-hidden rounded-[1.2rem] border border-white/75 bg-white/92 shadow-[0_16px_34px_-26px_rgba(71,47,34,0.16)] md:block">
                  <img
                    src={supportImage}
                    alt={props.panel.title || props.title}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className="order-1 flex flex-col justify-center gap-5 px-6 py-8 md:px-10 md:py-12 lg:order-2">
              {props.eyebrow ? (
                <span className="inline-flex w-fit rounded-full border border-[#e4d5c4] bg-[#fffaf4] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[#a8734e]">
                  {props.eyebrow}
                </span>
              ) : null}
              <h1 className="font-heading text-[2.75rem] font-semibold leading-[0.98] tracking-tight text-[#2f241e] md:text-[4.45rem]">
                {props.title}
              </h1>
              <p className="max-w-[34rem] text-sm leading-8 text-[#6d5a4f] md:text-base">
                {props.subtitle}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {routeHighlights.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="rounded-[1.2rem] border border-[#e4d5c4] bg-[#fffaf4] px-4 py-3"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a8734e]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-black text-[#2f241e]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#2f241e] px-7 py-3 text-sm font-black text-white transition-colors hover:bg-[#1d1511]',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#dbc8b3] bg-white px-7 py-3 text-sm font-black text-[#4a3930] transition-colors hover:border-[#d58d59] hover:text-[#a05a2c]',
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

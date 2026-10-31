import React from 'react';
import { HeroVariantProps } from './heroTypes';
import { renderHeroAction } from './heroActions';

export const ElessiSpotlightHero: React.FC<HeroVariantProps> = (props) => {
  const leadImage = props.backgroundImage || props.panel.image || '';
  const notes = (props.floatingCards || [])
    .map((item) => item.title || item.value || item.description || '')
    .filter(Boolean)
    .slice(0, 3);

  return (
    <section className="bg-[linear-gradient(180deg,#fffdfb_0%,#f8f1ea_34%,#fffdfb_100%)] py-14 md:py-18">
      <div className="container px-4 md:px-6">
        <div className="grid gap-5 rounded-[2rem] border border-[#eaded4] bg-white/94 p-5 shadow-[0_34px_100px_-72px_rgba(47,34,24,0.28)] lg:grid-cols-[1.04fr_0.96fr] lg:p-7">
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              {props.eyebrow ? (
                <span className="inline-flex rounded-full border border-[#eaded4] bg-[#fff7f1] px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#7b4e33]">
                  {props.eyebrow}
                </span>
              ) : null}
              <h1 className="font-heading text-[2.8rem] font-black leading-[0.95] tracking-tight text-[#241713] md:text-[4.3rem]">
                {props.title}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[#6f5b51] md:text-base">
                {props.subtitle}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(props.highlights || []).slice(0, 3).map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className="rounded-[1.3rem] border border-[#efe4da] bg-[#fffaf6] px-4 py-4"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8f7668]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-black text-[#241713]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {renderHeroAction(
                props.primaryHref,
                props.ctaText,
                'inline-flex items-center justify-center rounded-full bg-[#241713] px-6 py-3 text-sm font-black text-[#fff6ef] shadow-[0_24px_60px_-42px_rgba(36,23,19,0.6)]',
              )}
              {renderHeroAction(
                props.secondaryHref || props.primaryHref,
                props.secondaryCtaText,
                'inline-flex items-center justify-center rounded-full border border-[#eaded4] bg-white px-6 py-3 text-sm font-black text-[#241713]',
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
            <div className="relative overflow-hidden rounded-[1.8rem] bg-[#f7efe8]">
              {leadImage ? (
                <img
                  src={leadImage}
                  alt={props.title}
                  className="h-full min-h-[22rem] w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-x-4 bottom-4 rounded-[1.3rem] bg-white/92 px-4 py-4 shadow-[0_18px_44px_-34px_rgba(47,34,24,0.24)] backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8f7668]">
                  {props.panel.eyebrow || 'catalog cue'}
                </p>
                <p className="mt-2 text-lg font-black text-[#241713]">
                  {props.panel.title ||
                    'ابدأ من القطعة الأساسية ثم أكمل الإطلالة أو المجموعة'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6f5b51]">
                  {props.panel.subtitle ||
                    'تشكيل أقرب للحسم مع صور أوضح واختصارات وصول أسرع.'}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {(notes.length
                ? notes
                : [
                    props.panel.note || '',
                    props.panel.metricValue || '',
                    props.panel.metricLabel || '',
                  ]
              )
                .filter(Boolean)
                .slice(0, 3)
                .map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={`rounded-[1.25rem] border px-4 py-4 text-sm font-bold ${
                      index === 2
                        ? 'border-[#241713] bg-[#241713] text-[#fff6ef]'
                        : 'border-[#eaded4] bg-white text-[#241713]'
                    }`}
                  >
                    {item}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiDualMerchHero: React.FC<HeroVariantProps> = (props) => {
  const cards = (props.highlights || []).slice(0, 3);
  const leadImage = props.backgroundImage || props.panel.image || '';

  return (
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f4ece4_44%,#fffdf8_100%)] py-14 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="space-y-5 rounded-[1.9rem] border border-[#eaded4] bg-white/94 p-5 shadow-[0_30px_92px_-68px_rgba(47,34,24,0.24)] md:p-6">
            {props.eyebrow ? (
              <span className="inline-flex rounded-full border border-[#e8d9cc] bg-[#fff6ee] px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#7b4e33]">
                {props.eyebrow}
              </span>
            ) : null}
            <h1 className="font-heading text-[2.6rem] font-black leading-[0.96] tracking-tight text-[#241713] md:text-[4rem]">
              {props.title}
            </h1>
            <p className="text-sm leading-7 text-[#6f5b51] md:text-base">
              {props.subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              {renderHeroAction(
                props.primaryHref,
                props.ctaText,
                'inline-flex items-center justify-center rounded-full bg-[#241713] px-6 py-3 text-sm font-black text-[#fff6ef]',
              )}
              {renderHeroAction(
                props.secondaryHref || props.primaryHref,
                props.secondaryCtaText,
                'inline-flex items-center justify-center rounded-full border border-[#eaded4] bg-white px-6 py-3 text-sm font-black text-[#241713]',
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#f7efe8] shadow-[0_34px_96px_-70px_rgba(47,34,24,0.28)]">
              {leadImage ? (
                <img
                  src={leadImage}
                  alt={props.title}
                  className="h-full min-h-[24rem] w-full object-cover"
                />
              ) : null}
            </div>

            <div className="grid gap-3">
              {cards.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className={`rounded-[1.45rem] border px-4 py-4 shadow-[0_18px_42px_-34px_rgba(47,34,24,0.18)] ${
                    index === 0
                      ? 'border-[#241713] bg-[#241713] text-[#fff6ef]'
                      : 'border-[#eaded4] bg-white text-[#241713]'
                  }`}
                >
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${index === 0 ? 'text-[#f6cf9f]' : 'text-[#8f7668]'}`}
                  >
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-black">{item.value}</p>
                  <p
                    className={`mt-2 text-sm leading-6 ${index === 0 ? 'text-[#f7e9d9]/78' : 'text-[#6f5b51]'}`}
                  >
                    {index === 0
                      ? props.panel.subtitle ||
                        'كتلة بيع تقود المستخدم للمنتج أو المجموعة أو الهدية بسرعة.'
                      : props.panel.note || 'مسار بيع أوضح بدون تخمة بصرية.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiPromoCascadeHero: React.FC<HeroVariantProps> = (props) => {
  const panels = (props.highlights || []).slice(0, 4);

  return (
    <section className="bg-[linear-gradient(135deg,#1d1713_0%,#3a2d22_52%,#7d4f2e_100%)] py-14 text-white md:py-18">
      <div className="container px-4 md:px-6">
        <div className="grid gap-5 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="space-y-5 rounded-[2rem] border border-white/12 bg-white/[0.06] p-5 backdrop-blur md:p-6">
            {props.eyebrow ? (
              <span className="inline-flex rounded-full border border-[#f4d6ad]/30 bg-[#f4d6ad]/14 px-3 py-1 text-[11px] font-black tracking-[0.24em] text-[#f8d9aa]">
                {props.eyebrow}
              </span>
            ) : null}
            <h1 className="font-heading text-[2.8rem] font-black leading-[0.94] tracking-tight md:text-[4.2rem]">
              {props.title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/76 md:text-base">
              {props.subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              {renderHeroAction(
                props.primaryHref,
                props.ctaText,
                'inline-flex items-center justify-center rounded-full bg-[#f4d6ad] px-6 py-3 text-sm font-black text-[#221813]',
              )}
              {renderHeroAction(
                props.secondaryHref || props.primaryHref,
                props.secondaryCtaText,
                'inline-flex items-center justify-center rounded-full border border-white/16 bg-white/[0.06] px-6 py-3 text-sm font-black text-white',
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {panels.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className={`rounded-[1.6rem] border p-5 shadow-[0_26px_72px_-48px_rgba(0,0,0,0.35)] ${
                  index === 0
                    ? 'border-[#f4d6ad]/35 bg-[#f4d6ad] text-[#221813] sm:col-span-2'
                    : 'border-white/12 bg-white/[0.06] text-white'
                }`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${index === 0 ? 'text-[#6c4327]' : 'text-white/60'}`}
                >
                  {item.label}
                </p>
                <p className="mt-3 text-2xl font-black">{item.value}</p>
                <p
                  className={`mt-2 text-sm leading-6 ${index === 0 ? 'text-[#5b3b26]' : 'text-white/72'}`}
                >
                  {index === 0
                    ? props.panel.title ||
                      'أقوى عرض أو فئة يجب أن تظهر أولًا قبل باقي المسارات.'
                    : props.panel.note ||
                      'لوحة بيع قابلة للاستخدام للعروض أو الفئات أو التجميعات.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiUtilityStageHero: React.FC<HeroVariantProps> = (props) => {
  const quickRoutes = (props.highlights || []).slice(0, 4);
  const leadImage = props.panel.image || props.backgroundImage || '';

  return (
    <section className="bg-[linear-gradient(180deg,#fffef9_0%,#f2ead8_30%,#f8fafc_100%)] py-14 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-5 rounded-[2rem] border border-[#dfe4ea] bg-white/96 p-5 shadow-[0_34px_100px_-74px_rgba(31,36,44,0.28)] lg:grid-cols-[1.04fr_0.96fr] lg:p-7">
          <div className="space-y-5">
            {props.eyebrow ? (
              <span className="inline-flex rounded-full border border-[#1f242c]/12 bg-[#1f242c] px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#fff1b8]">
                {props.eyebrow}
              </span>
            ) : null}
            <h1 className="font-heading text-[2.7rem] font-black leading-[0.95] tracking-tight text-[#1f242c] md:text-[4rem]">
              {props.title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#4c5563] md:text-base">
              {props.subtitle}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickRoutes.map((item) => (
                <span
                  key={`${item.label}-${item.value}`}
                  className="rounded-full border border-[#1f242c]/10 bg-[#fff6d9] px-4 py-2 text-xs font-black text-[#1f242c]"
                >
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {renderHeroAction(
                props.primaryHref,
                props.ctaText,
                'inline-flex items-center justify-center rounded-full bg-[#1f242c] px-6 py-3 text-sm font-black text-[#fff4d1]',
              )}
              {renderHeroAction(
                props.secondaryHref || props.primaryHref,
                props.secondaryCtaText,
                'inline-flex items-center justify-center rounded-full border border-[#1f242c]/12 bg-white px-6 py-3 text-sm font-black text-[#1f242c]',
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
            <div className="relative overflow-hidden rounded-[1.8rem] bg-[#f4edd7]">
              {leadImage ? (
                <img
                  src={leadImage}
                  alt={props.title}
                  className="h-full min-h-[22rem] w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-x-4 bottom-4 rounded-[1.3rem] bg-[#1f242c] px-4 py-4 text-[#fff4d1]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#facc15]">
                  {props.panel.eyebrow || 'decision lane'}
                </p>
                <p className="mt-2 text-lg font-black">
                  {props.panel.title ||
                    'ابدأ من الفئة أو الاستخدام أو العرض الأنسب'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#fff4d1]/76">
                  {props.panel.subtitle ||
                    'معيار شراء أوضح وتفاصيل أقرب للحسم من أول شاشة.'}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                props.panel.note,
                props.panel.metricValue,
                props.panel.metricLabel,
              ]
                .filter(Boolean)
                .slice(0, 3)
                .map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={`rounded-[1.2rem] border px-4 py-4 text-sm font-bold ${
                      index === 1
                        ? 'border-[#facc15]/30 bg-[#fff4d1] text-[#1f242c]'
                        : 'border-[#dfe4ea] bg-white text-[#4c5563]'
                    }`}
                  >
                    {item}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiSoftDepartmentsHero: React.FC<HeroVariantProps> = (props) => {
  const routes = (props.highlights || []).slice(0, 4);
  const leadImage = props.backgroundImage || props.panel.image || '';

  return (
    <section className="bg-[linear-gradient(180deg,#fdfcf9_0%,#edf5ef_34%,#fdfcf9_100%)] py-14 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-5 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <div className="space-y-5">
            {props.eyebrow ? (
              <span className="inline-flex rounded-full border border-[#d8e6d8] bg-white px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#43604b]">
                {props.eyebrow}
              </span>
            ) : null}
            <h1 className="font-heading text-[2.8rem] font-black leading-[0.95] tracking-tight text-[#203528] md:text-[4.2rem]">
              {props.title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#56715e] md:text-base">
              {props.subtitle}
            </p>
            <div className="flex flex-wrap gap-2">
              {routes.map((item) => (
                <span
                  key={`${item.label}-${item.value}`}
                  className="rounded-full border border-[#d8e6d8] bg-white px-4 py-2 text-xs font-black text-[#203528]"
                >
                  {item.value}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {renderHeroAction(
                props.primaryHref,
                props.ctaText,
                'inline-flex items-center justify-center rounded-full bg-[#203528] px-6 py-3 text-sm font-black text-[#f4fbf5]',
              )}
              {renderHeroAction(
                props.secondaryHref || props.primaryHref,
                props.secondaryCtaText,
                'inline-flex items-center justify-center rounded-full border border-[#d8e6d8] bg-white px-6 py-3 text-sm font-black text-[#203528]',
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[#d8e6d8] bg-white p-3 shadow-[0_34px_100px_-74px_rgba(32,53,40,0.22)]">
            {leadImage ? (
              <img
                src={leadImage}
                alt={props.title}
                className="h-[24rem] w-full rounded-[1.4rem] object-cover md:h-[28rem]"
              />
            ) : null}
            <div className="absolute inset-x-7 bottom-7 rounded-[1.3rem] bg-white/94 px-4 py-4 shadow-[0_18px_48px_-38px_rgba(32,53,40,0.22)] backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6b8a74]">
                {props.panel.eyebrow || 'care route'}
              </p>
              <p className="mt-2 text-lg font-black text-[#203528]">
                {props.panel.title ||
                  'مسارات أقرب للعناية أو الاستخدام اليومي أو الهدية'}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#56715e]">
                {props.panel.subtitle ||
                  'اكتشاف أسرع من غير تخمة بصرية أو أقسام متزاحمة.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiOrganicHarvestHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image || '';
  const detailImage = props.panel.image || props.backgroundImage || '';
  const routes = (props.highlights || []).slice(0, 3);

  return (
    <section className="overflow-hidden border-b border-[#e6ddcf] bg-[#faf7f1] py-5 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="overflow-hidden border border-[#e4d8c8] bg-white shadow-[0_26px_72px_-58px_rgba(48,61,32,0.24)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)]">
            <div className="order-2 flex flex-col justify-center gap-5 px-5 py-7 text-start md:px-8 md:py-9 lg:order-1 lg:px-10 lg:py-12">
              {props.eyebrow ? (
                <span className="inline-flex w-fit text-[10px] font-black uppercase tracking-[0.26em] text-[#9d6f42] md:text-[11px]">
                  {props.eyebrow}
                </span>
              ) : null}

              <div className="space-y-3">
                <h1 className="font-heading text-[2.2rem] font-semibold leading-[0.98] tracking-tight text-[#24311f] sm:text-[2.55rem] md:text-[3.55rem] lg:text-[4.2rem]">
                  {props.title}
                </h1>
                <p className="max-w-[31rem] text-sm leading-7 text-[#5f6957] md:text-[15px] md:leading-8">
                  {props.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-[0.75rem] bg-[#24311f] px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#192016]',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-[0.75rem] border border-[#ddd0bf] bg-white px-6 py-3 text-sm font-black text-[#5b4d3f] transition-colors hover:border-[#d39c4d] hover:text-[#8c5d1e]',
                )}
              </div>

              {routes.length ? (
                <div className="hidden flex-wrap gap-2 pt-1 md:flex">
                  {routes.map((item) => (
                    <span
                      key={`${item.label}-${item.value}`}
                      className="inline-flex rounded-[0.7rem] border border-[#e9dece] bg-[#fff9f2] px-3.5 py-2 text-[10px] font-black tracking-[0.16em] text-[#6c5b49]"
                    >
                      {item.value}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="order-1 relative min-h-[18rem] overflow-hidden border-b border-[#eadfcd] bg-[linear-gradient(180deg,#f6efe3_0%,#fcfaf6_100%)] lg:order-2 lg:min-h-[34rem] lg:border-b-0 lg:border-s">
              <div className="absolute inset-0">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={props.title}
                    className="h-full w-full object-cover object-center"
                  />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,247,241,0.08)_0%,rgba(251,247,241,0.02)_24%,rgba(36,49,31,0.16)_100%)] lg:bg-[linear-gradient(90deg,rgba(251,247,241,0.12)_0%,rgba(251,247,241,0)_36%,rgba(36,49,31,0.18)_100%)]" />
              </div>

              <div className="absolute start-4 top-4 z-10 max-w-[12rem] rounded-[0.85rem] border border-white/80 bg-white/92 px-3.5 py-3 shadow-[0_20px_44px_-30px_rgba(45,59,39,0.22)] backdrop-blur md:start-6 md:top-6 md:max-w-[14rem] md:px-4 md:py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bf7a25]">
                  {props.panel.eyebrow || 'fresh delivery'}
                </p>
                <p className="mt-2 font-heading text-[1.05rem] font-semibold leading-tight text-[#24311f] md:text-[1.2rem]">
                  {props.panel.title || props.title}
                </p>
                {props.panel.subtitle ? (
                  <p className="mt-2 text-[11px] leading-5 text-[#67705e] md:text-xs md:leading-6">
                    {props.panel.subtitle}
                  </p>
                ) : null}
                {props.panel.metricValue ? (
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-[1.2rem] font-black text-[#24311f] md:text-[1.35rem]">
                      {props.panel.metricValue}
                    </span>
                    <span className="pb-0.5 text-[11px] font-bold text-[#8b7d6d]">
                      {props.panel.metricLabel}
                    </span>
                  </div>
                ) : null}
              </div>

              {detailImage ? (
                <div className="absolute bottom-4 end-4 hidden w-[12.5rem] overflow-hidden rounded-[0.9rem] border border-white/80 bg-white/90 shadow-[0_18px_40px_-28px_rgba(45,59,39,0.18)] backdrop-blur md:block md:bottom-6 md:end-6">
                  <img
                    src={detailImage}
                    alt={props.panel.title || props.title}
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 z-10 hidden border-t border-white/35 bg-[rgba(248,243,233,0.94)] px-5 py-3 backdrop-blur md:block md:px-8">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-black tracking-[0.18em] text-[#6c5b49]">
                  {routes.map((item, index) => (
                    <React.Fragment key={`${item.label}-${item.value}`}>
                      {index > 0 ? <span className="opacity-35">/</span> : null}
                      <span>{item.value}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiPlantSliderHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image || '';
  const detailImage = props.panel.image || props.backgroundImage || '';
  const routeChips = props.highlights.slice(0, 3);

  return (
    <section className="overflow-hidden bg-[#f8f7f1] py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="relative overflow-hidden border border-[#dfe7de] bg-[#fffefb] shadow-[0_34px_96px_-78px_rgba(33,59,45,0.2)]">
          <div className="pointer-events-none absolute inset-x-[8%] bottom-0 h-[24%] bg-[repeating-linear-gradient(90deg,rgba(208,218,208,0.32)_0px,rgba(208,218,208,0.32)_1px,transparent_1px,transparent_104px)] opacity-75" />
          <div className="pointer-events-none absolute left-[7%] top-[10%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(225,234,223,0.88),rgba(225,234,223,0)_70%)] blur-3xl" />
          <div className="pointer-events-none absolute right-[18%] top-[18%] h-40 w-40 rounded-full border border-[#d7e4d4]/80" />

          <div className="relative grid gap-6 px-5 py-6 md:px-7 md:py-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:px-10 lg:py-10">
            <div className="order-1 flex min-h-[17rem] items-end justify-center lg:min-h-[31rem]">
              <div className="relative w-full max-w-[44rem]">
                <div className="overflow-hidden rounded-[2rem] border border-[#e4ece2] bg-[linear-gradient(180deg,#fdfdfa_0%,#f4f7f1_100%)] px-4 pb-3 pt-6 shadow-[0_28px_80px_-64px_rgba(33,59,45,0.2)] sm:px-6 lg:px-10 lg:pb-6 lg:pt-8">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={props.title}
                      className="relative z-10 mx-auto max-h-[17rem] w-full object-contain sm:max-h-[22rem] lg:max-h-[27rem]"
                    />
                  ) : null}
                </div>

                <div className="absolute bottom-3 left-3 z-20 hidden max-w-[15rem] overflow-hidden rounded-[1.4rem] border border-[#dde7da] bg-white/96 shadow-[0_20px_48px_-32px_rgba(33,59,45,0.24)] backdrop-blur sm:block lg:bottom-5 lg:left-5">
                  {detailImage ? (
                    <img
                      src={detailImage}
                      alt={props.panel.title || props.title}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : null}
                  <div className="space-y-2 px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#7d946c]">
                      {props.panel.eyebrow || 'Indoor pick'}
                    </p>
                    <p className="font-heading text-[1.05rem] font-semibold leading-6 text-[#254232]">
                      {props.panel.title || props.title}
                    </p>
                    {props.panel.subtitle ? (
                      <p className="text-xs leading-6 text-[#6d7b6f]">
                        {props.panel.subtitle}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="order-2 space-y-5 text-start lg:max-w-[30rem]">
              {props.eyebrow ? (
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#8f998a] md:text-[11px]">
                  {props.eyebrow}
                </p>
              ) : null}

              <h1 className="font-heading text-[2.45rem] font-semibold leading-[0.96] tracking-tight text-[#52614d] sm:text-[2.9rem] md:text-[4.25rem]">
                {props.title}
              </h1>

              <p className="max-w-[29rem] text-sm leading-7 text-[#7e8a7d] md:text-base md:leading-8">
                {props.subtitle}
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-[1rem] bg-[#7d9f38] px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#6e8b31]',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-[1rem] border border-[#d9e4d6] bg-white px-6 py-3 text-sm font-black text-[#284233] transition-colors hover:border-[#7d9f38]',
                )}
              </div>

              {routeChips.length ? (
                <div className="hidden flex-wrap gap-2 pt-2 md:flex">
                  {routeChips.map((item) => (
                    <span
                      key={`${item.label}-${item.value}`}
                      className="inline-flex rounded-full border border-[#dde7da] bg-[#fbfcf8] px-4 py-2 text-[11px] font-black tracking-[0.16em] text-[#6b7b6c]"
                    >
                      {item.value}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="relative flex items-center justify-center gap-2 pb-4 pt-1">
            <span className="h-2.5 w-9 rounded-full bg-[#788172]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d8ddd4]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export const ElessiBikeHero: React.FC<HeroVariantProps> = (props) => {
  const heroImage = props.backgroundImage || props.panel.image || '';
  const detailImage = props.panel.image || props.backgroundImage || '';
  const routeChips = props.highlights.slice(0, 3);

  return (
    <section className="overflow-hidden border-b border-[#e3e7eb] bg-white py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="overflow-hidden border border-[#e3e7eb] bg-white">
          <div className="grid lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <div className="order-2 flex flex-col justify-center gap-5 px-6 py-7 text-start md:px-10 md:py-14 lg:order-1 lg:gap-6">
              {props.eyebrow ? (
                <span className="inline-flex w-fit text-[11px] font-black uppercase tracking-[0.28em] text-[#7d8894]">
                  {props.eyebrow}
                </span>
              ) : null}

              <div className="space-y-4">
                <h1 className="font-heading text-[2.3rem] font-semibold leading-[1.03] tracking-tight text-[#1d2a33] sm:text-[2.8rem] md:text-[4.7rem]">
                  {props.title}
                </h1>
                <p className="max-w-[32rem] text-sm leading-7 text-[#60717f] md:text-base md:leading-8">
                  {props.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {renderHeroAction(
                  props.primaryHref,
                  props.ctaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-[0.7rem] bg-[#1d2a33] px-7 py-3 text-sm font-black text-white transition-colors hover:bg-[#121d24]',
                )}
                {renderHeroAction(
                  props.secondaryHref || props.primaryHref,
                  props.secondaryCtaText,
                  'inline-flex min-h-[48px] items-center justify-center rounded-[0.7rem] border border-[#d9dee4] bg-white px-7 py-3 text-sm font-black text-[#31414d] transition-colors hover:border-[#d97706] hover:text-[#b45309]',
                )}
              </div>

              {routeChips.length ? (
                <div className="hidden flex-wrap gap-2 pt-1 md:flex">
                  {routeChips.map((item) => (
                    <span
                      key={`${item.label}-${item.value}`}
                      className="inline-flex rounded-full border border-[#e3e7eb] bg-[#f8fafb] px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-[#60717f]"
                    >
                      {item.value}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="order-1 relative min-h-[18rem] overflow-hidden border-b border-[#e3e7eb] bg-[#f7f9fb] lg:order-2 lg:min-h-[34rem] lg:border-b-0 lg:border-s">
              <div className="absolute inset-0">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={props.title}
                    className="h-full w-full object-cover object-center"
                  />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,249,251,0.24)_0%,rgba(247,249,251,0)_34%,rgba(29,42,51,0.08)_100%)]" />
              </div>

              <div className="absolute bottom-4 left-4 z-10 max-w-[15rem] border border-white/80 bg-white/92 px-4 py-4 shadow-[0_20px_44px_-30px_rgba(18,34,48,0.22)] backdrop-blur md:bottom-8 md:left-8">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d97706]">
                  {props.panel.eyebrow || 'Ready to ride'}
                </p>
                <p className="mt-2 font-heading text-[1.2rem] font-semibold leading-tight text-[#1d2a33]">
                  {props.panel.title || props.title}
                </p>
                {props.panel.subtitle ? (
                  <p className="mt-2 text-xs leading-6 text-[#60717f]">
                    {props.panel.subtitle}
                  </p>
                ) : null}
                {props.panel.metricValue ? (
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-[1.35rem] font-black text-[#1d2a33]">
                      {props.panel.metricValue}
                    </span>
                    <span className="pb-0.5 text-[11px] font-bold text-[#7d8894]">
                      {props.panel.metricLabel}
                    </span>
                  </div>
                ) : null}
              </div>

              {detailImage ? (
                <div className="absolute bottom-5 right-5 hidden w-[12rem] overflow-hidden border border-white/80 bg-white/90 shadow-[0_18px_40px_-28px_rgba(18,34,48,0.18)] backdrop-blur md:block">
                  <img
                    src={detailImage}
                    alt={props.panel.title || props.title}
                    className="aspect-[4/3] h-full w-full object-cover"
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

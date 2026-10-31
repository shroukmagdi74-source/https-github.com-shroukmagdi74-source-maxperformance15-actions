import React from 'react';
import { Link } from 'react-router-dom';
import { FeaturedCollectionsController } from '../useFeaturedCollectionsController';

export const ElessiCategoryVariants: React.FC<{
  ctrl: FeaturedCollectionsController;
}> = ({ ctrl }) => {
  const { variant, collectionCards, theme } = ctrl;

  if (variant === 'elessi-bag-categories') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {collectionCards.map((collection, index) => (
          <Link
            key={collection.id}
            to={collection.href}
            className="group overflow-hidden border border-[#eadfd3] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#d6b79f] hover:shadow-[0_28px_62px_-48px_rgba(61,41,29,0.2)]"
          >
            <div className="relative aspect-[4/4.6] overflow-hidden bg-[linear-gradient(180deg,#f7ede3_0%,#fffaf5_100%)]">
              <img
                src={collection.image}
                alt={collection.name}
                loading="lazy"
                width="420"
                height="480"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,25,21,0.05)_0%,rgba(35,25,21,0.16)_100%)]" />
              <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#9a6d51] shadow-[0_12px_26px_-18px_rgba(61,41,29,0.18)]">
                  {index === 0
                    ? 'يومي'
                    : index === 1
                      ? 'سفر'
                      : index === 2
                        ? 'هدايا'
                        : 'إضافات'}
                </span>
              </div>
            </div>
            <div className="space-y-3 px-4 py-4 text-start md:px-5 md:py-5">
              <h3 className="font-heading text-[1.45rem] font-semibold leading-tight text-[#231915]">
                {collection.name}
              </h3>
              <p className="text-sm leading-7 text-[#6f5c53]">
                {collection.description}
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-[#a1623b]">
                <span>
                  {theme?.direction === 'rtl' ? 'تصفح القسم' : 'Shop category'}
                </span>
                <span className="rtl:rotate-180">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'elessi-organic-routes') {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        {collectionCards[0] ? (
          <Link
            to={collectionCards[0].href}
            className="group overflow-hidden border border-[#eadfcd] bg-[linear-gradient(180deg,#fffefb,#f8f2e9)] shadow-[0_28px_88px_-62px_rgba(45,59,39,0.18)]"
          >
            <div className="grid gap-0 md:grid-cols-[1.08fr_0.92fr]">
              <div className="relative min-h-[18rem] overflow-hidden md:min-h-[24rem]">
                <img
                  src={collectionCards[0].image}
                  alt={collectionCards[0].name}
                  loading="lazy"
                  width="760"
                  height="840"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(45,59,39,0.06)_0%,rgba(45,59,39,0.68)_100%)]" />
                <div className="absolute inset-x-5 bottom-5 space-y-3 text-white">
                  <span className="inline-flex rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[10px] font-black tracking-[0.22em] backdrop-blur">
                    البداية اليومية
                  </span>
                  <h3 className="font-heading text-[1.9rem] font-black leading-tight">
                    {collectionCards[0].name}
                  </h3>
                  <p className="max-w-md text-sm leading-7 text-white/84">
                    {collectionCards[0].description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-5 p-5 sm:p-6">
                <div className="space-y-3">
                  <span className="inline-flex w-fit rounded-full border border-[#eadfcd] bg-white px-3 py-1 text-[10px] font-black tracking-[0.22em] text-[#8a6546]">
                    produce route
                  </span>
                  <h3 className="font-heading text-[1.75rem] font-black leading-tight text-[#2d3b27]">
                    ابدأ من الورقيات، الفاكهة، أو الصندوق الجاهز
                  </h3>
                  <p className="text-sm leading-7 text-[#67705e]">
                    دخول أقرب لروح السوق العضوي: صورة كبيرة، عنوان مباشر، ومؤشرات
                    واضحة تقود الطلب اليومي قبل الدخول إلى الشبكة الكاملة.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    'طلب أسبوعي',
                    'فاكهة الموسم',
                    'إضافات مطبخ',
                    'سلة أسرع',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1rem] border border-[#ebdfd0] bg-white/90 px-3 py-3 text-sm font-bold text-[#5c5348]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {collectionCards.slice(1, 5).map((collection, index) => (
            <Link
              key={collection.id}
              to={collection.href}
              className="group overflow-hidden border border-[#eadfcd] bg-white/96 shadow-[0_22px_64px_-54px_rgba(45,59,39,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_76px_-52px_rgba(45,59,39,0.18)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  loading="lazy"
                  width="420"
                  height="320"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(45,59,39,0.04)_0%,rgba(45,59,39,0.56)_100%)]" />
                <span className="absolute start-3 top-3 inline-flex rounded-full border border-white/18 bg-white/12 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-white backdrop-blur">
                  {index === 0
                    ? 'fresh fruit'
                    : index === 1
                      ? 'pantry'
                      : 'family crates'}
                </span>
              </div>
              <div className="space-y-2 p-4">
                <h3 className="font-heading text-lg font-black text-[#2d3b27]">
                  {collection.name}
                </h3>
                <p className="line-clamp-2 text-sm leading-6 text-[#67705e]">
                  {collection.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'elessi-plant-categories') {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-3">
          {collectionCards.slice(0, 3).map((collection, index) => (
            <Link
              key={collection.id}
              to={collection.href}
              className="group grid min-h-[15rem] overflow-hidden border border-[#eef2ec] bg-white transition-colors hover:border-[#cbd8c7]"
            >
              <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-4 p-5">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#99a392]">
                    {index === 0
                      ? 'Shop now'
                      : index === 1
                        ? 'Plant route'
                        : 'Discover'}
                  </p>
                  <h3 className="font-heading text-[1.5rem] font-black leading-tight text-[#203528]">
                    {collection.name}
                  </h3>
                  <p className="text-sm leading-7 text-[#5f7565]">
                    {collection.description}
                  </p>
                  <span className="inline-flex border-b border-[#203528] text-sm font-bold text-[#203528]">
                    Shop now
                  </span>
                </div>
                <div className="flex h-full items-center justify-center">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    loading="lazy"
                    width="620"
                    height="520"
                    className="max-h-[13rem] w-full object-contain transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {collectionCards[3] ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7efe4] pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#99a392]">
                Accessory route
              </p>
              <p className="text-sm font-bold text-[#203528]">
                {collectionCards[3].name}
              </p>
            </div>
            <Link
              to={collectionCards[3].href}
              className="inline-flex items-center rounded-full border border-[#d8e6d8] bg-white px-4 py-2 text-sm font-bold text-[#43604b] transition-colors hover:border-[#76b20d] hover:text-[#203528]"
            >
              {collectionCards[3].description ||
                'اكتشف الإضافات والأصص القريبة'}
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === 'elessi-merch-panels') {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        {collectionCards[0] ? (
          <Link
            to={collectionCards[0].href}
            className="group overflow-hidden rounded-[2rem] border border-[#ead8ca] bg-[linear-gradient(180deg,#fffefb,#f8eee4)] shadow-[0_34px_96px_-72px_rgba(91,57,40,0.28)]"
          >
            <div className="grid gap-0 md:grid-cols-[1.02fr_0.98fr]">
              <div className="relative min-h-[18rem] overflow-hidden md:min-h-[24rem]">
                <img
                  src={collectionCards[0].image}
                  alt={collectionCards[0].name}
                  loading="lazy"
                  width="760"
                  height="840"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,29,24,0.08)_0%,rgba(47,29,24,0.68)_100%)]" />
                <div className="absolute inset-x-5 bottom-5 space-y-3 text-white">
                  <span className="inline-flex rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[10px] font-black tracking-[0.22em] backdrop-blur">
                    البيع الأقرب
                  </span>
                  <h3 className="font-heading text-[1.9rem] font-black leading-tight">
                    {collectionCards[0].name}
                  </h3>
                  <p className="max-w-md text-sm leading-7 text-white/82">
                    {collectionCards[0].description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-5 p-5 sm:p-6">
                <div className="space-y-3">
                  <span className="inline-flex w-fit rounded-full border border-[#ead8ca] bg-white px-3 py-1 text-[10px] font-black tracking-[0.22em] text-[#8f5c44]">
                    department 01
                  </span>
                  <h3 className="font-heading text-[1.75rem] font-black leading-tight text-[#2d211e]">
                    ابدئي من المسار الذي يبيع أسرع
                  </h3>
                  <p className="text-sm leading-7 text-[#6f5a54]">
                    صورة كبيرة، عنوان مباشر، وتلميحات واضحة تقود الزائر إلى
                    القسم قبل أن يغرق في الشبكة.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    'اكتشاف أسرع',
                    'عروض أوضح',
                    'فئات جاهزة',
                    'سلة أكبر',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1rem] border border-[#ebddcf] bg-white/86 px-3 py-3 text-sm font-bold text-[#5e463f]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {collectionCards.slice(1, 5).map((collection, index) => (
            <Link
              key={collection.id}
              to={collection.href}
              className="group overflow-hidden rounded-[1.45rem] border border-[#ead8ca] bg-white/95 shadow-[0_22px_64px_-56px_rgba(91,57,40,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_76px_-54px_rgba(91,57,40,0.22)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  loading="lazy"
                  width="420"
                  height="320"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,29,24,0.04)_0%,rgba(47,29,24,0.56)_100%)]" />
                <span className="absolute start-3 top-3 inline-flex rounded-full border border-white/18 bg-white/14 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-white backdrop-blur">
                  {`0${index + 2}`}
                </span>
              </div>
              <div className="space-y-2 p-4">
                <h3 className="font-heading text-lg font-black text-[#2d211e]">
                  {collection.name}
                </h3>
                <p className="line-clamp-2 text-sm leading-6 text-[#6f5a54]">
                  {collection.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'elessi-pill-shelf') {
    return (
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 xl:grid-cols-4">
        {collectionCards.map((collection, index) => (
          <Link
            key={collection.id}
            to={collection.href}
            className="group inline-flex min-w-[16rem] shrink-0 items-center gap-3 rounded-[1.35rem] border border-[#ead8ca] bg-white/96 p-3 shadow-[0_20px_58px_-48px_rgba(91,57,40,0.16)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_72px_-48px_rgba(91,57,40,0.22)] md:min-w-0"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-[1rem] border border-[#efe0d4] bg-[#f9f0e8]">
              <img
                src={collection.image}
                alt={collection.name}
                loading="lazy"
                width="160"
                height="160"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-[#fff3eb] px-2.5 py-1 text-[10px] font-black tracking-[0.18em] text-[#9b6248]">
                  {`0${index + 1}`}
                </span>
                <h3 className="truncate text-sm font-black text-[#2d211e]">
                  {collection.name}
                </h3>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6f5a54]">
                {collection.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'elessi-story-cards') {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collectionCards.map((collection, index) => (
          <Link
            key={collection.id}
            to={collection.href}
            className={`group overflow-hidden rounded-[1.75rem] border border-[#ead8ca] bg-[linear-gradient(180deg,#fffefb,#fbf3ec)] shadow-[0_28px_78px_-60px_rgba(91,57,40,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_92px_-58px_rgba(91,57,40,0.24)] ${
              index === 0 ? 'md:col-span-2 xl:col-span-1' : ''
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={collection.image}
                alt={collection.name}
                loading="lazy"
                width="420"
                height="320"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,29,24,0.08)_0%,rgba(47,29,24,0.6)_100%)]" />
              <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3 text-white">
                <span className="inline-flex rounded-full border border-white/18 bg-white/12 px-3 py-1 text-[10px] font-black tracking-[0.22em] backdrop-blur">
                  قصة اليوم
                </span>
                <span className="text-xs font-black">{`0${index + 1}`}</span>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <h3 className="font-heading text-xl font-black text-[#2d211e]">
                {collection.name}
              </h3>
              <p className="text-sm leading-7 text-[#6f5a54]">
                {collection.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  index === 0 ? 'مدخل قوي' : 'قرار أسرع',
                  index % 2 === 0 ? 'صورة واضحة' : 'عرض مرتب',
                ].map((tag) => (
                  <span
                    key={`${collection.id}-${tag}`}
                    className="inline-flex rounded-full border border-[#eadccf] bg-white px-3 py-1.5 text-xs font-bold text-[#70574d]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'elessi-digital-departments') {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          {collectionCards[0] ? (
            <Link
              to={collectionCards[0].href}
              className="group overflow-hidden border border-[#e4e9f0] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] shadow-[0_24px_74px_-58px_rgba(15,23,42,0.18)]"
            >
              <div className="grid min-h-[18rem] gap-0 md:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
                <div className="flex flex-col justify-center gap-4 px-5 py-5 md:px-6">
                  <span className="inline-flex w-fit border border-[#dce4ef] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#7a8595]">
                    Launch lane
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-heading text-[1.55rem] font-black leading-tight text-[#161c26] md:text-[1.9rem]">
                      {collectionCards[0].name}
                    </h3>
                    <p className="text-sm leading-7 text-[#536172]">
                      {collectionCards[0].description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Best value', 'Top rated', 'Work-ready'].map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-2 border border-[#e4e9f0] bg-[#fbfcfe] px-3 py-1.5 text-[11px] font-bold text-[#516170]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative min-h-[16rem] overflow-hidden border-t border-[#e4e9f0] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(241,245,249,0.9)_58%,rgba(226,232,240,0.84))] md:min-h-full md:border-s md:border-t-0">
                  <img
                    src={collectionCards[0].image}
                    alt={collectionCards[0].name}
                    loading="lazy"
                    width="760"
                    height="680"
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.18] transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-[16%] top-[12%] h-[58%] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.96),rgba(255,255,255,0.72)_52%,rgba(255,255,255,0)_80%)]" />
                  <div className="relative z-10 flex h-full items-end justify-center px-5 py-5">
                    <img
                      src={collectionCards[0].image}
                      alt=""
                      loading="lazy"
                      width="520"
                      height="520"
                      className="max-h-[14rem] w-full max-w-[18rem] object-contain drop-shadow-[0_24px_48px_rgba(15,23,42,0.16)] md:max-h-[18rem] md:max-w-[20rem]"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ) : null}

          <div className="grid gap-3">
            {collectionCards.slice(1, 3).map((collection, index) => (
              <Link
                key={collection.id}
                to={collection.href}
                className="group grid min-h-[11rem] overflow-hidden border border-[#e4e9f0] bg-white transition-colors hover:border-[#cbd5e1]"
              >
                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-3 p-4">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7a8595]">
                      {index === 0 ? 'Creator route' : 'Desk setup'}
                    </p>
                    <h3 className="font-heading text-[1.3rem] font-black leading-tight text-[#161c26]">
                      {collection.name}
                    </h3>
                    <p className="text-sm leading-6 text-[#536172]">
                      {collection.description}
                    </p>
                  </div>
                  <div className="flex h-full items-center justify-center bg-[#f7f9fc] p-4">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      loading="lazy"
                      width="420"
                      height="320"
                      className="max-h-[8.5rem] w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#e4e9f0] pt-4">
          {collectionCards.slice(0, 4).map((collection, index) => (
            <Link
              key={`${collection.id}-chip`}
              to={collection.href}
              className="inline-flex items-center gap-2 border border-[#dce4ef] bg-white px-4 py-2 text-sm font-bold text-[#243042] transition-colors hover:border-[#f59e0b] hover:text-[#b45309]"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a8595]">
                {`0${index + 1}`}
              </span>
              <span>{collection.name}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'elessi-bike-panels') {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {collectionCards.slice(0, 4).map((collection, index) => (
          <Link
            key={collection.id}
            to={collection.href}
            className="group overflow-hidden border border-[#e3e7eb] bg-white transition-colors hover:border-[#c8d0d8]"
          >
            <div className="grid min-h-[16rem] gap-0 md:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
              <div className="flex flex-col justify-center gap-4 px-5 py-5 md:px-6">
                <span className="inline-flex w-fit rounded-full border border-[#e3e7eb] bg-[#f8fafb] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#687784]">
                  {index === 0
                    ? 'City ride'
                    : index === 1
                      ? 'Road lane'
                      : index === 2
                        ? 'Gear up'
                        : 'Workshop'}
                </span>
                <div className="space-y-2">
                  <h3 className="font-heading text-[1.45rem] font-bold leading-tight text-[#1d2a33]">
                    {collection.name}
                  </h3>
                  <p className="text-sm leading-7 text-[#60717f]">
                    {collection.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#1d2a33]">
                  <span>
                    {theme?.direction === 'rtl' ? 'تصفح القسم' : 'Shop category'}
                  </span>
                  <span className="rtl:rotate-180">→</span>
                </span>
              </div>
              <div className="relative min-h-[14rem] overflow-hidden border-t border-[#e3e7eb] bg-[#f7f9fb] md:min-h-full md:border-s md:border-t-0">
                <img
                  src={collection.image}
                  alt={collection.name}
                  loading="lazy"
                  width="620"
                  height="520"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'elessi-utility-cards') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {collectionCards.map((collection, index) => (
          <Link
            key={collection.id}
            to={collection.href}
            className="group grid grid-cols-[6.2rem_minmax(0,1fr)] gap-4 rounded-[1.45rem] border border-[#ead8ca] bg-white/96 p-3 shadow-[0_20px_62px_-54px_rgba(91,57,40,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-52px_rgba(91,57,40,0.24)] sm:grid-cols-[6.8rem_minmax(0,1fr)]"
          >
            <div className="relative aspect-square overflow-hidden rounded-[1rem] border border-[#efe0d4] bg-[#f9f0e8]">
              <img
                src={collection.image}
                alt={collection.name}
                loading="lazy"
                width="220"
                height="220"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-[#fff3eb] px-2.5 py-1 text-[10px] font-black tracking-[0.18em] text-[#9b6248]">
                  {index === 0 ? 'TOP' : `0${index + 1}`}
                </span>
                <h3 className="truncate font-heading text-lg font-black text-[#2d211e]">
                  {collection.name}
                </h3>
              </div>
              <p className="line-clamp-2 text-sm leading-6 text-[#6f5a54]">
                {collection.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {['فلترة أسرع', 'دخول مباشر'].map((item) => (
                  <span
                    key={`${collection.id}-${item}`}
                    className="inline-flex rounded-full border border-[#eadccf] bg-[#fffaf6] px-2.5 py-1 text-[11px] font-bold text-[#70574d]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return null;
};

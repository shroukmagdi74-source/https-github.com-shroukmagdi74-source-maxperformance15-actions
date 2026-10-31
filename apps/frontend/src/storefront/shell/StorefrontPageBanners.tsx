import React from 'react';
import { Link } from 'react-router-dom';
import { buildStorefrontPath } from '../utils/paths';
import type { BreadcrumbTrailOptions } from './shellTypes';

export const renderBreadcrumbTrail = (
  trail: string[],
  pathname: string,
  search: string,
  options: BreadcrumbTrailOptions = {},
) => {
  const {
    crumbColor = '',
    activeColor = 'font-medium text-foreground',
    slashColor = 'opacity-45',
    justify = 'center',
    textSize = 'text-sm md:text-[0.95rem]',
  } = options;

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className={`flex flex-wrap items-center ${justify === 'start' ? 'justify-start' : 'justify-center'} gap-2 ${textSize}`}
      >
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          let href: string | undefined;
          if (index === 0) {
            href = buildStorefrontPath(pathname, '/', search);
          } else if (!isLast && trail.length > 2) {
            href = buildStorefrontPath(pathname, '/shop', search);
          }

          return (
            <li
              key={`${crumb}-${index}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="inline-flex items-center gap-2"
            >
              {index > 0 ? (
                <span className={slashColor} aria-hidden="true">
                  /
                </span>
              ) : null}
              {href ? (
                <Link
                  to={href}
                  itemProp="item"
                  className={`hover:underline ${crumbColor}`}
                >
                  <span itemProp="name">{crumb}</span>
                </Link>
              ) : (
                <span
                  itemProp="name"
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? activeColor : crumbColor}
                >
                  {crumb}
                </span>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export const elessiCompactProductCrumbs = (
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full border-b border-border/70 bg-background/96">
    <div className="container px-4 py-3 md:px-6 md:py-4">
      {renderBreadcrumbTrail(trail, pathname, search, {
        crumbColor: 'text-muted-foreground',
        activeColor: 'font-medium text-foreground',
        slashColor: 'opacity-35',
        justify: 'start',
        textSize: 'text-[11px] font-bold md:text-xs',
      })}
    </div>
  </div>
);

export const carryLanePageBanner = (
  title: string,
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full overflow-hidden border-b border-[#eadfd3] bg-[#fbf7f1]">
    <div className="relative isolate py-10 md:py-14">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(251,247,241,0.94)_54%,rgba(246,238,228,0.96))]" />
      <div className="absolute -left-10 top-0 hidden h-full w-44 overflow-hidden rounded-br-[3.25rem] opacity-45 md:block">
        <img
          src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute -right-10 top-0 hidden h-full w-44 overflow-hidden rounded-bl-[3.25rem] opacity-45 md:block">
        <img
          src="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-3 px-4 text-center md:px-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#231915] md:text-[2.75rem]">
          {title}
        </h1>
        {renderBreadcrumbTrail(trail, pathname, search, {
          crumbColor: 'text-[#7d6a60]',
          activeColor: 'font-medium text-[#34231d]',
          slashColor: 'opacity-45',
        })}
      </div>
    </div>
  </div>
);

export const sproutRoomPageBanner = (
  title: string,
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full overflow-hidden border-b border-[#ece5d9] bg-[#f7f4ee]">
    <div className="relative isolate py-10 md:py-14">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(247,244,238,0.88)_58%,rgba(242,237,229,0.92))]" />
      <div className="absolute -left-8 top-0 hidden h-full w-40 overflow-hidden rounded-br-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute -right-8 top-0 hidden h-full w-40 overflow-hidden rounded-bl-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-3 px-4 text-center md:px-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#1f261f] md:text-[2.7rem]">
          {title}
        </h1>
        {renderBreadcrumbTrail(trail, pathname, search, {
          crumbColor: 'text-[#6c7568]',
          activeColor: 'font-medium text-[#2b362a]',
          slashColor: 'opacity-45',
        })}
      </div>
    </div>
  </div>
);

export const harvestFoldPageBanner = (
  title: string,
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full overflow-hidden border-b border-[#eadfcd] bg-[#fbf8f2]">
    <div className="relative isolate py-10 md:py-14">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(251,248,242,0.9)_56%,rgba(246,239,227,0.94))]" />
      <div className="absolute -left-8 top-0 hidden h-full w-40 overflow-hidden rounded-br-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute -right-8 top-0 hidden h-full w-40 overflow-hidden rounded-bl-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-3 px-4 text-center md:px-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#2d3b27] md:text-[2.7rem]">
          {title}
        </h1>
        {renderBreadcrumbTrail(trail, pathname, search, {
          crumbColor: 'text-[#6c5b49]',
          activeColor: 'font-medium text-[#2d3b27]',
          slashColor: 'opacity-45',
        })}
      </div>
    </div>
  </div>
);

export const signalDeckPageBanner = (
  title: string,
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full overflow-hidden border-b border-[#e4e9f0] bg-white">
    <div className="relative isolate py-10 md:py-14">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(247,249,252,0.94)_58%,rgba(238,242,247,0.96))]" />
      <div className="absolute -left-8 top-0 hidden h-full w-44 overflow-hidden rounded-br-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute -right-8 top-0 hidden h-full w-44 overflow-hidden rounded-bl-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-3 px-4 text-center md:px-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#161c26] md:text-[2.7rem]">
          {title}
        </h1>
        {renderBreadcrumbTrail(trail, pathname, search, {
          crumbColor: 'text-[#607184]',
          activeColor: 'font-medium text-[#161c26]',
          slashColor: 'opacity-45',
        })}
      </div>
    </div>
  </div>
);

export const pedalLabPageBanner = (
  title: string,
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full overflow-hidden border-b border-[#e3e7eb] bg-white">
    <div className="relative isolate py-10 md:py-14">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(249,250,251,0.94)_58%,rgba(243,246,248,0.96))]" />
      <div className="absolute -left-8 top-0 hidden h-full w-44 overflow-hidden rounded-br-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute -right-8 top-0 hidden h-full w-44 overflow-hidden rounded-bl-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-3 px-4 text-center md:px-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#1d2a33] md:text-[2.7rem]">
          {title}
        </h1>
        {renderBreadcrumbTrail(trail, pathname, search, {
          crumbColor: 'text-[#677684]',
          activeColor: 'font-medium text-[#1d2a33]',
          slashColor: 'opacity-45',
        })}
      </div>
    </div>
  </div>
);

export const glowRoutinePageBanner = (
  title: string,
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full overflow-hidden border-b border-[#eadfd8] bg-[#fffaf7]">
    <div className="relative isolate py-10 md:py-14">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(255,247,242,0.92)_56%,rgba(250,240,233,0.94))]" />
      <div className="absolute -left-8 top-0 hidden h-full w-40 overflow-hidden rounded-br-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute -right-8 top-0 hidden h-full w-40 overflow-hidden rounded-bl-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-3 px-4 text-center md:px-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#382426] md:text-[2.7rem]">
          {title}
        </h1>
        {renderBreadcrumbTrail(trail, pathname, search, {
          crumbColor: 'text-[#87686b]',
          activeColor: 'font-medium text-[#382426]',
          slashColor: 'opacity-45',
        })}
      </div>
    </div>
  </div>
);

export const gemAtelierPageBanner = (
  title: string,
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full overflow-hidden border-b border-[#eadfd8] bg-[#fffaf7]">
    <div className="relative isolate py-10 md:py-14">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(255,248,242,0.92)_56%,rgba(247,239,232,0.94))]" />
      <div className="absolute -left-8 top-0 hidden h-full w-40 overflow-hidden rounded-br-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute -right-8 top-0 hidden h-full w-40 overflow-hidden rounded-bl-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-3 px-4 text-center md:px-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#352427] md:text-[2.7rem]">
          {title}
        </h1>
        {renderBreadcrumbTrail(trail, pathname, search, {
          crumbColor: 'text-[#856a6d]',
          activeColor: 'font-medium text-[#352427]',
          slashColor: 'opacity-45',
        })}
      </div>
    </div>
  </div>
);

export const tailSupplyPageBanner = (
  title: string,
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full overflow-hidden border-b border-[#dfe7dc] bg-[#fbfdf9]">
    <div className="relative isolate py-10 md:py-14">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(247,252,247,0.92)_56%,rgba(239,247,240,0.94))]" />
      <div className="absolute -left-8 top-0 hidden h-full w-40 overflow-hidden rounded-br-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute -right-8 top-0 hidden h-full w-40 overflow-hidden rounded-bl-[3rem] opacity-40 md:block">
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=900"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-3 px-4 text-center md:px-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#254235] md:text-[2.7rem]">
          {title}
        </h1>
        {renderBreadcrumbTrail(trail, pathname, search, {
          crumbColor: 'text-[#5f7a67]',
          activeColor: 'font-medium text-[#254235]',
          slashColor: 'opacity-45',
        })}
      </div>
    </div>
  </div>
);

export const chronoGalleryPageBanner = (
  title: string,
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full overflow-hidden border-b border-[#dde2e6] bg-[#fbfcfd]">
    <div className="relative isolate py-10 md:py-14">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(246,248,250,0.92)_56%,rgba(236,240,244,0.94))]" />
      <div className="absolute -left-8 top-0 hidden h-full w-40 overflow-hidden rounded-br-[3rem] opacity-40 md:block">
        <img
          src="/assets/themes/style-store-eg/products/velvet-link-watch-1.jpg"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute -right-8 top-0 hidden h-full w-40 overflow-hidden rounded-bl-[3rem] opacity-40 md:block">
        <img
          src="/assets/themes/style-store-eg/products/mono-sport-watch-1.jpg"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-3 px-4 text-center md:px-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#1f2731] md:text-[2.7rem]">
          {title}
        </h1>
        {renderBreadcrumbTrail(trail, pathname, search, {
          crumbColor: 'text-[#6a727b]',
          activeColor: 'font-medium text-[#1f2731]',
          slashColor: 'opacity-45',
        })}
      </div>
    </div>
  </div>
);

export const garageFitPageBanner = (
  title: string,
  trail: string[],
  pathname: string,
  search: string,
) => (
  <div className="w-full overflow-hidden border-b border-[#2b211c] bg-[#120f0e]">
    <div className="relative isolate py-10 md:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,42,30,0.42),rgba(18,15,14,0.95)_58%,rgba(10,10,10,1))]" />
      <div className="absolute inset-y-0 left-0 hidden w-44 overflow-hidden md:block">
        <div className="absolute inset-y-0 left-8 w-px bg-gradient-to-b from-transparent via-[#f97316] to-transparent opacity-60" />
        <div className="absolute left-14 top-10 h-12 w-12 rounded-full border border-[#f97316]/40" />
        <div className="absolute left-24 top-24 h-20 w-20 rounded-full border border-[#fbbf24]/20" />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-48 items-center justify-center md:flex">
        <div className="grid gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#f7d7b6]">
          <span className="rounded-full border border-[#4b3329] bg-[#181614] px-3 py-2 text-center">
            Oil
          </span>
          <span className="rounded-full border border-[#4b3329] bg-[#181614] px-3 py-2 text-center">
            Filter
          </span>
          <span className="rounded-full border border-[#4b3329] bg-[#181614] px-3 py-2 text-center">
            LED
          </span>
        </div>
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-3 px-4 text-center md:px-6">
        <span className="inline-flex rounded-full border border-[#4b3329] bg-[#181614] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#f7b26a]">
          Garage Fit
        </span>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#fff6ea] md:text-[2.7rem]">
          {title}
        </h1>
        {renderBreadcrumbTrail(trail, pathname, search, {
          crumbColor: 'text-[#dcc4ad]',
          activeColor: 'font-medium text-[#fff6ea]',
          slashColor: 'opacity-45',
        })}
      </div>
    </div>
  </div>
);

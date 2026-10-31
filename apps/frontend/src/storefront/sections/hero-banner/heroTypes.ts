export interface HeroSticker {
  label: string;
  position?: "left-mid" | "left-bottom" | "right-mid" | "right-bottom";
  tone?: "primary" | "outline" | "default";
}

export interface HeroFloatingCard {
  badge?: string;
  title?: string;
  value?: string;
  description?: string;
  tone?: "indigo" | "glass" | "default";
}

export interface HeroBannerHighlight {
  label: string;
  value: string;
}

export interface HeroSlide {
  image?: string;
  imageUrl?: string;
  backgroundImage?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export interface HeroVariantProps {
  title: string;
  subtitle: string;
  ctaText: string;
  primaryHref: string;
  secondaryCtaText: string;
  secondaryHref: string;
  backgroundImage: string;
  eyebrow?: string;
  highlights: HeroBannerHighlight[];
  floatingCards: HeroFloatingCard[];
  stickers: HeroSticker[];
  contentAlign?: "left" | "center";
  panel: {
    image?: string;
    title?: string;
    subtitle?: string;
    note?: string;
    metricLabel?: string;
    metricValue?: string;
    eyebrow?: string;
  };
  primaryActionClassName?: string;
  secondaryActionClassName?: string;
  slides?: HeroSlide[];
  compact?: boolean;
}

export interface HeroBannerProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: {
    title?: string;
    subtitle?: string;
    variant?: string;
    primaryCtaText?: string;
    ctaText?: string;
    primaryCtaLink?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    backgroundImage?: string;
    imageUrl?: string;
    image?: string;
    eyebrow?: string;
    highlights?: HeroBannerHighlight[];
    floatingCards?: HeroFloatingCard[];
    stickers?: HeroSticker[];
    slides?: HeroSlide[];
    compact?: boolean;
    panelImage?: string;
    panelTitle?: string;
    panelSubtitle?: string;
    panelNote?: string;
    panelEyebrow?: string;
    panelMetricValue?: string;
    panelMetricLabel?: string;
    [key: string]: unknown;
  };
}

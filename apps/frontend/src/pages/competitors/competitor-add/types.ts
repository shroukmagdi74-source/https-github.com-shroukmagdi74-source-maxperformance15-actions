import {
  Facebook,
  Instagram as InstagramIcon,
  Music2,
  Ghost,
  MessageCircle,
  Youtube,
  Linkedin,
  Smartphone,
} from 'lucide-react';

export const PLATFORMS = ['manual', 'shopify', 'woocommerce', 'salla', 'zid', 'easy_orders', 'other'] as const;
export type PlatformType = (typeof PLATFORMS)[number];

export const ACTIVITY_TYPES = [
  'ecommerce',
  'services',
  'import_export',
  'manufacturing',
  'software',
  'education',
  'healthcare',
  'realestate',
  'tourism',
  'other',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const TARGET_MARKETS = ['b2b', 'b2c', 'b2b_b2c', 'government', 'all'] as const;
export type TargetMarketType = (typeof TARGET_MARKETS)[number];

export const SOCIAL_PLATFORMS = [
  { key: 'facebook', icon: Facebook },
  { key: 'instagram', icon: InstagramIcon },
  { key: 'tiktok', icon: Music2 },
  { key: 'snapchat', icon: Ghost },
  { key: 'x', icon: MessageCircle },
  { key: 'youtube', icon: Youtube },
  { key: 'linkedin', icon: Linkedin },
  { key: 'other', icon: Smartphone },
] as const;

export interface SocialProfile {
  platform: string;
  url: string;
}

export interface MediaNoteItem {
  id: string;
  text: string;
}

export interface ComparisonItem {
  id: string;
  featureName: string;
  competitorDesc: string;
  ourDesc: string;
  easierToUse: string;
  stronger: string;
  notes: string;
}

export interface DevIdea {
  id: string;
  title: string;
  description: string;
  images: string[];
}

export interface ImageItem {
  id: string;
  data: string;
  file?: File;
}

export interface CompetitorFormData {
  name: string;
  websiteUrl: string;
  platform: string;
  activityType: string;
  targetMarket: string;
  foundedYear: string;
  founderName: string;
  founderLink: string;
  country: string;
  city: string;
  trafficSource: string;
  strengths: string;
  weaknesses: string;
  price: string;
  currency: string;
  cycle: string;
  monthlyPrice: string;
  yearlyPrice: string;
  pricingNotes: string;
  status: string;
}

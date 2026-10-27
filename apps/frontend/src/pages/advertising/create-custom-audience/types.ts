import React from "react";
import {
  GlobeAltIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CameraIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CreateCustomAudienceData,
  FacebookAdAccount,
  FacebookPage,
  FacebookPixel,
} from "../../../services/facebookAdsService";

export type {
  CreateCustomAudienceData,
  FacebookAdAccount,
  FacebookPage,
  FacebookPixel,
};

export interface CustomerListItem {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export interface AudienceTypeOption {
  value: CreateCustomAudienceData["audienceType"];
  label: string;
  description: string;
  badge: string;
  icon: React.ElementType;
}

export const AUDIENCE_TYPES: AudienceTypeOption[] = [
  {
    value: "WEBSITE",
    label: "نشاط المتجر والموقع (Pixel)",
    description: "استهداف زوار المتجر، المشترين، من أضافوا للسلة، أو من زاروا روابط محددة",
    badge: "Pixel & CAPI",
    icon: GlobeAltIcon,
  },
  {
    value: "CUSTOMER_LIST",
    label: "قائمة العملاء (Customer List)",
    description: "استيراد مباشر لعملاء متجر MaxP، أو رفع ملف CSV، أو إدخال يدوي",
    badge: "تشفير تلقائي SHA256",
    icon: UserGroupIcon,
  },
  {
    value: "PAGE_ENGAGEMENT",
    label: "تفاعل صفحة فيسبوك (Facebook Page)",
    description: "من تفاعل مع صفحتك أو منشوراتك، نقر أزرار CTA، أرسل رسائل، أو زارها",
    badge: "حتى 365 يوماً",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    value: "IG_ENGAGEMENT",
    label: "تفاعل حساب إنستجرام (Instagram)",
    description: "من تفاعل مع حساب Instagram الاحترافي، زار البروفايل، أو أرسل DM",
    badge: "حساب الأعمال",
    icon: CameraIcon,
  },
  {
    value: "VIDEO_VIEWS",
    label: "مشاهدو الفيديو (Video Views)",
    description: "من شاهدوا فيديوهات صفحتك بنسبة 25%، 50%، 75%، 95% أو 10 ثوانٍ فما فوق",
    badge: "ThruPlay Retargeting",
    icon: PlayCircleIcon,
  },
];

import React, { useState, useMemo } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export interface StudioIconDefinition {
  id: string;
  labelAr: string;
  labelEn: string;
  category: "commerce" | "social" | "trust" | "actions" | "ui";
  tags: string[];
  svg: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}

const p = (props: React.SVGProps<SVGSVGElement>) => ({
  className: "w-5 h-5",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor",
  ...props,
});

export const STOREFRONT_ICONS: Record<string, StudioIconDefinition> = {
  // 1. Commerce
  cart: {
    id: "cart",
    labelAr: "سلة التسوق",
    labelEn: "Cart",
    category: "commerce",
    tags: ["سلة", "عربة", "تسوق", "شراء", "cart", "shop", "buy"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
    ),
  },
  bag: {
    id: "bag",
    labelAr: "حقيبة تسوق",
    labelEn: "Bag",
    category: "commerce",
    tags: ["حقيبة", "شنطة", "شراء", "متجر", "bag", "shopping"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
    ),
  },
  store: {
    id: "store",
    labelAr: "متجر",
    labelEn: "Store",
    category: "commerce",
    tags: ["متجر", "محل", "دكان", "store", "shop"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25A2.25 2.25 0 010 18.75V10.5M18 21h3.75A2.25 2.25 0 0024 18.75V10.5M3.75 3h16.5a1.5 1.5 0 011.5 1.5v3.75a3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 01-3 3 3 3 0 01-3-3V4.5A1.5 1.5 0 013.75 3z" /></svg>
    ),
  },
  tag: {
    id: "tag",
    labelAr: "وسم وخصم",
    labelEn: "Discount Tag",
    category: "commerce",
    tags: ["خصم", "تخفيض", "عرض", "سعر", "وسم", "discount", "tag", "sale", "offer"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.386a60.158 60.158 0 005.156-3.473c.697-.56.91-1.52.484-2.296a60.166 60.166 0 00-3.32-5.07c-.452-.572-1.127-.898-1.85-.898h-4.318M6.75 6.75h.008v.008H6.75V6.75z" /></svg>
    ),
  },
  percent: {
    id: "percent",
    labelAr: "نسبة وتخفيض",
    labelEn: "Percentage",
    category: "commerce",
    tags: ["نسبة", "تخفيض", "عرض", "promo", "percent", "sale"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15M7.5 9a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm9 10.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /></svg>
    ),
  },
  gift: {
    id: "gift",
    labelAr: "هدية ومكافأة",
    labelEn: "Gift Box",
    category: "commerce",
    tags: ["هدية", "مكافأة", "مجاني", "gift", "present", "free", "reward"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
    ),
  },
  cash: {
    id: "cash",
    labelAr: "دفع نقدي",
    labelEn: "Cash On Delivery",
    category: "commerce",
    tags: ["كاش", "نقد", "دفع عند الاستلام", "فلوس", "cash", "money", "cod"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6H2.25m0 0v9.75c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V6c0-.621-.504-1.125-1.125-1.125H3.375A1.125 1.125 0 002.25 6zM9 12a3 3 0 106 0 3 3 0 00-6 0z" /></svg>
    ),
  },
  "credit-card": {
    id: "credit-card",
    labelAr: "بطاقة دفع فيزا/ماستر",
    labelEn: "Credit Card",
    category: "commerce",
    tags: ["بطاقة", "فيزا", "ماستر", "دفع", "card", "credit", "payment", "visa"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-6-10.5h16.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V7.5a1.5 1.5 0 011.5-1.5z" /></svg>
    ),
  },
  wallet: {
    id: "wallet",
    labelAr: "محفظة إلكترونية",
    labelEn: "Wallet",
    category: "commerce",
    tags: ["محفظة", "رصيد", "فودافون كاش", "انستاباي", "wallet", "instapay"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>
    ),
  },
  box: {
    id: "box",
    labelAr: "طرد وشحنة",
    labelEn: "Package",
    category: "commerce",
    tags: ["طرد", "صندوق", "شحنة", "منتج", "box", "package", "parcel"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.75h.008v.008H12v-.008zM3.75 7.5h16.5m-16.5 0L6 3.75h12l2.25 3.75" /></svg>
    ),
  },
  truck: {
    id: "truck",
    labelAr: "شحن وتوصيل",
    labelEn: "Shipping Truck",
    category: "commerce",
    tags: ["شحن", "توصيل", "سريع", "سيارة", "shipping", "delivery", "truck", "bosta"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V14.25m0 0H2.25m12 0h2.25" /></svg>
    ),
  },
  delivery: {
    id: "delivery",
    labelAr: "توصيل سريع",
    labelEn: "Fast Delivery",
    category: "commerce",
    tags: ["توصيل", "سريع", "دليفري", "delivery", "express", "fast"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  return: {
    id: "return",
    labelAr: "استبدال واسترجاع",
    labelEn: "Easy Returns",
    category: "commerce",
    tags: ["استرجاع", "استبدال", "ضمان", "إرجاع", "return", "refund", "exchange"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
    ),
  },

  // 2. Trust & Security
  shield: {
    id: "shield",
    labelAr: "أمان وحماية",
    labelEn: "Shield Security",
    category: "trust",
    tags: ["أمان", "حماية", "درع", "موثوق", "security", "shield", "safety"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
    ),
  },
  guarantee: {
    id: "guarantee",
    labelAr: "ضمان الجودة",
    labelEn: "Quality Guarantee",
    category: "trust",
    tags: ["ضمان", "جودة", "شهادة", "أصلي", "guarantee", "warranty", "original"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
    ),
  },
  badge: {
    id: "badge",
    labelAr: "شارة معتمدة",
    labelEn: "Verified Badge",
    category: "trust",
    tags: ["شارة", "معتمد", "موثق", "badge", "verified"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007-4.437l1.528-1.528a2.25 2.25 0 000-3.182l-.44-.44a2.25 2.25 0 00-3.182 0l-1.528 1.528M9.75 14.25l-1.528 1.528a2.25 2.25 0 01-3.182 0l-.44-.44a2.25 2.25 0 010-3.182l1.528-1.528" /></svg>
    ),
  },
  star: {
    id: "star",
    labelAr: "نجمة وتقييم",
    labelEn: "Star Rating",
    category: "trust",
    tags: ["نجمة", "تقييم", "مميز", "مراجعة", "star", "rating", "review"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
    ),
  },
  heart: {
    id: "heart",
    labelAr: "إعجاب ومفضلة",
    labelEn: "Heart Favorite",
    category: "trust",
    tags: ["قلب", "مفضلة", "حب", "إعجاب", "heart", "favorite", "love", "wishlist"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
    ),
  },
  lock: {
    id: "lock",
    labelAr: "قفل وتشفير",
    labelEn: "Lock Secure",
    category: "trust",
    tags: ["قفل", "تشفير", "حماية", "lock", "secure", "privacy"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
    ),
  },
  sparkles: {
    id: "sparkles",
    labelAr: "بريق ولمعان",
    labelEn: "Sparkles",
    category: "trust",
    tags: ["بريق", "لمعان", "سحر", "جديد", "sparkles", "magic", "new"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
    ),
  },
  fire: {
    id: "fire",
    labelAr: "نار ورائج",
    labelEn: "Trending Fire",
    category: "trust",
    tags: ["نار", "رائج", "ترند", "حار", "مطلوب", "fire", "hot", "trending"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>
    ),
  },
  bolt: {
    id: "bolt",
    labelAr: "برق وسرعة",
    labelEn: "Lightning Bolt",
    category: "trust",
    tags: ["برق", "سرعة", "طاقة", "فلاش", "bolt", "flash", "lightning"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
    ),
  },

  // 3. Social & Contact
  phone: {
    id: "phone",
    labelAr: "هاتف واتصال",
    labelEn: "Phone Call",
    category: "social",
    tags: ["هاتف", "تليفون", "موبايل", "اتصال", "phone", "call", "mobile"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
    ),
  },
  whatsapp: {
    id: "whatsapp",
    labelAr: "واتساب",
    labelEn: "WhatsApp",
    category: "social",
    tags: ["واتساب", "شات", "محادثة", "whatsapp", "chat"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 10-7.39-3.89L3 21l3.96-1.57A8.96 8.96 0 0012 21zm-2.25-11.25c.375-.75.75-.75 1.125-.75h.75c.225 0 .45.15.525.375l.75 1.8c.075.15.075.375-.075.525l-.45.45c-.15.15-.15.375 0 .525.675 1.05 1.575 1.95 2.625 2.625.15.15.375.15.525 0l.45-.45c.15-.15.375-.15.525-.075l1.8.75c.225.075.375.3.375.525v.75c0 .375 0 .75-.75 1.125-1.2.6-3.45-.15-5.55-2.25s-2.85-4.35-2.25-5.55z" /></svg>
    ),
  },
  instagram: {
    id: "instagram",
    labelAr: "انستغرام",
    labelEn: "Instagram",
    category: "social",
    tags: ["انستقرام", "انستغرام", "صور", "instagram", "insta"],
    svg: (props) => (
      <svg {...p(props)}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="18" cy="6" r="1" fill="currentColor" /></svg>
    ),
  },
  facebook: {
    id: "facebook",
    labelAr: "فيسبوك",
    labelEn: "Facebook",
    category: "social",
    tags: ["فيسبوك", "فيس", "facebook", "fb"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" /></svg>
    ),
  },
  tiktok: {
    id: "tiktok",
    labelAr: "تيك توك",
    labelEn: "TikTok",
    category: "social",
    tags: ["تيك توك", "فيديو", "tiktok", "reels"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12a4 4 0 104 4V4a5 5 0 005 5v3a8 8 0 01-5-5v8a4 4 0 01-4 4z" /></svg>
    ),
  },
  youtube: {
    id: "youtube",
    labelAr: "يوتيوب",
    labelEn: "YouTube",
    category: "social",
    tags: ["يوتيوب", "فيديو", "youtube", "video"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43zM9.75 15.02l5.75-3.27-5.75-3.27v6.54z" /></svg>
    ),
  },
  twitter: {
    id: "twitter",
    labelAr: "إكس / تويتر",
    labelEn: "X / Twitter",
    category: "social",
    tags: ["تويتر", "إكس", "تغريدة", "twitter", "x"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
    ),
  },
  snapchat: {
    id: "snapchat",
    labelAr: "سناب شات",
    labelEn: "Snapchat",
    category: "social",
    tags: ["سناب", "سناب شات", "snapchat", "snap"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3a6 6 0 00-6 6c0 1.5.75 3 1.5 4.5-1.5.5-3 1.5-3 3 0 1 1 1.5 2.5 1.5.5 0 1-.2 1.5-.5.5.8 1.8 1.5 3.5 1.5s3-.7 3.5-1.5c.5.3 1 .5 1.5.5 1.5 0 2.5-.5 2.5-1.5 0-1.5-1.5-2.5-3-3 .75-1.5 1.5-3 1.5-4.5a6 6 0 00-6-6z" /></svg>
    ),
  },
  mail: {
    id: "mail",
    labelAr: "بريد إلكتروني",
    labelEn: "Email",
    category: "social",
    tags: ["بريد", "إيميل", "رسالة", "mail", "email", "letter"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
    ),
  },
  chat: {
    id: "chat",
    labelAr: "محادثة وتعليق",
    labelEn: "Chat Message",
    category: "social",
    tags: ["شات", "محادثة", "تعليق", "رسائل", "chat", "message", "comment"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
    ),
  },

  // 4. Actions & UI
  search: {
    id: "search",
    labelAr: "بحث",
    labelEn: "Search",
    category: "actions",
    tags: ["بحث", "استكشاف", "عدسة", "search", "find"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
    ),
  },
  filter: {
    id: "filter",
    labelAr: "فلترة وتصفية",
    labelEn: "Filter",
    category: "actions",
    tags: ["فلترة", "تصفية", "ترتيب", "filter", "sort"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>
    ),
  },
  refresh: {
    id: "refresh",
    labelAr: "تحديث وإعادة",
    labelEn: "Refresh",
    category: "actions",
    tags: ["تحديث", "إعادة", "تحميل", "refresh", "reload"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
    ),
  },
  share: {
    id: "share",
    labelAr: "مشاركة",
    labelEn: "Share",
    category: "actions",
    tags: ["مشاركة", "إرسال", "share"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
    ),
  },
  bookmark: {
    id: "bookmark",
    labelAr: "حفظ ومفضلة",
    labelEn: "Bookmark",
    category: "actions",
    tags: ["حفظ", "إشارة", "bookmark", "save"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
    ),
  },
  check: {
    id: "check",
    labelAr: "صح وتأكيد",
    labelEn: "Check",
    category: "actions",
    tags: ["صح", "تأكيد", "نجاح", "موافق", "check", "confirm", "success", "done"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
    ),
  },
  "check-circle": {
    id: "check-circle",
    labelAr: "دائرة صح معتمدة",
    labelEn: "Check Circle",
    category: "actions",
    tags: ["صح", "دائرة", "نجاح", "check", "circle", "approved"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  "x-mark": {
    id: "x-mark",
    labelAr: "إغلاق وحذف",
    labelEn: "Close Cross",
    category: "actions",
    tags: ["إغلاق", "حذف", "إلغاء", "close", "cancel", "x", "delete"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    ),
  },
  plus: {
    id: "plus",
    labelAr: "إضافة وزيادة",
    labelEn: "Plus Add",
    category: "actions",
    tags: ["إضافة", "جديد", "زائد", "plus", "add", "new"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
    ),
  },
  minus: {
    id: "minus",
    labelAr: "إنقاص وناقص",
    labelEn: "Minus Remove",
    category: "actions",
    tags: ["طرح", "ناقص", "إنقاص", "minus", "decrease"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
    ),
  },
  "arrow-right": {
    id: "arrow-right",
    labelAr: "سهم لليمين",
    labelEn: "Arrow Right",
    category: "ui",
    tags: ["سهم", "يمين", "تالي", "arrow", "right", "next"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
    ),
  },
  "arrow-left": {
    id: "arrow-left",
    labelAr: "سهم لليسار",
    labelEn: "Arrow Left",
    category: "ui",
    tags: ["سهم", "يسار", "سابق", "arrow", "left", "back"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
    ),
  },
  "arrow-up": {
    id: "arrow-up",
    labelAr: "سهم لأعلى",
    labelEn: "Arrow Up",
    category: "ui",
    tags: ["سهم", "أعلى", "arrow", "up"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
    ),
  },
  "arrow-down": {
    id: "arrow-down",
    labelAr: "سهم لأسفل",
    labelEn: "Arrow Down",
    category: "ui",
    tags: ["سهم", "أسفل", "arrow", "down"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
    ),
  },
  "chevron-right": {
    id: "chevron-right",
    labelAr: "مؤشر يمين",
    labelEn: "Chevron Right",
    category: "ui",
    tags: ["مؤشر", "يمين", "chevron", "right"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
    ),
  },
  "chevron-left": {
    id: "chevron-left",
    labelAr: "مؤشر يسار",
    labelEn: "Chevron Left",
    category: "ui",
    tags: ["مؤشر", "يسار", "chevron", "left"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
    ),
  },
  "chevron-down": {
    id: "chevron-down",
    labelAr: "مؤشر أسفل",
    labelEn: "Chevron Down",
    category: "ui",
    tags: ["مؤشر", "أسفل", "chevron", "down"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
    ),
  },
  "chevron-up": {
    id: "chevron-up",
    labelAr: "مؤشر أعلى",
    labelEn: "Chevron Up",
    category: "ui",
    tags: ["مؤشر", "أعلى", "chevron", "up"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
    ),
  },

  // 5. Media & General UI
  photo: {
    id: "photo",
    labelAr: "صورة",
    labelEn: "Photo Image",
    category: "ui",
    tags: ["صورة", "وسائط", "جاليري", "photo", "image", "picture"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
    ),
  },
  camera: {
    id: "camera",
    labelAr: "كاميرا وتصوير",
    labelEn: "Camera",
    category: "ui",
    tags: ["كاميرا", "تصوير", "camera"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
    ),
  },
  play: {
    id: "play",
    labelAr: "تشغيل فيديو",
    labelEn: "Play Video",
    category: "ui",
    tags: ["تشغيل", "فيديو", "play", "video"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
    ),
  },
  pause: {
    id: "pause",
    labelAr: "إيقاف مؤقت",
    labelEn: "Pause",
    category: "ui",
    tags: ["إيقاف", "مؤقت", "pause"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
    ),
  },
  eye: {
    id: "eye",
    labelAr: "مشاهدة وعرض",
    labelEn: "Eye View",
    category: "ui",
    tags: ["عين", "مشاهدة", "عرض", "رؤية", "eye", "view"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
  },
  bell: {
    id: "bell",
    labelAr: "إشعارات وتنبيهات",
    labelEn: "Bell Notification",
    category: "ui",
    tags: ["جرس", "إشعار", "تنبيه", "bell", "notification"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
    ),
  },
  clock: {
    id: "clock",
    labelAr: "ساعة ووقت",
    labelEn: "Clock Time",
    category: "ui",
    tags: ["ساعة", "وقت", "توقيت", "مؤقت", "clock", "time", "timer"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  calendar: {
    id: "calendar",
    labelAr: "تقويم وتاريخ",
    labelEn: "Calendar Date",
    category: "ui",
    tags: ["تقويم", "تاريخ", "يوم", "شهر", "calendar", "date"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
    ),
  },
  "map-pin": {
    id: "map-pin",
    labelAr: "موقع وعنوان",
    labelEn: "Map Location",
    category: "ui",
    tags: ["موقع", "عنوان", "خريطة", "مكان", "location", "map", "address", "pin"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
    ),
  },
  globe: {
    id: "globe",
    labelAr: "كرة أرضية ولغة",
    labelEn: "Globe Language",
    category: "ui",
    tags: ["لغة", "دولي", "عالمي", "globe", "language", "world"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-7.5 9h15" /></svg>
    ),
  },
  user: {
    id: "user",
    labelAr: "مستخدم وحساب",
    labelEn: "User Account",
    category: "ui",
    tags: ["مستخدم", "حساب", "بروفايل", "user", "profile", "account"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
    ),
  },
  users: {
    id: "users",
    labelAr: "مجموعة مستخدمين",
    labelEn: "Users Community",
    category: "ui",
    tags: ["مستخدمين", "فريق", "عملاء", "users", "team", "community"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
    ),
  },
  "thumbs-up": {
    id: "thumbs-up",
    labelAr: "إعجاب ممتاز",
    labelEn: "Thumbs Up",
    category: "ui",
    tags: ["إعجاب", "لايك", "ممتاز", "thumbs", "like"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.25A2.25 2.25 0 013 16.5v-6a2.25 2.25 0 012.25-2.25h1.383z" /></svg>
    ),
  },
  download: {
    id: "download",
    labelAr: "تحميل وتنزيل",
    labelEn: "Download",
    category: "actions",
    tags: ["تحميل", "تنزيل", "download", "save"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
    ),
  },
  upload: {
    id: "upload",
    labelAr: "رفع ملف",
    labelEn: "Upload",
    category: "actions",
    tags: ["رفع", "ملف", "upload"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
    ),
  },
  info: {
    id: "info",
    labelAr: "معلومات وتفاصيل",
    labelEn: "Info",
    category: "ui",
    tags: ["معلومات", "تفاصيل", "info", "help"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
    ),
  },
  help: {
    id: "help",
    labelAr: "مساعدة وسؤال",
    labelEn: "Help Question",
    category: "ui",
    tags: ["مساعدة", "سؤال", "استفسار", "help", "question", "faq"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
    ),
  },
  warning: {
    id: "warning",
    labelAr: "تحذير وتنبيه",
    labelEn: "Warning Alert",
    category: "ui",
    tags: ["تحذير", "تنبيه", "خطر", "warning", "alert"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
    ),
  },
  sun: {
    id: "sun",
    labelAr: "شمس ونهاري",
    labelEn: "Sun Light",
    category: "ui",
    tags: ["شمس", "نهاري", "فاتح", "sun", "light"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
    ),
  },
  moon: {
    id: "moon",
    labelAr: "قمر وليلي",
    labelEn: "Moon Dark",
    category: "ui",
    tags: ["قمر", "ليلي", "داكن", "moon", "dark"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
    ),
  },
  menu: {
    id: "menu",
    labelAr: "قائمة",
    labelEn: "Menu",
    category: "ui",
    tags: ["قائمة", "menu", "hamburger"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
    ),
  },
  hanger: {
    id: "hanger",
    labelAr: "ملابس وأزياء",
    labelEn: "Apparel Hanger",
    category: "commerce",
    tags: ["ملابس", "أزياء", "موضة", "شماعة", "hanger", "clothes", "fashion", "apparel"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5a2.25 2.25 0 00-2.25 2.25c0 .937.575 1.739 1.393 2.072L3.385 14.73A1.5 1.5 0 004.5 17.25h15a1.5 1.5 0 001.115-2.52l-7.758-5.908A2.247 2.247 0 0014.25 6.75 2.25 2.25 0 0012 4.5z" /></svg>
    ),
  },
  shoes: {
    id: "shoes",
    labelAr: "أحذية ورياضة",
    labelEn: "Shoes",
    category: "commerce",
    tags: ["حذاء", "أحذية", "شوز", "رياضة", "shoes", "sneakers"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l3-3h4.5l3 3h6a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H3.75A1.5 1.5 0 012.25 18v-3a1.5 1.5 0 011.5-1.5z" /></svg>
    ),
  },
  watch: {
    id: "watch",
    labelAr: "ساعة يد وإكسسوار",
    labelEn: "Watch Accessory",
    category: "commerce",
    tags: ["ساعة", "إكسسوار", "watch", "accessory"],
    svg: (props) => (
      <svg {...p(props)}><circle cx="12" cy="12" r="6" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6v3H9V3zm0 15h6v3H9v-3zm3-7v2l1.5 1.5" /></svg>
    ),
  },
  perfume: {
    id: "perfume",
    labelAr: "عطور وتجميل",
    labelEn: "Perfume Beauty",
    category: "commerce",
    tags: ["عطر", "عطور", "تجميل", "مكياج", "perfume", "beauty"],
    svg: (props) => (
      <svg {...p(props)}><rect x="6" y="8" width="12" height="13" rx="3" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M10 5h4v3h-4V5zm-1-2h6v2H9V3z" /></svg>
    ),
  },
  coffee: {
    id: "coffee",
    labelAr: "مشروبات وأغذية",
    labelEn: "Coffee Food",
    category: "commerce",
    tags: ["قهوة", "مشروبات", "كافيه", "أغذية", "coffee", "cup", "food"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-5v3m4-3v3m4-3v3" /></svg>
    ),
  },
  electronics: {
    id: "electronics",
    labelAr: "أجهزة وإلكترونيات",
    labelEn: "Electronics Device",
    category: "commerce",
    tags: ["إلكترونيات", "أجهزة", "موبايل", "electronics", "device", "laptop"],
    svg: (props) => (
      <svg {...p(props)}><rect x="3" y="4" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 18h20m-14 0l-1 3m9-3l1 3" /></svg>
    ),
  },
  furniture: {
    id: "furniture",
    labelAr: "أثاث ومنزل",
    labelEn: "Furniture Home",
    category: "commerce",
    tags: ["أثاث", "منزل", "ديكور", "furniture", "home"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M4 18v3m16-3v3M3 11a2 2 0 012-2h14a2 2 0 012 2v7H3v-7zm1 0V7a3 3 0 013-3h10a3 3 0 013 3v4" /></svg>
    ),
  },
  support: {
    id: "support",
    labelAr: "خدمة العملاء",
    labelEn: "Customer Support",
    category: "trust",
    tags: ["دعم", "خدمة عملاء", "سماعة", "support", "headset"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 00-9 9v4a3 3 0 003 3h1a1 1 0 001-1v-4a1 1 0 00-1-1H4.07A7.002 7.002 0 0112 5a7.002 7.002 0 017.93 8H17a1 1 0 00-1 1v4a1 1 0 001 1h1a3 3 0 003-3v-4a9 9 0 00-9-9z" /></svg>
    ),
  },
  award: {
    id: "award",
    labelAr: "وسام التميز",
    labelEn: "Award Winner",
    category: "trust",
    tags: ["وسام", "جائزة", "كأس", "تميز", "award", "trophy", "winner"],
    svg: (props) => (
      <svg {...p(props)}><circle cx="12" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
    ),
  },
  target: {
    id: "target",
    labelAr: "هدف ودقة",
    labelEn: "Target Accuracy",
    category: "trust",
    tags: ["هدف", "دقة", "target", "goal"],
    svg: (props) => (
      <svg {...p(props)}><circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
    ),
  },
  crown: {
    id: "crown",
    labelAr: "تاج وفخامة",
    labelEn: "Crown Luxury",
    category: "trust",
    tags: ["تاج", "ملك", "فخامة", "بريميوم", "crown", "vip", "luxury"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18l-2-11-5 5-2-7-2 7-5-5-2 11z" /></svg>
    ),
  },
  diamond: {
    id: "diamond",
    labelAr: "ألماس وأصالة",
    labelEn: "Diamond Gem",
    category: "trust",
    tags: ["ألماس", "جوهرة", "أصيل", "diamond", "gem", "luxury"],
    svg: (props) => (
      <svg {...p(props)}><path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l4 6-10 12L2 9l4-6zm-4 6h20M12 21L7.5 9m4.5 12l4.5-12M6 3l1.5 6m10.5-6l-1.5 6" /></svg>
    ),
  },
};

export const STOREFRONT_ICON_LIST = Object.values(STOREFRONT_ICONS);

export interface StudioIconPickerProps {
  selectedIcon?: string;
  onSelectIcon: (iconId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const StudioIconPicker: React.FC<StudioIconPickerProps> = ({
  selectedIcon,
  onSelectIcon,
  isOpen = true,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "الكل" },
    { id: "commerce", label: "تجارة ومبيعات" },
    { id: "trust", label: "ثقة وضمان" },
    { id: "social", label: "تواصل اجتماعي" },
    { id: "actions", label: "إجراءات" },
    { id: "ui", label: "واجهة عامة" },
  ];

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STOREFRONT_ICON_LIST.filter((icon) => {
      const matchesCategory =
        selectedCategory === "all" || icon.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const inId = icon.id.toLowerCase().includes(q);
      const inAr = icon.labelAr.toLowerCase().includes(q);
      const inEn = icon.labelEn.toLowerCase().includes(q);
      const inTags = icon.tags.some((t) => t.toLowerCase().includes(q));

      return inId || inAr || inEn || inTags;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="studio-icon-picker"
      className="flex flex-col h-full w-full bg-[#17181c] text-[#e8eaee] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#202226] p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">مكتبة الأيقونات</span>
          <span className="text-xs rounded-full bg-[#202226] px-2 py-0.5 text-[#9ba0a8]">
            {filteredIcons.length}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#9ba0a8] hover:bg-[#202226] hover:text-white"
            aria-label="إغلاق"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#202226]">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
          <input
            type="text"
            data-testid="studio-icon-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الوسم (عربي / English)..."
            className="w-full rounded-lg border border-[#26282e] bg-[#0c0d0f] py-1.5 ps-9 pe-3 text-xs text-white placeholder-[#64748b] focus:border-[#2b6cf6] focus:outline-none"
          />
        </div>

        {/* Categories Bar */}
        <div className="mt-2.5 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-md px-2 py-1 text-[11px] transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#2b6cf6] text-white font-medium"
                  : "bg-[#202226] text-[#9ba0a8] hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Icons Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredIcons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-xs text-[#64748b]">
            <p>لا توجد أيقونة تطابق البحث "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {filteredIcons.map((icon) => {
              const isSelected = selectedIcon === icon.id;
              const SvgIcon = icon.svg;
              return (
                <button
                  key={icon.id}
                  type="button"
                  data-testid={`icon-item-${icon.id}`}
                  onClick={() => onSelectIcon(icon.id)}
                  title={`${icon.labelAr} (${icon.labelEn})`}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all ${
                    isSelected
                      ? "border-[#2b6cf6] bg-[#2b6cf6]/15 text-[#2b6cf6] ring-1 ring-[#2b6cf6]"
                      : "border-[#202226] bg-[#0c0d0f] text-[#9ba0a8] hover:border-[#383b42] hover:text-white hover:bg-[#1a1c22]"
                  }`}
                >
                  <SvgIcon className="w-5 h-5 shrink-0" />
                  <span className="text-[10px] truncate max-w-full text-center">
                    {icon.labelAr}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioIconPicker;

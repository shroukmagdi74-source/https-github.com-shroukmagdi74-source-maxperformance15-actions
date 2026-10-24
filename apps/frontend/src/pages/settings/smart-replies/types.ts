export type SmartReplyChannel =
  | "WHATSAPP"
  | "FACEBOOK"
  | "INSTAGRAM"
  | "TIKTOK"
  | "TELEGRAM_USER"
  | "TELEGRAM_BOT";

export interface AutoReplyTemplate {
  id: string;
  name: string;
  type: "greeting" | "thanks" | "confirmation" | "farewell" | "custom";
  channels?: SmartReplyChannel[];
  keywords: string[];
  responses: string[];
  isDefault?: boolean;
}

export interface SmartRepliesSettingsData {
  enabled: boolean;
  channels: SmartReplyChannel[];
  templates: AutoReplyTemplate[];
}

export interface ChannelConfig {
  id: SmartReplyChannel;
  label: string;
  shortLabel: string;
  activeClass: string;
  inactiveClass: string;
  badgeClass: string;
}

export const DEFAULT_CHANNELS: SmartReplyChannel[] = [
  "WHATSAPP",
  "FACEBOOK",
  "INSTAGRAM",
];

export const ALL_CHANNELS: ChannelConfig[] = [
  {
    id: "WHATSAPP",
    label: "واتساب (WhatsApp)",
    shortLabel: "واتساب",
    activeClass:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700 shadow-xs",
    inactiveClass:
      "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-750",
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80",
  },
  {
    id: "FACEBOOK",
    label: "فيسبوك ماسنجر (Messenger)",
    shortLabel: "ماسنجر",
    activeClass:
      "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700 shadow-xs",
    inactiveClass:
      "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-750",
    badgeClass:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80",
  },
  {
    id: "INSTAGRAM",
    label: "إنستغرام (Instagram)",
    shortLabel: "إنستغرام",
    activeClass:
      "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 dark:border-fuchsia-700 shadow-xs",
    inactiveClass:
      "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-750",
    badgeClass:
      "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 border-fuchsia-200/80 dark:border-fuchsia-800/80",
  },
  {
    id: "TIKTOK",
    label: "تيك توك (TikTok)",
    shortLabel: "تيك توك",
    activeClass:
      "bg-neutral-900 text-white border-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300 shadow-xs",
    inactiveClass:
      "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-750",
    badgeClass:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700",
  },
  {
    id: "TELEGRAM_USER",
    label: "تلجرام - حساب شخصي (User)",
    shortLabel: "تلجرام يوزر",
    activeClass:
      "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-700 shadow-xs",
    inactiveClass:
      "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-750",
    badgeClass:
      "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80",
  },
  {
    id: "TELEGRAM_BOT",
    label: "تلجرام - بوت (Bot)",
    shortLabel: "تلجرام بوت",
    activeClass:
      "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-700 shadow-xs",
    inactiveClass:
      "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-750",
    badgeClass:
      "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/80",
  },
];

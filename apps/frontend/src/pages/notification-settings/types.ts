import type {
  NotificationChannelId,
  NotificationSettingsData,
  NotificationTypePreference,
} from "@/utils/notificationSettings";

export interface NotificationType {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  defaultEnabled: boolean;
  channels: NotificationChannelId[];
  canDisable: boolean;
}

export interface NotificationStats {
  delivered: {
    total: number;
    byChannel: Record<string, number>;
  };
  engagement: {
    openRate: number;
    clickRate: number;
    responseTime: number;
  };
  preferences: {
    mostUsedChannel: string;
    quietHoursActive: boolean;
  };
  trends: Array<{
    period: string;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
}

export type SettingsTab = "general" | "types" | "stats";

export type FeedbackState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

export const buildDefaultTypePreference = (
  type: NotificationType,
): NotificationTypePreference => ({
  enabled: type.defaultEnabled,
  channels: [...type.channels],
  priority: type.priority,
  customSound: null,
});

export const createNormalizedSettings = ({
  rawSettings,
  notificationTypes,
  userId,
  companyId,
  email,
  timezone,
}: {
  rawSettings?: Partial<NotificationSettingsData> | null;
  notificationTypes: NotificationType[];
  userId: string;
  companyId: string;
  email: string;
  timezone?: string;
}): NotificationSettingsData => {
  const baseTypeSettings = notificationTypes.reduce<
    Record<string, NotificationTypePreference>
  >((acc, type) => {
    const existing = rawSettings?.typeSettings?.[type.id];
    const defaults = buildDefaultTypePreference(type);

    const mergedChannels = Array.isArray(existing?.channels)
      ? existing.channels.filter((channel) => type.channels.includes(channel))
      : defaults.channels;

    acc[type.id] = {
      ...defaults,
      ...existing,
      channels: mergedChannels.length > 0 ? mergedChannels : defaults.channels,
    };
    return acc;
  }, {});

  return {
    userId: String(rawSettings?.userId || userId),
    companyId: String(rawSettings?.companyId || companyId || "1"),
    globalEnabled: rawSettings?.globalEnabled ?? true,
    quietHours: {
      enabled: rawSettings?.quietHours?.enabled ?? false,
      startTime: rawSettings?.quietHours?.startTime || "22:00",
      endTime: rawSettings?.quietHours?.endTime || "08:00",
      timezone:
        rawSettings?.quietHours?.timezone || timezone || "Africa/Cairo",
    },
    channels: {
      push: {
        enabled: rawSettings?.channels?.push?.enabled ?? true,
        sound: rawSettings?.channels?.push?.sound ?? true,
        vibration: rawSettings?.channels?.push?.vibration ?? true,
        badge: rawSettings?.channels?.push?.badge ?? true,
      },
      email: {
        enabled: rawSettings?.channels?.email?.enabled ?? true,
        address: rawSettings?.channels?.email?.address || email,
        frequency: rawSettings?.channels?.email?.frequency || "immediate",
        format: rawSettings?.channels?.email?.format || "html",
      },
      sms: {
        enabled: rawSettings?.channels?.sms?.enabled ?? false,
        phoneNumber: rawSettings?.channels?.sms?.phoneNumber || "",
        frequency: rawSettings?.channels?.sms?.frequency || "immediate",
      },
      inApp: {
        enabled: rawSettings?.channels?.inApp?.enabled ?? true,
        showBadge: rawSettings?.channels?.inApp?.showBadge ?? true,
        autoMarkRead: rawSettings?.channels?.inApp?.autoMarkRead ?? false,
      },
      browser: {
        enabled: rawSettings?.channels?.browser?.enabled ?? false,
        showPreview: rawSettings?.channels?.browser?.showPreview ?? true,
        requireInteraction:
          rawSettings?.channels?.browser?.requireInteraction ?? false,
      },
      sound: {
        enabled: rawSettings?.channels?.sound?.enabled ?? true,
        volume:
          typeof rawSettings?.channels?.sound?.volume === "number"
            ? rawSettings.channels.sound.volume
            : 100,
        pattern: rawSettings?.channels?.sound?.pattern || "cash",
      },
      incompleteSound: {
        enabled: rawSettings?.channels?.incompleteSound?.enabled ?? true,
        volume:
          typeof rawSettings?.channels?.incompleteSound?.volume === "number"
            ? rawSettings.channels.incompleteSound.volume
            : 100,
        pattern: rawSettings?.channels?.incompleteSound?.pattern || "coins",
      },
    },
    typeSettings: baseTypeSettings,
  };
};

export const cloneSettings = (settings: NotificationSettingsData): NotificationSettingsData =>
  JSON.parse(JSON.stringify(settings)) as NotificationSettingsData;

export const getChannelName = (channel: NotificationChannelId | string): string => {
  const names: Record<string, string> = {
    push: "الإشعارات المنبثقة",
    email: "البريد الإلكتروني",
    sms: "الرسائل النصية",
    inApp: "داخل التطبيق",
    browser: "إشعار المتصفح",
  };

  return names[channel] || channel;
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "text-red-700 bg-red-50 border-red-100";
    case "medium":
      return "text-amber-700 bg-amber-50 border-amber-100";
    case "low":
      return "text-green-700 bg-green-50 border-green-100";
    default:
      return "text-gray-700 bg-gray-50 border-gray-100";
  }
};

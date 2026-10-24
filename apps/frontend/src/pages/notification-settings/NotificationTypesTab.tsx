import React from "react";
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  type NotificationChannelId,
  type NotificationSettingsData,
  type NotificationTypePreference,
} from "@/utils/notificationSettings";
import {
  type NotificationType,
  getChannelName,
  getPriorityColor,
} from "./types";
import { ToggleSwitch } from "./ToggleSwitch";

interface NotificationTypesTabProps {
  notificationTypes: NotificationType[];
  settings: NotificationSettingsData;
  browserPermission: string;
  getTypePreference: (type: NotificationType) => NotificationTypePreference;
  onToggleTypeEnabled: (type: NotificationType, enabled: boolean) => void;
  onToggleTypeChannel: (
    type: NotificationType,
    channel: NotificationChannelId,
    checked: boolean,
  ) => void;
  onTestNotification: (type: NotificationType) => void;
}

export const getNotificationChannelIcon = (channel: NotificationChannelId) => {
  switch (channel) {
    case "push":
      return <DevicePhoneMobileIcon className="h-5 w-5" />;
    case "email":
      return <EnvelopeIcon className="h-5 w-5" />;
    case "sms":
      return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
    case "browser":
      return <ComputerDesktopIcon className="h-5 w-5" />;
    case "inApp":
    default:
      return <BellIcon className="h-5 w-5" />;
  }
};

export const NotificationTypesTab: React.FC<NotificationTypesTabProps> = ({
  notificationTypes,
  settings,
  browserPermission,
  getTypePreference,
  onToggleTypeEnabled,
  onToggleTypeChannel,
  onTestNotification,
}) => {
  return (
    <div className="space-y-4">
      {notificationTypes.map((type) => {
        const typePreference = getTypePreference(type);
        const channelsVisible = typePreference.enabled || !type.canDisable;

        return (
          <div
            key={type.id}
            className="rounded-2xl border bg-white p-6 shadow-2xs border-border/60 dark:bg-gray-800"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {type.name}
                  </h3>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityColor(
                      type.priority,
                    )}`}
                  >
                    {type.priority === "high"
                      ? "عالية"
                      : type.priority === "medium"
                        ? "متوسطة"
                        : "منخفضة"}
                  </span>
                  {!type.canDisable ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                      أساسي
                    </span>
                  ) : null}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {type.description}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start">
                <button
                  type="button"
                  onClick={() => onTestNotification(type)}
                  className="rounded-lg border border-blue-200 p-2 text-blue-600 transition hover:bg-blue-50"
                  title="اختبار الإشعار"
                >
                  <PlayIcon className="h-5 w-5" />
                </button>
                <ToggleSwitch
                  checked={typePreference.enabled}
                  disabled={!type.canDisable}
                  label={`تفعيل ${type.name}`}
                  onChange={(checked) => onToggleTypeEnabled(type, checked)}
                />
              </div>
            </div>

            {channelsVisible ? (
              <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      القنوات المفعلة
                    </span>
                    {type.channels.includes("browser") ? (
                      <span className="text-xs text-blue-600 dark:text-blue-300">
                        {!settings.channels.browser.enabled
                          ? "فعّل إشعار المتصفح من الإعدادات العامة أولًا"
                          : browserPermission !== "granted"
                            ? "اسمح بإذن المتصفح أولًا ليعمل إشعار المتصفح هنا"
                            : "يمكنك تشغيل إشعار المتصفح لهذا النوع تحديدًا"}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {type.channels.map((channel) => {
                      const checked = typePreference.channels.includes(channel);
                      const browserGloballyEnabled =
                        settings.channels.browser.enabled;
                      const isBrowserOption =
                        channel === "browser" &&
                        browserPermission !== "granted";
                      const displayChecked =
                        channel === "browser" && !browserGloballyEnabled
                          ? false
                          : checked;

                      return (
                        <label
                          key={channel}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                            displayChecked
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-700"
                          } ${isBrowserOption ? "opacity-80" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={displayChecked}
                            aria-label={`${getChannelName(channel)} لـ ${type.name}`}
                            onChange={(event) =>
                              onToggleTypeChannel(
                                type,
                                channel,
                                event.target.checked,
                              )
                            }
                            disabled={channel === "browser" && !browserGloballyEnabled}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="flex items-center gap-2">
                            {getNotificationChannelIcon(channel)}
                            <span>{getChannelName(channel)}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

import React from "react";
import {
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { showBrowserNotification } from "@/utils/browserNotifications";
import { type NotificationSettingsData } from "@/utils/notificationSettings";
import { ToggleSwitch } from "./ToggleSwitch";

interface NotificationGeneralTabProps {
  settings: NotificationSettingsData;
  updateSettings: (path: string, value: unknown) => void;
  browserPermission: string;
  browserPermissionLabel: { label: string; className: string };
  browserNotificationStatusLabel: { label: string; className: string };
  browserPermissionAction: { label: string; helper: string } | null;
  onBrowserChannelToggle: (enabled: boolean) => void;
  onRequestBrowserPermission: () => void;
  onShowFeedback: (feedback: { type: "success" | "error" | "info"; message: string }) => void;
}

export const NotificationGeneralTab: React.FC<NotificationGeneralTabProps> = ({
  settings,
  updateSettings,
  browserPermission,
  browserPermissionLabel,
  browserNotificationStatusLabel,
  browserPermissionAction,
  onBrowserChannelToggle,
  onRequestBrowserPermission,
  onShowFeedback,
}) => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-2xs border border-border/60 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          الإعدادات العامة
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                تفعيل الإشعارات
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                إيقاف أو تشغيل كل الإشعارات دفعة واحدة.
              </p>
            </div>
            <ToggleSwitch
              checked={settings.globalEnabled}
              label="تفعيل الإشعارات"
              onChange={(checked) => updateSettings("globalEnabled", checked)}
            />
          </div>

          <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  ساعات الهدوء
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  منع التنبيهات في أوقات معينة.
                </p>
              </div>
              <ToggleSwitch
                checked={settings.quietHours.enabled}
                label="تفعيل ساعات الهدوء"
                onChange={(checked) =>
                  updateSettings("quietHours.enabled", checked)
                }
              />
            </div>

            {settings.quietHours.enabled ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    من الساعة
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.startTime}
                    onChange={(event) =>
                      updateSettings("quietHours.startTime", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    إلى الساعة
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.endTime}
                    onChange={(event) =>
                      updateSettings("quietHours.endTime", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    المنطقة الزمنية
                  </label>
                  <input
                    type="text"
                    value={settings.quietHours.timezone}
                    onChange={(event) =>
                      updateSettings("quietHours.timezone", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-2xs border border-border/60 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          قنوات الإشعارات
        </h2>

        <div className="space-y-4">
          {/* Push Notifications Card */}
          <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start">
                <DevicePhoneMobileIcon className="ml-3 h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    الإشعارات المنبثقة
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    تنبيه سريع داخل الواجهة الحالية.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.channels.push.enabled}
                label="تفعيل الإشعارات المنبثقة"
                onChange={(checked) =>
                  updateSettings("channels.push.enabled", checked)
                }
              />
            </div>

            {settings.channels.push.enabled ? (
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                {[
                  {
                    label: "الصوت",
                    path: "channels.push.sound",
                    value: settings.channels.push.sound,
                  },
                  {
                    label: "الاهتزاز",
                    path: "channels.push.vibration",
                    value: settings.channels.push.vibration,
                  },
                  {
                    label: "شارة العدد",
                    path: "channels.push.badge",
                    value: settings.channels.push.badge,
                  },
                ].map((option) => (
                  <div
                    key={option.path}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                    <ToggleSwitch
                      checked={option.value}
                      label={option.label}
                      onChange={(checked) =>
                        updateSettings(option.path, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Browser Notifications Card */}
          <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start">
                <ComputerDesktopIcon className="ml-3 h-6 w-6 text-indigo-600" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      إشعار المتصفح
                    </h3>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${browserPermissionLabel.className}`}
                    >
                      {browserPermissionLabel.label}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${browserNotificationStatusLabel.className}`}
                    >
                      {browserNotificationStatusLabel.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    تنبيهات فورية تظهر في نظام التشغيل عند ورود طلبات أو رسائل جديدة للمنشأة.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.channels.browser.enabled}
                label="تفعيل إشعارات المتصفح"
                onChange={onBrowserChannelToggle}
              />
            </div>

            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div
                  className={`flex items-start gap-2 text-sm ${
                    browserPermission === "denied"
                      ? "text-red-600 dark:text-red-300"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <InformationCircleIcon
                    className={`mt-0.5 h-5 w-5 ${
                      browserPermission === "denied"
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  />
                  <span>
                    {browserPermissionAction?.helper ||
                      "إشعارات المتصفح مفعلة وجاهزة للمزامنة."}
                  </span>
                </div>
                {browserPermissionAction ? (
                  <button
                    type="button"
                    onClick={onRequestBrowserPermission}
                    className="inline-flex items-center rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                  >
                    {browserPermissionAction.label}
                  </button>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  إبقاء الإشعار ظاهرًا حتى يتم إغلاقه
                </span>
                <ToggleSwitch
                  checked={settings.channels.browser.requireInteraction}
                  label="إبقاء إشعار المتصفح ظاهرًا"
                  onChange={(checked) =>
                    updateSettings(
                      "channels.browser.requireInteraction",
                      checked,
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  عرض معاينة مختصرة داخل التنبيه
                </span>
                <ToggleSwitch
                  checked={settings.channels.browser.showPreview}
                  label="عرض معاينة إشعار المتصفح"
                  onChange={(checked) =>
                    updateSettings("channels.browser.showPreview", checked)
                  }
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-700 dark:bg-slate-900/40">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    تجربة إشعار المتصفح
                  </h4>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    اختبار فوري لظهور إشعار سطح المكتب والنظام على هذا الجهاز.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const shown = showBrowserNotification({
                      title: "تجربة إشعار المتصفح - منصة ماكس بي",
                      body: "هذا إشعار تجريبي للتأكد من وصول التنبيهات المباشرة إلى جهازك بنجاح.",
                      tag: "browser-test-instant",
                      requireInteraction: settings.channels.browser.requireInteraction,
                    });
                    if (shown) {
                      onShowFeedback({
                        type: "success",
                        message: "تم إظهار الإشعار التجريبي بنجاح.",
                      });
                    } else {
                      onShowFeedback({
                        type: "info",
                        message:
                          browserPermission === "denied"
                            ? "الإشعارات محظورة في متصفحك. اسمح بها من شريط العنوان."
                            : "اضغط على زر 'طلب إذن المتصفح' أولاً للسماح بالإشعارات.",
                      });
                    }
                  }}
                  className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  <PlayIcon className="ml-1.5 h-3.5 w-3.5 text-primary" />
                  إرسال إشعار تجريبي الآن
                </button>
              </div>
            </div>
          </div>

          {/* Email Card */}
          <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start">
                <EnvelopeIcon className="ml-3 h-6 w-6 text-green-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    البريد الإلكتروني
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ملخصات أو تنبيهات فورية عبر البريد.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.channels.email.enabled}
                label="تفعيل البريد الإلكتروني"
                onChange={(checked) =>
                  updateSettings("channels.email.enabled", checked)
                }
              />
            </div>

            {settings.channels.email.enabled ? (
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 dark:border-gray-700">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    عنوان البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={settings.channels.email.address}
                    onChange={(event) =>
                      updateSettings("channels.email.address", event.target.value)
                    }
                    placeholder="example@domain.com"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    تكرار الإرسال
                  </label>
                  <select
                    value={settings.channels.email.frequency}
                    onChange={(event) =>
                      updateSettings("channels.email.frequency", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="immediate">فوري</option>
                    <option value="hourly">كل ساعة</option>
                    <option value="daily">يومي</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    تنسيق الرسالة
                  </label>
                  <select
                    value={settings.channels.email.format}
                    onChange={(event) =>
                      updateSettings("channels.email.format", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="html">HTML</option>
                    <option value="text">Text</option>
                  </select>
                </div>
              </div>
            ) : null}
          </div>

          {/* SMS Card */}
          <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start">
                <ChatBubbleLeftRightIcon className="ml-3 h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    الرسائل النصية
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    تنبيه مختصر على الجوال للحالات المهمة.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.channels.sms.enabled}
                label="تفعيل الرسائل النصية"
                onChange={(checked) =>
                  updateSettings("channels.sms.enabled", checked)
                }
              />
            </div>

            {settings.channels.sms.enabled ? (
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 dark:border-gray-700">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={settings.channels.sms.phoneNumber}
                    onChange={(event) =>
                      updateSettings(
                        "channels.sms.phoneNumber",
                        event.target.value,
                      )
                    }
                    placeholder="+966501234567"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    تكرار الإرسال
                  </label>
                  <select
                    value={settings.channels.sms.frequency}
                    onChange={(event) =>
                      updateSettings(
                        "channels.sms.frequency",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="immediate">فوري</option>
                    <option value="hourly">كل ساعة</option>
                    <option value="daily">يومي</option>
                  </select>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

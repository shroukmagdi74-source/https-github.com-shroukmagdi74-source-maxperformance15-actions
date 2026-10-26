import React from "react";
import {
  Settings as Cog6ToothIcon,
  Palette as SwatchIcon,
  ShieldCheck as ShieldCheckIcon,
  Zap as BoltIcon,
  CheckCircle2 as CheckCircleIcon,
  Trophy as TrophyIcon,
} from "lucide-react";
import { SettingsData, TaskDetailsVisibility } from "./types";

interface DevTaskVisibilityTabProps {
  settings: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData | null>>;
}

const VISIBILITY_FIELDS = [
  {
    key: "showDescription" as const,
    label: "إظهار الوصف",
    icon: Cog6ToothIcon,
  },
  {
    key: "showRelatedLinks" as const,
    label: "إظهار الروابط المتعلقة",
    icon: SwatchIcon,
  },
  {
    key: "showChecklists" as const,
    label: "إظهار قوائم التحقق",
    icon: CheckCircleIcon,
  },
  {
    key: "showBusinessValue" as const,
    label: "إظهار قيمة العمل",
    icon: TrophyIcon,
  },
  {
    key: "showAcceptanceCriteria" as const,
    label: "إظهار معايير القبول",
    icon: ShieldCheckIcon,
  },
  {
    key: "showAttachments" as const,
    label: "إظهار المرفقات (الصور)",
    icon: BoltIcon,
  },
  {
    key: "showCreatedAt" as const,
    label: "إظهار تاريخ الإنشاء",
    icon: Cog6ToothIcon,
  },
];

export const DevTaskVisibilityTab: React.FC<DevTaskVisibilityTabProps> = ({
  settings,
  setSettings,
}) => {
  const currentVisibility = settings.taskDetailsVisibility || {
    showDescription: true,
    showRelatedLinks: true,
    showChecklists: true,
    showBusinessValue: true,
    showAcceptanceCriteria: true,
    showAttachments: true,
    showCreatedAt: true,
  };

  const handleToggle = (key: keyof TaskDetailsVisibility, checked: boolean) => {
    setSettings({
      ...settings,
      taskDetailsVisibility: {
        ...currentVisibility,
        [key]: checked,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          إعدادات رؤية تفاصيل المهمة
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          تحكم في العناصر التي تظهر في صفحة تفاصيل المهمة للمطورين.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VISIBILITY_FIELDS.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-600 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <Icon className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <span className="block font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {label}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={currentVisibility[key] ?? true}
                onChange={(e) => handleToggle(key, e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

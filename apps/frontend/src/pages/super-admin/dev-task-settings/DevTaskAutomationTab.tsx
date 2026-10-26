import React, { useRef } from "react";
import { Trash2 as TrashIcon } from "lucide-react";
import { SettingsData, DevTeamMember } from "./types";
import { DevTaskEscalationRules } from "./DevTaskEscalationRules";

interface DevTaskAutomationTabProps {
  settings: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData | null>>;
  teamMembers: DevTeamMember[];
}

export const DevTaskAutomationTab: React.FC<DevTaskAutomationTabProps> = ({
  settings,
  setSettings,
  teamMembers,
}) => {
  const newComponentNameRef = useRef<HTMLInputElement>(null);
  const newComponentOwnerRef = useRef<HTMLSelectElement>(null);

  const handleAddComponentMapping = () => {
    const nameEl = newComponentNameRef.current;
    const ownerEl = newComponentOwnerRef.current;
    if (nameEl?.value && ownerEl?.value) {
      setSettings({
        ...settings,
        componentMappings: {
          ...settings.componentMappings,
          [nameEl.value]: ownerEl.value,
        },
      });
      nameEl.value = "";
      ownerEl.value = "";
    }
  };

  const handleRemoveComponentMapping = (comp: string) => {
    const newMap = { ...settings.componentMappings };
    delete newMap[comp];
    setSettings({
      ...settings,
      componentMappings: newMap,
    });
  };

  return (
    <div className="space-y-8">
      {/* Component Mappings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          أقسام العمل والمسؤولين
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          قم بتعريف الأقسام (مثل: Frontend, Mobile) وتعيين مسؤول لكل قسم. <br />
          عند اختيار القسم في المهمة، سيتم تعيين المسؤول تلقائياً.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            id="new-component-name"
            name="newComponentName"
            aria-label="اسم القسم الجديد"
            ref={newComponentNameRef}
            placeholder="اسم القسم (مثال: Mobile App)"
            className="border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 text-sm"
          />
          <div className="flex gap-2">
            <select
              id="new-component-owner"
              name="newComponentOwner"
              aria-label="المسؤول عن القسم الجديد"
              ref={newComponentOwnerRef}
              className="border rounded px-3 py-2 flex-1 dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="">اختر المسؤول...</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddComponentMapping}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium transition-colors"
            >
              إضافة
            </button>
          </div>
        </div>

        <ul className="space-y-2">
          {Object.entries(settings.componentMappings).map(([comp, memberId]) => {
            const member = teamMembers.find((m) => m.id === memberId);
            return (
              <li
                key={comp}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-100 dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {comp}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm">
                    {member ? member.name : "Unknown Member"}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveComponentMapping(comp)}
                  className="text-red-500 hover:text-red-700 p-1 rounded"
                  aria-label={`حذف قسم ${comp}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Auto-Creation Setting */}
      <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          التشغيل الآلي للمهام
        </h3>

        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.autoTestingSubtask || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoTestingSubtask: e.target.checked,
                  })
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </div>
            <div>
              <span className="block font-medium text-gray-900 dark:text-gray-100">
                إنشاء مهمة اختبار تلقائياً عند الاكتمال
              </span>
              <span className="block text-sm text-gray-500 mt-1">
                عند تحويل حالة أي مهمة إلى "DONE" (مكتمل)، سيقوم النظام
                تلقائياً بإنشاء مهمة فرعية جديدة من نوع "TESTING" للمراجعة.
              </span>
            </div>
          </label>

          {/* Assignee Selector */}
          {settings.autoTestingSubtask && (
            <div className="mt-4 mr-14">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                تعيين تلقائي إلى:
              </label>
              <select
                id="auto-testing-assignee"
                name="autoTestingAssignee"
                aria-label="تعيين مهمة الاختبار التلقائي"
                value={settings.autoTestingAssigneeId || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoTestingAssigneeId: e.target.value || null,
                  })
                }
                className="border rounded px-3 py-2 text-sm w-full max-w-sm dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">(بدون تعيين محدد)</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                سيتم إسناد المهمة الفرعية لهذا الشخص تلقائياً.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Escalation Rules Subcomponent */}
      <DevTaskEscalationRules
        settings={settings}
        setSettings={setSettings}
        teamMembers={teamMembers}
      />
    </div>
  );
};

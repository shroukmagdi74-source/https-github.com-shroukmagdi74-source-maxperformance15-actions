import React from "react";
import {
  SettingsData,
  DevTeamMember,
  PermissionRule,
  TENANT_EXCLUDED_ROLES,
} from "./types";

interface DevTaskPermissionsTabProps {
  settings: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData | null>>;
  teamMembers: DevTeamMember[];
}

export const DevTaskPermissionsTab: React.FC<DevTaskPermissionsTabProps> = ({
  settings,
  setSettings,
  teamMembers,
}) => {
  // Get roles from settings permissions (the source of truth)
  const rolesFromSettings = settings?.permissions
    ? Object.keys(settings.permissions)
    : [];
  // Also include any roles from current team members that aren't in settings
  const teamRoles = teamMembers.map((m) => m.role).filter(Boolean);

  const allRoles = Array.from(new Set([...rolesFromSettings, ...teamRoles]))
    .filter((role) => !TENANT_EXCLUDED_ROLES.includes(role))
    .sort();

  const handlePermissionChange = (
    role: string,
    key: keyof PermissionRule,
    value: boolean | string,
  ) => {
    const currentPerm = settings.permissions[role] || {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canChangeStatus: false,
      canComment: true,
      canAssign: false,
      canArchive: false,
      canViewReports: false,
      canManageProjects: false,
      canExport: false,
      canAccessSettings: false,
      canManageTaskSettings: false,
      canViewAll: false,
      viewScope: "assigned_only",
    };

    const newPerms = {
      ...settings.permissions,
      [role]: {
        ...currentPerm,
        [key]: value,
      },
    };

    setSettings({
      ...settings,
      permissions: newPerms,
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        صلاحيات الأدوار
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        حدد ما يمكن لكل دور القيام به في نظام المهام.
      </p>

      <div className="space-y-6">
        {allRoles.map((role) => {
          const perm: PermissionRule = settings.permissions[role] || {
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canChangeStatus: false,
            canComment: true,
            canAssign: false,
            canArchive: false,
            canViewReports: false,
            canManageProjects: false,
            canExport: false,
            canAccessSettings: false,
            canManageTaskSettings: false,
            canViewAll: false,
            viewScope: "assigned_only",
          };

          return (
            <div
              key={role}
              className="border rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
            >
              <h4 className="font-bold text-indigo-600 mb-3 capitalize text-lg">
                {role}
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Actions */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    صلاحيات المهام
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "canCreate" as const, label: "إنشاء مهام" },
                      { key: "canEdit" as const, label: "تعديل مهام" },
                      { key: "canDelete" as const, label: "حذف مهام" },
                      { key: "canChangeStatus" as const, label: "تغيير الحالة" },
                      { key: "canComment" as const, label: "إضافة تعليق" },
                      { key: "canAssign" as const, label: "تعيين مسؤولين" },
                      { key: "canArchive" as const, label: "أرشفة المهام" },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(perm[key])}
                          onChange={(e) =>
                            handlePermissionChange(role, key, e.target.checked)
                          }
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Project & Reports */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    المشاريع والتقارير
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "canViewReports" as const, label: "عرض التقارير" },
                      {
                        key: "canManageProjects" as const,
                        label: "إدارة المشاريع",
                      },
                      { key: "canExport" as const, label: "تصدير البيانات" },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(perm[key])}
                          onChange={(e) =>
                            handlePermissionChange(role, key, e.target.checked)
                          }
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Settings Access */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    الوصول للإعدادات والمستخدمين
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        key: "canAccessSettings" as const,
                        label: "الوصول للإعدادات",
                      },
                      {
                        key: "canManageTaskSettings" as const,
                        label: "إدارة إعدادات المهام",
                      },
                      {
                        key: "canViewAll" as const,
                        label: "عرض جميع المستخدمين",
                      },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(perm[key])}
                          onChange={(e) =>
                            handlePermissionChange(role, key, e.target.checked)
                          }
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Scope */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    نطاق الرؤية
                  </p>
                  <select
                    id={`permission-view-scope-${role}`}
                    name={`permissionViewScope-${role}`}
                    aria-label={`نطاق الرؤية للدور ${role}`}
                    value={perm.viewScope}
                    onChange={(e) =>
                      handlePermissionChange(
                        role,
                        "viewScope",
                        e.target.value as PermissionRule["viewScope"],
                      )
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">
                      الكل (جميع المشاريع والمهام)
                    </option>
                    <option value="project">نفس المشروع فقط</option>
                    <option value="assigned_only">
                      مهامي فقط (المسندة لي)
                    </option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    يحدد هذا الخيار المهام التي يمكن للمستخدم رؤيتها في
                    القائمة.
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

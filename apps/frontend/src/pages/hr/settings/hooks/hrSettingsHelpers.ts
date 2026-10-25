import {
  defaultHRSettings,
  type HRSettingsData,
  type NotificationHealth,
  type NotificationRecipientEmployeeOption,
} from "../types/hrSettingsTypes";

export function safeParseJson(data: unknown, defaultValue: unknown = []) {
  if (!data) return defaultValue;
  if (Array.isArray(data)) return data;
  try {
    let parsed: unknown = typeof data === "string" ? JSON.parse(data) : data;
    let depth = 0;
    while (typeof parsed === "string" && depth < 5) {
      parsed = JSON.parse(parsed);
      depth++;
    }
    return Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null
        ? parsed
        : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function normalizeRecipientEmployees(
  rawEmployees: unknown,
): NotificationRecipientEmployeeOption[] {
  const employees = Array.isArray(rawEmployees) ? rawEmployees : [];
  return employees
    .map((employee: any) => ({
      id: employee.userId || employee.id,
      name:
        `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
        employee.name ||
        "موظف",
      phone:
        employee.phone || employee.mobile || employee.user?.phone || "",
      employeeNumber: employee.employeeNumber || undefined,
      department:
        employee.department?.name ||
        employee.department?.title ||
        employee.departmentRelation?.name ||
        employee.department ||
        undefined,
    }))
    .filter((employee: NotificationRecipientEmployeeOption) =>
      Boolean(employee.id),
    );
}

export function parseLoadedHRSettings(rawSettings: Record<string, unknown>): HRSettingsData {
  const loadedSettings: HRSettingsData = {
    ...defaultHRSettings,
    ...(rawSettings as Partial<HRSettingsData>),
  };

  loadedSettings.lateWarningLevels = safeParseJson(
    loadedSettings.lateWarningLevels,
    [],
  ) as HRSettingsData["lateWarningLevels"];
  loadedSettings.delayPenaltyTiers = safeParseJson(
    loadedSettings.delayPenaltyTiers,
    [],
  ) as HRSettingsData["delayPenaltyTiers"];
  loadedSettings.notificationRecipients = safeParseJson(
    loadedSettings.notificationRecipients,
    [],
  ) as HRSettingsData["notificationRecipients"];

  return loadedSettings;
}

export function validateHRSettingsData(
  settings: HRSettingsData,
): Record<string, string> {
  const newErrors: Record<string, string> = {};

  if (settings.maxAdvancePercentage < 0 || settings.maxAdvancePercentage > 100) {
    newErrors.maxAdvancePercentage = "النسبة يجب أن تكون بين 0 و 100";
  }
  if (settings.taxRate < 0 || settings.taxRate > 100) {
    newErrors.taxRate = "نسبة الضريبة يجب أن تكون بين 0 و 100";
  }
  if (settings.socialInsuranceRate < 0 || settings.socialInsuranceRate > 100) {
    newErrors.socialInsuranceRate = "نسبة التأمينات يجب أن تكون بين 0 و 100";
  }
  if (
    settings.probationLeavePercentage < 0 ||
    settings.probationLeavePercentage > 100
  ) {
    newErrors.probationLeavePercentage = "النسبة يجب أن تكون بين 0 و 100";
  }

  if (settings.geofenceEnabled) {
    const lat = parseFloat(settings.officeLatitude);
    const lng = parseFloat(settings.officeLongitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.officeLatitude =
        "خط العرض يجب أن يكون رقم صحيح بين -90 و 90";
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.officeLongitude =
        "خط الطول يجب أن يكون رقم صحيح بين -180 و 180";
    }
    if (settings.geofenceRadius < 50 || settings.geofenceRadius > 5000) {
      newErrors.geofenceRadius = "نطاق البصمة يجب أن يكون بين 50 و 5000 متر";
    }
  }

  if (settings.workingDays.length === 0) {
    newErrors.workingDays = "يجب تحديد يوم عمل واحد على الأقل";
  }

  if (settings.annualLeaveDefault < 0) {
    newErrors.annualLeaveDefault = "يجب أن يكون الرقم موجب";
  }
  if (settings.sickLeaveDefault < 0) {
    newErrors.sickLeaveDefault = "يجب أن يكون الرقم موجب";
  }

  if (settings.aiOwnerNotificationsEnabled) {
    const hasPrimaryRecipient = Boolean(settings.ownerWhatsAppNumber.trim());
    const additionalRecipientsCount = settings.notificationRecipients.filter(
      (recipient) => Boolean(recipient.phone?.trim()),
    ).length;

    if (!hasPrimaryRecipient && additionalRecipientsCount === 0) {
      newErrors.aiOwnerNotificationsEnabled =
        "فعّلي رقم واتساب أساسي أو أضيفي مستلمًا واحدًا على الأقل";
    }
  }

  return newErrors;
}

export function computeNotificationDeliverySummary(
  settings: HRSettingsData,
  notificationHealth: NotificationHealth | null,
) {
  const configuredAdditionalRecipientsCount =
    settings.notificationRecipients.filter((recipient) =>
      Boolean(recipient.phone?.trim()),
    ).length;

  const hasConfiguredRecipient =
    Boolean(settings.ownerWhatsAppNumber.trim()) ||
    configuredAdditionalRecipientsCount > 0 ||
    Boolean(notificationHealth?.hasCompanyPhoneFallback);

  const connectedSessionCount = notificationHealth?.connectedSessionCount || 0;
  const hasConnectedSession = connectedSessionCount > 0;

  const activeNotificationIssues: string[] = [];
  if (settings.aiOwnerNotificationsEnabled && !hasConfiguredRecipient) {
    activeNotificationIssues.push("no_recipient_configured");
  }
  if (settings.aiOwnerNotificationsEnabled && !hasConnectedSession) {
    activeNotificationIssues.push("no_whatsapp_session");
  }

  const readyRecipientsCount =
    Number(Boolean(settings.ownerWhatsAppNumber.trim())) +
    configuredAdditionalRecipientsCount +
    Number(
      !settings.ownerWhatsAppNumber.trim() &&
        configuredAdditionalRecipientsCount === 0 &&
        Boolean(notificationHealth?.hasCompanyPhoneFallback),
    );

  const isWhatsAppDeliveryReady =
    settings.aiOwnerNotificationsEnabled &&
    hasConfiguredRecipient &&
    hasConnectedSession;

  return {
    configuredAdditionalRecipientsCount,
    hasConfiguredRecipient,
    connectedSessionCount,
    hasConnectedSession,
    activeNotificationIssues,
    readyRecipientsCount,
    isWhatsAppDeliveryReady,
  };
}

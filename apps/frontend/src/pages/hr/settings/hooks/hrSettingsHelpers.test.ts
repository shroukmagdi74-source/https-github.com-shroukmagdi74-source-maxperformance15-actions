import { describe, it, expect } from "vitest";
import {
  calculateDistance,
  computeNotificationDeliverySummary,
  normalizeRecipientEmployees,
  parseLoadedHRSettings,
  validateHRSettingsData,
} from "./hrSettingsHelpers";
import { defaultHRSettings } from "../types/hrSettingsTypes";

describe("hrSettingsHelpers", () => {
  it("normalizes recipient employees and parses JSON settings", () => {
    const normalized = normalizeRecipientEmployees([
      {
        id: "emp-1",
        firstName: "أحمد",
        lastName: "حسن",
        phone: "01012345678",
        department: { name: "المبيعات" },
      },
    ]);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].name).toBe("أحمد حسن");
    expect(normalized[0].department).toBe("المبيعات");

    const parsed = parseLoadedHRSettings({
      taxRate: 14,
      lateWarningLevels: JSON.stringify([{ count: 3, action: "warning" }]),
    });
    expect(parsed.taxRate).toBe(14);
    expect(parsed.lateWarningLevels).toHaveLength(1);
  });

  it("validates settings and computes delivery summary", () => {
    const invalid = validateHRSettingsData({
      ...defaultHRSettings,
      taxRate: 150,
      workingDays: [],
    });
    expect(invalid.taxRate).toBeDefined();
    expect(invalid.workingDays).toBeDefined();

    const summary = computeNotificationDeliverySummary(
      {
        ...defaultHRSettings,
        aiOwnerNotificationsEnabled: true,
        ownerWhatsAppNumber: "201012345678",
      },
      {
        connectedSessionCount: 1,
        totalSessionCount: 1,
        hasCompanyPhoneFallback: false,
      } as any,
    );
    expect(summary.isWhatsAppDeliveryReady).toBe(true);
    expect(calculateDistance(30.0444, 31.2357, 30.0444, 31.2357)).toBe(0);
  });
});

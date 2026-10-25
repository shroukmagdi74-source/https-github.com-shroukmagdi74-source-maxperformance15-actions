// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { HRAttendanceTab } from "../hr/settings/components/HRAttendanceTab";

vi.mock("../../components/hr/AutoDeductionSettings", () => ({
  PunctualityRules: () => <div data-testid="punctuality-rules">PunctualityRules</div>,
  FinancialPenalties: () => <div data-testid="financial-penalties">FinancialPenalties</div>,
  CalculationEngine: () => <div data-testid="calculation-engine">CalculationEngine</div>,
  PunctualityNotifications: () => <div data-testid="punctuality-notifications">PunctualityNotifications</div>,
}));

const mockSettings: any = {
  earlyLeaveThreshold: 15,
  monthlyLateLimit: 3,
  lateWarningLevels: [{ count: 1, deductionFactor: 0.25 }],
  allowRemoteCheckIn: true,
  requireLocation: false,
  autoAbsentMarking: true,
  geofenceEnabled: true,
  officeLatitude: "30.0444",
  officeLongitude: "31.2357",
  geofenceRadius: 200,
};

describe("HRAttendanceTab Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders attendance punctuality tab and subcomponents", () => {
    render(
      <HRAttendanceTab
        settings={mockSettings}
        setSettings={vi.fn()}
        gettingLocation={false}
        testingLocation={false}
        locationTestResult={null}
        onGetCurrentLocation={vi.fn()}
        onTestCurrentLocation={vi.fn()}
        onOpenInGoogleMaps={vi.fn()}
      />
    );

    expect(screen.getByText("الالتزام والجزاءات")).toBeTruthy();
    expect(screen.getByText("تتبع الموقع (GPS)")).toBeTruthy();
    expect(screen.getByText("محرك الحسابات")).toBeTruthy();
    expect(screen.getByText("سياسات الالتزام والجزاءات")).toBeTruthy();
    expect(screen.getByTestId("punctuality-rules")).toBeTruthy();
    expect(screen.getByTestId("financial-penalties")).toBeTruthy();
  });
});

// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/lib/utils", () => ({
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" "),
}));

import {
  sortApps,
  buildAppPayload,
  PricingModelBadge,
  ActiveStatusPill,
  TrialDaysInput,
  MarketplaceApp,
} from "../app-pricing";

describe("AppPricing Sheet Unit Tests", () => {
  const mockApps: MarketplaceApp[] = [
    {
      id: "app-1",
      slug: "marketing-suite",
      name: "منصة التسويق",
      nameEn: "Marketing Suite",
      category: "MARKETING",
      description: "Suite for marketing automation",
      pricingModel: "SUBSCRIPTION",
      monthlyPrice: 300,
      yearlyPrice: 3000,
      trialDays: 14,
      isActive: true,
      isInstalled: true,
    },
    {
      id: "app-2",
      slug: "free-tools",
      name: "أدوات مجانية",
      nameEn: "Free Tools",
      category: "PRODUCTIVITY",
      description: "Free tools for everyone",
      pricingModel: "FREE",
      monthlyPrice: 0,
      yearlyPrice: 0,
      trialDays: 0,
      isActive: false,
      isInstalled: false,
    },
    {
      id: "app-3",
      slug: "sms-gateway",
      name: "بوابة الرسائل",
      nameEn: "SMS Gateway",
      category: "COMMUNICATION",
      description: "Pay per message",
      pricingModel: "PAY_PER_USE",
      unitPrice: 0.25,
      unitName: "sms",
      trialDays: 7,
      isActive: true,
      isInstalled: false,
    },
  ];

  it("buildAppPayload correctly sanitizes and formats inputs", () => {
    const payload = buildAppPayload(
      {
        name: "Test App",
        category: "AI",
        pricingModel: "SUBSCRIPTION",
        monthlyPrice: 150,
        trialDays: 10,
        isActive: true,
      },
      "test-app",
    );

    expect(payload.name).toBe("Test App");
    expect(payload.slug).toBe("test-app");
    expect(payload.category).toBe("AI");
    expect(payload.pricingModel).toBe("SUBSCRIPTION");
    expect(payload.monthlyPrice).toBe(150);
    expect(payload.yearlyPrice).toBe(0);
    expect(payload.trialDays).toBe(10);
    expect(payload.isActive).toBe(true);
  });

  it("sortApps correctly sorts by monthlyPrice descending", () => {
    const sorted = sortApps(mockApps, "monthlyPrice", "desc", "ar");
    expect(sorted[0].slug).toBe("marketing-suite"); // 300
    expect(sorted[1].slug).toBe("free-tools"); // 0
    expect(sorted[2].slug).toBe("sms-gateway"); // -1
  });

  it("sortApps correctly sorts by name ascending in Arabic", () => {
    const sorted = sortApps(mockApps, "name", "asc", "ar");
    expect(sorted[0].name).toBe("أدوات مجانية");
    expect(sorted[1].name).toBe("بوابة الرسائل");
    expect(sorted[2].name).toBe("منصة التسويق");
  });

  it("PricingModelBadge renders correct translation keys", () => {
    const t = (k: string) => k;
    const { rerender } = render(<PricingModelBadge t={t as any} model="FREE" />);
    expect(screen.getByText("subscription.free")).toBeTruthy();

    rerender(<PricingModelBadge t={t as any} model="SUBSCRIPTION" />);
    expect(screen.getByText("subscription.subscription")).toBeTruthy();

    rerender(<PricingModelBadge t={t as any} model="PAY_PER_USE" />);
    expect(screen.getByText("subscription.payAsYouGo")).toBeTruthy();
  });

  it("ActiveStatusPill indicates active and disabled state", () => {
    const t = (k: string, fallback?: string) => fallback || k;
    const { rerender } = render(<ActiveStatusPill t={t as any} isActive={true} />);
    expect(screen.getByText("مفعّل")).toBeTruthy();

    rerender(<ActiveStatusPill t={t as any} isActive={false} />);
    expect(screen.getByText("موقوف")).toBeTruthy();
  });

  it("TrialDaysInput triggers onChange and onCommit correctly", () => {
    const handleChange = vi.fn();
    const handleCommit = vi.fn();

    render(
      <TrialDaysInput
        value={14}
        onChange={handleChange}
        onCommit={handleCommit}
        daysLabel="days"
      />,
    );

    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.value).toBe("14");

    fireEvent.change(input, { target: { value: "30" } });
    expect(handleChange).toHaveBeenCalledWith(30);

    fireEvent.blur(input);
    expect(handleCommit).toHaveBeenCalled();
  });
});

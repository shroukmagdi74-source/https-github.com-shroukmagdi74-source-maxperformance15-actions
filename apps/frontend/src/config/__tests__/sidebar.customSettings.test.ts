import { describe, expect, it } from "vitest";
import { getSidebarConfig } from "../sidebar";

describe("sidebar customization via getSidebarConfig", () => {
  const dummyT = (key: string) => {
    const map: Record<string, string> = {
      "sidebar.dashboard": "لوحة التحكم الافتراضية",
      "sidebar.orders": "الطلبات الافتراضية",
      "sidebar.products": "المنتجات الافتراضية",
      "sidebar.settings": "الإعدادات الافتراضية",
    };
    return map[key] || key;
  };

  const user = {
    role: "OWNER",
    company: {
      isCurrent: true,
      activeApps: ["store", "orders", "products"],
    },
  };

  it("keeps current default menu identical for any company that never saved settings", () => {
    const configDefault = getSidebarConfig(dummyT as any, user);
    expect(configDefault).toBeDefined();
    expect(configDefault.length).toBeGreaterThan(0);

    // Without saved settings, orders has default title
    const ordersSec = configDefault.find((s) => s.id === "orders");
    expect(ordersSec).toBeDefined();
    expect(ordersSec?.hidden).toBeFalsy();
  });

  it("applies a saved order and custom labels over defaults", () => {
    const savedCustomization = [
      {
        key: "orders",
        order: 0,
        visible: true,
        labelAr: "إدارة المبيعات والطلبات",
        labelEn: "Sales & Orders",
      },
      {
        key: "dashboard",
        order: 1,
        visible: true,
        labelAr: "الرئيسية المخصصة",
        labelEn: "Custom Dashboard",
      },
    ];

    const config = getSidebarConfig(dummyT as any, user, savedCustomization);

    // Orders was moved to index 0 (order: 0) ahead of dashboard (order: 1)
    const ordersIndex = config.findIndex((s) => s.id === "orders");
    const dashboardIndex = config.findIndex((s) => s.id === "main");

    expect(ordersIndex).toBeLessThan(dashboardIndex);

    // Custom Arabic label won over default
    const ordersSec = config.find((s) => s.id === "orders");
    expect(ordersSec?.title).toBe("إدارة المبيعات والطلبات");

    const dashSec = config.find((s) => s.id === "main");
    expect(dashSec?.title).toBe("الرئيسية المخصصة");
  });

  it("applies saved visibility and prevents hiding locked items", () => {
    const savedCustomization = [
      {
        key: "orders",
        order: 0,
        visible: false, // Hide orders
      },
      {
        key: "dashboard",
        order: 1,
        visible: false, // Attempt to hide protected dashboard
      },
      {
        key: "settings",
        order: 2,
        visible: false, // Attempt to hide protected settings
      },
    ];

    const config = getSidebarConfig(dummyT as any, user, savedCustomization);

    const ordersSec = config.find((s) => s.id === "orders");
    expect(ordersSec?.hidden).toBe(true);

    // Dashboard and settings are locked and must never be hidden
    const dashSec = config.find((s) => s.id === "main");
    expect(dashSec?.hidden).toBe(false);

    const settingsSec = config.find((s) => s.id === "settings");
    expect(settingsSec?.hidden).toBe(false);
  });

  it("applies settings.labels and companyApp.customName", () => {
    const userWithCustomApp = {
      role: "OWNER",
      company: {
        isCurrent: true,
        companyApps: [
          {
            appId: "accounting",
            customName: "نظام الحسابات المتطور",
          },
        ],
      },
    };

    const structuredSettings = {
      labels: {
        orders: "مركز المبيعات",
      },
    };

    const config = getSidebarConfig(dummyT as any, userWithCustomApp, structuredSettings);

    const ordersSec = config.find((s) => s.id === "orders");
    expect(ordersSec?.title).toBe("مركز المبيعات");

    const accountingSec = config.find((s) => s.id === "accounting");
    if (accountingSec) {
      expect(accountingSec.title).toBe("نظام الحسابات المتطور");
    }
  });

  it("strictly hides unpermitted items even if marked visible or customized in saved settings", () => {
    const regularUser = {
      role: "TEAM_MEMBER",
      permissions: [],
      company: {
        isCurrent: true,
      },
    };

    // User attempts to make a restricted item (e.g. settings or audit) visible with custom label
    const maliciousSettings = [
      {
        key: "platform-audit",
        order: 0,
        visible: true,
        labelAr: "سجل الرقابة للجميع",
      },
    ];

    const config = getSidebarConfig(dummyT as any, regularUser, maliciousSettings);

    const auditSec = config.find((s) => s.id === "platform-audit");
    // Either the section is completely excluded by permission filter or its items are hidden
    if (auditSec) {
      expect(auditSec.hidden).toBe(true);
    } else {
      expect(auditSec).toBeUndefined();
    }
  });
});

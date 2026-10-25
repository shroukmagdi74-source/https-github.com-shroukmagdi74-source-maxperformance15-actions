import { describe, expect, it } from "vitest";
import { getSidebarConfig, mapSuperAdminGroupsToSidebarSections } from "../sidebar";
import { getSuperAdminMenuGroups } from "../superAdminMenuConfig";
import { FEATURE_UNIFIED_SUPERADMIN_SHELL, shouldUseSuperAdminShell } from "../../components/layout/layoutMode";

describe("ARCH-1B: Super Admin Menu Adapter & Unified Shell", () => {
  const dummyT = (key: string) => key;

  const EXPECTED_PLATFORM_IDS = [
    "platform-home",
    "platform-companies",
    "platform-billing",
    "platform-storeApps",
    "platform-ai",
    "platform-system",
    "platform-dev",
  ];

  it("(أ) maps 7 Super Admin groups into 7 sections with platform-* IDs", () => {
    const groups = getSuperAdminMenuGroups(dummyT);
    expect(groups).toHaveLength(7);

    const sections = mapSuperAdminGroupsToSidebarSections(groups);
    expect(sections).toHaveLength(7);

    const sectionIds = sections.map((s) => s.id);
    expect(sectionIds).toEqual(EXPECTED_PLATFORM_IDS);

    expect(sections.every((s) => s.id.startsWith("platform-"))).toBe(true);
  });

  it("(ب) ensures each section and every item has requiredRoles: ['SUPER_ADMIN']", () => {
    const groups = getSuperAdminMenuGroups(dummyT);
    const sections = mapSuperAdminGroupsToSidebarSections(groups);

    for (const section of sections) {
      expect(section.requiredRoles).toEqual(["SUPER_ADMIN"]);
      expect(section.items.length).toBeGreaterThan(0);

      for (const item of section.items) {
        expect(item.requiredRoles).toEqual(["SUPER_ADMIN"]);
        expect(item.to).toBeTruthy();
        expect(item.label).toBeTruthy();
        // Ensure no deprecated 'roles' property exists on items or section
        expect((item as unknown as Record<string, unknown>)['roles']).toBeUndefined();
        expect((section as unknown as Record<string, unknown>)['roles']).toBeUndefined();
      }
    }
  });

  it("(ج) ensures a regular user (role: 'OWNER') gets 0 Super Admin platform-* sections", () => {
    const config = getSidebarConfig(dummyT, {
      role: "OWNER",
      company: { isCurrent: true, activeApps: ["store"] },
    } as any);

    // Super Admin platform sections mapped via adapter
    const platformAdminSections = config.filter(
      (s) => s.id.startsWith("platform-") && s.requiredRoles?.includes("SUPER_ADMIN")
    );
    expect(platformAdminSections).toHaveLength(0);

    // None of the 7 Super Admin platform IDs should exist for a regular user
    expect(config.some((s) => EXPECTED_PLATFORM_IDS.includes(s.id))).toBe(false);
  });

  it("(د) preserves platform-* sections for SUPER_ADMIN even with non-empty assignedApps", () => {
    const config = getSidebarConfig(
      dummyT,
      {
        role: "SUPER_ADMIN",
        company: { isCurrent: true },
      } as any,
      undefined,
      undefined,
      ["store", "crm", "accounting"] // non-empty assignedApps restriction
    );

    // Under assignedApps restriction, all 7 Super Admin platform sections pass through
    const platformSections = config.filter((s) => s.id.startsWith("platform-"));
    expect(platformSections).toHaveLength(7);

    const sectionIds = platformSections.map((s) => s.id);
    expect(sectionIds).toEqual(EXPECTED_PLATFORM_IDS);
  });

  it("deduplication check: eliminates /company-dashboard and duplicate server-usage", () => {
    const groups = getSuperAdminMenuGroups(dummyT);
    const sections = mapSuperAdminGroupsToSidebarSections(groups);

    const allPaths = sections.flatMap((s) => s.items.map((i) => i.to));

    // 1. /company-dashboard must NOT be in platform groups (company has its own home)
    expect(allPaths).not.toContain("/company-dashboard");

    // 2. /super-admin/server-usage must appear exactly ONCE (in system, not duplicated in home)
    const serverUsageOccurrences = allPaths.filter((p) => p === "/super-admin/server-usage");
    expect(serverUsageOccurrences).toHaveLength(1);

    const homeSection = sections.find((s) => s.id === "platform-home");
    expect(homeSection?.items.map((i) => i.to)).toEqual(["/super-admin/dashboard"]);

    const systemSection = sections.find((s) => s.id === "platform-system");
    expect(systemSection?.items.some((i) => i.to === "/super-admin/server-usage")).toBe(true);
  });

  it("verifies rollback switch: FEATURE_UNIFIED_SUPERADMIN_SHELL bypasses legacy shell", () => {
    expect(FEATURE_UNIFIED_SUPERADMIN_SHELL).toBe(true);
    // When unified shell is true, shouldUseSuperAdminShell returns false immediately
    expect(shouldUseSuperAdminShell("SUPER_ADMIN", "/super-admin/dashboard")).toBe(false);
    expect(shouldUseSuperAdminShell("SUPER_ADMIN", "/super-admin/companies-v2")).toBe(false);
  });
});

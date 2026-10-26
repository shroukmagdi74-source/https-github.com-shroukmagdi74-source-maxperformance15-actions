// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  isValidHexColor,
  getSafeHexColor,
  sanitizeStatusItems,
  TENANT_EXCLUDED_ROLES,
  StatusItem,
  SettingsData,
  DevTeamMember,
} from "../dev-task-settings/types";
import { DevTaskGeneralTab } from "../dev-task-settings/DevTaskGeneralTab";
import { DevTaskPermissionsTab } from "../dev-task-settings/DevTaskPermissionsTab";
import { DevTaskVisibilityTab } from "../dev-task-settings/DevTaskVisibilityTab";
import { DevTaskLeaderboardTab } from "../dev-task-settings/DevTaskLeaderboardTab";

const mockSettings: SettingsData = {
  timezone: "Africa/Cairo",
  taskStatuses: [
    { value: "TODO", label: "قيد الانتظار", color: "#6366f1" },
    { value: "IN_PROGRESS", label: "قيد التنفيذ", color: "#3b82f6" },
    { value: "DONE", label: "مكتمل", color: "#10b981" },
  ],
  taskPriorities: [
    { value: "HIGH", label: "عالية", color: "#ef4444" },
    { value: "MEDIUM", label: "متوسطة", color: "#f59e0b" },
  ],
  permissions: {
    DEVELOPER: {
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canComment: true,
      canAssign: false,
      canChangeStatus: true,
      canArchive: false,
      canViewReports: false,
      canManageProjects: false,
      canExport: false,
      canAccessSettings: false,
      canManageTaskSettings: false,
      canViewAll: false,
      viewScope: "assigned_only",
    },
  },
  componentMappings: {
    Frontend: "mem-1",
  },
  autoTestingSubtask: true,
  autoTestingAssigneeId: "mem-2",
  leaderboardSettings: {
    baseXP: 15,
    taskTypeScores: {
      FEATURE: 25,
      BUG: 20,
    },
    priorityScores: {
      HIGH: 10,
    },
    timeBasedScoring: {
      enabled: true,
      earlyCompletionBonus: 25,
      onTimeBonus: 10,
      lateCompletionPenalty: 15,
      maxBonusPercent: 50,
      maxPenaltyPercent: 30,
    },
  },
  taskDetailsVisibility: {
    showDescription: true,
    showRelatedLinks: true,
    showChecklists: true,
    showBusinessValue: false,
    showAcceptanceCriteria: true,
    showAttachments: true,
    showCreatedAt: true,
  },
};

const mockTeamMembers: DevTeamMember[] = [
  { id: "mem-1", name: "Ahmed Frontend", role: "DEVELOPER" },
  { id: "mem-2", name: "Sara QA", role: "QA_ENGINEER" },
];

describe("DevTaskSettings Unit Tests", () => {
  it("validates and sanitizes status colors properly", () => {
    expect(isValidHexColor("#6366f1")).toBe(true);
    expect(isValidHexColor("#fff")).toBe(false);
    expect(isValidHexColor("invalid-color")).toBe(false);

    expect(getSafeHexColor("#10b981")).toBe("#10b981");
    expect(getSafeHexColor("invalid")).toBe("#cbd5e1");
    expect(getSafeHexColor(undefined)).toBe("#cbd5e1");

    const rawItems: StatusItem[] = [
      { value: "A", label: "Alpha", color: "#123456" },
      { value: "B", label: "Beta", color: "not-a-color" },
    ];
    const sanitized = sanitizeStatusItems(rawItems);
    expect(sanitized[0].color).toBe("#123456");
    expect(sanitized[1].color).toBe("#cbd5e1");
  });

  it("filters out tenant roles from permissions screen", () => {
    expect(TENANT_EXCLUDED_ROLES).toContain("OWNER");
    expect(TENANT_EXCLUDED_ROLES).toContain("AGENT");
    expect(TENANT_EXCLUDED_ROLES).toContain("COMPANY_ADMIN");
  });

  it("renders General Tab with timezone and statuses table", () => {
    const dummySetSettings = vi.fn();
    const dummyUpdateStatus = vi.fn();
    const dummyAddStatus = vi.fn();
    const dummyRemoveStatus = vi.fn();

    render(
      <DevTaskGeneralTab
        settings={mockSettings}
        setSettings={dummySetSettings}
        updateStatus={dummyUpdateStatus}
        addStatus={dummyAddStatus}
        removeStatus={dummyRemoveStatus}
      />,
    );

    expect(screen.getByText("إعدادات المنطقة الزمنية")).toBeDefined();
    expect(screen.getByText("حالات المهام (Statuses)")).toBeDefined();
    expect(screen.getByDisplayValue("قيد الانتظار")).toBeDefined();
    expect(screen.getByDisplayValue("قيد التنفيذ")).toBeDefined();
    expect(screen.getByDisplayValue("مكتمل")).toBeDefined();
  });

  it("renders Permissions Tab and handles roles", () => {
    const dummySetSettings = vi.fn();

    render(
      <DevTaskPermissionsTab
        settings={mockSettings}
        setSettings={dummySetSettings}
        teamMembers={mockTeamMembers}
      />,
    );

    expect(screen.getByText("صلاحيات الأدوار")).toBeDefined();
    expect(screen.getByText("DEVELOPER")).toBeDefined();
    expect(screen.getByText("QA_ENGINEER")).toBeDefined();
  });

  it("renders Leaderboard Tab with base XP and scores", () => {
    const dummySetSettings = vi.fn();

    render(
      <DevTaskLeaderboardTab
        settings={mockSettings}
        setSettings={dummySetSettings}
      />,
    );

    expect(screen.getByText("إعدادات لوحة الأبطال")).toBeDefined();
    expect(screen.getAllByDisplayValue("15").length).toBeGreaterThanOrEqual(1); // baseXP and penalties
    expect(screen.getByText("مثال توضيحي على الحساب:")).toBeDefined();
    expect(screen.getByText("حساب النقاط بناءً على الوقت")).toBeDefined();
  });

  it("renders Visibility Tab with field labels", () => {
    const dummySetSettings = vi.fn();

    render(
      <DevTaskVisibilityTab
        settings={mockSettings}
        setSettings={dummySetSettings}
      />,
    );

    expect(screen.getByText("إعدادات رؤية تفاصيل المهمة")).toBeDefined();
    expect(screen.getByText("إظهار الوصف")).toBeDefined();
    expect(screen.getByText("إظهار الروابط المتعلقة")).toBeDefined();
    expect(screen.getByText("إظهار قوائم التحقق")).toBeDefined();
    expect(screen.getByText("إظهار قيمة العمل")).toBeDefined();
  });
});

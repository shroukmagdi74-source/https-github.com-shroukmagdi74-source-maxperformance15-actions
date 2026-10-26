// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createMasterBlueprint, WORKFLOW_STAGES } from "../masterBlueprint";
import { TOOL_PRESETS } from "../toolPresets";
import { MindMapHeader } from "../MindMapHeader";
import type { MindMapController } from "../useMindMapController";

describe("MindMap Page & Engine Unit Tests", () => {
  it("generates master blueprint with 12 steps customized for company", () => {
    const blueprint = createMasterBlueprint("الرواد لتجارة التجزئة");
    expect(blueprint.length).toBe(12);

    // Verify step 1
    expect(blueprint[0].id).toBe("m-step-1");
    expect(blueprint[0].category).toBe("calc");
    expect(blueprint[0].liveRoute).toBe("/break-even");

    // Verify company name injection in step 3
    const step3 = blueprint.find((s) => s.stepOrder === 3);
    expect(step3?.title).toContain("الرواد لتجارة التجزئة");

    // Verify final step is training video
    const step12 = blueprint.find((s) => s.stepOrder === 12);
    expect(step12?.hasVideo).toBe(true);
    expect(step12?.category).toBe("training");
  });

  it("verifies all 5 workflow stages are defined", () => {
    expect(WORKFLOW_STAGES.length).toBe(5);
    const stageIds = WORKFLOW_STAGES.map((s) => s.id);
    expect(stageIds).toEqual([
      "stage-plan",
      "stage-creative-store",
      "stage-ads-chat",
      "stage-ops-warehouse",
      "stage-finance-growth",
    ]);
  });

  it("verifies TOOL_PRESETS contains the core operational tools", () => {
    expect(TOOL_PRESETS.calc_break_even).toBeDefined();
    expect(TOOL_PRESETS.calc_break_even.liveRoute).toBe("/break-even");

    expect(TOOL_PRESETS.store_pdp).toBeDefined();
    expect(TOOL_PRESETS.store_pdp.category).toBe("store");

    expect(TOOL_PRESETS.chat_unified).toBeDefined();
    expect(TOOL_PRESETS.chat_unified.liveRoute).toBe("/unified-inbox");

    expect(TOOL_PRESETS.ops_warehouse).toBeDefined();
    expect(TOOL_PRESETS.ops_warehouse.category).toBe("ops");

    expect(TOOL_PRESETS.finance_pnl).toBeDefined();
    expect(TOOL_PRESETS.finance_pnl.category).toBe("finance");
  });

  it("renders MindMapHeader with brand and mode switchers", () => {
    const mockController: Partial<MindMapController> = {
      companyName: "شركة الهدى",
      isMindmapInstalled: true,
      isInstalling: false,
      mode: "plan",
      viewMode: "canvas",
      isExecuting: false,
      switchMode: vi.fn(),
      setViewMode: vi.fn(),
      runExecutionSimulation: vi.fn(),
      handleReloadMasterBlueprint: vi.fn(),
      handleInstallMindmap: vi.fn(),
    };

    render(
      <MemoryRouter>
        <MindMapHeader c={mockController as MindMapController} />
      </MemoryRouter>,
    );

    expect(screen.getByText("الخرائط الذهنية ومسارات العمل")).toBeTruthy();
    expect(screen.getByText("مفعّل لـ شركة الهدى")).toBeTruthy();
    expect(screen.getByText("تخطيط")).toBeTruthy();
    expect(screen.getByText("تدريب وشرح")).toBeTruthy();
    expect(screen.getByText("أتمتة وتنفيذ")).toBeTruthy();
    expect(screen.getByText("تشغيل المسار")).toBeTruthy();
  });
});

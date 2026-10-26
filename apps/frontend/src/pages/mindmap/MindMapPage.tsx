import React from "react";
import { useMindMapController } from "./useMindMapController";
import { MindMapHeader } from "./MindMapHeader";
import { MindMapTimelineView } from "./MindMapTimelineView";
import { MindMapCanvasView } from "./MindMapCanvasView";
import { MindMapToolsPalette } from "./MindMapToolsPalette";

export default function MindMapPage() {
  const c = useMindMapController();

  return (
    <div
      className="h-[calc(100vh-64px)] w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative"
      dir="rtl"
    >
      <MindMapHeader c={c} />

      {c.viewMode === "timeline" ? (
        <MindMapTimelineView c={c} />
      ) : (
        <MindMapCanvasView c={c} />
      )}

      <MindMapToolsPalette c={c} />
    </div>
  );
}
export { createMasterBlueprint, WORKFLOW_STAGES } from "./masterBlueprint";
export type { MapNode, WorkflowStage } from "./types";

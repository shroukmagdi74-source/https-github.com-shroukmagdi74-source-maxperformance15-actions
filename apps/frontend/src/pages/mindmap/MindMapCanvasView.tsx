import React from "react";
import {
  ArrowDownCircle,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { WORKFLOW_STAGES } from "./masterBlueprint";
import { MindMapNodeItem } from "./MindMapNodeItem";
import { MindMapDock } from "./MindMapDock";
import type { MindMapController } from "./useMindMapController";

export const MindMapCanvasView: React.FC<{ c: MindMapController }> = ({ c }) => {
  const {
    nodes,
    mode,
    zoom,
    pan,
    selectedNodeId,
    trainStepIndex,
    isExecuting,
    isDropHintVisible,
    viewportRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleCanvasDragOver,
    handleCanvasDragLeave,
    handleCanvasDrop,
    prevTrainStep,
    nextTrainStep,
  } = c;

  return (
    <div
      ref={viewportRef}
      dir="ltr"
      className="relative flex-1 w-full h-full overflow-hidden bg-slate-950"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(30, 27, 75, 0.22) 0%, rgba(2, 6, 23, 1) 100%), radial-gradient(#334155 1.5px, transparent 1.5px)",
        backgroundSize: "100% 100%, 32px 32px",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
    >
      {/* Drop Hint Overlay */}
      {isDropHintVisible && (
        <div className="pointer-events-none absolute inset-4 border-2 border-dashed border-violet-500/60 rounded-3xl bg-violet-950/20 z-30 flex items-center justify-center">
          <div className="bg-slate-900/90 border border-violet-500 px-5 py-2.5 rounded-2xl text-xs font-bold text-violet-300 flex items-center gap-2 shadow-2xl">
            <ArrowDownCircle className="w-5 h-5 text-violet-400 animate-bounce" />
            <span>أفلت أداة السيناريو هنا لتثبيتها وربطها بالمسار فوراً!</span>
          </div>
        </div>
      )}

      {/* Presentation Controller */}
      {mode === "train" && (
        <div
          className="absolute top-20 right-1/2 translate-x-1/2 z-30 bg-slate-900/95 border border-amber-500/50 p-2 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur animate-fade-in"
          dir="rtl"
        >
          <div className="flex items-center gap-2 px-3 text-amber-400 font-bold text-xs border-l border-slate-800">
            <GraduationCap className="w-4 h-4" />
            <span>
              خطوة الشرح: {trainStepIndex} من {Math.max(...nodes.map((n) => n.stepOrder || 1))}
            </span>
          </div>
          <button
            onClick={prevTrainStep}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={nextTrainStep}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
          >
            <span>الخطوة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Infinite Transform Container */}
      <div
        className="absolute top-0 left-0 w-[5000px] h-[5000px] origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Stage Swimlanes Background Containers */}
        <div className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none z-0">
          {WORKFLOW_STAGES.map((st) => (
            <div
              key={st.id}
              style={{
                position: "absolute",
                left: `${st.x}px`,
                top: `${st.y}px`,
                width: `${st.width}px`,
                height: `${st.height}px`,
              }}
              className={`rounded-3xl border-2 border-dashed ${st.accentBorder} bg-gradient-to-b ${st.bgGradient} backdrop-blur-sm p-4 flex flex-col justify-between transition-all duration-300 select-none`}
              dir="rtl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-950/90 border ${st.accentBorder} ${st.color}`}
                  >
                    {st.badge}
                  </span>
                  <h3 className="text-xs font-bold text-slate-200">{st.title}</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  {st.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* SVG Edges with Animated Flow Particles */}
        <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none z-10">
          {nodes.map((node) => {
            if (!node.parentId) return null;
            const parent = nodes.find((n) => n.id === node.parentId);
            if (!parent) return null;

            const pWidth = 304;
            const pHeight = 110;
            const nWidth = 304;
            const nHeight = 110;

            const startX = parent.x + (node.x > parent.x ? pWidth : 0);
            const startY = parent.y + pHeight / 2;
            const endX = node.x + (node.x > parent.x ? 0 : nWidth);
            const endY = node.y + nHeight / 2;

            const deltaX = Math.abs(endX - startX) * 0.5;
            const control1X = node.x > parent.x ? startX + deltaX : startX - deltaX;
            const control2X = node.x > parent.x ? endX - deltaX : endX + deltaX;

            const isEdgeActive = selectedNodeId === node.id || selectedNodeId === parent.id;
            const edgePath = `M ${startX} ${startY} C ${control1X} ${startY}, ${control2X} ${endY}, ${endX} ${endY}`;

            return (
              <g key={`edge-group-${parent.id}-${node.id}`}>
                <path
                  d={edgePath}
                  className={`fill-none transition-all duration-300 ${
                    isExecuting
                      ? "stroke-emerald-400 stroke-[3.5] [stroke-dasharray:8_4] animate-pulse"
                      : isEdgeActive
                        ? "stroke-violet-400 stroke-[3]"
                        : "stroke-slate-700/80 stroke-[2]"
                  }`}
                />
                {(isExecuting || mode === "exec") && (
                  <circle r="4" fill="#34d399">
                    <animateMotion path={edgePath} dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Interactive HTML Nodes */}
        <div className="absolute top-0 left-0 w-[5000px] h-[5000px] z-20 pointer-events-auto">
          {nodes.map((node) => (
            <MindMapNodeItem key={node.id} node={node} c={c} />
          ))}
        </div>
      </div>

      {/* Floating Bottom Dock & Minimap */}
      <MindMapDock c={c} />
    </div>
  );
};

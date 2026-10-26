import React from "react";
import { ExternalLink, Lock, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { MapNode } from "./types";
import type { MindMapController } from "./useMindMapController";

interface MindMapNodeItemProps {
  node: MapNode;
  c: MindMapController;
}

export const MindMapNodeItem: React.FC<MindMapNodeItemProps> = ({ node, c }) => {
  const navigate = useNavigate();
  const {
    selectedNodeId,
    setSelectedNodeId,
    mode,
    trainStepIndex,
    isToolInstalled,
    companyName,
    handleNodeMouseDown,
    handleOpenLiveTool,
  } = c;

  const isSelected = selectedNodeId === node.id;
  const isSpotlight = mode === "train" && trainStepIndex === node.stepOrder;
  const isDimmed = mode === "train" && trainStepIndex !== node.stepOrder;
  const installed = isToolInstalled(node.requiredAppSlug);

  return (
    <div
      dir="rtl"
      className={`map-node absolute rounded-2xl border p-4 flex flex-col justify-between shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl w-[304px] bg-slate-900/90 cursor-grab active:cursor-grabbing transition-all duration-200 group ${
        node.color
      } ${
        isSelected
          ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-950 shadow-violet-500/25 scale-[1.03] z-30"
          : "hover:border-slate-600 hover:scale-[1.01]"
      } ${
        isSpotlight
          ? "ring-4 ring-amber-400 shadow-2xl scale-[1.06] z-50 animate-pulse"
          : ""
      } ${isDimmed ? "opacity-20 grayscale-[70%] blur-[0.5px]" : ""}`}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
      }}
      onMouseDown={(e) => handleNodeMouseDown(e, node)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedNodeId(node.id);
      }}
    >
      {/* Left Connection Port (Output Handle) */}
      <div
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)] group-hover:scale-125 transition-transform"
        title="منفذ المخرجات (Output Port)"
      />

      {/* Right Connection Port (Input Handle) */}
      <div
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform"
        title="منفذ المدخلات (Input Port)"
      />

      {/* Top Row: Category badge & step order + App Status */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-black flex items-center justify-center border border-slate-700/80">
            {node.stepOrder}
          </span>
          <span className="text-[10px] font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60">
            {node.badge}
          </span>
        </div>

        {node.requiredAppSlug && (
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-bold transition ${
              installed
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
            }`}
          >
            {installed ? "مفعّل ✅" : "غير مفعّل 🔒"}
          </span>
        )}
      </div>

      {/* Title and Subtitle */}
      <div className="text-xs font-black text-white leading-snug tracking-tight group-hover:text-violet-200 transition">
        {node.title}
      </div>
      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
        {node.subtitle}
      </div>

      {/* Live Metric Badge */}
      {node.liveMetric && (
        <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-400 text-[10px]">{node.liveMetric.label}:</span>
          </div>
          <span className={`font-black ${node.liveMetric.color}`}>{node.liveMetric.value}</span>
        </div>
      )}

      {/* Bottom Row: Actions */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
        {node.liveRoute ? (
          installed ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLiveTool(node.liveRoute);
              }}
              className="flex items-center gap-1 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition font-bold border border-slate-700"
              title="فتح الأداة المفعّلة"
            >
              <span>فتح الأداة</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/marketplace");
                toast.info(`الأداة بحاجة لتفعيل من المتجر لشركة ${companyName || ""}`);
              }}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-100 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 rounded-lg transition font-bold"
              title="غير مفعّلة — اضغط للانتقال للمتجر"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>تفعيل من المتجر</span>
            </button>
          )
        ) : (
          <span className="text-slate-500 font-medium">مسار عمليات</span>
        )}

        {node.hasVideo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.info("تشغيل مشغل الفيديو التعليمي للمتدرب");
            }}
            className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 px-2 py-1 rounded-lg font-bold transition"
          >
            <Video className="w-3 h-3" />
            <span>فيديو الشرح</span>
          </button>
        )}
      </div>
    </div>
  );
};

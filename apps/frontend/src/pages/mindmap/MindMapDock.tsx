import React from "react";
import {
  Boxes,
  ZoomIn,
  ZoomOut,
  Scan,
  Sparkles,
  ExternalLink,
  Trash2,
  Map as MapIcon,
} from "lucide-react";
import { toast } from "sonner";
import { WORKFLOW_STAGES } from "./masterBlueprint";
import type { MindMapController } from "./useMindMapController";

export const MindMapDock: React.FC<{ c: MindMapController }> = ({ c }) => {
  const {
    nodes,
    zoom,
    pan,
    setZoom,
    setPan,
    selectedNodeId,
    isSidePanelOpen,
    setIsSidePanelOpen,
    isMinimapOpen,
    setIsMinimapOpen,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    aiExpandNode,
    deleteSelectedNode,
    handleOpenLiveTool,
  } = c;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <>
      {/* Selected Node Action Context Bar - floating directly above selected node */}
      {selectedNode && (
        <div
          style={{
            position: "absolute",
            left: `${selectedNode.x * zoom + pan.x + 152 * zoom}px`,
            top: `${Math.max(12, selectedNode.y * zoom + pan.y - 52)}px`,
            transform: "translateX(-50%)",
          }}
          className="z-30 bg-slate-900/95 border border-violet-500/80 rounded-2xl shadow-2xl p-1.5 flex items-center gap-1.5 backdrop-blur animate-fade-in pointer-events-auto"
          dir="rtl"
        >
          <button
            onClick={aiExpandNode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-violet-600/20 text-violet-300 hover:bg-violet-600 hover:text-white transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>توسيع بالـ AI</span>
          </button>
          <button
            onClick={() => {
              if (selectedNode.liveRoute) handleOpenLiveTool(selectedNode.liveRoute);
              else toast.success("تم تشغيل الأداة واختبار تنفيذها على السيرفر بنجاح");
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>تشغيل الأداة</span>
          </button>
          <div className="h-4 w-px bg-slate-800 mx-1"></div>
          <button
            onClick={deleteSelectedNode}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Bottom Dock */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 backdrop-blur-2xl bg-slate-900/90 border border-slate-700/70 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] px-3 py-1.5 flex items-center gap-2 pointer-events-auto"
        dir="rtl"
      >
        <button
          onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-lg shadow-violet-600/30 active:scale-95"
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>أدوات السيناريو (17)</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

        <div className="hidden lg:flex items-center gap-1 text-[11px]">
          <button
            onClick={() => {
              handleResetZoom();
              toast.info("عرض دورة التجارة الكاملة");
            }}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-800 transition font-bold"
          >
            الكل
          </button>
          {WORKFLOW_STAGES.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setZoom(0.95);
                setPan({ x: 200 - st.x, y: 150 - st.y });
                toast.info(`التركيز على: ${st.title}`);
              }}
              className={`px-2 py-1 rounded-lg transition hover:bg-slate-800 font-bold ${st.color}`}
            >
              {st.badge}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-800 mx-1"></div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-800 transition"
            title="تكبير"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-bold text-slate-400 w-8 text-center font-mono tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-800 transition"
            title="تصغير"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-800 transition"
            title="إعادة ضبط"
          >
            <Scan className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => setIsMinimapOpen(!isMinimapOpen)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
            isMinimapOpen ? "bg-slate-800 text-violet-400" : "text-slate-500 hover:bg-slate-800"
          }`}
          title="إظهار/إخفاء الخريطة المصغرة"
        >
          <MapIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Minimap */}
      {isMinimapOpen && (
        <div
          className="hidden sm:flex flex-col absolute bottom-5 left-5 z-30 w-44 h-28 backdrop-blur-2xl bg-slate-900/90 border border-slate-700/70 rounded-2xl shadow-2xl p-2 select-none pointer-events-auto"
          dir="rtl"
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1 border-b border-slate-800/80 pb-1">
            <span className="flex items-center gap-1">
              <MapIcon className="w-3 h-3 text-violet-400" />
              <span>خريطة المسار</span>
            </span>
            <span className="text-[9px] text-slate-500 font-normal">{nodes.length} عقدة</span>
          </div>
          <div className="relative flex-1 w-full bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800/60" dir="ltr">
            {WORKFLOW_STAGES.map((st) => (
              <div
                key={`mini-${st.id}`}
                style={{
                  position: "absolute",
                  left: `${(st.x / 2000) * 100}%`,
                  top: `${((st.y + 100) / 900) * 100}%`,
                  width: `${(st.width / 2000) * 100}%`,
                  height: `${(st.height / 900) * 100}%`,
                }}
                className="border border-slate-700/40 bg-slate-800/20 rounded-[2px]"
              />
            ))}
            {nodes.map((n) => (
              <div
                key={`mini-node-${n.id}`}
                style={{
                  position: "absolute",
                  left: `${(n.x / 2000) * 100}%`,
                  top: `${((n.y + 100) / 900) * 100}%`,
                }}
                className={`w-1.5 h-1.5 rounded-full transition-transform ${
                  selectedNodeId === n.id
                    ? "bg-violet-400 scale-150 ring-2 ring-violet-500"
                    : "bg-slate-400"
                }`}
              />
            ))}
            <div
              style={{
                position: "absolute",
                left: `${Math.max(0, Math.min(80, (-pan.x / zoom / 2000) * 100))}%`,
                top: `${Math.max(0, Math.min(70, ((-pan.y / zoom + 100) / 900) * 100))}%`,
                width: `${Math.min(100, (800 / zoom / 2000) * 100)}%`,
                height: `${Math.min(100, (500 / zoom / 900) * 100)}%`,
              }}
              className="border-2 border-violet-400 bg-violet-500/15 rounded pointer-events-none"
            />
          </div>
        </div>
      )}
    </>
  );
};

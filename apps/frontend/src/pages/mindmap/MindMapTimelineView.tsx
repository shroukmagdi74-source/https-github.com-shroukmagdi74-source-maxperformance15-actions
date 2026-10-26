import React from "react";
import { ChevronUp, ChevronDown, ExternalLink, Lock, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WORKFLOW_STAGES } from "./masterBlueprint";
import type { MindMapController } from "./useMindMapController";

export const MindMapTimelineView: React.FC<{ c: MindMapController }> = ({ c }) => {
  const navigate = useNavigate();
  const {
    nodes,
    setViewMode,
    expandedStages,
    toggleStageExpanded,
    isToolInstalled,
    companyName,
    handleOpenLiveTool,
  } = c;

  return (
    <div className="flex-1 w-full overflow-y-auto pt-36 sm:pt-24 pb-20 px-3 sm:px-4 max-w-4xl mx-auto space-y-4" dir="rtl">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between backdrop-blur">
        <div>
          <h3 className="text-sm font-bold text-white">المسار الزمني التنفيذي لدورة التجارة</h3>
          <p className="text-xs text-slate-400 mt-0.5">عرض متوافق مع الموبايل بنسبة 100% يوضح كافة المراحل والعمليات</p>
        </div>
        <button
          onClick={() => setViewMode("canvas")}
          className="flex items-center gap-1 text-xs text-violet-400 bg-violet-950/50 border border-violet-500/40 px-3 py-1.5 rounded-xl font-bold transition hover:bg-violet-900/50"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>عرض الكانفاس</span>
        </button>
      </div>

      {WORKFLOW_STAGES.map((stage) => {
        const stageNodes = nodes.filter((n) => {
          if (stage.id === "stage-plan") {
            return n.stepOrder === 1 || n.stepOrder === 12 || n.category === "calc" || n.category === "training";
          }
          if (stage.id === "stage-creative-store") {
            return n.stepOrder === 2 || n.stepOrder === 3 || n.category === "creative" || n.category === "store";
          }
          if (stage.id === "stage-ads-chat") {
            return n.stepOrder === 4 || n.stepOrder === 5 || n.category === "ads" || n.category === "chat";
          }
          if (stage.id === "stage-ops-warehouse") {
            return n.stepOrder === 6 || n.stepOrder === 7 || n.stepOrder === 8 || n.category === "ops";
          }
          if (stage.id === "stage-finance-growth") {
            return n.stepOrder === 9 || n.stepOrder === 10 || n.stepOrder === 11 || n.category === "finance" || n.category === "growth";
          }
          return false;
        });

        const isExpanded = expandedStages[stage.id] ?? true;

        return (
          <div key={stage.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur overflow-hidden shadow-xl">
            <div
              onClick={() => toggleStageExpanded(stage.id)}
              className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition border-b border-slate-800/60"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-black px-2.5 py-1 rounded-xl bg-slate-950 border ${stage.accentBorder} ${stage.color}`}>
                  {stage.badge}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">{stage.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{stage.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold">{stageNodes.length} أدوات</span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {isExpanded && (
              <div className="p-3 sm:p-4 space-y-3">
                {stageNodes.map((node) => {
                  const installed = isToolInstalled(node.requiredAppSlug);
                  return (
                    <div
                      key={node.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {node.stepOrder}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{node.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                installed
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {installed ? "مفعّل ✅" : "غير مفعّل 🔒"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">{node.subtitle}</p>
                          {node.liveMetric && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span className="text-slate-400">{node.liveMetric.label}:</span>
                              <span className={`font-bold ${node.liveMetric.color}`}>{node.liveMetric.value}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {node.liveRoute &&
                          (installed ? (
                            <button
                              onClick={() => handleOpenLiveTool(node.liveRoute)}
                              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition"
                            >
                              <span>فتح الأداة</span>
                              <ExternalLink className="w-3 h-3 text-emerald-400" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                navigate("/marketplace");
                                toast.info(`الأداة بحاجة لتفعيل من المتجر لشركة ${companyName || ""}`);
                              }}
                              className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                            >
                              <Lock className="w-3 h-3 text-amber-400" />
                              <span>تفعيل</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

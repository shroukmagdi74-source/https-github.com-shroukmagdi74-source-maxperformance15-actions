import React from "react";
import {
  GitBranch,
  Play,
  Sparkles,
  GraduationCap,
  PlayCircle,
  BookOpen,
  Lock,
  CheckCircle2,
  AlertCircle,
  Map as MapIcon,
  ListTree,
} from "lucide-react";
import type { MindMapController } from "./useMindMapController";

export const MindMapHeader: React.FC<{ c: MindMapController }> = ({ c }) => {
  const {
    companyName,
    isMindmapInstalled,
    isInstalling,
    handleInstallMindmap,
    mode,
    switchMode,
    viewMode,
    setViewMode,
    isExecuting,
    runExecutionSimulation,
    handleReloadMasterBlueprint,
  } = c;

  return (
    <header className="absolute top-3 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-6xl pointer-events-auto">
      <div className="backdrop-blur-2xl bg-slate-900/85 border border-slate-700/60 shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-2xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm text-white tracking-wide">الخرائط الذهنية ومسارات العمل</h1>
              {isMindmapInstalled ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-full shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>مفعّل لـ {companyName || "الشركة"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full shadow-sm">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>معاينة (غير مفعّل)</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">دورة التجارة المتكاملة (12 مرحلة تنفيذية • 17 أداة حية)</p>
          </div>
        </div>

        {/* Center: Mode Switcher (Pill Style) */}
        <div className="flex items-center bg-slate-950/80 border border-slate-800 p-1 rounded-xl backdrop-blur">
          <button
            onClick={() => switchMode("plan")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
              mode === "plan"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-[1.02]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>تخطيط</span>
          </button>
          <button
            onClick={() => switchMode("train")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
              mode === "train"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.02]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>تدريب وشرح</span>
          </button>
          <button
            onClick={() => switchMode("exec")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
              mode === "exec"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-[1.02]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>أتمتة وتنفيذ</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Canvas vs Timeline */}
          <button
            onClick={() => setViewMode(viewMode === "canvas" ? "timeline" : "canvas")}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition"
            title={
              viewMode === "canvas"
                ? "التبديل إلى عرض المسار الزمني (مناسب للموبايل)"
                : "التبديل إلى الكانفاس التفاعلي"
            }
          >
            {viewMode === "canvas" ? (
              <>
                <ListTree className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">مسار زمني</span>
              </>
            ) : (
              <>
                <MapIcon className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">كانفاس</span>
              </>
            )}
          </button>

          {/* Blueprint Template Button */}
          <button
            onClick={handleReloadMasterBlueprint}
            title="تحميل دورة التجارة الكاملة"
            className="hidden md:flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>قالب الدورة</span>
          </button>

          {/* Run Button with Glowing Pulse */}
          <button
            onClick={runExecutionSimulation}
            disabled={isExecuting}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 fill-slate-950 ${isExecuting ? "animate-spin" : ""}`} />
            <span>{isExecuting ? "جاري المحاكاة..." : "تشغيل المسار"}</span>
          </button>
        </div>
      </div>

      {/* Floating Unactivated Warning Pill */}
      {!isMindmapInstalled && (
        <div className="mt-2 backdrop-blur-2xl bg-amber-950/90 border border-amber-500/40 rounded-2xl px-4 py-2 flex items-center justify-between gap-4 text-xs shadow-xl animate-fade-in">
          <div className="flex items-center gap-2 text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>وضع المعاينة:</strong> تطبيق الخرائط غير مفعّل لشركة <strong>{companyName || "حسابك"}</strong>. فعّل مجاناً لتشغيل الأتمتة الكاملة.
            </span>
          </div>
          <button
            onClick={() => void handleInstallMindmap()}
            disabled={isInstalling}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-3 py-1 rounded-xl text-xs transition shadow shrink-0 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isInstalling ? "جاري التفعيل..." : "تفعيل مجاناً بنقرة واحدة"}</span>
          </button>
        </div>
      )}
    </header>
  );
};

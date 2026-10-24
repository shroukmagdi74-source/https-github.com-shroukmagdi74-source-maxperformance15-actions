import React from "react";
import { History, Info } from "lucide-react";
import {
  MapNode,
  DrawnEdge,
  TimelineStage,
  NodeStatus,
  STAGES,
  STATUS_META,
} from "./types";

interface LoyaltyMapCanvasProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  nodeRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  edges: DrawnEdge[];
  nodeById: Record<string, MapNode>;
  timelineStages: TimelineStage[];
  setSelectedNode: (node: MapNode) => void;
  setTimelineLog: (tl: TimelineStage) => void;
}

export const LoyaltyMapCanvas: React.FC<LoyaltyMapCanvasProps> = ({
  mapRef,
  nodeRefs,
  edges,
  nodeById,
  timelineStages,
  setSelectedNode,
  setTimelineLog,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            خريطة الأدوات
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            كل عقدة بحجم متساوٍ — اللون يعبر عن الحالة فقط. الأسهم تمثل التدفق الزمني.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="inline-block h-0.5 w-6 rounded bg-slate-400" />
            تدفق زمني
          </span>
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="inline-block h-0.5 w-6 rounded bg-amber-400" />
            حلقة إعادة استهداف
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div ref={mapRef} className="relative min-w-[960px]">
          <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full">
            <defs>
              <marker
                id="loyalty-map-arrow-slate"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L7,3 L0,6 z" fill="#94a3b8" />
              </marker>
              <marker
                id="loyalty-map-arrow-amber"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L7,3 L0,6 z" fill="#f59e0b" />
              </marker>
            </defs>
            {edges.map((e) => (
              <g key={e.id}>
                <path
                  d={e.d}
                  fill="none"
                  stroke={e.color}
                  strokeWidth="1.5"
                  strokeDasharray={e.loop ? "5 4" : undefined}
                  opacity="0.65"
                  markerEnd={e.marker}
                />
                <text
                  x={e.lx}
                  y={e.ly}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#94a3b8"
                >
                  {e.label}
                </text>
              </g>
            ))}
          </svg>
          <div className="relative z-10 grid grid-cols-4 gap-x-5">
            {STAGES.map((stage) => {
              const tl = timelineStages.find((t) => t.id === stage.id);
              return (
                <div key={stage.id} className="space-y-3">
                  <div className="rounded-lg border border-dashed border-gray-300 px-2 py-1.5 dark:border-gray-600">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      <stage.icon className="h-3.5 w-3.5" />
                      {stage.label}
                    </div>
                    {tl && (
                      <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                        <span className="truncate">
                          {tl.date ? `${tl.dateLabel}: ${tl.date}` : tl.note || "غير محدد"}
                        </span>
                        <button
                          onClick={() => setTimelineLog(tl)}
                          title="سجل الأحداث"
                          className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        >
                          <History className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {stage.nodeIds.map((id) => {
                    const node = nodeById[id];
                    if (!node) return null;
                    const sm = STATUS_META[node.status];
                    return (
                      <div
                        key={node.id}
                        ref={(el) => {
                          nodeRefs.current[node.id] = el;
                        }}
                        className={`h-[132px] cursor-pointer rounded-xl border-2 ${sm.border} bg-white p-3 transition-shadow hover:shadow-md dark:bg-gray-800`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedNode(node)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedNode(node);
                          }
                        }}
                      >
                        <div className="flex h-full flex-col">
                          <div className="flex items-center justify-between">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${sm.iconBg}`}
                            >
                              <node.icon className={`h-4 w-4 ${sm.iconFg}`} />
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sm.badge}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />
                              {sm.label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-bold leading-tight text-gray-900 dark:text-gray-100">
                            {node.label}
                          </p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                            {node.summary}
                          </p>
                          {node.chips && node.chips.length > 0 ? (
                            <div className="mt-auto flex flex-wrap gap-1">
                              {node.chips.map((c) => (
                                <span
                                  key={c}
                                  className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          دليل الحالات:
        </span>
        {(["active", "inactive", "warning", "unknown"] as NodeStatus[]).map((s) => (
          <span
            key={s}
            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_META[s].dot}`} />
            {STATUS_META[s].label}
          </span>
        ))}
        <span className="ms-auto flex items-center gap-1.5 text-xs text-gray-400">
          <Info className="h-3.5 w-3.5" />
          كل عقدة = أداة واحدة في قسم العملاء
        </span>
      </div>
    </div>
  );
};

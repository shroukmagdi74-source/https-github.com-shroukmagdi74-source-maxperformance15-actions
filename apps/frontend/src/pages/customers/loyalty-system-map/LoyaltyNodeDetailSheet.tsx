import React from "react";
import { NavigateFunction } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MapNode, NodeDetail, STATUS_META } from "./types";

interface LoyaltyNodeDetailSheetProps {
  selectedNode: MapNode | null;
  setSelectedNode: (node: MapNode | null) => void;
  nodeDetails: Record<string, NodeDetail>;
  navigate: NavigateFunction;
}

export const LoyaltyNodeDetailSheet: React.FC<LoyaltyNodeDetailSheetProps> = ({
  selectedNode,
  setSelectedNode,
  nodeDetails,
  navigate,
}) => {
  return (
    <Sheet open={!!selectedNode} onOpenChange={(o) => !o && setSelectedNode(null)}>
      <SheetContent side="right">
        {selectedNode && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${STATUS_META[selectedNode.status].iconBg}`}
                >
                  <selectedNode.icon className={`h-4 w-4 ${STATUS_META[selectedNode.status].iconFg}`} />
                </span>
                {selectedNode.label}
              </SheetTitle>
              <SheetDescription>{selectedNode.summary}</SheetDescription>
            </SheetHeader>

            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_META[selectedNode.status].badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[selectedNode.status].dot}`} />
                  {STATUS_META[selectedNode.status].label}
                </span>
              </div>

              {nodeDetails[selectedNode.id] && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                    <p className="text-[10px] font-semibold uppercase text-gray-400">
                      العملاء / الحجم
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                      {nodeDetails[selectedNode.id].count}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                    <p className="text-[10px] font-semibold uppercase text-gray-400">
                      آخر نشاط
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                      {nodeDetails[selectedNode.id].lastActivity}
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.chips && selectedNode.chips.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedNode.chips.map((c) => (
                    <span
                      key={c}
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <SheetFooter>
              <button
                onClick={() => {
                  const detail = nodeDetails[selectedNode.id];
                  navigate(detail?.route || selectedNode.route);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700"
              >
                <ExternalLink className="h-4 w-4" />
                افتح الأداة
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

import React from "react";
import { Wand2, Loader2, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MarketingProduct, BatchCountType } from "../types";

interface CreativeStudioTopBarProps {
  selectedProduct: MarketingProduct | null;
  isGenerating: boolean;
  batchCount: BatchCountType;
  selectedModel: string;
  dailyUsage?: number;
  dailyLimit?: number;
  onGenerate: () => void;
  onChangeBatchCount: (count: BatchCountType) => void;
  onOpenModelModal: () => void;
}

export const CreativeStudioTopBar: React.FC<CreativeStudioTopBarProps> = ({
  selectedProduct,
  isGenerating,
  batchCount,
  selectedModel,
  dailyUsage = 0,
  dailyLimit = 50,
  onGenerate,
  onChangeBatchCount,
  onOpenModelModal,
}) => {
  return (
    <div className="p-3 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !selectedProduct}
          className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs active:scale-[0.97] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5 text-indigo-200" />
          )}
          <span>
            {isGenerating
              ? "جاري التوليد..."
              : batchCount > 1
              ? `توليد ${batchCount} تنويعات بالذكاء الاصطناعي`
              : "توليد المشهد بالذكاء الاصطناعي"}
          </span>
        </Button>

        {/* Batch Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          {([1, 2, 4] as const).map((cnt) => (
            <button
              key={cnt}
              type="button"
              onClick={() => onChangeBatchCount(cnt)}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                batchCount === cnt
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title={`توليد ${cnt} ${cnt === 1 ? "صورة" : "تنويعات"}`}
            >
              {cnt}x
            </button>
          ))}
        </div>
      </div>

      {/* Model Selector Trigger & Quota */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenModelModal}
          className="h-7 px-2 text-[11px] font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
          title="فتح معرض نماذج الذكاء الاصطناعي والمواصفات"
        >
          <Cpu className="w-3 h-3" />
          <span className="font-mono">{selectedModel.split("/").pop()}</span>
        </button>

        <div
          className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg"
          title="الرصيد المتبقي لتوليد المشاهد اليوم"
        >
          <span>الرصيد المتبقي:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {Math.max(0, dailyLimit - dailyUsage)}/{dailyLimit}
          </span>
        </div>
      </div>
    </div>
  );
};

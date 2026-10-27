import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { CanvasOverlaySettings, ShadowType } from "../types";

interface CreativePhysicsTabProps {
  overlay: CanvasOverlaySettings;
  onUpdateOverlay: (updates: Partial<CanvasOverlaySettings>) => void;
}

export const CreativePhysicsTab: React.FC<CreativePhysicsTabProps> = ({
  overlay,
  onUpdateOverlay,
}) => {
  const transform = overlay.productTransform || {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    shadowType: "contact" as ShadowType,
  };

  const shadowOptions = [
    {
      id: "contact" as const,
      label: "ظل التماس الأرضي",
      desc: "واقعي تحت أسفل المنتج",
    },
    {
      id: "directional" as const,
      label: "ظل استوديو مائل",
      desc: "يعكس اتجاه الإضاءة",
    },
    {
      id: "subtle" as const,
      label: "ظل محيطي ناعم",
      desc: "خفيف للمنتجات المعلقة",
    },
    { id: "none" as const, label: "بدون ظل", desc: "للكتالوج النقي" },
  ];

  return (
    <div className="space-y-4">
      {/* Shadow Physics Mode */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
          فيزياء الظل (Shadow Physics)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {shadowOptions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                onUpdateOverlay({
                  productTransform: { ...transform, shadowType: s.id },
                })
              }
              className={`p-2.5 rounded-xl border text-right transition cursor-pointer ${
                transform.shadowType === s.id
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="text-xs font-bold">{s.label}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {s.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scale Slider */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300">
            حجم المنتج (Scale)
          </span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
            {Math.round(transform.scale * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={transform.scale}
          onChange={(e) =>
            onUpdateOverlay({
              productTransform: {
                ...transform,
                scale: parseFloat(e.target.value),
              },
            })
          }
          className="w-full accent-indigo-600 cursor-pointer"
        />
      </div>

      {/* Rotation Slider */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300">
            تدوير المنتج (Rotation)
          </span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
            {transform.rotation}°
          </span>
        </div>
        <input
          type="range"
          min="-30"
          max="30"
          step="1"
          value={transform.rotation}
          onChange={(e) =>
            onUpdateOverlay({
              productTransform: {
                ...transform,
                rotation: parseInt(e.target.value, 10),
              },
            })
          }
          className="w-full accent-indigo-600 cursor-pointer"
        />
      </div>

      {/* Reset Position Button */}
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onUpdateOverlay({
              productTransform: {
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                shadowType: "contact",
              },
            })
          }
          className="w-full h-8 text-xs rounded-xl border-slate-200 dark:border-slate-800 cursor-pointer gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة ضبط الموضع والحجم للافتراضي</span>
        </Button>
      </div>
    </div>
  );
};

import React from "react";
import { X, Crown, Trophy, Gem } from "lucide-react";
import { type LoyaltyProgram, TIER_PRESET_PACKS } from "./types";

interface TierPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: LoyaltyProgram[];
  presetProgramId: string;
  setPresetProgramId: (id: string) => void;
  selectedPresetKey: string | null;
  setSelectedPresetKey: (key: string | null) => void;
  onApplyPreset: (e: React.FormEvent) => void;
  isApplyingPreset: boolean;
}

export const TierPresetModal: React.FC<TierPresetModalProps> = ({
  isOpen,
  onClose,
  programs,
  presetProgramId,
  setPresetProgramId,
  selectedPresetKey,
  setSelectedPresetKey,
  onApplyPreset,
  isApplyingPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            قوالب مستويات جاهزة
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={onApplyPreset} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              برنامج الولاء
            </label>
            <select
              value={presetProgramId}
              onChange={(e) => setPresetProgramId(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <option value="">اختر برنامج الولاء</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameAr || p.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              القالب سيُنشئ المستويات بأسمائها وألوانها ومزاياها جاهزة، ويمكنك تعديلها بعد ذلك من هنا.
            </p>
          </div>

          <div className="space-y-3">
            {TIER_PRESET_PACKS.map((pack) => (
              <button
                key={pack.key}
                type="button"
                onClick={() => setSelectedPresetKey(pack.key)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-right ${
                  selectedPresetKey === pack.key
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                }`}
              >
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 shrink-0">
                  {pack.icon === "crown" ? (
                    <Crown className="w-6 h-6" />
                  ) : pack.icon === "trophy" ? (
                    <Trophy className="w-6 h-6" />
                  ) : (
                    <Gem className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {pack.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {pack.description}
                  </div>
                </div>
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {pack.count} مستويات
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
            <button
              type="submit"
              disabled={isApplyingPreset || !presetProgramId || !selectedPresetKey}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg font-bold transition-all shadow-lg shadow-purple-200 dark:shadow-none"
            >
              {isApplyingPreset ? "جاري الإنشاء..." : "إنشاء المستويات"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

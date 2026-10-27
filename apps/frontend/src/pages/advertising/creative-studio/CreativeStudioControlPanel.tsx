import React, { useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { CREATIVE_STUDIO_PRESETS } from "./CreativeStudioPresets";
import { CreativeDirectorSuggestions } from "./CreativeDirectorSuggestions";
import { CreativeAiChatCoPilot } from "./CreativeAiChatCoPilot";
import { CreativeSceneLibraryTab } from "./CreativeSceneLibraryTab";
import {
  CreativeStudioTopBar,
  CreativeStudioTabBar,
  ControlPanelTab,
  CreativePresetsTab,
  CreativePhysicsTab,
  CreativeTypographyTab,
  CreativeAdvancedTab,
} from "./control-panel";
import type {
  AspectRatioType,
  CreativePreset,
  CanvasOverlaySettings,
  MarketingProduct,
  CreativeAngleSuggestion,
  CreativeModality,
  BrandKitSettings,
  BatchCountType,
  SceneLibraryItem,
} from "./types";

interface CreativeStudioControlPanelProps {
  selectedProduct: MarketingProduct | null;
  selectedPresetId: string;
  onSelectPreset: (preset: CreativePreset) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  aspectRatio: AspectRatioType;
  onChangeAspectRatio: (ratio: AspectRatioType) => void;
  overlay: CanvasOverlaySettings;
  onUpdateOverlay: (updates: Partial<CanvasOverlaySettings>) => void;
  customPrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
  onSelectAngle?: (angle: CreativeAngleSuggestion) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  dailyUsage?: number;
  dailyLimit?: number;
  referenceImageUrl: string | null;
  onSetReferenceImageUrl: (url: string | null) => void;
  brandKit: BrandKitSettings;
  onUpdateBrandKit: (updates: Partial<BrandKitSettings>) => void;
  batchCount: BatchCountType;
  onChangeBatchCount: (count: BatchCountType) => void;
  onOpenModelModal: () => void;
  onTriggerGenerateWithPrompt: (prompt: string) => void;
  onSelectScenePreset?: (scene: SceneLibraryItem, autoSwapPrompt: string) => void;
  storeLogoUrl?: string | null;
}

export const CreativeStudioControlPanel: React.FC<CreativeStudioControlPanelProps> = ({
  selectedProduct,
  selectedPresetId,
  onSelectPreset,
  selectedModel,
  onSelectModel,
  overlay,
  onUpdateOverlay,
  customPrompt,
  onChangeCustomPrompt,
  onSelectAngle,
  isGenerating,
  onGenerate,
  dailyUsage = 0,
  dailyLimit = 50,
  referenceImageUrl,
  onSetReferenceImageUrl,
  brandKit,
  onUpdateBrandKit,
  batchCount,
  onChangeBatchCount,
  onOpenModelModal,
  onTriggerGenerateWithPrompt,
  onSelectScenePreset,
  storeLogoUrl,
}) => {
  const [activeTab, setActiveTab] = useState<ControlPanelTab>("COPILOT");
  const [selectedModality, setSelectedModality] = useState<"ALL" | CreativeModality>("ALL");
  const refFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onSetReferenceImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onUpdateOverlay({
            logo: {
              ...(overlay.logo || {
                position: "top-right",
                size: "md",
                opacity: 1,
              }),
              url: reader.result,
              show: true,
            },
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-950/40 border-l border-slate-200/80 dark:border-slate-800 overflow-hidden select-none">
      {/* Top Action Bar */}
      <CreativeStudioTopBar
        selectedProduct={selectedProduct}
        isGenerating={isGenerating}
        batchCount={batchCount}
        selectedModel={selectedModel}
        dailyUsage={dailyUsage}
        dailyLimit={dailyLimit}
        onGenerate={onGenerate}
        onChangeBatchCount={onChangeBatchCount}
        onOpenModelModal={onOpenModelModal}
      />

      {/* Modern Navigation Sub-Tabs */}
      <CreativeStudioTabBar activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Tab Contents */}
      <div
        className={`flex-1 min-h-0 ${
          activeTab === "COPILOT" || activeTab === "LIBRARY"
            ? "overflow-hidden p-0 flex flex-col"
            : "overflow-y-auto p-4 space-y-4"
        }`}
      >
        {activeTab === "COPILOT" && (
          <CreativeAiChatCoPilot
            product={selectedProduct}
            onApplyPrompt={(prompt) => {
              onChangeCustomPrompt(prompt);
            }}
            onTriggerGenerate={(prompt) => {
              onTriggerGenerateWithPrompt(prompt);
            }}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === "DIRECTOR" && (
          <div className="space-y-4">
            {selectedProduct ? (
              <CreativeDirectorSuggestions
                product={selectedProduct}
                onSelectAngle={(angle) => {
                  onChangeCustomPrompt(angle.prompt);
                  if (onSelectAngle) onSelectAngle(angle);
                  const matched = CREATIVE_STUDIO_PRESETS.find(
                    (p) => p.category === angle.modality
                  );
                  if (matched) onSelectPreset(matched);
                }}
                isGenerating={isGenerating}
              />
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                اختر منتجاً من الشريط العلوي ليقوم المخرج الإبداعي باقتراح زوايا تسويقية مخصصة له.
              </div>
            )}
          </div>
        )}

        {activeTab === "LIBRARY" && (
          <CreativeSceneLibraryTab
            productName={selectedProduct?.name || "المنتج التجاري"}
            selectedCategory="shoes"
            onSelectScenePreset={(scene, autoSwapPrompt) => {
              onChangeCustomPrompt(autoSwapPrompt);
              if (onSelectScenePreset) {
                onSelectScenePreset(scene, autoSwapPrompt);
              }
            }}
            onTriggerGenerateWithPrompt={(prompt) => {
              onChangeCustomPrompt(prompt);
              onTriggerGenerateWithPrompt(prompt);
            }}
          />
        )}

        {activeTab === "PRESETS" && (
          <CreativePresetsTab
            referenceImageUrl={referenceImageUrl}
            selectedPresetId={selectedPresetId}
            selectedModality={selectedModality}
            onSetReferenceImageUrl={onSetReferenceImageUrl}
            onSelectModality={setSelectedModality}
            onSelectPreset={onSelectPreset}
            refFileInputRef={refFileInputRef}
            onRefImageUpload={handleRefImageUpload}
          />
        )}

        {activeTab === "PHYSICS" && (
          <CreativePhysicsTab
            overlay={overlay}
            onUpdateOverlay={onUpdateOverlay}
          />
        )}

        {activeTab === "TYPOGRAPHY" && (
          <CreativeTypographyTab
            overlay={overlay}
            onUpdateOverlay={onUpdateOverlay}
            brandKit={brandKit}
            onUpdateBrandKit={onUpdateBrandKit}
            logoFileInputRef={logoFileInputRef}
            onLogoUpload={handleLogoUpload}
            storeLogoUrl={storeLogoUrl}
          />
        )}

        {activeTab === "ADVANCED" && (
          <CreativeAdvancedTab
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
            onOpenModelModal={onOpenModelModal}
            customPrompt={customPrompt}
            onChangeCustomPrompt={onChangeCustomPrompt}
          />
        )}
      </div>
    </div>
  );
};

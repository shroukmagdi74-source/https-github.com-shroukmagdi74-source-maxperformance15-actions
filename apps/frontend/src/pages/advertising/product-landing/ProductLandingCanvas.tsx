import React from "react";
import { Plus } from "lucide-react";
import {
  ProductLandingPage,
  ProductLandingProduct,
  ProductLandingStatus,
} from "../../../services/productLandingPagesService";
import { EditorState, LandingSection } from "./types";
import { LandingQualityIssue } from "./landingQuality";
import { ProductSummaryCard } from "./ProductSummaryCard";
import { LandingQualityPanel } from "./LandingQualityPanel";
import { LandingStylePanel } from "./LandingStylePanel";
import { LandingSeoPanel } from "./LandingSeoPanel";
import { SectionsStackEditor } from "./SectionsStackEditor";

interface ProductLandingCanvasProps {
  mobileTab: "editor" | "preview";
  selectedPage: ProductLandingPage | null;
  selectedProduct: ProductLandingProduct | null;
  editor: EditorState;
  updateEditor: (updater: (current: EditorState) => EditorState) => void;
  setIsDirty: (dirty: boolean) => void;
  onUpdateStatus: (status: ProductLandingStatus) => Promise<void>;
  updatingStatus: boolean;
  onDeletePage: () => Promise<void>;
  deleting: boolean;
  qualityIssues: LandingQualityIssue[];
  activeSectionId: string | null;
  setActiveSectionId: React.Dispatch<React.SetStateAction<string | null>>;
  onMoveSection: (index: number, direction: -1 | 1) => void;
  onReorderSections: (sourceIndex: number, targetIndex: number) => void;
  onDuplicateSection: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onRemoveSection: (id: string) => void;
  onUpdateSectionContent: (id: string, updatedContent: LandingSection["content"]) => void;
  onUpdateSectionVariant: (id: string, variant: string) => void;
  onOpenElementsDrawer: () => void;
}

export const ProductLandingCanvas: React.FC<ProductLandingCanvasProps> = ({
  mobileTab,
  selectedPage,
  selectedProduct,
  editor,
  updateEditor,
  setIsDirty,
  onUpdateStatus,
  updatingStatus,
  onDeletePage,
  deleting,
  qualityIssues,
  activeSectionId,
  setActiveSectionId,
  onMoveSection,
  onReorderSections,
  onDuplicateSection,
  onToggleEnabled,
  onRemoveSection,
  onUpdateSectionContent,
  onUpdateSectionVariant,
  onOpenElementsDrawer,
}) => {
  return (
    <section
      className={`eo-builder-canvas ${mobileTab === "preview" ? "eo-hide-on-mobile" : ""}`}
    >
      <ProductSummaryCard
        page={selectedPage}
        product={selectedProduct}
        title={editor.title}
        onChangeTitle={(val) => {
          updateEditor((c) => ({ ...c, title: val }));
          setIsDirty(true);
        }}
        slug={editor.slug}
        onChangeSlug={(val) => {
          updateEditor((c) => ({ ...c, slug: val }));
          setIsDirty(true);
        }}
        status={editor.status}
        onUpdateStatus={onUpdateStatus}
        updatingStatus={updatingStatus}
        onDeletePage={onDeletePage}
        deleting={deleting}
      />

      {/* فحص الجودة قبل النشر — المانعات بتتقفل هنا وفي بوابة الباكند */}
      <LandingQualityPanel issues={qualityIssues} />

      <LandingStylePanel
        style={editor.style}
        onChange={(style) => {
          updateEditor((c) => ({ ...c, style }));
          setIsDirty(true);
        }}
      />

      <LandingSeoPanel
        seo={editor.seo}
        productImage={selectedProduct?.mainImage || ""}
        onChange={(seo) => {
          updateEditor((c) => ({ ...c, seo }));
          setIsDirty(true);
        }}
      />

      <SectionsStackEditor
        sections={editor.sections}
        activeSectionId={activeSectionId}
        onToggleActiveSection={(id) =>
          setActiveSectionId((current) => (current === id ? null : id))
        }
        onMoveSection={onMoveSection}
        onReorderSections={onReorderSections}
        onDuplicateSection={onDuplicateSection}
        onToggleEnabled={onToggleEnabled}
        onRemoveSection={onRemoveSection}
        onUpdateSectionContent={onUpdateSectionContent}
        onUpdateSectionVariant={onUpdateSectionVariant}
        product={selectedProduct}
      />

      {/* Mobile Quick Add Section Button */}
      <div className="eo-mobile-bottom-add-bar">
        <button
          type="button"
          className="eo-btn eo-btn-add-section-full"
          onClick={onOpenElementsDrawer}
        >
          <Plus size={16} />
          <span>+ إضافة عنصر جديد إلى هذه الصفحة</span>
        </button>
      </div>
    </section>
  );
};

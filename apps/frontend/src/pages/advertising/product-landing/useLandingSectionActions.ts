import React from "react";
import { toast } from "sonner";
import {
  ProductLandingProduct,
  SectionType,
} from "../../../services/productLandingPagesService";
import {
  EditorState,
  LandingSection,
  LandingTemplate,
  exportLandingPageToJson,
  importLandingPageFromJson,
} from "./types";
import { createDefaultSection } from "./sectionDefaults";

interface UseLandingSectionActionsProps {
  editor: EditorState;
  updateEditor: (updater: (current: EditorState) => EditorState) => void;
  setIsDirty: (dirty: boolean) => void;
  activeSectionId: string | null;
  setActiveSectionId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedProduct: ProductLandingProduct | null;
  selectedPageTitle?: string;
  selectedPageSlug?: string;
}

export function useLandingSectionActions({
  editor,
  updateEditor,
  setIsDirty,
  activeSectionId,
  setActiveSectionId,
  selectedProduct,
  selectedPageTitle,
  selectedPageSlug,
}: UseLandingSectionActionsProps) {
  const handleAddSection = (type: SectionType) => {
    const newSec = createDefaultSection(type, selectedProduct);
    updateEditor((current) => ({
      ...current,
      sections: [...current.sections, newSec],
    }));
    setActiveSectionId(newSec.id);
    setIsDirty(true);
    toast.success(`تمت إضافة: ${newSec.title}`);
  };

  const handleMoveSection = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= editor.sections.length) return;

    updateEditor((current) => {
      const nextSections = [...current.sections];
      const temp = nextSections[index];
      nextSections[index] = nextSections[targetIndex];
      nextSections[targetIndex] = temp;
      return { ...current, sections: nextSections };
    });
    setIsDirty(true);
  };

  const handleReorderSections = (sourceIndex: number, targetIndex: number) => {
    if (
      sourceIndex < 0 ||
      sourceIndex >= editor.sections.length ||
      targetIndex < 0 ||
      targetIndex >= editor.sections.length ||
      sourceIndex === targetIndex
    ) {
      return;
    }

    updateEditor((current) => {
      const nextSections = [...current.sections];
      const [moved] = nextSections.splice(sourceIndex, 1);
      nextSections.splice(targetIndex, 0, moved);
      return { ...current, sections: nextSections };
    });
    setIsDirty(true);
  };

  const handleDuplicateSection = (id: string) => {
    const sec = editor.sections.find((s) => s.id === id);
    if (!sec) return;
    const duplicated: LandingSection = {
      ...sec,
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${sec.title} (نسخة)`,
      content: JSON.parse(JSON.stringify(sec.content || {})),
    };
    const index = editor.sections.findIndex((s) => s.id === id);
    const next = [...editor.sections];
    next.splice(index + 1, 0, duplicated);
    updateEditor((current) => ({ ...current, sections: next }));
    setActiveSectionId(duplicated.id);
    setIsDirty(true);
    toast.success(`تم تكرار قسم: ${sec.title}`);
  };

  const handleToggleSectionEnabled = (id: string) => {
    updateEditor((current) => ({
      ...current,
      sections: current.sections.map((sec) =>
        sec.id === id ? { ...sec, enabled: sec.enabled === false } : sec,
      ),
    }));
    setIsDirty(true);
  };

  const handleRemoveSection = (id: string) => {
    updateEditor((current) => ({
      ...current,
      sections: current.sections.filter((sec) => sec.id !== id),
    }));
    if (activeSectionId === id) setActiveSectionId(null);
    setIsDirty(true);
    toast.info("تم حذف القسم");
  };

  const handleExportJson = () => {
    const jsonStr = exportLandingPageToJson(
      editor.title || selectedPageTitle || "",
      editor.slug || selectedPageSlug || "",
      editor.sections,
      editor.formConfig,
    );
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `landing-${editor.slug || "page"}-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("تم تصدير تصميم الصفحة كملف JSON بنجاح! 📥");
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const imported = importLandingPageFromJson(text);
        if (!imported.sections || imported.sections.length === 0) {
          toast.error("الملف لا يحتوي على أي أقسام صالحة");
          return;
        }
        updateEditor((current) => ({
          ...current,
          title: imported.title || current.title,
          slug: imported.slug || current.slug,
          sections: imported.sections,
          formConfig: imported.formConfig || current.formConfig,
        }));
        if (imported.sections.length > 0) {
          setActiveSectionId(imported.sections[0].id);
        }
        setIsDirty(true);
        toast.success(`تم استيراد ${imported.sections.length} أقسام من ملف JSON بنجاح! 🚀`);
      } catch {
        toast.error("فشل قراءة ملف JSON — تأكد من صحة الملف");
      }
    };
    reader.readAsText(file);
  };

  const handleApplyTemplate = (template: LandingTemplate) => {
    const newSections = template.buildSections(selectedProduct);
    updateEditor((current) => ({
      ...current,
      sections: newSections,
    }));
    if (newSections.length > 0) {
      setActiveSectionId(newSections[0].id);
    }
    setIsDirty(true);
    toast.success(`تم تطبيق قالب "${template.name}" بنجاح! ✨`);
  };

  const handleUpdateSectionContent = (
    id: string,
    updatedContent: LandingSection["content"],
  ) => {
    updateEditor((current) => ({
      ...current,
      sections: current.sections.map((sec) =>
        sec.id === id ? { ...sec, content: updatedContent } : sec,
      ),
    }));
    setIsDirty(true);
  };

  const handleUpdateSectionVariant = (id: string, variant: string) => {
    updateEditor((current) => ({
      ...current,
      sections: current.sections.map((sec) =>
        sec.id === id ? { ...sec, variant } : sec,
      ),
    }));
    setIsDirty(true);
  };

  return {
    handleAddSection,
    handleMoveSection,
    handleReorderSections,
    handleDuplicateSection,
    handleToggleSectionEnabled,
    handleRemoveSection,
    handleExportJson,
    handleImportJson,
    handleApplyTemplate,
    handleUpdateSectionContent,
    handleUpdateSectionVariant,
  };
}

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ProductLandingPage,
  ProductLandingProduct,
  ProductLandingStatus,
  productLandingPagesService,
} from "../../../services/productLandingPagesService";
import { EditorState, buildDefaultSectionsForProduct } from "./types";
import { LandingQualityIssue, hasCriticalLandingIssues } from "./landingQuality";

interface UseLandingPageMutationsProps {
  selectedPage: ProductLandingPage | null;
  pages: ProductLandingPage[];
  setPages: React.Dispatch<React.SetStateAction<ProductLandingPage[]>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string>>;
  products: ProductLandingProduct[];
  editor: EditorState;
  updateEditor: (updater: (current: EditorState) => EditorState) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  qualityIssues: LandingQualityIssue[];
}

export function useLandingPageMutations({
  selectedPage,
  pages,
  setPages,
  setSelectedId,
  products,
  editor,
  updateEditor,
  isDirty,
  setIsDirty,
  qualityIssues,
}: UseLandingPageMutationsProps) {
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [saveTick, setSaveTick] = useState(0);

  const handleSave = async (silent = false) => {
    if (!selectedPage || saving) return;

    try {
      setSaving(true);
      const updated = await productLandingPagesService.update(selectedPage.id, {
        title: editor.title,
        slug: editor.slug,
        status: editor.status,
        designNotes: editor.designNotes,
        formConfig: {
          ...editor.formConfig,
          sections: editor.sections,
        },
        sections: editor.sections,
        slices: editor.slices,
        style: editor.style,
        seo: editor.seo,
      });

      if (!updated) {
        throw new Error("لم يتم حفظ الصفحة");
      }

      setPages((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setIsDirty(false);
      setSaveTick((tick) => tick + 1);
      if (!silent) {
        toast.success("تم حفظ كافة أقسام وبيانات الصفحة بنجاح! 🎉");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ الصفحة");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;
  useEffect(() => {
    if (!isDirty || !selectedPage) return;
    const timer = window.setTimeout(() => {
      void handleSaveRef.current(true);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [editor, isDirty, selectedPage]);

  const handleUpdateStatus = async (status: ProductLandingStatus) => {
    if (!selectedPage) return;

    if (status === "PUBLISHED" && hasCriticalLandingIssues(qualityIssues)) {
      const blocker = qualityIssues.find((i) => i.severity === "critical");
      toast.error(`ممنوع النشر: ${blocker?.label ?? "محتوى غير صالح"}`);
      return;
    }

    try {
      setUpdatingStatus(true);
      const updated = await productLandingPagesService.updateStatus(
        selectedPage.id,
        status,
      );

      if (!updated) {
        throw new Error("لم يتم تحديث الحالة");
      }

      setPages((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      updateEditor((current) => ({ ...current, status: updated.status }));
      toast.success(
        status === "PUBLISHED"
          ? "تم نشر صفحة الهبوط بنجاح! 🚀"
          : "تم إيقاف صفحة الهبوط مؤقتاً ⏸️",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحديث الحالة");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeletePage = async () => {
    if (!selectedPage) return;

    try {
      setDeleting(true);
      await productLandingPagesService.delete(selectedPage.id);
      toast.success("تم حذف صفحة الهبوط بنجاح 🗑️");
      const nextPages = pages.filter((p) => p.id !== selectedPage.id);
      setPages(nextPages);
      setSelectedId(nextPages[0]?.id || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حذف الصفحة");
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateAi = async () => {
    if (!selectedPage) return;

    try {
      setGeneratingAi(true);
      const result = await productLandingPagesService.generateAiContent(
        selectedPage.id,
      );

      if (result) {
        setPages((current) =>
          current.map((item) => (item.id === result.id ? result : item)),
        );
        toast.success("تم توليد محتوى الصفحة المخصص بالذكاء الاصطناعي بنجاح! ✨");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "تعذر التوليد بالذكاء الاصطناعي",
      );
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleCreatePage = async (payload: {
    productId: string;
    title: string;
    slug: string;
  }) => {
    try {
      setCreating(true);
      const prod = products.find((p) => p.id === payload.productId);
      const initialSections = buildDefaultSectionsForProduct(prod);

      const created = await productLandingPagesService.create({
        productId: payload.productId,
        title: payload.title,
        slug: payload.slug,
        sections: initialSections,
        formConfig: {
          sections: initialSections,
        },
      });

      if (!created) {
        throw new Error("لم يتم إنشاء الصفحة");
      }

      setPages((current) => [created, ...current]);
      setSelectedId(created.id);
      toast.success("تم إنشاء صفحة الهبوط الجديدة بنجاح! 🎉");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر إنشاء صفحة الهبوط",
      );
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return {
    saving,
    creating,
    deleting,
    generatingAi,
    updatingStatus,
    saveTick,
    handleSave,
    handleUpdateStatus,
    handleDeletePage,
    handleGenerateAi,
    handleCreatePage,
  };
}

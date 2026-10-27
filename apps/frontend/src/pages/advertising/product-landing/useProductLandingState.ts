import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ProductLandingPage,
  ProductLandingProduct,
  productLandingPagesService,
} from "../../../services/productLandingPagesService";
import {
  DEFAULT_EDITOR,
  EditorState,
  buildDefaultSectionsForProduct,
} from "./types";
import { getLandingQualityIssues } from "./landingQuality";
import {
  useEditorHistory,
  useUndoKeyboardShortcuts,
} from "./useEditorHistory";
import { useAuth } from "../../../hooks/useAuthSimple";
import { buildStoreUrl } from "../../../utils/storeUrl";
import { useLandingSectionActions } from "./useLandingSectionActions";
import { useLandingPageMutations } from "./useLandingPageMutations";

export function useProductLandingState() {
  const [pages, setPages] = useState<ProductLandingPage[]>([]);
  const [products, setProducts] = useState<ProductLandingProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const {
    editor,
    updateEditor,
    undo,
    redo,
    resetEditor,
    canUndo,
    canRedo,
  } = useEditorHistory<EditorState>(DEFAULT_EDITOR);
  useUndoKeyboardShortcuts(undo, redo);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [showPhonePreview, setShowPhonePreview] = useState(true);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [isElementsDrawerOpen, setIsElementsDrawerOpen] = useState(false);

  const { user } = useAuth();
  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedId) || null,
    [pages, selectedId],
  );
  const selectedProduct = selectedPage?.product || null;

  const liveSlug = selectedPage?.slug || "";
  const companySlug = user?.company?.slug || "";
  const customDomain = user?.company?.customDomain || "";
  const companyId = user?.companyId || user?.company?.id || selectedPage?.companyId;

  const customerUrl = useMemo(() => {
    if (!liveSlug) return "";
    return buildStoreUrl(
      companySlug,
      `/store/lp/${liveSlug}`,
      customDomain || undefined,
      companyId,
    );
  }, [liveSlug, companySlug, customDomain, companyId]);

  const previewUrl = useMemo(() => {
    if (!customerUrl) return "";
    return selectedPage?.status === "PUBLISHED" ? customerUrl : `${customerUrl}?preview=1`;
  }, [customerUrl, selectedPage?.status]);

  const qualityIssues = useMemo(() => getLandingQualityIssues(editor), [editor]);

  const mutations = useLandingPageMutations({
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
  });

  const previewRefreshToken = useMemo(
    () =>
      `${mutations.saveTick}::${JSON.stringify([
        editor.title,
        editor.slug,
        editor.status,
        editor.style,
        editor.seo,
        editor.formConfig,
        editor.sections?.map((s) => [s.id, s.enabled, s.variant, s.title]),
      ])}`,
    [
      mutations.saveTick,
      editor.title,
      editor.slug,
      editor.status,
      editor.style,
      editor.seo,
      editor.formConfig,
      editor.sections,
    ],
  );

  const loadPages = useCallback(async () => {
    try {
      setLoadingPages(true);
      const data = await productLandingPagesService.list();
      setPages(data);
      setSelectedId((current) => current || data[0]?.id || "");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر تحميل صفحات الهبوط",
      );
    } finally {
      setLoadingPages(false);
    }
  }, []);

  const loadProducts = useCallback(async (search = "") => {
    try {
      setLoadingProducts(true);
      const data = await productLandingPagesService.listProducts({
        search,
        limit: 30,
      });
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
    loadProducts();
  }, [loadPages, loadProducts]);

  useEffect(() => {
    if (selectedPage) {
      const savedSections =
        Array.isArray(selectedPage.sections) && selectedPage.sections.length > 0
          ? selectedPage.sections
          : Array.isArray(selectedPage.formConfig?.sections) &&
              selectedPage.formConfig!.sections!.length > 0
            ? selectedPage.formConfig!.sections!
            : buildDefaultSectionsForProduct(selectedPage.product);

      resetEditor({
        title: selectedPage.title || "",
        slug: selectedPage.slug || "",
        status: selectedPage.status || "DRAFT",
        designNotes: selectedPage.designNotes || "",
        formConfig: {
          orderKicker: selectedPage.formConfig?.orderKicker || "نموذج الطلب",
          orderTitle:
            selectedPage.formConfig?.orderTitle ||
            (selectedPage.product?.name
              ? `اطلب ${selectedPage.product.name}`
              : "اطلب المنتج الآن"),
          orderCopy:
            selectedPage.formConfig?.orderCopy ||
            "املأ البيانات الأساسية وسيتم التواصل معك لتأكيد الطلب.",
          buttonLabel:
            selectedPage.formConfig?.buttonLabel || "تأكيد الطلب الآن",
        },
        slices: Array.isArray(selectedPage.slices) ? selectedPage.slices : [],
        sections: savedSections,
        style: selectedPage.style || {},
        seo: selectedPage.seo || {},
      });
      setActiveSectionId(savedSections[0]?.id || null);
      setIsDirty(false);
    }
  }, [selectedPage, resetEditor]);

  const sectionActions = useLandingSectionActions({
    editor,
    updateEditor,
    setIsDirty,
    activeSectionId,
    setActiveSectionId,
    selectedProduct,
    selectedPageTitle: selectedPage?.title,
    selectedPageSlug: selectedPage?.slug,
  });

  const handleCopyUrl = async () => {
    if (!customerUrl) return;
    await navigator.clipboard.writeText(customerUrl);
    toast.success("تم نسخ رابط صفحة الهبوط! 📋");
  };

  return {
    pages,
    products,
    selectedId,
    setSelectedId,
    selectedPage,
    selectedProduct,
    editor,
    updateEditor,
    undo,
    redo,
    canUndo,
    canRedo,
    activeSectionId,
    setActiveSectionId,
    loadingPages,
    loadingProducts,
    saving: mutations.saving,
    creating: mutations.creating,
    deleting: mutations.deleting,
    isDirty,
    setIsDirty,
    generatingAi: mutations.generatingAi,
    updatingStatus: mutations.updatingStatus,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isTemplatesModalOpen,
    setIsTemplatesModalOpen,
    showPhonePreview,
    setShowPhonePreview,
    mobileTab,
    setMobileTab,
    isElementsDrawerOpen,
    setIsElementsDrawerOpen,
    companyId,
    customerUrl,
    previewUrl,
    previewRefreshToken,
    qualityIssues,
    loadPages,
    loadProducts,
    handleAddSection: sectionActions.handleAddSection,
    handleMoveSection: sectionActions.handleMoveSection,
    handleReorderSections: sectionActions.handleReorderSections,
    handleDuplicateSection: sectionActions.handleDuplicateSection,
    handleToggleSectionEnabled: sectionActions.handleToggleSectionEnabled,
    handleRemoveSection: sectionActions.handleRemoveSection,
    handleExportJson: sectionActions.handleExportJson,
    handleImportJson: sectionActions.handleImportJson,
    handleApplyTemplate: sectionActions.handleApplyTemplate,
    handleUpdateSectionContent: sectionActions.handleUpdateSectionContent,
    handleUpdateSectionVariant: sectionActions.handleUpdateSectionVariant,
    handleSave: mutations.handleSave,
    handleUpdateStatus: mutations.handleUpdateStatus,
    handleDeletePage: mutations.handleDeletePage,
    handleGenerateAi: mutations.handleGenerateAi,
    handleCreatePage: mutations.handleCreatePage,
    handleCopyUrl,
  };
}

import React from 'react';
import { FileText, Globe, Loader2, Sparkles, X } from 'lucide-react';
import RichTextEditor from '../../../components/RichTextEditor';
import { PAGE_TYPE_CONFIG } from './pageTypeConfig';
import type { PageFormData, PageTypeKey } from './types';

interface StorePageEditorModalProps {
  isOpen: boolean;
  isEditing: boolean;
  saving: boolean;
  formData: PageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PageFormData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  translate: (key: string, options?: any) => string;
}

export const StorePageEditorModal: React.FC<StorePageEditorModalProps> = ({
  isOpen,
  isEditing,
  saving,
  formData,
  setFormData,
  onClose,
  onSubmit,
  translate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-start">
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border/70 bg-card text-foreground shadow-2xl transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <FileText className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {isEditing
                    ? translate('storePages.modalEditTitle')
                    : translate('storePages.modalCreateTitle')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isEditing
                    ? translate('storePages.modalEditDesc')
                    : translate('storePages.modalCreateDesc')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Form */}
          <form id="store-page-form" onSubmit={onSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  {translate('storePages.formTitle')} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={translate('storePages.formTitlePlaceholder')}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  {translate('storePages.formPageType')}
                </label>
                <select
                  value={formData.pageType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pageType: e.target.value as PageTypeKey }))
                  }
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.entries(PAGE_TYPE_CONFIG).map(([key, item]) => (
                    <option key={key} value={key}>
                      {translate(`storePages.${item.labelKey}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  {translate('storePages.formSlug')} <span className="text-destructive">*</span>
                </label>
                <div className="flex rounded-lg border border-border/60 bg-background overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <span
                    className="flex select-none items-center bg-muted/40 px-3 text-xs font-mono text-muted-foreground border-r border-border/50"
                    dir="ltr"
                  >
                    {translate('storePages.formSlugPrefix')}
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      }))
                    }
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                    placeholder="privacy-policy"
                    dir="ltr"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {translate('storePages.formSlugDesc')}
                </p>
              </div>
            </div>

            {/* Rich Content Editor */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {translate('storePages.formContent')}
              </label>
              <div className="rounded-lg border border-border/60 overflow-hidden bg-background">
                <RichTextEditor
                  value={formData.content}
                  onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                  placeholder={translate('storePages.formContentPlaceholder')}
                />
              </div>
            </div>

            {/* SEO Metadata Box */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Globe className="size-3.5 text-primary" />
                <span>{translate('storePages.formSeoTitle')}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                    {translate('storePages.formMetaTitle')}
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                    {translate('storePages.formMetaDescription')}
                  </label>
                  <input
                    type="text"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-card p-3 shadow-2xs hover:bg-muted/30">
                <div>
                  <span className="block text-xs font-bold text-foreground">
                    {translate('storePages.formPublishStatus')}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {translate('storePages.formPublishDesc')}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-card p-3 shadow-2xs hover:bg-muted/30">
                <div>
                  <span className="block text-xs font-bold text-foreground">
                    {translate('storePages.formFooter')}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {translate('storePages.formFooterDesc')}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showInFooter}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, showInFooter: e.target.checked }))
                  }
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
              </label>
            </div>
          </form>

          {/* Modal Footer */}
          <div className="flex flex-row-reverse items-center gap-2 border-t border-border/50 bg-muted/20 px-5 py-3.5 sm:px-6">
            <button
              type="submit"
              form="store-page-form"
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary/90 disabled:opacity-50 active:scale-95"
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              <span>
                {isEditing
                  ? translate('storePages.formSubmitUpdate')
                  : translate('storePages.formSubmitCreate')}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/60 active:scale-95"
            >
              {translate('storePages.formCancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

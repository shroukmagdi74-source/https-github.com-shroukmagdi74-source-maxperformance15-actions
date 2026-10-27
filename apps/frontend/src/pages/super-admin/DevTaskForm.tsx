import React from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../../i18n';
import { ArrowRight, Sparkles, Pencil, X } from 'lucide-react';
import {
  useDevTaskForm,
  DevTaskBasicCard,
  DevTaskBusinessCriteriaCard,
  DevTaskChecklistCard,
  DevTaskRelatedLinksCard,
  DevTaskSidebar,
} from './dev-task-form';

const DevTaskForm: React.FC = () => {
  const navigate = useNavigate();

  const {
    id,
    isEdit,
    loading,
    saving,
    error,
    projects,
    teamMembers,
    releases,
    formData,
    setFormData,
    settings,
    watchers,
    setWatchers,
    checklistItems,
    setChecklistItems,
    selectedImages,
    imagePreviews,
    existingImages,
    imageBlobUrls,
    newLinkTitle,
    setNewLinkTitle,
    newLinkUrl,
    setNewLinkUrl,
    derivedComponentOptions,
    handleChange,
    handleImageChange,
    removeImage,
    removeExistingImage,
    handleSubmit,
  } = useDevTaskForm();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={i18n.dir()}>
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors border border-border"
            aria-label="رجوع"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                {isEdit ? <Pencil className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              </div>
              <span>{isEdit ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}</span>
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              {isEdit
                ? `تحديث بيانات المهمة #${id?.slice(0, 8)}`
                : 'أضف مهمة جديدة إلى خطة التطوير والمشاريع'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content (8 cols) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 p-3.5 rounded-xl flex items-center gap-2">
                  <X className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-destructive text-xs font-medium">{error}</p>
                </div>
              )}

              <DevTaskBasicCard
                formData={formData}
                handleChange={handleChange}
                existingImages={existingImages}
                selectedImages={selectedImages}
                imagePreviews={imagePreviews}
                imageBlobUrls={imageBlobUrls}
                handleImageChange={handleImageChange}
                removeImage={removeImage}
                removeExistingImage={removeExistingImage}
              />

              <DevTaskBusinessCriteriaCard
                formData={formData}
                handleChange={handleChange}
              />

              <DevTaskChecklistCard
                checklistItems={checklistItems}
                setChecklistItems={setChecklistItems}
              />

              <DevTaskRelatedLinksCard
                formData={formData}
                setFormData={setFormData}
                newLinkTitle={newLinkTitle}
                setNewLinkTitle={setNewLinkTitle}
                newLinkUrl={newLinkUrl}
                setNewLinkUrl={setNewLinkUrl}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : isEdit ? (
                  'حفظ التعديلات'
                ) : (
                  'إنشاء المهمة'
                )}
              </button>
            </div>
          </div>

          {/* Sidebar (4 cols) */}
          <div className="col-span-12 lg:col-span-4">
            <DevTaskSidebar
              formData={formData}
              handleChange={handleChange}
              settings={settings}
              teamMembers={teamMembers}
              projects={projects}
              releases={releases}
              watchers={watchers}
              setWatchers={setWatchers}
              derivedComponentOptions={derivedComponentOptions}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default DevTaskForm;

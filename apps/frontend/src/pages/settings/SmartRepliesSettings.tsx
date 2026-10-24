import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckIcon } from "@heroicons/react/24/outline";
import {
  SmartRepliesHeader,
  SmartRepliesToggleCard,
  SmartReplyTemplateList,
  useSmartRepliesSettingsController,
} from "./smart-replies";

const SmartRepliesSettings: React.FC = () => {
  const navigate = useNavigate();
  const {
    t,
    loading,
    saving,
    settings,
    editingId,
    editingTemplate,
    newKeyword,
    setNewKeyword,
    expandedResponses,
    templatesContainerRef,
    handleSave,
    handleToggleEnable,
    handleToggleGlobalChannel,
    handleToggleTemplateChannel,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    handleDelete,
    handleAddTemplate,
    handleAddKeyword,
    handleRemoveKeyword,
    handleResponseChange,
    handleAddResponse,
    handleRemoveResponse,
    toggleExpand,
    updateEditingTemplate,
  } = useSmartRepliesSettingsController();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("smartReplies.loading") || "جاري التحميل..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-5xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 pb-32 sm:pb-12"
      dir="rtl"
    >
      <SmartRepliesHeader
        onBack={() => navigate("/settings")}
        onAddTemplate={handleAddTemplate}
      />

      <div className="space-y-4 sm:space-y-6">
        <SmartRepliesToggleCard
          enabled={settings.enabled}
          channels={settings.channels}
          saving={saving}
          onToggleEnable={handleToggleEnable}
          onToggleChannel={handleToggleGlobalChannel}
        />

        <SmartReplyTemplateList
          templates={settings.templates}
          editingId={editingId}
          editingTemplate={editingTemplate}
          newKeyword={newKeyword}
          saving={saving}
          expandedResponses={expandedResponses}
          containerRef={templatesContainerRef}
          onAddTemplate={handleAddTemplate}
          onEditStart={handleEditStart}
          onEditCancel={handleEditCancel}
          onEditSave={handleEditSave}
          onDelete={handleDelete}
          onUpdateTemplate={updateEditingTemplate}
          onNewKeywordChange={setNewKeyword}
          onAddKeyword={handleAddKeyword}
          onRemoveKeyword={handleRemoveKeyword}
          onResponseChange={handleResponseChange}
          onAddResponse={handleAddResponse}
          onRemoveResponse={handleRemoveResponse}
          onToggleTemplateChannel={handleToggleTemplateChannel}
          onToggleExpand={toggleExpand}
        />

        {!editingId && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-97 disabled:opacity-50 text-white rounded-xl text-sm sm:text-base font-bold transition-all shadow-xs cursor-pointer"
            >
              <CheckIcon className="h-5 w-5" />
              <span>
                {saving
                  ? t("smartReplies.saving") || "جاري الحفظ..."
                  : t("smartReplies.save") || "حفظ جميع الإعدادات"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartRepliesSettings;

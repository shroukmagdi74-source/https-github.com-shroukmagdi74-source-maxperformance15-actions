import React from "react";
import {
  useTaskTemplates,
  TaskTemplatesHeader,
  TaskTemplatesEmptyState,
  TaskTemplateCard,
  CreateTemplateModal,
  EditTemplateModal,
} from "./templates";

const TaskTemplates: React.FC = () => {
  const {
    templates,
    loading,
    projects,
    categories,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingTemplate,
    setEditingTemplate,
    newTemplate,
    setNewTemplate,
    tagInput,
    setTagInput,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    resetForm,
    addTag,
    removeTag,
  } = useTaskTemplates();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <TaskTemplatesHeader onOpenCreateModal={() => setShowCreateModal(true)} />

      {/* Templates Grid or Empty State */}
      {templates.length === 0 ? (
        <TaskTemplatesEmptyState onOpenCreateModal={() => setShowCreateModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TaskTemplateCard
              key={template.id}
              template={template}
              onUse={useTemplate}
              onEdit={(t) => {
                setEditingTemplate(t);
                setShowEditModal(true);
              }}
              onDelete={deleteTemplate}
            />
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        newTemplate={newTemplate}
        setNewTemplate={setNewTemplate}
        projects={projects}
        categories={categories}
        tagInput={tagInput}
        setTagInput={setTagInput}
        addTag={addTag}
        removeTag={removeTag}
        onCreate={createTemplate}
      />

      {/* Edit Template Modal */}
      <EditTemplateModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTemplate(null);
        }}
        editingTemplate={editingTemplate}
        setEditingTemplate={setEditingTemplate}
        onUpdate={updateTemplate}
      />
    </div>
  );
};

export default TaskTemplates;
export * from "./templates";

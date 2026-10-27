import React, { useState, useMemo } from "react";
import {
  CubeTransparentIcon,
  PlusIcon,
  ArrowPathIcon,
  TrashIcon,
  XMarkIcon,
  LinkSlashIcon,
  PencilSquareIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { StudioGlobalComponent } from "../StudioTypes";
import { countComponentUsage } from "../utils/resolveComponentInstance";

export interface StudioGlobalComponentsPanelProps {
  globalComponents?: StudioGlobalComponent[];
  selectedSectionKey?: string;
  selectedSectionConfig?: any;
  activePageKey?: string;
  allPages?: Record<string, { sections?: any[] }>;
  onCreateComponent?: (name?: string, section?: any) => StudioGlobalComponent | null;
  onInsertInstance?: (componentId: string, insertAtIndex?: number) => void;
  onEditMaster?: (componentId: string) => void;
  onUpdateMaster?: (componentId: string, updates: Partial<StudioGlobalComponent>) => void;
  onDetachInstance?: (sectionKey?: string) => void;
  onDeleteComponent?: (componentId: string, force?: boolean) => boolean | void;
  onClose?: () => void;
}

export const StudioGlobalComponentsPanel: React.FC<StudioGlobalComponentsPanelProps> = ({
  globalComponents = [],
  selectedSectionKey,
  selectedSectionConfig,
  allPages,
  onCreateComponent,
  onInsertInstance,
  onEditMaster,
  onUpdateMaster,
  onDetachInstance,
  onDeleteComponent,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newComponentName, setNewComponentName] = useState("");
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isSelectedSectionInstance = Boolean(
    selectedSectionConfig &&
      typeof selectedSectionConfig === "object" &&
      selectedSectionConfig.type === "componentInstance"
  );

  const instanceComponentId = isSelectedSectionInstance
    ? selectedSectionConfig.componentId || selectedSectionConfig.settings?.componentId
    : null;

  const currentInstanceMaster = useMemo(() => {
    if (!instanceComponentId) return null;
    return globalComponents.find((c) => c.id === instanceComponentId) || null;
  }, [instanceComponentId, globalComponents]);

  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return globalComponents;
    const q = searchQuery.toLowerCase();
    return globalComponents.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.section && typeof c.section.type === "string" && c.section.type.toLowerCase().includes(q))
    );
  }, [globalComponents, searchQuery]);

  const handleStartCreate = () => {
    const defaultName =
      selectedSectionConfig?.label ||
      selectedSectionConfig?.settings?.title ||
      selectedSectionConfig?.type ||
      "مكوّن عام جديد";
    setNewComponentName(defaultName);
    setIsCreating(true);
  };

  const handleConfirmCreate = () => {
    if (!onCreateComponent) return;
    onCreateComponent(newComponentName, selectedSectionConfig);
    setIsCreating(false);
    setNewComponentName("");
  };

  const handleStartEditName = (comp: StudioGlobalComponent) => {
    setEditingComponentId(comp.id);
    setEditingName(comp.name);
  };

  const handleSaveEditName = (id: string) => {
    if (editingName.trim() && onUpdateMaster) {
      onUpdateMaster(id, { name: editingName.trim() });
    }
    setEditingComponentId(null);
  };

  const handleDeleteClick = (id: string) => {
    const usage = countComponentUsage(id, allPages);
    if (usage > 0) {
      setConfirmDeleteId(id);
    } else {
      onDeleteComponent?.(id, true);
    }
  };

  return (
    <div
      data-testid="global-components-panel"
      className="flex h-full w-[310px] shrink-0 flex-col border-e border-[#0c0d0f] bg-[#202226] text-[#e8eaee] select-none z-10"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-[#33363c] px-3.5 py-3 bg-[#1a1c20]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b6cf6]/20 text-[#2b6cf6]">
            <CubeTransparentIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-white">المكوّنات العالمية</h3>
            <p className="text-[9.5px] text-[#8b9199]">تزامن فوري وتحديث جماعي</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#8b9199] hover:bg-[#2b2e35] hover:text-white transition-colors"
            title="إغلاق"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 2. Active Section Action Card */}
      <div className="p-3 border-b border-[#33363c] bg-[#24272e]">
        {isSelectedSectionInstance ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded bg-[#2b6cf6]/20 px-1.5 py-0.5 text-[9.5px] font-bold text-[#60a5fa]">
                <ArrowPathIcon className="h-3 w-3 animate-spin" style={{ animationDuration: "6s" }} />
                نسخة متزامنة
              </span>
              <span className="text-[9.5px] text-[#9ca3af] font-mono truncate max-w-[120px]">
                {currentInstanceMaster?.name || "مكوّن"}
              </span>
            </div>
            <p className="text-[10px] text-[#9ca3af] leading-tight">
              أي تعديل على الأصل سينعكس على هذه النسخة وجميع النسخ في الصفحات الأخرى.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {instanceComponentId && onEditMaster && (
                <button
                  type="button"
                  data-testid="edit-master-btn"
                  onClick={() => onEditMaster(instanceComponentId)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-[#3b82f6] bg-[#3b82f6]/10 px-2 py-1.5 text-[10.5px] font-bold text-[#60a5fa] hover:bg-[#3b82f6]/20 transition-all"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                  تحرير الأصل
                </button>
              )}
              {onDetachInstance && (
                <button
                  type="button"
                  data-testid="detach-instance-btn"
                  onClick={() => onDetachInstance(selectedSectionKey)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-[#4b5563] bg-[#2d3340] px-2 py-1.5 text-[10.5px] font-bold text-[#d1d5db] hover:border-[#6b7280] hover:bg-[#374151] transition-all"
                  title="تحويل هذه النسخة إلى قسم مستقل غير مرتبط بالأصل"
                >
                  <LinkSlashIcon className="h-3.5 w-3.5" />
                  فصل النسخة
                </button>
              )}
            </div>
          </div>
        ) : selectedSectionKey ? (
          <div className="space-y-2">
            {!isCreating ? (
              <button
                type="button"
                data-testid="convert-to-component-btn"
                onClick={handleStartCreate}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#2b6cf6] px-3 py-2 text-xs font-bold text-white hover:bg-[#255fd9] shadow-sm transition-all"
              >
                <PlusIcon className="h-4 w-4" />
                تحويل القسم لمكوّن
              </button>
            ) : (
              <div className="space-y-2 rounded-lg border border-[#3b82f6] bg-[#1e2330] p-2.5">
                <span className="block text-[10px] font-bold text-[#93c5fd]">اسم المكوّن العام:</span>
                <input
                  type="text"
                  data-testid="component-name-input"
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  placeholder="أدخل اسماً مميزاً..."
                  className="w-full rounded border border-[#3b82f6]/40 bg-[#161922] px-2 py-1 text-xs text-white outline-none focus:border-[#3b82f6]"
                  autoFocus
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    data-testid="confirm-create-component-btn"
                    onClick={handleConfirmCreate}
                    disabled={!newComponentName.trim()}
                    className="flex-1 rounded bg-[#2b6cf6] py-1 text-[10.5px] font-bold text-white hover:bg-[#255fd9] disabled:opacity-50"
                  >
                    حفظ كمكوّن
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="rounded bg-[#2a2e38] px-2 py-1 text-[10.5px] text-[#9ca3af] hover:text-white"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[10.5px] text-[#8b9199] text-center py-1">
            حدد أي قسم في الكانفس لتحويله إلى مكوّن عام متزامن
          </p>
        )}
      </div>

      {/* 3. Search Bar */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center rounded-lg border border-[#33363c] bg-[#1a1c22] px-2.5 py-1.5 text-xs text-[#8b9199] focus-within:border-[#2b6cf6] focus-within:text-white">
          <MagnifyingGlassIcon className="h-3.5 w-3.5 shrink-0 me-1.5" />
          <input
            type="text"
            data-testid="search-components-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المكوّنات العامة..."
            className="w-full bg-transparent text-[11px] text-[#e8eaee] placeholder-[#6b7280] outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[#6b7280] hover:text-white"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Components List */}
      <div
        data-testid="global-components-list"
        className="flex-1 overflow-y-auto p-3 space-y-2 [scrollbar-width:thin]"
      >
        {filteredComponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-[#8b9199]">
            <CubeTransparentIcon className="h-8 w-8 text-[#4b5563] mb-2" />
            <p className="text-xs font-semibold text-[#9ca3af]">لا توجد مكوّنات بعد</p>
            <p className="text-[10px] mt-1 leading-relaxed">
              حوّل أي قسم إلى مكوّن لاستخدامه عبر صفحات متعددة وتحديثه من مكان واحد.
            </p>
          </div>
        ) : (
          filteredComponents.map((comp) => {
            const usageCount = countComponentUsage(comp.id, allPages);
            const isEditing = editingComponentId === comp.id;

            return (
              <div
                key={comp.id}
                data-testid={`component-card-${comp.id}`}
                className="group rounded-xl border border-[#33363c] bg-[#26292f] p-2.5 transition-all hover:border-[#3b82f6]/60 hover:bg-[#2b3038]"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-1.5">
                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        data-testid={`edit-name-input-${comp.id}`}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full rounded border border-[#3b82f6] bg-[#161922] px-1.5 py-0.5 text-xs text-white"
                        autoFocus
                      />
                      <button
                        type="button"
                        data-testid={`save-name-btn-${comp.id}`}
                        onClick={() => handleSaveEditName(comp.id)}
                        className="p-1 rounded bg-[#2b6cf6] text-white hover:bg-[#255fd9]"
                      >
                        <CheckIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 truncate flex-1">
                      <span className="h-2 w-2 rounded-full bg-[#10b981] shrink-0" />
                      <h4
                        data-testid={`component-name-${comp.id}`}
                        className="text-[11.5px] font-bold text-white truncate cursor-pointer hover:underline"
                        onClick={() => handleStartEditName(comp)}
                        title="انقر لتعديل الاسم"
                      >
                        {comp.name}
                      </h4>
                    </div>
                  )}

                  <span
                    data-testid={`usage-count-${comp.id}`}
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold shrink-0 ${
                      usageCount > 0
                        ? "bg-[#10b981]/20 text-[#34d399]"
                        : "bg-[#4b5563]/30 text-[#9ca3af]"
                    }`}
                  >
                    {usageCount > 0 ? `${usageCount} صفحة` : "غير مستخدم"}
                  </span>
                </div>

                {/* Meta details */}
                <div className="flex items-center justify-between text-[9.5px] text-[#8b9199] mb-2.5">
                  <span className="font-mono bg-[#1f2229] px-1.5 py-0.5 rounded text-[#9ca3af]">
                    {comp.section?.type || "قسم"}
                  </span>
                  <span>{new Date(comp.updatedAt || comp.createdAt).toLocaleDateString("ar-EG")}</span>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-[#333742]">
                  {onInsertInstance && (
                    <button
                      type="button"
                      data-testid={`insert-instance-${comp.id}`}
                      onClick={() => onInsertInstance(comp.id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#2b6cf6] py-1 text-[10.5px] font-bold text-white hover:bg-[#255fd9] transition-all"
                    >
                      <PlusIcon className="h-3 w-3" />
                      إدراج نسخة
                    </button>
                  )}
                  {onEditMaster && (
                    <button
                      type="button"
                      data-testid={`edit-master-${comp.id}`}
                      onClick={() => onEditMaster(comp.id)}
                      className="rounded-lg border border-[#4b5563] bg-[#20232a] p-1 text-[#9ca3af] hover:text-white hover:border-[#6b7280] transition-colors"
                      title="تحرير الأصل"
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onDeleteComponent && (
                    <button
                      type="button"
                      data-testid={`delete-component-${comp.id}`}
                      onClick={() => handleDeleteClick(comp.id)}
                      className="rounded-lg border border-[#4b5563] bg-[#20232a] p-1 text-[#9ca3af] hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                      title="حذف المكوّن"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Confirm Delete Warning Drawer */}
                {confirmDeleteId === comp.id && (
                  <div className="mt-2 rounded-lg border border-amber-500/50 bg-amber-950/40 p-2 text-start">
                    <div className="flex items-center gap-1 text-[10.5px] font-bold text-amber-400 mb-1">
                      <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>تحذير: المكوّن مستخدم</span>
                    </div>
                    <p className="text-[9.5px] text-amber-200/80 leading-tight mb-2">
                      هذا المكوّن مستخدم في {usageCount} موضع. حذفه سيحول النسخ إلى عنصر «مكوّن محذوف» دون كسر الصفحات.
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid="delete-confirm-btn"
                        onClick={() => {
                          onDeleteComponent?.(comp.id, true);
                          setConfirmDeleteId(null);
                        }}
                        className="flex-1 rounded bg-red-600 py-0.5 text-[10px] font-bold text-white hover:bg-red-700"
                      >
                        تأكيد الحذف
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded bg-[#2a2e38] px-2 py-0.5 text-[10px] text-[#9ca3af] hover:text-white"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Footer info */}
      <div className="border-t border-[#33363c] p-2.5 text-center bg-[#181a1f]">
        <p className="text-[9.5px] text-[#8b9199]">
          مكوّنات متزامنة تضمن تناسق الهوية عبر كامل المتجر
        </p>
      </div>
    </div>
  );
};

import type { MetaTemplate } from "../types";

export interface MetaTemplateTableProps {
  loading: boolean;
  selectedSessionId: string;
  groupedTemplates: Record<string, MetaTemplate[]>;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (name: string) => void;
  selectedRows: Set<string>;
  onToggleRow: (name: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  onClearSelectedRows: () => void;
  varPreviewOpen: Record<string, boolean>;
  onToggleVarPreview: (variantKey: string) => void;
  varPreviewValues: Record<string, string>;
  onVarPreviewChange: (key: string, value: string) => void;
  substituteVars: (text: string, key: string) => string;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenLibrary: () => void;
  onViewTemplate: (tpl: MetaTemplate) => void;
  onEditTemplate: (tpl: MetaTemplate) => void;
  onDuplicateTemplate: (tpl: MetaTemplate) => void;
  onDeleteTemplate: (name: string) => void;
}

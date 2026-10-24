import React from 'react';
import { Plus, RefreshCw, Sparkles, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomerPhoneSection } from './CustomerPhoneSection';
import type { Contact } from '../../../../hooks/useWhatsAppQueries';
import type { ActiveCustomerJourney } from './types';

interface ChatRightPanelInfoTabProps {
  contact: Contact;
  customer: any;
  isGroup: boolean;
  isLinkedCustomer: boolean;
  displayPhone: string;
  editingPhone: boolean;
  phoneDraft: string;
  setPhoneDraft: (v: string) => void;
  savingPhone: boolean;
  phoneUpdateMessage: string | null;
  onStartEditPhone: () => void;
  onCancelEditPhone: () => void;
  onSavePhone: () => void;
  displayPhone2: string;
  editingPhone2: boolean;
  phone2Draft: string;
  setPhone2Draft: (v: string) => void;
  savingPhone2: boolean;
  onStartEditPhone2: () => void;
  onCancelEditPhone2: () => void;
  onSavePhone2: () => void;
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
  updatingCategory: boolean;
  leadCategories: any[];
  tags: string[];
  newTagInput: string;
  setNewTagInput: (v: string) => void;
  availableTags: string[];
  isAddingTag: boolean;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  labels: { id: string; name: string; color: string }[];
  activeJourney: ActiveCustomerJourney | null;
  journeyLoading: boolean;
  reEnrolling: boolean;
  onReEnroll: () => void;
}

const sectionStyle = {
  borderRadius: '0.75rem',
  border: '1px solid color-mix(in srgb, var(--shell-control-border) 60%, transparent)',
  backgroundColor: 'var(--whatsapp-surface-strong)',
  padding: '0.875rem',
};

export const ChatRightPanelInfoTab: React.FC<ChatRightPanelInfoTabProps> = ({
  contact,
  customer,
  isGroup,
  isLinkedCustomer,
  displayPhone,
  editingPhone,
  phoneDraft,
  setPhoneDraft,
  savingPhone,
  phoneUpdateMessage,
  onStartEditPhone,
  onCancelEditPhone,
  onSavePhone,
  displayPhone2,
  editingPhone2,
  phone2Draft,
  setPhone2Draft,
  savingPhone2,
  onStartEditPhone2,
  onCancelEditPhone2,
  onSavePhone2,
  selectedCategoryId,
  onCategoryChange,
  updatingCategory,
  leadCategories,
  tags,
  newTagInput,
  setNewTagInput,
  availableTags,
  isAddingTag,
  onAddTag,
  onRemoveTag,
  labels,
  activeJourney,
  journeyLoading,
  reEnrolling,
  onReEnroll,
}) => {
  const selectedCategory = leadCategories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-3">
      {/* Lead Category */}
      <div style={sectionStyle}>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">تصنيف العميل</h4>
        <div className="flex items-center gap-2">
          {selectedCategory && (
            <span
              className="inline-block size-3 shrink-0 rounded-full"
              style={{ backgroundColor: selectedCategory.color || '#6366f1' }}
            />
          )}
          <Select
            value={selectedCategoryId}
            onValueChange={(v) => v && onCategoryChange(v)}
            disabled={updatingCategory}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون تصنيف</SelectItem>
              {leadCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: cat.color || '#6366f1' }}
                    />
                    <span>{cat.name} ({cat.contactCount})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer Tags */}
      <div style={sectionStyle}>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">وسوم العميل (Tags)</h4>
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-secondary/20 px-2 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                <Tag className="size-2.5" />
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                  title="حذف الوسم"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">لا توجد وسوم لهذا العميل</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddTag(newTagInput);
                }
              }}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="وسم جديد... (Enter)"
              disabled={isAddingTag}
              list="suggested-tags-list"
            />
            <datalist id="suggested-tags-list">
              {availableTags
                .filter((t) => !tags.includes(t))
                .map((t) => (
                  <option key={t} value={t} />
                ))}
            </datalist>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="size-8 rounded-md"
            onClick={() => onAddTag(newTagInput)}
            disabled={isAddingTag || !newTagInput.trim()}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* WhatsApp Labels */}
      {contact.labels && contact.labels.length > 0 && (
        <div style={sectionStyle}>
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground">تصنيفات واتساب</h4>
          <div className="flex flex-wrap gap-1">
            {contact.labels.map((labelId) => {
              const def = labels.find((l) => l.id === labelId);
              return def ? (
                <span
                  key={labelId}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                  style={{ backgroundColor: def.color }}
                >
                  {def.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Journey Status Card */}
      {!isGroup && activeJourney && (
        <div style={sectionStyle} className="border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="size-3.5" />
              <span>رحلة العميل النشطة</span>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {activeJourney.status}
            </span>
          </div>
          <p className="text-xs font-semibold text-foreground">{activeJourney.flowName}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              الخطوة {activeJourney.currentStep} من {activeJourney.totalSteps}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReEnroll}
              disabled={reEnrolling}
              className="h-6 px-2 text-[10px] text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            >
              <RefreshCw className="size-3 mr-1" />
              إعادة التسجيل
            </Button>
          </div>
        </div>
      )}

      {/* Phone Numbers & Location */}
      <CustomerPhoneSection
        contact={contact}
        customer={customer}
        isGroup={isGroup}
        isLinkedCustomer={isLinkedCustomer}
        displayPhone={displayPhone}
        editingPhone={editingPhone}
        phoneDraft={phoneDraft}
        setPhoneDraft={setPhoneDraft}
        savingPhone={savingPhone}
        phoneUpdateMessage={phoneUpdateMessage}
        onStartEditPhone={onStartEditPhone}
        onCancelEditPhone={onCancelEditPhone}
        onSavePhone={onSavePhone}
        displayPhone2={displayPhone2}
        editingPhone2={editingPhone2}
        phone2Draft={phone2Draft}
        setPhone2Draft={setPhone2Draft}
        savingPhone2={savingPhone2}
        onStartEditPhone2={onStartEditPhone2}
        onCancelEditPhone2={onCancelEditPhone2}
        onSavePhone2={onSavePhone2}
        sectionStyle={sectionStyle}
      />
    </div>
  );
};

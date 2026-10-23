import React from 'react';
import {
  ArrowRightLeft,
  ChevronRight,
  FileText,
  Mail,
  Phone,
  Plus,
  Send,
  ShoppingBag,
  Tag,
  User,
  X,
} from 'lucide-react';
import type { ConversationDetail, CustomerOrder } from './types';

const statusOptions = ['NEW', 'QUEUED', 'ASSIGNED', 'ACTIVE', 'PENDING', 'WAITING_CUSTOMER', 'ESCALATED', 'CLOSED'];

interface WhatsAppChatDetailsSidebarProps {
  conversation: ConversationDetail;
  customerOrders: CustomerOrder[];
  loadingOrders: boolean;
  statusOptionsList?: string[];
  tagInput: string;
  onTagInputChange: (val: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tagId: string) => void;
  noteDraft: string;
  onNoteDraftChange: (val: string) => void;
  onAddNote: (requestAssistance?: boolean) => void;
  selectedMentionIds: string[];
  onToggleMention: (id: string) => void;
  transferTarget: string;
  onTransferTargetChange: (id: string) => void;
  onTransferConversation: () => void;
  onUpdateStatus: (status: string) => void;
  canTransfer: boolean;
  saving: boolean;
  showDetailsPanel: boolean;
  onCloseDetailsPanel: () => void;
  translateStatus: (st?: string) => string;
}

export const WhatsAppChatDetailsSidebar: React.FC<WhatsAppChatDetailsSidebarProps> = ({
  conversation,
  customerOrders,
  loadingOrders,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  noteDraft,
  onNoteDraftChange,
  onAddNote,
  selectedMentionIds,
  onToggleMention,
  transferTarget,
  onTransferTargetChange,
  onTransferConversation,
  onUpdateStatus,
  canTransfer,
  saving,
  showDetailsPanel,
  onCloseDetailsPanel,
  translateStatus,
}) => {
  return (
    <aside
      className={`wa-slim-scroll min-h-0 flex-col overflow-y-auto border-l border-border/50 bg-card/60 p-4 space-y-4 rtl:border-l-0 rtl:border-r ${
        showDetailsPanel ? 'fixed inset-y-0 right-0 z-40 flex w-80 bg-background shadow-xl rtl:right-auto rtl:left-0' : 'hidden xl:flex xl:w-96'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-3 xl:hidden">
        <h3 className="text-sm font-bold text-foreground">تفاصيل المحادثة والعميل</h3>
        <button
          type="button"
          onClick={onCloseDetailsPanel}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Customer Info Card */}
      <div className="rounded-xl border border-border/50 bg-background/60 p-3.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
            {conversation.customer.name.charAt(0) || <User className="size-5" />}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-foreground">
              {conversation.customer.name}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono tabular-nums">
              <Phone className="size-3" />
              <span>{conversation.customer.phone}</span>
            </div>
          </div>
        </div>

        {conversation.customer.email && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground truncate border-t border-border/40 pt-2">
            <Mail className="size-3 shrink-0" />
            <span className="truncate">{conversation.customer.email}</span>
          </div>
        )}
      </div>

      {/* Status Controller */}
      <div className="rounded-xl border border-border/50 bg-background/60 p-3.5 shadow-xs">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
          حالة المحادثة
        </label>
        <select
          value={conversation.status}
          onChange={(e) => onUpdateStatus(e.target.value)}
          className="w-full rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary/50"
        >
          {statusOptions.map((st) => (
            <option key={st} value={st}>
              {translateStatus(st)}
            </option>
          ))}
        </select>
      </div>

      {/* Customer Orders */}
      <div className="rounded-xl border border-border/50 bg-background/60 p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <ShoppingBag className="size-3.5 text-primary" />
            <span>طلبات العميل ({customerOrders.length})</span>
          </div>
        </div>

        {loadingOrders ? (
          <div className="py-3 text-center text-xs text-muted-foreground">جاري تحميل الطلبات...</div>
        ) : customerOrders.length === 0 ? (
          <div className="py-2 text-center text-xs text-muted-foreground">لا توجد طلبات مسجلة لهذا العميل</div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto wa-slim-scroll">
            {customerOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-card p-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-foreground font-mono tabular-nums">
                    #{order.orderNumber || order.id.slice(0, 8)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {order.status || 'NEW'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-foreground font-mono tabular-nums">
                    {order.total || 0} ج.م
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="rounded-xl border border-border/50 bg-background/60 p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
          <Tag className="size-3.5 text-indigo-500" />
          <span>الوسوم (Tags)</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-2.5">
          {conversation.conversationTags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-muted/40 px-2 py-0.5 text-[11px] text-foreground"
            >
              <span>{t.tag}</span>
              <button
                type="button"
                onClick={() => onRemoveTag(t.id)}
                className="hover:text-destructive"
              >
                <X className="size-2.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-1.5">
          <input
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddTag();
              }
            }}
            placeholder="إضافة وسم..."
            className="flex-1 rounded-md border border-border/50 bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary/50"
          />
          <button
            type="button"
            onClick={onAddTag}
            className="rounded-md border border-border/50 bg-muted px-2 py-1 text-xs hover:bg-muted/80 transition"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="rounded-xl border border-border/50 bg-background/60 p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
          <FileText className="size-3.5 text-amber-500" />
          <span>ملاحظات داخلية</span>
        </div>

        {conversation.notes.length > 0 && (
          <div className="mb-2.5 space-y-1.5 max-h-36 overflow-y-auto wa-slim-scroll">
            {conversation.notes.map((note) => (
              <div
                key={note.id}
                className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2 text-xs text-foreground"
              >
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                  <span className="font-semibold text-foreground">
                    {note.author.firstName}
                  </span>
                  <span className="font-mono tabular-nums">
                    {note.createdAt ? new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div>{note.content}</div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <textarea
            value={noteDraft}
            onChange={(e) => onNoteDraftChange(e.target.value)}
            rows={2}
            placeholder="اكتب ملاحظة للفريق..."
            className="w-full resize-none rounded-md border border-border/50 bg-background p-2 text-xs text-foreground outline-none focus:border-primary/50"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => onAddNote(false)}
              disabled={saving || !noteDraft.trim()}
              className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80 disabled:opacity-40"
            >
              حفظ
            </button>
            <button
              type="button"
              onClick={() => onAddNote(true)}
              disabled={saving || !noteDraft.trim()}
              className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 disabled:opacity-40"
            >
              طلب مساعدة
            </button>
          </div>
        </div>
      </div>

      {/* Transfer Conversation */}
      {canTransfer && (
        <div className="rounded-xl border border-border/50 bg-background/60 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
            <ArrowRightLeft className="size-3.5 text-primary" />
            <span>تحويل المحادثة لموظف آخر</span>
          </div>

          <div className="space-y-2">
            <select
              value={transferTarget}
              onChange={(e) => onTransferTargetChange(e.target.value)}
              className="w-full rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/50"
            >
              <option value="">اختر الموظف...</option>
              {conversation.availableModerators?.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.name} ({mod.department || 'بدون قسم'})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onTransferConversation}
              disabled={!transferTarget || saving}
              className="w-full rounded-md bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition"
            >
              تحويل الآن
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

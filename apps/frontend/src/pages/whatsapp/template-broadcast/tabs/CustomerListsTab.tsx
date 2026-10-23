import React from 'react';
import {
  Copy,
  Filter,
  Layers,
  List,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CustomerList, LeadCategory, formatListDate, listCriteriaText } from '../types';

interface CustomerListsTabProps {
  listsSearch: string;
  setListsSearch: (v: string) => void;
  listsFilter: 'all' | 'custom' | 'default';
  setListsFilter: (v: 'all' | 'custom' | 'default') => void;
  filteredCustomerLists: CustomerList[];
  refreshingListId: string | null;
  onSelectForSend: (list: CustomerList) => void;
  onDuplicateList: (list: CustomerList) => void;
  onRefreshListCount: (list: CustomerList) => void;
  onDeleteList: (list: CustomerList) => void;
  leadCategories: LeadCategory[];
  expandedListId: string | null;
  setExpandedListId: (id: string | null) => void;
  listMembers: Record<string, any[]>;
  loadingMembers: boolean;
  importingCategoryId: string | null;
  onImportFromCategory: (categoryId: string, categoryName: string) => void;
  onToggleExpandCategory: (categoryId: string, contactCount: number) => void;
}

export const CustomerListsTab: React.FC<CustomerListsTabProps> = ({
  listsSearch,
  setListsSearch,
  listsFilter,
  setListsFilter,
  filteredCustomerLists,
  refreshingListId,
  onSelectForSend,
  onDuplicateList,
  onRefreshListCount,
  onDeleteList,
  leadCategories,
  expandedListId,
  listMembers,
  loadingMembers,
  importingCategoryId,
  onImportFromCategory,
  onToggleExpandCategory,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">قوائم العملاء والتصنيفات</h3>
          <p className="text-xs text-muted-foreground">
            إدارة شرائح العملاء والإرسال المباشر إليها عبر قوالب واتساب
          </p>
        </div>
        <a
          href="/customers/lists"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Layers className="size-3.5" />
          إدارة القوائم الكاملة
        </a>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={listsSearch}
            onChange={(e) => setListsSearch(e.target.value)}
            placeholder="ابحث في القوائم..."
            className="h-8 rounded-lg pr-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-card p-0.5">
          {(
            [
              { value: 'all', label: 'الكل' },
              { value: 'custom', label: 'المخصصة' },
              { value: 'default', label: 'الافتراضية' },
            ] as const
          ).map((f) => (
            <button
              key={f.value}
              onClick={() => setListsFilter(f.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                listsFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lists Grid */}
      {filteredCustomerLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-10 text-center">
          <Layers className="size-8 text-muted-foreground/40" />
          <h4 className="mt-2 text-xs font-semibold text-foreground">
            {listsSearch || listsFilter !== 'all' ? 'لم يتم العثور على قوائم' : 'لا توجد قوائم عملاء'}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {listsSearch || listsFilter !== 'all'
              ? 'جرّب تغيير كلمات البحث أو الفلترة.'
              : 'أنشئ قائمة عملاء ذكية من صفحة إدارة القوائم.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomerLists.map((list) => (
            <div
              key={list.id}
              className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-3.5 transition-all hover:border-border"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-xs font-bold text-foreground">{list.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {list.isDefault ? 'قائمة افتراضية' : formatListDate(list.updatedAt)}
                    </p>
                  </div>
                  {list.isDefault && (
                    <Badge variant="secondary" className="shrink-0 text-[10px] font-medium">
                      افتراضية
                    </Badge>
                  )}
                </div>

                {list.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground mb-2 leading-relaxed">
                    {list.description}
                  </p>
                )}

                <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                  <Filter className="size-2.5" />
                  <span>{listCriteriaText(list.criteria)}</span>
                  {(list as any).isStale && <span className="mr-1 text-amber-500 font-medium">• قديم</span>}
                </div>

                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-xl font-bold font-mono tabular-nums text-foreground">
                    {list.count}
                  </span>
                  <span className="text-xs text-muted-foreground">عميل</span>
                </div>
              </div>

              <div className="flex items-center gap-1 border-t border-border/40 pt-2.5 mt-2">
                <Button
                  size="sm"
                  className="h-7 gap-1 rounded-md text-xs px-2.5"
                  onClick={() => onSelectForSend(list)}
                >
                  <Send className="size-3" />
                  <span>إرسال</span>
                </Button>
                {!list.isDefault && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md px-2"
                      onClick={() => onDuplicateList(list)}
                      title="نسخ القائمة"
                      aria-label="نسخ القائمة"
                    >
                      <Copy className="size-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md px-2"
                      onClick={() => onRefreshListCount(list)}
                      disabled={refreshingListId === list.id}
                      title="تحديث عدد العملاء"
                      aria-label="تحديث عدد العملاء"
                    >
                      <RefreshCw
                        className={`size-3 ${refreshingListId === list.id ? 'animate-spin' : ''}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-auto h-7 rounded-md px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDeleteList(list)}
                      aria-label="حذف القائمة"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Lead Categories Section */}
      <Card className="rounded-xl border border-border/50 bg-card shadow-none">
        <CardHeader className="border-b border-border/30 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-foreground">تصنيفات جهات الاتصال</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                استيراد جهات الاتصال المسجلة في تصنيفات العملاء المحتملين
              </CardDescription>
            </div>
            <a
              href="/customers/segments"
              className="inline-flex h-7 items-center gap-1 rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <List className="size-3" />
              مركز التقسيم
            </a>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-3">
          {leadCategories.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              لا توجد تصنيفات مسجلة حالياً
            </div>
          ) : (
            leadCategories.map((cat) => {
              const isExpanded = expandedListId === cat.id;
              const members = listMembers[cat.id] || [];
              const isImporting = importingCategoryId === cat.id;
              return (
                <div key={cat.id} className="rounded-lg border border-border/40 bg-card overflow-hidden">
                  <div
                    className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => onToggleExpandCategory(cat.id, cat.contactCount)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-block size-2 rounded-full shrink-0"
                        style={{ background: cat.color || '#6366f1' }}
                      />
                      <span className="text-xs font-medium text-foreground truncate">{cat.name}</span>
                      <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                        ({cat.contactCount} جهة)
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="h-6 gap-1 rounded-md text-xs px-2"
                      disabled={isImporting || cat.contactCount === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onImportFromCategory(cat.id, cat.name);
                      }}
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="size-3 animate-spin" />
                          <span>جاري الاستيراد...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="size-3" />
                          <span>استيراد</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border/40 p-2.5 space-y-1.5 max-h-40 overflow-y-auto bg-muted/20">
                      {loadingMembers ? (
                        <p className="text-xs text-muted-foreground">جاري تحميل جهات الاتصال...</p>
                      ) : members.length === 0 ? (
                        <p className="text-xs text-muted-foreground">لا توجد جهات اتصال في هذا التصنيف</p>
                      ) : (
                        members.map((m: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs py-0.5">
                            <span className="truncate">{m.name || m.pushName || '—'}</span>
                            <span className="text-muted-foreground font-mono tabular-nums" dir="ltr">
                              {m.phoneNumber || ''}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

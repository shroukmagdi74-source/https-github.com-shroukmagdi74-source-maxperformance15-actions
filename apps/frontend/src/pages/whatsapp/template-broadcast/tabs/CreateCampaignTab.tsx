import React from 'react';
import {
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  RefreshCw,
  Send,
  Tag,
  UserPlus,
  X,
  XCircle,
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppSurfaceCard } from '../../components/WhatsAppPageShell';
import { BroadcastResult, CustomerList, LeadCategory, MetaTemplate, Session } from '../types';
import { TemplatePicker } from './TemplatePicker';

interface CreateCampaignTabProps {
  campaignName: string;
  setCampaignName: (v: string) => void;
  sessions: Session[];
  selectedSessionId: string;
  setSelectedSessionId: (v: string) => void;
  templates: MetaTemplate[];
  selectedTemplate: string;
  setSelectedTemplate: (v: string) => void;
  languageCode: string;
  setLanguageCode: (v: string) => void;
  waHeaderMedia: string;
  setWaHeaderMedia: (v: string) => void;
  headerMediaName: string;
  setHeaderMediaName: (v: string) => void;
  headerUploading: boolean;
  customerLists: CustomerList[];
  selectedListId: string;
  handleSelectList: (v: string) => void;
  availableTags: { name: string; count: number }[];
  selectedTag: string;
  handleSelectTag: (v: string) => void;
  leadCategories: LeadCategory[];
  selectedLeadCategoryId: string;
  setSelectedLeadCategoryId: (v: string) => void;
  scheduleAt: string;
  setScheduleAt: (v: string) => void;
  recipientsText: string;
  setRecipientsText: (v: string) => void;
  recipients: string[];
  addRecipients: () => void;
  removeRecipient: (phone: string) => void;
  sending: boolean;
  handleCreateCampaign: () => void;
  handleUploadHeaderMedia: (file: File) => void;
  result: BroadcastResult | null;
  sendProgress: { current: number; total: number; status: string } | null;
  onGoToCampaigns: () => void;
}

export const CreateCampaignTab: React.FC<CreateCampaignTabProps> = ({
  campaignName,
  setCampaignName,
  sessions,
  selectedSessionId,
  setSelectedSessionId,
  templates,
  selectedTemplate,
  setSelectedTemplate,
  languageCode,
  setLanguageCode,
  waHeaderMedia,
  setWaHeaderMedia,
  headerMediaName,
  setHeaderMediaName,
  headerUploading,
  customerLists,
  selectedListId,
  handleSelectList,
  availableTags,
  selectedTag,
  handleSelectTag,
  leadCategories,
  selectedLeadCategoryId,
  setSelectedLeadCategoryId,
  scheduleAt,
  setScheduleAt,
  recipientsText,
  setRecipientsText,
  recipients,
  addRecipients,
  removeRecipient,
  sending,
  handleCreateCampaign,
  handleUploadHeaderMedia,
  result,
  sendProgress,
  onGoToCampaigns,
}) => {
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        {/* Campaign Settings */}
        <WhatsAppSurfaceCard title="إعدادات الحملة" description="اختر القالب المعتمد والجمهور المستهدف">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">اسم الحملة</Label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="مثال: عروض نهاية الموسم لعملاء VIP"
                className="h-8 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">جلسة واتساب المعتمدة</Label>
              <Select value={selectedSessionId} onValueChange={(v) => setSelectedSessionId(v ?? '')}>
                <SelectTrigger className="h-8 rounded-lg text-xs font-mono">
                  <SelectValue placeholder="اختر جلسة" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => {
                    const isCuid = s.name && s.name.length === 25 && /^[a-z0-9]+$/.test(s.name);
                    const nameToUse = isCuid ? 'جلسة واتساب' : s.name;
                    const phone = s.metaDisplayPhoneNumber || s.phoneNumber;
                    return (
                      <SelectItem key={s.id} value={s.id} className="text-xs font-mono">
                        {phone ? `${nameToUse} (${phone})` : nameToUse}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">القالب (المعتمد رسمياً فقط)</Label>
              <TemplatePicker
                templates={templates}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                languageCode={languageCode}
                setLanguageCode={setLanguageCode}
              />
            </div>

            {/* Header Media */}
            {(() => {
              const selectedTplObj = templates.find((t) => t.name === selectedTemplate);
              const headerComp = selectedTplObj?.components?.find((c: any) => (c.type || '').toUpperCase() === 'HEADER');
              const headerFormat = headerComp?.format;
              const requiresMedia = headerFormat && headerFormat !== 'TEXT';

              return (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center justify-between">
                    <span>صورة الرأس</span>
                    {requiresMedia ? (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                        (مطلوبة لهذا القالب — هيدر {headerFormat})
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-normal">(اختياري)</span>
                    )}
                  </Label>
                  {waHeaderMedia ? (
                    <div className="flex h-8 items-center gap-2 rounded-lg border border-border/50 bg-muted/40 px-3">
                      <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-xs font-mono text-muted-foreground" dir="ltr">
                        {headerMediaName || waHeaderMedia}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setWaHeaderMedia('');
                          setHeaderMediaName('');
                        }}
                      >
                        إزالة
                      </Button>
                    </div>
                  ) : (
                    <label className={`flex h-8 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed text-xs transition-colors ${
                      requiresMedia ? 'border-amber-500/50 bg-amber-500/5 text-foreground hover:bg-amber-500/10' : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                    }`}>
                      {headerUploading ? (
                        <>
                          <RefreshCw className="size-3.5 animate-spin" />
                          <span>جاري الرفع إلى ميتا...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="size-3.5" />
                          <span>{requiresMedia ? 'اختر صورة الترويسة المطلوبة للقالب' : 'اختر صورة لتضمينها في ترويسة القالب'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={headerUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadHeaderMedia(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
              );
            })()}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">لغة القالب</Label>
                <Select value={languageCode} onValueChange={(v) => setLanguageCode(v ?? '')}>
                  <SelectTrigger className="h-8 rounded-lg text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set(templates.map((t) => t.language))].map((lang) => (
                      <SelectItem key={lang} value={lang} className="text-xs font-mono">
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">قائمة العملاء</Label>
                <Select value={selectedListId} onValueChange={(v) => void handleSelectList(v ?? '')}>
                  <SelectTrigger className="h-8 rounded-lg text-xs">
                    <SelectValue placeholder="اختر قائمة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual" className="text-xs">إدخال يدوي</SelectItem>
                    {customerLists.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="text-xs">
                        {l.name} ({l.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {availableTags.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">تصفية بالوسم (Tag)</Label>
                <Select value={selectedTag} onValueChange={(v) => void handleSelectTag(v ?? '')}>
                  <SelectTrigger className="h-8 rounded-lg text-xs">
                    <SelectValue placeholder="اختر وسماً لتحميل الأرقام" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">بدون تصفية بالوسم</SelectItem>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag.name} value={tag.name} className="text-xs">
                        <span className="flex items-center gap-1.5">
                          <Tag className="size-3 text-muted-foreground" />
                          <span>{tag.name} ({tag.count})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">تصنيف جهات الاتصال</Label>
              <Select value={selectedLeadCategoryId} onValueChange={(v) => setSelectedLeadCategoryId(v ?? '')}>
                <SelectTrigger className="h-8 rounded-lg text-xs">
                  <SelectValue placeholder="جميع التصنيفات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs">جميع التصنيفات</SelectItem>
                  {leadCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{ background: cat.color || '#6366f1' }}
                        />
                        <span>{cat.name} ({cat.contactCount})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">جدولة الإرسال</Label>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  className="h-8 rounded-lg text-xs font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduleAt('')}
                  className={`h-8 rounded-lg text-xs ${scheduleAt ? '' : 'opacity-30'}`}
                >
                  <Clock className="size-3.5" />
                  مسح
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {scheduleAt
                  ? `سيتم الإرسال تلقائياً في ${new Date(scheduleAt).toLocaleString('ar-EG')}`
                  : 'اترك الحقل فارغاً للإرسال الفوري الآن'}
              </p>
            </div>

            {selectedTemplate && (
              <div className="rounded-lg border border-emerald-300/60 bg-emerald-500/5 p-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-200">
                  <CheckCircle className="size-3.5 text-emerald-600" />
                  <span>تخصيص متغيرات القالب</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                  سيتم تعبئة المتغير الأول باسم العميل تلقائياً عند الإرسال، والقوالب بدون متغيرات ترسل بالنص الثابت.
                </p>
              </div>
            )}
          </div>
        </WhatsAppSurfaceCard>

        {/* Recipients Card */}
        <WhatsAppSurfaceCard
          title="المستلمون"
          description={`${recipients.length} مستلم محدد`}
        >
          <div className="space-y-3">
            <Textarea
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
              placeholder="اكتب أرقام الهواتف مفصولة بفاصلة أو سطر جديد..."
              className="min-h-[70px] rounded-lg text-xs font-mono"
            />
            <Button
              onClick={addRecipients}
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 rounded-lg text-xs"
            >
              <UserPlus className="size-3.5" />
              إضافة الأرقام للقائمة
            </Button>

            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-lg border border-border/40 bg-muted/20">
                {recipients.map((phone) => (
                  <Badge
                    key={phone}
                    variant="secondary"
                    className="gap-1 rounded-md px-2 py-0.5 text-[11px] font-mono tabular-nums"
                  >
                    <span>{phone}</span>
                    <button
                      onClick={() => removeRecipient(phone)}
                      className="mr-0.5 hover:text-destructive"
                      aria-label="إزالة الرقم"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </WhatsAppSurfaceCard>

        {/* Primary CTA */}
        <Button
          onClick={handleCreateCampaign}
          disabled={sending || recipients.length === 0 || !selectedTemplate || !campaignName}
          className="w-full h-10 rounded-lg text-xs font-semibold gap-2"
        >
          {sending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>جاري الإرسال والمعالجة...</span>
            </>
          ) : (
            <>
              <Send className="size-4" />
              <span>
                إرسال البث ({recipients.length} مستلم)
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Right Column: Broadcast Result */}
      <div className="lg:col-span-2">
        <Card className="rounded-xl border border-border/50 bg-card shadow-none">
          <CardHeader className="border-b border-border/30 pb-3">
            <CardTitle className="text-xs font-semibold text-foreground">نتيجة الإرسال</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              تقرير وتفاصيل الحملة بعد التنفيذ
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {(!result || result.status === 'sending' || sending) ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                {sending || result?.status === 'sending' ? (
                  <div className="flex flex-col items-center gap-2.5">
                    <Loader2 className="size-6 animate-spin text-primary" />
                    <span className="font-medium text-foreground">
                      جاري الإرسال في الخلفية...{' '}
                      {sendProgress ? (
                        <span className="font-mono tabular-nums font-bold">
                          {sendProgress.current}/{sendProgress.total}
                        </span>
                      ) : (
                        ''
                      )}
                    </span>
                    {sendProgress && sendProgress.total > 0 && (
                      <div className="w-56 bg-muted rounded-full h-2 overflow-hidden mt-1">
                        <div
                          className="bg-primary h-full transition-all duration-300 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((sendProgress.current / sendProgress.total) * 100))}%` }}
                        />
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg text-xs mt-2"
                      onClick={onGoToCampaigns}
                    >
                      عرض في سجل الحملات
                    </Button>
                  </div>
                ) : (
                  'لم يتم إرسال حملة في هذه الجلسة بعد'
                )}
              </div>
            ) : result.scheduled ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-amber-300/60 bg-amber-500/10 p-4 text-center">
                <Clock className="size-7 text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-200">تمت الجدولة بنجاح</p>
                  <p className="text-[11px] font-mono text-amber-700 dark:text-amber-300 mt-0.5">
                    {new Date(result.scheduledAt || '').toLocaleString('ar-EG')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-lg text-xs mt-1"
                  onClick={onGoToCampaigns}
                >
                  عرض سجل الحملات
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 rounded-lg border border-emerald-300/60 bg-emerald-500/10 p-3">
                  <CheckCircle className="size-6 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold font-mono tabular-nums text-emerald-800 dark:text-emerald-200">
                      {result.sentCount || result.sent || 0}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">تم الإرسال بنجاح</p>
                  </div>
                </div>

                {(result.failedCount || result.failed || 0) > 0 && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-red-300/60 bg-red-500/10 p-3">
                    <XCircle className="size-6 text-red-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-mono tabular-nums text-red-800 dark:text-red-200">
                        {result.failedCount || result.failed || 0}
                      </p>
                      <p className="text-[11px] text-red-700 dark:text-red-300">فشل في الإرسال</p>
                    </div>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <Separator />
                    <p className="text-xs font-medium text-muted-foreground">تفاصيل الأخطاء:</p>
                    <div className="max-h-36 space-y-1 overflow-y-auto">
                      {result.errors.map((e, i) => (
                        <p
                          key={i}
                          className="rounded-md bg-muted/50 p-2 text-[11px] font-mono text-destructive"
                        >
                          {e.recipient?.to || e.recipient?.phone || '—'}: {e.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 rounded-lg text-xs gap-1.5 mt-2"
                  onClick={onGoToCampaigns}
                >
                  <Megaphone className="size-3.5" />
                  عرض في سجل الحملات
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

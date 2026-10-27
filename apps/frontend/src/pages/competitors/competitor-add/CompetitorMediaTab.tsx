import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Plus, Edit3, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CompetitorFormData, MediaNoteItem } from './types';

interface CompetitorMediaTabProps {
  dir: string;
  formData: CompetitorFormData;
  handleInputChange: (field: keyof CompetitorFormData, value: string) => void;
  mediaNotes: MediaNoteItem[];
  mediaNoteInput: string;
  setMediaNoteInput: React.Dispatch<React.SetStateAction<string>>;
  editingNoteId: string | null;
  editingNoteText: string;
  setEditingNoteText: React.Dispatch<React.SetStateAction<string>>;
  handleAddMediaNote: () => void;
  handleRemoveMediaNote: (id: string) => void;
  handleStartEditNote: (id: string, text: string) => void;
  handleSaveEditNote: (id: string) => void;
  handleCancelEditNote: () => void;
}

export const CompetitorMediaTab: React.FC<CompetitorMediaTabProps> = ({
  dir,
  formData,
  handleInputChange,
  mediaNotes,
  mediaNoteInput,
  setMediaNoteInput,
  editingNoteId,
  editingNoteText,
  setEditingNoteText,
  handleAddMediaNote,
  handleRemoveMediaNote,
  handleStartEditNote,
  handleSaveEditNote,
  handleCancelEditNote,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={18} className="text-orange-500" />
            {t('competitors.mediaAnalysis') || 'تحليل الميديا'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Traffic Source */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t('competitors.trafficSource') || 'مصدر الزيارات'}
            </Label>
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit" dir={dir}>
              {['organic', 'paid', 'both'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleInputChange('trafficSource', val)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    formData.trafficSource === val
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(`competitors.${val}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t dark:border-gray-700" />

          {/* Media Notes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t('competitors.mediaNotes') || 'ملاحظات تحليل الميديا'}
            </Label>
            <div className="flex gap-2">
              <Textarea
                value={mediaNoteInput}
                onChange={e => setMediaNoteInput(e.target.value)}
                placeholder={t('competitors.mediaNotesPlaceholder') || 'أضف ملاحظة...'}
                className="min-h-[60px]"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddMediaNote();
                  }
                }}
              />
              <Button
                onClick={handleAddMediaNote}
                disabled={!mediaNoteInput.trim()}
                className="self-end shrink-0"
                aria-label={t('common.add') || 'Add note'}
              >
                <Plus size={16} />
              </Button>
            </div>
            {mediaNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t('competitors.noMediaNotes') || 'لا توجد ملاحظات بعد. أضف ملاحظاتك أعلاه.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto mt-4">
                {mediaNotes.map(n => (
                  <div key={n.id} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 group">
                    {editingNoteId === n.id ? (
                      <div className="flex-1 space-y-2">
                        <Textarea
                          value={editingNoteText}
                          onChange={e => setEditingNoteText(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEditNote(n.id)}>
                            {t('common.save')}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleCancelEditNote}>
                            {t('common.cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="flex-1 text-sm whitespace-pre-wrap">{n.text}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleStartEditNote(n.id, n.text)}
                            aria-label={t('common.edit') || 'Edit note'}
                          >
                            <Edit3 size={14} className="text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleRemoveMediaNote(n.id)}
                            aria-label={t('common.delete') || 'Delete note'}
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorMediaTab;

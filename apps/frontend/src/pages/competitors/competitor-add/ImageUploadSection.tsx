import React from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ImageItem } from './types';

interface ImageUploadSectionProps {
  label: string;
  images: ImageItem[];
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  label,
  images,
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="relative group aspect-square rounded-lg overflow-hidden border bg-muted/30"
          >
            <img src={img.data} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onMoveUp(i)}
                disabled={i === 0}
                className="text-white hover:bg-white/20"
                aria-label={t('common.moveUp') || 'Move up'}
              >
                <ChevronUp size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onMoveDown(i)}
                disabled={i === images.length - 1}
                className="text-white hover:bg-white/20"
                aria-label={t('common.moveDown') || 'Move down'}
              >
                <ChevronDown size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onRemove(img.id)}
                className="text-red-300 hover:bg-red-500/30"
                aria-label={t('common.delete') || 'Delete'}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
        <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors">
          <Upload size={18} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{t('common.upload') || 'رفع'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) {
                onAdd(f);
                e.target.value = '';
              }
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUploadSection;

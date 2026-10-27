import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

interface ImageUploadAreaProps {
  previewUrl?: string;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  label: string;
  size?: number;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  previewUrl,
  onFileSelect,
  onClear,
  label,
  size = 100,
}) => {
  const { derivedTheme } = useTheme();
  const isDark = derivedTheme === 'dark';
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border-2 border-dashed transition-all hover:border-primary',
          previewUrl ? 'border-primary' : isDark ? 'border-white/15' : 'border-black/12'
        )}
        style={{
          width: size,
          height: size,
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <Upload className="size-5 text-muted-foreground" />
            <span className="px-0.5 text-center text-[0.6rem] text-muted-foreground">{label}</span>
          </div>
        )}
      </div>
      {previewUrl && onClear && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={e => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute -right-2 -top-2 bg-destructive text-white hover:bg-destructive/90"
          style={{ width: 22, height: 22 }}
          aria-label="Clear image"
        >
          <X className="size-3" />
        </Button>
      )}
    </div>
  );
};

export default ImageUploadArea;

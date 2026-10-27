import React from 'react';
import { Sparkles, Image as ImageIcon, X, UploadCloud } from 'lucide-react';
import { Attachment } from '../../../types/tasks';
import type { DevTaskFormData } from './types';

interface DevTaskBasicCardProps {
  formData: DevTaskFormData;
  handleChange: (field: keyof DevTaskFormData, value: string) => void;
  existingImages: Attachment[];
  selectedImages: File[];
  imagePreviews: string[];
  imageBlobUrls: Record<string, string>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  removeExistingImage: (attachmentId: string) => void;
}

export const DevTaskBasicCard: React.FC<DevTaskBasicCardProps> = ({
  formData,
  handleChange,
  existingImages,
  selectedImages,
  imagePreviews,
  imageBlobUrls,
  handleImageChange,
  removeImage,
  removeExistingImage,
}) => {
  return (
    <div className="bg-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2 border-b border-border/60 pb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>تفاصيل المهمة الأساسية</span>
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            العنوان <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="مثال: ترقية بوابة الدفع الإلكتروني..."
            className="w-full px-3.5 py-2 border border-border rounded-lg bg-muted/20 focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground text-sm font-medium transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            الوصف <span className="text-destructive">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="وصف تفصيلي للمهمة والمتطلبات التقنية..."
            rows={6}
            className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-muted/20 focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground text-xs leading-relaxed resize-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span>المرفقات والصور</span>
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              ({existingImages.length + selectedImages.length} / 10)
            </span>
          </label>

          <div className="space-y-3">
            {/* Image Previews Grid */}
            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
                {/* Existing images */}
                {existingImages.map(img => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border">
                    {imageBlobUrls[img.id] ? (
                      <img
                        src={imageBlobUrls[img.id]}
                        alt={img.originalName || 'Task image'}
                        className="w-full h-28 object-cover"
                      />
                    ) : (
                      <div className="w-full h-28 bg-muted flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1.5 left-1.5 p-1 bg-destructive/90 text-destructive-foreground rounded-md hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-1.5 right-1.5 bg-background/80 backdrop-blur-sm text-foreground text-[10px] px-1.5 py-0.5 rounded border border-border/40 font-mono tabular-nums">
                      {(img.fileSize / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                ))}

                {/* New image previews */}
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group rounded-lg overflow-hidden border border-border">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-28 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 left-1.5 p-1 bg-destructive/90 text-destructive-foreground rounded-md hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                      aria-label="Remove preview"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-1.5 right-1.5 bg-background/80 backdrop-blur-sm text-foreground text-[10px] px-1.5 py-0.5 rounded border border-border/40 font-mono tabular-nums">
                      {selectedImages[index] ? (selectedImages[index].size / 1024 / 1024).toFixed(1) : '0'} MB
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Drop Area */}
            {existingImages.length + selectedImages.length < 10 && (
              <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-border hover:border-primary/50 rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <UploadCloud className="h-6 w-6 text-muted-foreground mb-1.5" />
                  <p className="text-xs font-medium text-foreground">رفع صور توضيحية أو لقطات شاشة</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    حتى 10 صور (بحد أقصى 20MB لكل صورة)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevTaskBasicCard;

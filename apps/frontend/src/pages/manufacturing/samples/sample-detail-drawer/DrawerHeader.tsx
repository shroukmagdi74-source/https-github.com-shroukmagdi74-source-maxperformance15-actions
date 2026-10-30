import React from 'react';
import { X, Share2 } from 'lucide-react';
import { SampleOrder } from '../../manufacturingApi';
import { SampleStatusBadge, MaterialSourceBadge } from '../SampleStatusBadge';

export interface DrawerHeaderProps {
  sample: SampleOrder;
  onShare: () => void;
  onClose: () => void;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  sample,
  onShare,
  onClose,
}) => {
  return (
    <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between bg-muted/20">
      <div className="flex items-center gap-2.5">
        <h2 className="text-base font-bold text-foreground tabular-nums">
          {sample.sampleNumber}
        </h2>
        <SampleStatusBadge status={sample.status} />
        <MaterialSourceBadge source={sample.materialSource} />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="مشاركة العينة"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>مشاركة</span>
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

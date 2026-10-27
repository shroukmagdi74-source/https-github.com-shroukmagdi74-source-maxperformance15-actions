import React from 'react';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import { FactoryPortalAssignment } from '../../manufacturingApi';

interface FactoryDeliveredMaterialsCardProps {
  deliveredMaterials?: FactoryPortalAssignment['deliveredMaterials'];
  isExpanded: boolean;
  onToggle: () => void;
}

export const FactoryDeliveredMaterialsCard: React.FC<
  FactoryDeliveredMaterialsCardProps
> = ({ deliveredMaterials, isExpanded, onToggle }) => {
  const materialsCount = deliveredMaterials?.length || 0;

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden bg-background">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-primary" />
          <span>
            الخامات المسلمة للمصنع (
            <span className="tabular-nums">{materialsCount}</span>)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-border/60 bg-muted/20 text-xs">
          {deliveredMaterials && deliveredMaterials.length > 0 ? (
            <div className="divide-y divide-border/50">
              {deliveredMaterials.map((mat, idx) => (
                <div
                  key={idx}
                  className="py-2 flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-foreground">
                      {mat.rawMaterialName}
                    </span>
                    {mat.batchNumber && (
                      <span className="text-[10px] text-muted-foreground block font-mono">
                        تشغيلة: {mat.batchNumber}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-foreground tabular-nums">
                    {mat.quantity} {mat.unit}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-2">
              لم يتم تسجيل إذن صرف خامات لهذا الأمر حتى الآن.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
